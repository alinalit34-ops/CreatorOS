import express from "express";
import path from "path";
import dotenv from "dotenv";
import { google } from "googleapis";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

// Load local environment secrets
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini AI client
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    return null;
  }
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        }
      }
    });
  }
  return geminiClient;
}

// In-memory cache for OAuth flow resolution across window contexts
const pendingOAuthSessions = new Map<string, { 
  completed: boolean; 
  tokens?: any; 
  youtubeStats?: any; 
  tiktokStats?: any;
  error?: string;
  timestamp: number;
}>();

// Clean up expired sessions (> 10 mins)
setInterval(() => {
  const now = Date.now();
  for (const [key, session] of pendingOAuthSessions.entries()) {
    if (now - session.timestamp > 600000) {
      pendingOAuthSessions.delete(key);
    }
  }
}, 60000);

// Helper to resolve the correct redirect URI based on environment
function getRedirectUri(req?: express.Request) {
  let base = process.env.APP_URL;
  if (!base || base === "MY_APP_URL" || base.includes("localhost")) {
    if (req) {
      const proto = (req.headers["x-forwarded-proto"] as string) || req.protocol || "https";
      const host = (req.headers["x-forwarded-host"] as string) || req.headers.host || "localhost:3000";
      base = `${proto}://${host}`;
    } else {
      base = "http://localhost:3000";
    }
  }
  // Strip trailing slashes to avoid double-slash issues
  return `${base.replace(/\/+$/, "")}/auth/callback`;
}

// Helper to resolve the TikTok-specific redirect URI
function getTikTokRedirectUri(req?: express.Request) {
  let base = process.env.APP_URL;
  if (!base || base === "MY_APP_URL" || base.includes("localhost")) {
    if (req) {
      const proto = (req.headers["x-forwarded-proto"] as string) || req.protocol || "https";
      const host = (req.headers["x-forwarded-host"] as string) || req.headers.host || "localhost:3000";
      base = `${proto}://${host}`;
    } else {
      base = "http://localhost:3000";
    }
  }
  return `${base.replace(/\/+$/, "")}/auth/callback/tiktok`;
}

// Diagnostic status endpoint to verify YouTube secrets configuration
app.get("/api/auth/google/status", (req, res) => {
  const hasClientId = Boolean(process.env.YOUTUBE_CLIENT_ID && process.env.YOUTUBE_CLIENT_ID.trim().length > 0);
  const hasClientSecret = Boolean(process.env.YOUTUBE_CLIENT_SECRET && process.env.YOUTUBE_CLIENT_SECRET.trim().length > 0);
  res.json({
    configured: hasClientId && hasClientSecret,
    hasClientId,
    hasClientSecret,
    redirectUri: getRedirectUri(req)
  });
});

// Diagnostic status endpoint to verify TikTok secrets configuration
app.get("/api/auth/tiktok/status", (req, res) => {
  const hasClientKey = Boolean(process.env.TIKTOK_CLIENT_KEY && process.env.TIKTOK_CLIENT_KEY.trim().length > 0);
  const hasClientSecret = Boolean(process.env.TIKTOK_CLIENT_SECRET && process.env.TIKTOK_CLIENT_SECRET.trim().length > 0);
  res.json({
    configured: hasClientKey && hasClientSecret,
    hasClientKey,
    hasClientSecret,
    redirectUri: getTikTokRedirectUri(req),
    alternateRedirectUri: getRedirectUri(req)
  });
});

// Polling endpoint for frontend to check if Google/YouTube OAuth completed
app.get("/api/auth/google/session", (req, res) => {
  const uid = (req.query.uid as string) || "guest";
  const session = pendingOAuthSessions.get(uid);

  if (!session) {
    return res.json({ completed: false });
  }

  res.json(session);
});

// Polling endpoint for frontend to check if TikTok OAuth completed
app.get("/api/auth/tiktok/session", (req, res) => {
  const uid = (req.query.uid as string) || "guest";
  const session = pendingOAuthSessions.get(`tiktok_${uid}`) || pendingOAuthSessions.get(uid);

  if (!session) {
    return res.json({ completed: false });
  }

  res.json(session);
});

// 1. Endpoint to generate TikTok OAuth URL
app.get("/api/auth/tiktok/url", (req, res) => {
  try {
    const clientKey = process.env.TIKTOK_CLIENT_KEY?.trim();
    const clientSecret = process.env.TIKTOK_CLIENT_SECRET?.trim();

    if (!clientKey || !clientSecret) {
      return res.status(400).json({ 
        error: "TikTok configuration missing",
        message: "TIKTOK_CLIENT_KEY and TIKTOK_CLIENT_SECRET are not configured in AI Studio Secrets. Please configure them in Settings." 
      });
    }

    const redirectUri = getTikTokRedirectUri(req);
    const state = `tiktok_${req.query.uid as string || Date.now()}`;

    // Register pending session
    pendingOAuthSessions.set(state, {
      completed: false,
      timestamp: Date.now()
    });

    const params = new URLSearchParams({
      client_key: clientKey,
      scope: "user.info.basic,user.info.profile,user.info.stats,video.list",
      response_type: "code",
      redirect_uri: redirectUri,
      state: state
    });

    const authUrl = `https://www.tiktok.com/v2/auth/authorize/?${params.toString()}`;
    res.json({ url: authUrl, sessionId: state, redirectUri });
  } catch (error: any) {
    console.error("Error generating TikTok OAuth URL:", error);
    res.status(500).json({ error: "Failed to generate TikTok authorization URL", details: error.message });
  }
});

// 1. Endpoint to generate Google/YouTube OAuth URL
app.get("/api/auth/google/url", (req, res) => {
  try {
    const clientId = process.env.YOUTUBE_CLIENT_ID?.trim();
    const clientSecret = process.env.YOUTUBE_CLIENT_SECRET?.trim();

    if (!clientId || !clientSecret) {
      return res.status(400).json({ 
        error: "YouTube configuration missing",
        message: "YOUTUBE_CLIENT_ID and YOUTUBE_CLIENT_SECRET are not configured or empty. Please check your AI Studio Secrets panel." 
      });
    }

    const redirectUri = getRedirectUri(req);
    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);

    // Request readonly access to view YouTube channel statistics and metadata
    const scopes = [
      "https://www.googleapis.com/auth/youtube.readonly",
      "https://www.googleapis.com/auth/userinfo.profile"
    ];

    const state = (req.query.uid as string) || `guest_${Date.now()}`;

    // Register pending session
    pendingOAuthSessions.set(state, {
      completed: false,
      timestamp: Date.now()
    });

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: "offline", // To receive refresh tokens
      prompt: "consent",      // Force consent to get refresh token every time
      scope: scopes,
      state: state,
    });

    res.json({ url: authUrl, sessionId: state, redirectUri });
  } catch (error: any) {
    console.error("Error generating OAuth URL:", error);
    res.status(500).json({ error: "Failed to generate authorization URL", details: error.message });
  }
});

// Handler for TikTok Authorization Code exchange
async function handleTikTokCallback(req: express.Request, res: express.Response) {
  const code = (req.query.code as string) || (req.query.auth_code as string);
  const state = (req.query.state as string) || "guest";

  if (!code) {
    return res.status(400).send("No authorization code provided by TikTok.");
  }

  try {
    const clientKey = process.env.TIKTOK_CLIENT_KEY?.trim();
    const clientSecret = process.env.TIKTOK_CLIENT_SECRET?.trim();
    const redirectUri = req.path.includes("tiktok") ? getTikTokRedirectUri(req) : getRedirectUri(req);

    if (!clientKey || !clientSecret) {
      throw new Error("TikTok credentials (TIKTOK_CLIENT_KEY / TIKTOK_CLIENT_SECRET) missing on server.");
    }

    // Exchange code for TikTok user access token
    const tokenParams = new URLSearchParams({
      client_key: clientKey,
      client_secret: clientSecret,
      code: code,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
    });

    const tokenRes = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Cache-Control": "no-cache"
      },
      body: tokenParams.toString()
    });

    const tokenData = await tokenRes.json();
    if (tokenData.error && tokenData.error.code !== "ok" && tokenData.error.message) {
      throw new Error(`TikTok token exchange error: ${tokenData.error.message}`);
    }

    const tokens = tokenData.data || tokenData;
    const accessToken = tokens.access_token;
    const openId = tokens.open_id;

    let tiktokStats: any = null;
    if (accessToken) {
      try {
        const userRes = await fetch(
          "https://open.tiktokapis.com/v2/user/info/?fields=open_id,union_id,avatar_url,display_name,bio_description,profile_deep_link,is_verified,follower_count,following_count,likes_count,video_count",
          {
            headers: {
              "Authorization": `Bearer ${accessToken}`
            }
          }
        );
        const userData = await userRes.json();
        const user = userData.data?.user || userData.user;
        if (user) {
          tiktokStats = {
            success: true,
            openId: user.open_id || openId,
            displayName: user.display_name || "TikTok Creator",
            avatarUrl: user.avatar_url || "",
            bioDescription: user.bio_description || "",
            profileDeepLink: user.profile_deep_link || "",
            isVerified: Boolean(user.is_verified),
            metrics: {
              followers: Number(user.follower_count || 0),
              following: Number(user.following_count || 0),
              likes: Number(user.likes_count || 0),
              videos: Number(user.video_count || 0)
            }
          };
        }
      } catch (e: any) {
        console.warn("Could not fetch TikTok user info:", e.message);
      }
    }

    if (!tiktokStats) {
      tiktokStats = {
        success: true,
        openId: openId || "connected",
        displayName: "TikTok Creator",
        avatarUrl: "",
        metrics: {
          followers: 0,
          following: 0,
          likes: 0,
          videos: 0
        }
      };
    }

    // Save to pending session map for polling resolution
    pendingOAuthSessions.set(state, {
      completed: true,
      tokens,
      tiktokStats,
      timestamp: Date.now()
    });
    // Also without prefix if needed
    const rawUid = state.replace(/^tiktok_/, "");
    pendingOAuthSessions.set(rawUid, {
      completed: true,
      tokens,
      tiktokStats,
      timestamp: Date.now()
    });

    const displayName = tiktokStats.displayName || "TikTok Creator";
    const followers = tiktokStats.metrics?.followers?.toLocaleString() || "0";
    const likes = tiktokStats.metrics?.likes?.toLocaleString() || "0";

    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>TikTok Connected</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #09090b; color: #f4f4f5; text-align: center; padding: 40px 20px; }
            .card { max-width: 420px; margin: 0 auto; background: #18181b; border: 1px solid #27272a; border-radius: 16px; padding: 24px; }
            .icon-wrap { width: 52px; height: 52px; background: rgba(6, 182, 212, 0.15); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; color: #06b6d4; font-size: 24px; font-weight: bold; }
            .badge { display: inline-block; padding: 4px 12px; background: rgba(34, 197, 94, 0.15); color: #22c55e; border-radius: 9999px; font-size: 12px; font-weight: bold; margin-bottom: 12px; }
            h2 { margin: 0 0 8px; font-size: 20px; }
            p { color: #a1a1aa; font-size: 14px; line-height: 1.5; margin: 0 0 16px; }
            .stats { display: flex; justify-content: space-around; background: #09090b; border-radius: 12px; padding: 12px; margin-bottom: 20px; }
            .stat-val { font-size: 16px; font-weight: bold; color: #fff; }
            .stat-lbl { font-size: 11px; color: #71717a; text-transform: uppercase; margin-top: 2px; }
            .btn { background: #06b6d4; color: #000; border: none; border-radius: 8px; padding: 10px 20px; font-weight: bold; font-size: 14px; cursor: pointer; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="icon-wrap">♪</div>
            <div class="badge">TIKTOK SYNC COMPLETE</div>
            <h2>${displayName}</h2>
            <p>Your live TikTok account metrics are synchronized to Creator OS.</p>
            
            <div class="stats">
              <div>
                <div class="stat-val">${followers}</div>
                <div class="stat-lbl">Followers</div>
              </div>
              <div>
                <div class="stat-val">${likes}</div>
                <div class="stat-lbl">Total Likes</div>
              </div>
            </div>

            <button class="btn" onclick="window.close()">Return to Dashboard</button>
          </div>

          <script>
            const payload = {
              type: 'OAUTH_AUTH_SUCCESS',
              provider: 'tiktok',
              userId: ${JSON.stringify(state)},
              tokens: ${JSON.stringify(tokens)},
              tiktokStats: ${JSON.stringify(tiktokStats)},
              timestamp: Date.now()
            };

            // 1. Post to opener if available
            try {
              if (window.opener) {
                window.opener.postMessage(payload, '*');
              }
            } catch (e) {
              console.warn("Opener postMessage error:", e);
            }

            // 2. Set in localStorage for storage event listener across tabs
            try {
              localStorage.setItem('CREATOR_OS_AUTH_COMPLETED', JSON.stringify(payload));
            } catch (e) {
              console.warn("LocalStorage set error:", e);
            }

            // Auto close after 2.5s if in popup
            setTimeout(() => {
              try { window.close(); } catch(e) {}
            }, 2500);
          </script>
        </body>
      </html>
    `);
  } catch (err: any) {
    console.error("TikTok OAuth Exchange Error:", err);
    res.status(500).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>TikTok Authentication Error</title>
          <style>
            body { font-family: sans-serif; background-color: #09090b; color: #ef4444; padding: 40px; text-align: center; }
          </style>
        </head>
        <body>
          <h2>TikTok Authorization Failed</h2>
          <p style="color: #a1a1aa">${err.message || "An error occurred while connecting your TikTok account."}</p>
          <button onclick="window.close()" style="margin-top: 20px; background: #27272a; color: #f4f4f5; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer;">Close Window</button>
        </body>
      </html>
    `);
  }
}

// 2. Dedicated TikTok Callback Route
app.get(["/auth/callback/tiktok", "/auth/callback/tiktok/"], handleTikTokCallback);

// 3. Unified Endpoint to exchange Authorization Code for YouTube or TikTok
app.get(["/auth/callback", "/auth/callback/"], async (req, res) => {
  const code = req.query.code as string;
  const state = req.query.state as string || "guest";

  if (!code) {
    return res.status(400).send("No authorization code provided.");
  }

  // Check if this is a TikTok callback forwarded to the default redirect URI
  if (state.startsWith("tiktok_") || req.query.scopes !== undefined) {
    return handleTikTokCallback(req, res);
  }

  try {
    const clientId = process.env.YOUTUBE_CLIENT_ID?.trim();
    const clientSecret = process.env.YOUTUBE_CLIENT_SECRET?.trim();
    const redirectUri = getRedirectUri(req);

    if (!clientId || !clientSecret) {
      throw new Error("Client configuration missing on the backend.");
    }

    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
    const { tokens } = await oauth2Client.getToken(code);

    // Immediately fetch YouTube Channel statistics on the backend
    oauth2Client.setCredentials(tokens);
    const youtube = google.youtube({ version: "v3", auth: oauth2Client });
    
    let youtubeStats: any = null;
    try {
      const channelResp = await youtube.channels.list({
        part: ["snippet", "statistics"],
        mine: true
      });

      const channels = channelResp.data.items;
      if (channels && channels.length > 0) {
        const mainChannel = channels[0];
        const stats = mainChannel.statistics;
        const snippet = mainChannel.snippet;
        youtubeStats = {
          success: true,
          channelId: mainChannel.id,
          title: snippet?.title || "Connected YouTube Channel",
          customUrl: snippet?.customUrl || "",
          avatar: snippet?.thumbnails?.default?.url || "",
          metrics: {
            subscribers: Number(stats?.subscriberCount || 0),
            views: Number(stats?.viewCount || 0),
            videos: Number(stats?.videoCount || 0),
            hiddenSubscriberCount: stats?.hiddenSubscriberCount || false
          }
        };
      }
    } catch (e: any) {
      console.warn("Could not immediately fetch channel stats in callback:", e.message);
    }

    // Save to pending session map for polling resolution
    pendingOAuthSessions.set(state, {
      completed: true,
      tokens,
      youtubeStats,
      timestamp: Date.now()
    });

    const channelTitle = youtubeStats?.title || "Your YouTube Channel";
    const subCount = youtubeStats?.metrics?.subscribers?.toLocaleString() || "0";
    const viewCount = youtubeStats?.metrics?.views?.toLocaleString() || "0";

    // Return HTML with triple-redundancy: postMessage + localStorage + automatic window close
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Authentication Successful</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #09090b; color: #f4f4f5; text-align: center; padding: 40px 20px; }
            .card { max-width: 420px; margin: 0 auto; background: #18181b; border: 1px solid #27272a; border-radius: 16px; padding: 24px; }
            .icon-wrap { width: 52px; height: 52px; background: rgba(239, 68, 68, 0.15); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; color: #ef4444; font-size: 24px; font-weight: bold; }
            .badge { display: inline-block; padding: 4px 12px; background: rgba(34, 197, 94, 0.15); color: #22c55e; border-radius: 9999px; font-size: 12px; font-weight: bold; margin-bottom: 12px; }
            h2 { margin: 0 0 8px; font-size: 20px; }
            p { color: #a1a1aa; font-size: 14px; line-height: 1.5; margin: 0 0 16px; }
            .stats { display: flex; justify-content: space-around; background: #09090b; border-radius: 12px; padding: 12px; margin-bottom: 20px; }
            .stat-val { font-size: 16px; font-weight: bold; color: #fff; }
            .stat-lbl { font-size: 11px; color: #71717a; text-transform: uppercase; margin-top: 2px; }
            .btn { background: #6366f1; color: #fff; border: none; border-radius: 8px; padding: 10px 20px; font-weight: bold; font-size: 14px; cursor: pointer; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="icon-wrap">▶</div>
            <div class="badge">LIVE SYNC COMPLETE</div>
            <h2>${channelTitle}</h2>
            <p>Your live YouTube analytics are connected to Creator OS.</p>
            
            <div class="stats">
              <div>
                <div class="stat-val">${subCount}</div>
                <div class="stat-lbl">Subscribers</div>
              </div>
              <div>
                <div class="stat-val">${viewCount}</div>
                <div class="stat-lbl">Total Views</div>
              </div>
            </div>

            <button class="btn" onclick="window.close()">Return to Dashboard</button>
          </div>

          <script>
            const payload = {
              type: 'OAUTH_AUTH_SUCCESS',
              provider: 'youtube',
              userId: ${JSON.stringify(state)},
              tokens: ${JSON.stringify(tokens)},
              youtubeStats: ${JSON.stringify(youtubeStats)},
              timestamp: Date.now()
            };

            // 1. Post to opener if available
            try {
              if (window.opener) {
                window.opener.postMessage(payload, '*');
              }
            } catch (e) {
              console.warn("Opener postMessage error:", e);
            }

            // 2. Set in localStorage for storage event listener across tabs
            try {
              localStorage.setItem('CREATOR_OS_AUTH_COMPLETED', JSON.stringify(payload));
            } catch (e) {
              console.warn("LocalStorage set error:", e);
            }

            // Auto close after 2.5s if in popup
            setTimeout(() => {
              try { window.close(); } catch(e) {}
            }, 2500);
          </script>
        </body>
      </html>
    `);
  } catch (err: any) {
    console.error("OAuth Exchange Error:", err);
    res.status(500).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Authentication Error</title>
          <style>
            body { font-family: sans-serif; background-color: #09090b; color: #ef4444; padding: 40px; text-align: center; }
          </style>
        </head>
        <body>
          <h2>OAuth Verification Failed</h2>
          <p style="color: #a1a1aa">${err.message || "An exception occurred during authorization."}</p>
          <button onclick="window.close()" style="margin-top: 20px; background: #27272a; color: #f4f4f5; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer;">Close Window</button>
        </body>
      </html>
    `);
  }
});

// 4. Proxy endpoint to query REAL TikTok account statistics
app.get("/api/tiktok/stats", async (req, res) => {
  const tokenString = req.query.accessToken as string;
  if (!tokenString) {
    return res.status(401).json({ error: "Access token is required" });
  }

  try {
    const userRes = await fetch(
      "https://open.tiktokapis.com/v2/user/info/?fields=open_id,union_id,avatar_url,display_name,bio_description,profile_deep_link,is_verified,follower_count,following_count,likes_count,video_count",
      {
        headers: {
          "Authorization": `Bearer ${tokenString}`
        }
      }
    );
    const userData = await userRes.json();
    const user = userData.data?.user || userData.user;

    if (!user) {
      return res.status(404).json({ error: "No TikTok user found for this token." });
    }

    res.json({
      success: true,
      openId: user.open_id,
      displayName: user.display_name || "TikTok Creator",
      avatarUrl: user.avatar_url || "",
      bioDescription: user.bio_description || "",
      profileDeepLink: user.profile_deep_link || "",
      isVerified: Boolean(user.is_verified),
      metrics: {
        followers: Number(user.follower_count || 0),
        following: Number(user.following_count || 0),
        likes: Number(user.likes_count || 0),
        videos: Number(user.video_count || 0)
      }
    });
  } catch (error: any) {
    console.error("TikTok Live Fetch Error:", error);
    res.status(500).json({ error: "Failed to fetch TikTok stats", message: error.message });
  }
});

// 3. Proxy endpoint to query REAL YouTube channel statistics
app.get("/api/youtube/stats", async (req, res) => {
  const tokenString = req.query.accessToken as string;
  if (!tokenString) {
    return res.status(401).json({ error: "Access token is required" });
  }

  try {
    const clientId = process.env.YOUTUBE_CLIENT_ID;
    const clientSecret = process.env.YOUTUBE_CLIENT_SECRET;
    const redirectUri = getRedirectUri();

    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
    oauth2Client.setCredentials({ access_token: tokenString });

    const youtube = google.youtube({ version: "v3", auth: oauth2Client });
    
    // Fetch channels associated with this user
    const response = await youtube.channels.list({
      part: ["snippet", "statistics"],
      mine: true
    });

    const channels = response.data.items;
    if (!channels || channels.length === 0) {
      return res.status(404).json({ error: "No YouTube channels detected for this Google account." });
    }

    const mainChannel = channels[0];
    const stats = mainChannel.statistics;
    const snippet = mainChannel.snippet;

    res.json({
      success: true,
      channelId: mainChannel.id,
      title: snippet?.title || "My YouTube Space",
      customUrl: snippet?.customUrl || "",
      avatar: snippet?.thumbnails?.default?.url || "",
      metrics: {
        subscribers: Number(stats?.subscriberCount || 0),
        views: Number(stats?.viewCount || 0),
        videos: Number(stats?.videoCount || 0),
        hiddenSubscriberCount: stats?.hiddenSubscriberCount || false
      }
    });
  } catch (error: any) {
    console.error("YouTube Live Fetch Error:", error);
    res.status(500).json({ error: "Failed to fetch YouTube stats", message: error.message });
  }
});

// ==========================================
// 4. Gemini AI Server-Side Intelligence APIs
// ==========================================

// Helper function to build intelligent dynamic strategy fallback when Gemini is unavailable
function getDynamicStrategyFallback(params: any) {
  const { userProfile, connectedPlatforms = [], youtubeChannelInfo, posts = [] } = params || {};
  const niche = userProfile?.niche || "Product and Creative";
  const name = userProfile?.name ? userProfile.name.split(" ")[0] : "Creator";
  const hasYt = connectedPlatforms.includes("youtube") || Boolean(youtubeChannelInfo);
  const ytSubs = typeof youtubeChannelInfo?.metrics?.subscribers === "number" ? youtubeChannelInfo.metrics.subscribers : 0;
  const ytViews = typeof youtubeChannelInfo?.metrics?.views === "number" ? youtubeChannelInfo.metrics.views : 0;
  const ytVideos = typeof youtubeChannelInfo?.metrics?.videos === "number" ? youtubeChannelInfo.metrics.videos : (typeof youtubeChannelInfo?.metrics?.videoCount === "number" ? youtubeChannelInfo.metrics.videoCount : 0);
  const scheduledCount = Array.isArray(posts) ? posts.filter((p: any) => p.status === "scheduled").length : 0;
  const publishedCount = Array.isArray(posts) ? posts.filter((p: any) => p.status === "published").length : 0;

  const isZeroState = ytSubs === 0 && ytViews === 0 && ytVideos === 0 && publishedCount === 0;

  if (isZeroState) {
    return {
      performanceInsight: `You haven't started posting yet, let's brainstorm ideas! I'll help you with production ideas, hook formulas, and building your first 30-day content calendar to establish your brand presence in ${niche} and unlock your first monetization avenues.`,
      contentIdeas: [
        {
          title: `Why I Decided to Focus on ${niche} in 2026`,
          description: `A personal, compelling origin story video introducing your unique philosophy, the core problems you solve, and what viewers will learn from your channel.`,
          platform: "YouTube",
          reasoning: `Introduction and manifesto videos build deep audience empathy and have very high conversion into your first 100 core subscribers.`
        },
        {
          title: `3 Essential Tools in My ${niche} Stack`,
          description: `Fast-paced visual breakdown of the top 3 software tools, templates, or hardware items you rely on daily, including practical pros & cons.`,
          platform: "TikTok",
          reasoning: `Tool breakdowns and practical tech stacks have high organic algorithmic discovery on short-form feeds for zero-subscriber accounts.`
        },
        {
          title: `The Biggest Mistakes Beginners Make in ${niche}`,
          description: `Educational thread breaking down 4 common pitfalls you have observed and the exact contrarian mental frameworks to avoid them.`,
          platform: "Twitter",
          reasoning: `Authoritative contrarian advice establishes professional credibility quickly and drives early bookmarking and profile clicks.`
        }
      ],
      optimalSchedule: [
        { day: "Tuesday", time: "7:00 PM", platform: "YouTube", reason: "Prime evening attention window for comprehensive tutorials." },
        { day: "Thursday", time: "1:00 PM", platform: "TikTok", reason: "Mid-week lunch discovery peak for short visual tips." },
        { day: "Saturday", time: "11:00 AM", platform: "Instagram", reason: "Weekend exploration time for carousel visual guides." }
      ],
      trendingTopics: [
        `AI Workflow Optimization in ${niche}`,
        `Minimalist Workspace & Tooling`,
        `Zero to First $1k Creator Roadmap`,
        `High-Converting Visual Hierarchy`,
        `Building in Public Strategies`
      ]
    };
  }

  // Active creator with metrics
  return {
    performanceInsight: `With ${ytViews.toLocaleString()} total views and ${ytSubs.toLocaleString()} subscribers on ${youtubeChannelInfo?.title || 'your channels'}, focus on audience retention in the first 30 seconds. Repurposing your top-performing concepts into interactive short-form reels will accelerate your growth velocity in ${niche}.`,
    contentIdeas: [
      {
        title: `Deep Dive: Advanced Frameworks in ${niche}`,
        description: `Step-by-step masterclass analyzing high-leverage workflows with downloadable cheat sheets.`,
        platform: "YouTube",
        reasoning: `High watch time on long-form content boosts channel authority in search indexing.`
      },
      {
        title: `Quick Tip: How to 10x Your ${niche} Output`,
        description: `Bite-sized breakdown of your favorite productivity shortcut.`,
        platform: "Instagram",
        reasoning: `High shareability on Instagram Reels to attract fresh top-of-funnel viewers.`
      },
      {
        title: `Case Study: Real-World Lessons from ${niche}`,
        description: `Behind-the-scenes breakdown of actual challenges and how you overcame them.`,
        platform: "Twitter",
        reasoning: `Builds authentic thought leadership and high quote-tweet engagement.`
      }
    ],
    optimalSchedule: [
      { day: "Tuesday", time: "7:00 PM", platform: "YouTube", reason: "Peak subscriber watch activity." },
      { day: "Friday", time: "12:00 PM", platform: "Instagram", reason: "Highest lunchtime engagement." },
      { day: "Sunday", time: "8:00 PM", platform: "Twitter", reason: "End-of-week planning review." }
    ],
    trendingTopics: [
      `Next-Gen AI in ${niche}`,
      `Audience Monetization Funnels`,
      `Design Systems at Scale`,
      `Modern Creator Stack 2026`,
      `Multi-Channel Content Engines`
    ]
  };
}

// Helper function to build intelligent dynamic repurpose fallback
function getDynamicRepurposeFallback(body: any) {
  const { ideaTitle = "Content Blueprint", ideaDescription = "", originalPlatform = "YouTube", targetPlatform = "Twitter/X Thread", customTone = "punchy & engaging" } = body || {};
  const isTwitter = targetPlatform.toLowerCase().includes("twitter") || targetPlatform.toLowerCase().includes("x ");
  const isTiktok = targetPlatform.toLowerCase().includes("tiktok") || targetPlatform.toLowerCase().includes("reel") || targetPlatform.toLowerCase().includes("shorts");
  const isLinkedIn = targetPlatform.toLowerCase().includes("linkedin");

  let variationType = isTwitter ? "Twitter Thread (5 Posts)" : isTiktok ? "Short-Form Video Script (30-60s)" : isLinkedIn ? "Executive Article" : "Visual Carousel Guide";
  let blocks: any[] = [];

  if (isTwitter) {
    blocks = [
      { label: "1/5 Hook Tweet", content: `Most creators get "${ideaTitle}" completely backward.\n\nHere is the exact high-leverage framework to 10x your output without burning out 🧵👇` },
      { label: "2/5 Core Problem", content: `The biggest trap is over-complicating production before nailing the hook.\n\n${ideaDescription || "Focus on one clear thesis per post and eliminate 40% of fluff."}` },
      { label: "3/5 The Playbook", content: `3 simple rules to execute this:\n1. Hook in the first 2 seconds / lines\n2. Deliver actionable takeaway in step-by-step clarity\n3. Provide downloadable template or lead magnet` },
      { label: "4/5 Pro-Tip", content: `Batch your creation into single-focus sessions: 1 day for research & ideation, 1 day for scripting, 1 day for multi-channel distribution.` },
      { label: "5/5 CTA", content: `If you found this valuable:\n1. Follow for more creator workflow breakdowns\n2. Repost the first tweet to share with your network` }
    ];
  } else if (isTiktok) {
    blocks = [
      { label: "Hook (0:00 - 0:03)", content: `Stop doing "${ideaTitle}" the hard way. Here's what you need to do instead.`, visualCue: "Fast zoom on talking head with bold on-screen caption" },
      { label: "The Shift (0:03 - 0:15)", content: `${ideaDescription || "Most creators spend hours on editing when the real lever is the first 3 seconds of retention."}`, visualCue: "Screen recording / visual b-roll highlight" },
      { label: "The Action Step (0:15 - 0:35)", content: `Use this 3-step workflow: First, define the transformation. Second, cut the preamble. Third, give them an immediate micro-win.`, visualCue: "Text overlays pointing to step 1, 2, 3" },
      { label: "CTA (0:35 - 0:45)", content: `Save this video for your next filming session and drop your niche in the comments!`, visualCue: "Friendly close-up with comment sticker animation" }
    ];
  } else {
    blocks = [
      { label: "The Hook", content: `Why "${ideaTitle}" is the most underrated growth strategy for creators in 2026.` },
      { label: "The Insight", content: `${ideaDescription || "The creator economy is shifting from broad viral vanity metrics to deep, high-trust niche ecosystems."}` },
      { label: "The Framework", content: `Here is the structured approach:\n• Phase 1: Research high-signal topics\n• Phase 2: Build repurposing loops across video and text\n• Phase 3: Monetize directly with digital assets` },
      { label: "Key Takeaway", content: `Focus on clarity and leverage over raw volume. Quality distribution compounds faster than isolated posts.` }
    ];
  }

  return {
    targetPlatform,
    title: ideaTitle,
    variationType,
    intro: `Optimized for ${targetPlatform} with a ${customTone} tone.`,
    blocks,
    hashtags: ["#CreatorEconomy", "#ContentStrategy", "#BuildInPublic", "#CreatorGrowth"],
    growthTip: "Post during your audience's local peak availability window and engage in the comments within the first 45 minutes."
  };
}

// Multi-model resilience helper with exponential backoff for high-demand spikes (503 / 429)
async function generateWithGeminiCascade(
  ai: GoogleGenAI,
  params: {
    contents: any;
    config?: any;
    primaryModel?: string;
  }
) {
  const models = [
    params.primaryModel || "gemini-3.7-flash",
    "gemini-flash-latest",
    "gemini-3.1-flash-lite"
  ];
  const candidateModels = Array.from(new Set(models));

  let lastError: any = null;

  for (const model of candidateModels) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: params.contents,
          config: params.config,
        });
        return response;
      } catch (err: any) {
        lastError = err;
        const msg = String(err?.message || "");
        const status = err?.status || err?.code;
        const isTransient =
          status === "UNAVAILABLE" ||
          status === 503 ||
          status === 429 ||
          msg.includes("503") ||
          msg.includes("high demand") ||
          msg.includes("UNAVAILABLE") ||
          msg.includes("RESOURCE_EXHAUSTED") ||
          msg.includes("temporarily unavailable") ||
          msg.includes("overloaded");

        if (isTransient && attempt === 0) {
          // Wait briefly before retrying this model
          await new Promise((resolve) => setTimeout(resolve, 500));
          continue;
        }
        // Advance to fallback model in cascade
        break;
      }
    }
  }

  throw lastError;
}

// POST /api/ai/strategy
app.post("/api/ai/strategy", async (req, res) => {
  const { userProfile, connectedPlatforms = [], youtubeChannelInfo, posts = [] } = req.body || {};
  const niche = userProfile?.niche || "Product and Creative";
  const creatorName = userProfile?.name || "Creator";
  const hasYt = connectedPlatforms.includes("youtube") || Boolean(youtubeChannelInfo);
  const ytSubs = typeof youtubeChannelInfo?.metrics?.subscribers === "number" ? youtubeChannelInfo.metrics.subscribers : 0;
  const ytViews = typeof youtubeChannelInfo?.metrics?.views === "number" ? youtubeChannelInfo.metrics.views : 0;
  const ytVideos = typeof youtubeChannelInfo?.metrics?.videos === "number" ? youtubeChannelInfo.metrics.videos : (typeof youtubeChannelInfo?.metrics?.videoCount === "number" ? youtubeChannelInfo.metrics.videoCount : 0);
  const scheduledCount = Array.isArray(posts) ? posts.filter((p: any) => p.status === "scheduled").length : 0;
  const publishedCount = Array.isArray(posts) ? posts.filter((p: any) => p.status === "published").length : 0;

  const isZeroState = ytSubs === 0 && ytViews === 0 && ytVideos === 0 && publishedCount === 0;

  const ai = getGeminiClient();

  if (!ai) {
    // Return smart dynamic contextual strategy based on actual user data
    return res.json({
      success: true,
      strategy: getDynamicStrategyFallback(req.body)
    });
  }

  const prompt = `
    You are the Senior AI Executive Strategist for Creator OS.
    Analyze this creator's REAL profile, stage, channel numbers, and content pipeline to provide tailored, strategic guidance.

    CREATOR CONTEXT:
    - Name: ${creatorName}
    - Niche: ${niche}
    - Connected Social Platforms: ${connectedPlatforms.length > 0 ? connectedPlatforms.join(", ") : "None connected yet"}
    - YouTube Account: ${hasYt ? (youtubeChannelInfo?.title ? `Synced channel "${youtubeChannelInfo.title}"` : "Connected") : "Not linked"}
    - Live YouTube Subscribers: ${ytSubs}
    - Live Total Views: ${ytViews}
    - Public Video Count: ${ytVideos}
    - Total Scheduled Posts in Pipeline: ${scheduledCount}
    - Total Published Posts: ${publishedCount}
    - Is Brand New Creator / Zero State: ${isZeroState ? "YES (0 posts, 0 videos, 0 views)" : "NO (Active creator with content)"}

    CRITICAL INSTRUCTIONS FOR PERFORMANCE INSIGHT:
    ${isZeroState ? `
    - The creator has NOT published any content yet and currently has 0 subscribers / 0 views.
    - DO NOT talk about past engagement drops or mock stats!
    - The insight MUST speak directly to starting out, for instance:
      "You haven't started posting yet, let's brainstorm ideas! I'll help you with production ideas, hook formulas, and building your first 30-day content calendar to establish your brand presence in ${niche} and unlock your first monetization avenues."
    - Focus content ideas on 3 foundational launch topics (e.g. Origin story, Beginner roadmap, Essential tools).
    ` : `
    - Provide deep, data-driven analysis referencing their actual ${ytSubs} subscribers and ${ytViews} views.
    - Suggest high-leverage ways to optimize retention, expand to new formats, and monetize through digital products and brand sponsorships in ${niche}.
    `}

    Return strict JSON matching the required schema.
  `;

  try {
    const response = await generateWithGeminiCascade(ai, {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            performanceInsight: { type: Type.STRING },
            contentIdeas: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  platform: { type: Type.STRING },
                  reasoning: { type: Type.STRING }
                },
                required: ["title", "description", "platform", "reasoning"]
              }
            },
            optimalSchedule: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  day: { type: Type.STRING },
                  time: { type: Type.STRING },
                  platform: { type: Type.STRING },
                  reason: { type: Type.STRING }
                },
                required: ["day", "time", "platform", "reason"]
              }
            },
            trendingTopics: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["performanceInsight", "contentIdeas", "optimalSchedule", "trendingTopics"]
        }
      }
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json({
      success: true,
      strategy: parsed
    });
  } catch (err: any) {
    console.warn("Gemini Strategy API fallback invoked:", err?.message || err);
    // Fall back to smart dynamic generator
    return res.json({
      success: true,
      strategy: getDynamicStrategyFallback(req.body)
    });
  }
});

// POST /api/ai/repurpose
app.post("/api/ai/repurpose", async (req, res) => {
  const { ideaTitle, ideaDescription, originalPlatform = "YouTube", targetPlatform = "Twitter/X Thread", customTone = "punchy & engaging" } = req.body || {};
  const ai = getGeminiClient();

  if (!ai) {
    // Dynamic fallback
    return res.json({
      success: true,
      result: getDynamicRepurposeFallback(req.body)
    });
  }

  const prompt = `
    You are an expert Content Growth Chemist & Social Media Copywriter.
    Translate this content idea for "${originalPlatform}" into an optimized variation for "${targetPlatform}".
    
    Original Content:
    - Title: "${ideaTitle}"
    - Description: "${ideaDescription}"
    - Target: "${targetPlatform}"
    - Desired Tone: "${customTone}"

    Rules:
    - If Twitter/X: 3-5 high-signal tweets with clear value hooks.
    - If TikTok/Reels: Short video script with visual cues and 0-3s hook.
    - If LinkedIn: Professional thought leadership post with clean spacing.
    - If Instagram Carousel: Slide-by-slide guide.

    Return strict JSON format.
  `;

  try {
    const response = await generateWithGeminiCascade(ai, {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            targetPlatform: { type: Type.STRING },
            title: { type: Type.STRING },
            variationType: { type: Type.STRING },
            intro: { type: Type.STRING },
            blocks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  label: { type: Type.STRING },
                  content: { type: Type.STRING },
                  visualCue: { type: Type.STRING }
                },
                required: ["content"]
              }
            },
            hashtags: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            growthTip: { type: Type.STRING }
          },
          required: ["targetPlatform", "title", "variationType", "intro", "blocks", "hashtags", "growthTip"]
        }
      }
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json({ success: true, result: parsed });
  } catch (err: any) {
    console.warn("Gemini Repurpose API fallback invoked:", err?.message || err);
    return res.json({
      success: true,
      result: getDynamicRepurposeFallback(req.body)
    });
  }
});

// POST /api/ai/chat
app.post("/api/ai/chat", async (req, res) => {
  const { messages = [], userContext = {} } = req.body || {};
  const ai = getGeminiClient();

  const name = userContext.name || "Creator";
  const niche = userContext.niche || "Product and Creative";
  const ytSubs = userContext.ytSubs ?? 0;
  const ytViews = userContext.ytViews ?? 0;
  const isZeroState = ytSubs === 0 && ytViews === 0 && (!userContext.postsCount || userContext.postsCount === 0);

  if (!ai) {
    // Contextual fallback response
    const lastUserMsg = messages[messages.length - 1]?.content || "";
    let reply = `Hi ${name}! As your Creator OS Strategist in ${niche}, I'm here to help you `;
    if (isZeroState) {
      reply += `launch your brand from ground zero. Since you haven't started posting yet, let's brainstorm your first 3 anchor content ideas, create your schedule, and set up your initial monetization pipeline! What topic in ${niche} are you most excited to explore first?`;
    } else {
      reply += `scale your ${ytViews.toLocaleString()} views and ${ytSubs.toLocaleString()} subscribers. How can we optimize your upcoming content pipeline today?`;
    }
    return res.json({ success: true, reply });
  }

  try {
    const formattedContents = messages.map((m: any) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }]
    }));

    const systemInstruction = `
      You are the Creator OS Executive AI Coach assisting ${name} (niche: ${niche}).
      Creator Status:
      - Current Stage: ${isZeroState ? "Fresh Creator (0 published posts, 0 subscribers, 0 views)" : `Active Creator (${ytSubs} subscribers, ${ytViews} views)`}
      - Connected Platforms: ${userContext.connectedPlatforms?.join(', ') || 'None'}
      
      Guidelines:
      - If they are a Fresh Creator: Be super encouraging, actionable, and focus on zero-to-one launch velocity (first 3 video ideas, script hooks, setting up a 30-day posting calendar, overcoming impostor syndrome, finding their unique voice).
      - If they are an Active Creator: Focus on scaling views, improving average view duration, optimizing thumbnails/hooks, and launching digital products or sponsorships.
      - Use clean markdown formatting with concise bullet points.
    `;

    const response = await generateWithGeminiCascade(ai, {
      contents: formattedContents,
      config: {
        systemInstruction
      }
    });

    return res.json({
      success: true,
      reply: response.text || "I've analyzed your creator profile. Let's continue building your content pipeline!"
    });
  } catch (err: any) {
    console.warn("Gemini Chat API fallback invoked:", err?.message || err);
    // Contextual fallback reply
    const lastUserMsg = messages[messages.length - 1]?.content || "";
    let answer = "";
    if (isZeroState) {
      if (lastUserMsg.toLowerCase().includes("idea") || lastUserMsg.toLowerCase().includes("brainstorm") || lastUserMsg.toLowerCase().includes("start")) {
        answer = `### 🚀 3 High-Impact Launch Ideas for ${niche}\n\n1. **The Origin Manifesto (YouTube)**: *"Why I'm Starting My ${niche} Journey in 2026"*\n   - **Hook**: "Most people wait until they are successful to share their frameworks. I'm building in public starting today."\n   - **Goal**: Win your first 50 loyal subscribers.\n\n2. **The 3-Tool Workflow (TikTok/Reels)**: *"The 3 Tools I Can't Live Without in ${niche}"*\n   - **Hook**: "If I lost everything and had to restart today, here are the 3 free tools I would download first."\n   - **Goal**: High algorithmic discovery.\n\n3. **The Contrarian Advice (Twitter/X)**: *"4 Things Beginners in ${niche} Waste Time On"*\n   - **Goal**: Rapid credibility building.`;
      } else {
        answer = `### Zero-to-One Launch Plan for ${niche}\n\nSince you are starting fresh, focus on **fast execution cycles**:\n- **Week 1**: 1 YouTube introductory video + 2 short visual clips.\n- **Week 2**: 3 short-form workflow tips + 1 actionable Twitter thread.\n- **Week 3**: 1 Deep-dive tutorial on the most common question in ${niche}.\n\nWould you like me to schedule these placeholder drafts to your Content Calendar?`;
      }
    } else {
      answer = `### Strategic Scaling Framework for ${niche}\nBased on your ${ytViews.toLocaleString()} views:\n\n- **Retention Focus**: Hook viewers in the first 5 seconds with a bold problem statement before introducing yourself.\n- **Repurposing Velocity**: Transcribe your top long-form video into 3 short reels and 1 high-signal newsletter.\n- **Monetization**: Package your key repeatable workflow into a digital template on Gumroad or Notion.`;
    }
    return res.json({ success: true, reply: answer });
  }
});

// Integration with Client SPA
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server launched and listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
