import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, ArrowRight, Sparkles } from 'lucide-react';

// Premium custom SVG icons for brand recognition
const YouTubeIcon = () => (
  <svg viewBox="0 0 24 24" className="h-6 w-6 shrink-0" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.871.508 9.388.508 9.388.508s7.517 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837z" fill="#FF0000"/>
    <path d="M9.545 8.432l6.273 3.568-6.273 3.568V8.432z" fill="#FFFFFF"/>
  </svg>
);

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" className="h-6 w-6 shrink-0 fill-none stroke-[2]" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="ig-gradient-icon" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#fdf497" />
        <stop offset="28%" stopColor="#fd5949" />
        <stop offset="75%" stopColor="#d6249f" />
        <stop offset="100%" stopColor="#285AEB" />
      </linearGradient>
    </defs>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" stroke="url(#ig-gradient-icon)"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" stroke="url(#ig-gradient-icon)"/>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" stroke="url(#ig-gradient-icon)"/>
  </svg>
);

const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" className="h-6 w-6 shrink-0 fill-current text-zinc-900 dark:text-zinc-100" xmlns="http://www.w3.org/2000/svg">
    <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.89-.6-4.08-1.51-.77-.6-1.39-1.39-1.83-2.29-.04 2.87.04 5.75-.02 8.62-.1 1.83-.75 3.71-2.03 5.04-1.44 1.54-3.64 2.4-5.78 2.22-2.34-.14-4.7-1.53-5.63-3.71-.97-2.19-.64-4.9.89-6.75 1.34-1.63 3.53-2.52 5.64-2.23.01 1.41-.01 2.81 0 4.22-1-.22-2.18-.06-2.94.68-.69.64-.99 1.64-.81 2.57.19 1.15 1.11 2.11 2.3 2.23 1.15.11 2.38-.56 2.76-1.65.25-.66.21-1.38.22-2.08-.01-4.75-.01-9.51 0-14.26z"/>
  </svg>
);

const XIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 fill-current text-zinc-900 dark:text-zinc-100" xmlns="http://www.w3.org/2000/svg">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const PLATFORMS = [
  { 
    id: 'youtube', 
    name: 'YouTube', 
    icon: YouTubeIcon, 
    bgClass: 'bg-red-500/10 dark:bg-red-500/20', 
    borderClass: 'border-red-500/10 dark:border-red-500/20',
    activeRingClass: 'border-red-500 bg-red-500/[0.04] shadow-lg shadow-red-500/10',
    hoverClass: 'hover:border-red-500/40 hover:bg-red-500/[0.01]',
    btnStyle: 'hover:border-red-200 hover:text-red-500 hover:bg-red-500/[0.02] dark:hover:text-red-400 border-zinc-200 dark:border-zinc-800'
  },
  { 
    id: 'instagram', 
    name: 'Instagram', 
    icon: InstagramIcon, 
    bgClass: 'bg-pink-500/10 dark:bg-pink-500/20', 
    borderClass: 'border-pink-500/10 dark:border-pink-500/20',
    activeRingClass: 'border-pink-500 bg-pink-500/[0.04] shadow-lg shadow-pink-500/10',
    hoverClass: 'hover:border-pink-500/40 hover:bg-pink-500/[0.01]',
    btnStyle: 'hover:border-pink-200 hover:text-pink-500 hover:bg-pink-500/[0.02] dark:hover:text-pink-400 border-zinc-200 dark:border-zinc-800'
  },
  { 
    id: 'tiktok', 
    name: 'TikTok', 
    icon: TikTokIcon, 
    bgClass: 'bg-cyan-500/10 dark:bg-cyan-500/20', 
    borderClass: 'border-cyan-500/10 dark:border-cyan-500/20',
    activeRingClass: 'border-cyan-400 bg-cyan-500/[0.03] shadow-lg shadow-cyan-500/10',
    hoverClass: 'hover:border-cyan-500/40 hover:bg-cyan-500/[0.01]',
    btnStyle: 'hover:border-cyan-200 hover:text-cyan-500 hover:bg-cyan-500/[0.02] dark:hover:text-cyan-400 border-zinc-200 dark:border-zinc-800'
  },
  { 
    id: 'twitter', 
    name: 'X', 
    icon: XIcon, 
    bgClass: 'bg-zinc-500/10 dark:bg-zinc-500/20', 
    borderClass: 'border-zinc-500/10 dark:border-zinc-500/20',
    activeRingClass: 'border-zinc-400 bg-zinc-500/[0.04] shadow-lg shadow-zinc-500/10',
    hoverClass: 'hover:border-zinc-500/40 hover:bg-zinc-500/[0.01]',
    btnStyle: 'hover:border-zinc-300 hover:text-white hover:bg-zinc-500/[0.02] dark:hover:text-zinc-100 border-zinc-200 dark:border-zinc-800'
  },
];

interface ConnectPlatformsProps {
  onNext: () => void;
  connectedPlatforms: string[];
  setConnectedPlatforms: React.Dispatch<React.SetStateAction<string[]>>;
  userId?: string;
  showToast?: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export default function ConnectPlatforms({ onNext, connectedPlatforms, setConnectedPlatforms, userId, showToast }: ConnectPlatformsProps) {
  const [connecting, setConnecting] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [popupBlockedUrl, setPopupBlockedUrl] = useState<string | null>(null);

  const handleConnect = async (id: string) => {
    if (connectedPlatforms.includes(id)) {
      // Disconnect
      setConnectedPlatforms(prev => prev.filter(p => p !== id));
      setErrorMsg(null);
      setPopupBlockedUrl(null);
      return;
    }
    setErrorMsg(null);
    setPopupBlockedUrl(null);

    // YouTube real OAuth flow trigger
    if (id === 'youtube') {
      setConnecting('youtube');
      try {
        const currentUid = userId || `user_${Date.now()}`;
        showToast?.('Requesting Google OAuth authorization...', 'info');
        const res = await fetch(`/api/auth/google/url?uid=${encodeURIComponent(currentUid)}`);
        
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data.message || data.error || "OAuth route not configured.");
        }

        if (!data.url) {
          throw new Error("Invalid response from server (missing auth URL).");
        }

        const sessionId = data.sessionId || currentUid;

        // Start background polling to catch token completion immediately
        const pollTimer = setInterval(async () => {
          try {
            const check = await fetch(`/api/auth/google/session?uid=${encodeURIComponent(sessionId)}`);
            const session = await check.json();
            if (session.completed) {
              clearInterval(pollTimer);
              setPopupBlockedUrl(null);
              setConnecting(null);
              
              const payload = {
                type: 'OAUTH_AUTH_SUCCESS',
                provider: 'youtube',
                tokens: session.tokens,
                youtubeStats: session.youtubeStats
              };
              localStorage.setItem('CREATOR_OS_AUTH_COMPLETED', JSON.stringify(payload));
              window.dispatchEvent(new StorageEvent('storage', {
                key: 'CREATOR_OS_AUTH_COMPLETED',
                newValue: JSON.stringify(payload)
              }));
            }
          } catch (e) {}
        }, 1500);

        setTimeout(() => clearInterval(pollTimer), 120000);

        const popup = window.open(data.url, 'youtube_oauth', 'width=600,height=720,status=no,resizable=yes');
        
        if (!popup || popup.closed || typeof popup.closed === 'undefined') {
          setPopupBlockedUrl(data.url);
          showToast?.('Popup blocked by browser. Please click the button below to authorize.', 'info');
        } else {
          showToast?.('Google Authorization window opened. Select your channel account.', 'info');
        }
      } catch (err: any) {
        console.error("YouTube OAuth Error:", err);
        setErrorMsg(err.message || "Failed to initialize YouTube connection.");
        showToast?.(err.message, 'error');
        setConnecting(null);
      }
      return;
    }

    // TikTok real OAuth flow trigger
    if (id === 'tiktok') {
      setConnecting('tiktok');
      try {
        const currentUid = userId || `user_${Date.now()}`;
        showToast?.('Requesting TikTok OAuth authorization...', 'info');
        const res = await fetch(`/api/auth/tiktok/url?uid=${encodeURIComponent(currentUid)}`);
        
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data.message || data.error || "TikTok OAuth route not configured.");
        }

        if (!data.url) {
          throw new Error("Invalid response from server (missing auth URL).");
        }

        const sessionId = data.sessionId || currentUid;

        // Start background polling to catch token completion immediately
        const pollTimer = setInterval(async () => {
          try {
            const check = await fetch(`/api/auth/tiktok/session?uid=${encodeURIComponent(sessionId)}`);
            const session = await check.json();
            if (session.completed) {
              clearInterval(pollTimer);
              setPopupBlockedUrl(null);
              setConnecting(null);
              
              const payload = {
                type: 'OAUTH_AUTH_SUCCESS',
                provider: 'tiktok',
                tokens: session.tokens,
                tiktokStats: session.tiktokStats
              };
              localStorage.setItem('CREATOR_OS_AUTH_COMPLETED', JSON.stringify(payload));
              window.dispatchEvent(new StorageEvent('storage', {
                key: 'CREATOR_OS_AUTH_COMPLETED',
                newValue: JSON.stringify(payload)
              }));
            }
          } catch (e) {}
        }, 1500);

        setTimeout(() => clearInterval(pollTimer), 120000);

        const popup = window.open(data.url, 'tiktok_oauth', 'width=600,height=720,status=no,resizable=yes');
        
        if (!popup || popup.closed || typeof popup.closed === 'undefined') {
          setPopupBlockedUrl(data.url);
          showToast?.('Popup blocked by browser. Please click the button below to authorize.', 'info');
        } else {
          showToast?.('TikTok Authorization window opened. Authorize Creator OS to sync stats.', 'info');
        }
      } catch (err: any) {
        console.error("TikTok OAuth Error:", err);
        setErrorMsg(err.message || "Failed to initialize TikTok connection.");
        showToast?.(err.message, 'error');
        setConnecting(null);
      }
      return;
    }

    // Standard simulation helper for client-only widgets
    setConnecting(id);
    setTimeout(() => {
      setConnectedPlatforms(prev => [...prev, id]);
      setConnecting(null);
    }, 900);
  };

  const handleContinue = () => {
    if (connectedPlatforms.length === 0) {
      setErrorMsg("Please connect at least one creative platform to configure your OS dashboard!");
      return;
    }
    onNext();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 max-w-4xl mx-auto text-left select-none">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h2 className="text-4xl font-display font-bold mb-4">Connect Your Platforms</h2>
        <p className="text-muted-foreground text-lg">Creator OS unifies your metrics from across the web. Connect accounts to proceed.</p>
        
        <div className="mt-8 flex items-center justify-center gap-2">
          {[1, 2, 3].map((step) => (
            <div 
              key={step} 
              className={`h-1.5 rounded-full transition-all duration-500 ${step === 2 ? 'w-12 bg-indigo-500' : 'w-6 bg-muted'}`} 
            />
          ))}
        </div>
      </motion.div>

      {/* Error alert banner */}
      <AnimatePresence>
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="w-full max-w-2xl bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl mb-6 flex items-center gap-3 text-sm font-medium"
          >
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{errorMsg}</span>
          </motion.div>
        )}
        {popupBlockedUrl && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="w-full max-w-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 p-4 rounded-2xl mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-sm"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-400 shrink-0" />
              <span>Browser popup was blocked. Click to open authorization directly:</span>
            </div>
            <a
              href={popupBlockedUrl}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl text-xs shrink-0 inline-flex items-center gap-1.5 transition-colors"
            >
              Open Google Consent
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </motion.div>
        )}
      </AnimatePresence>

      <div id="connect-platforms-list" className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full mb-12 max-w-2xl">
        {PLATFORMS.map((platform) => {
          const isConnected = connectedPlatforms.includes(platform.id);
          const isConnecting = connecting === platform.id;

          return (
            <Card 
              key={platform.id}
              className={`p-5 flex items-center justify-between border-2 transition-all cursor-pointer group rounded-2xl ${
                isConnected 
                ? platform.activeRingClass
                : `border-border ${platform.hoverClass} bg-card/60`
              }`}
              onClick={() => handleConnect(platform.id)}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform ${platform.bgClass} border ${platform.borderClass}`}>
                  <platform.icon />
                </div>
                <div>
                  <h3 className="font-semibold text-zinc-800 dark:text-zinc-200">{platform.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {isConnected ? 'Syncing Active' : isConnecting ? 'Connecting...' : 'Click to connect'}
                  </p>
                </div>
              </div>
              
              <Button 
                variant={isConnected ? "ghost" : "outline"} 
                size="sm"
                className={`rounded-xl px-4 text-xs font-semibold shrink-0 cursor-pointer ${
                  isConnected 
                    ? 'text-red-500 hover:bg-red-500/10' 
                    : `text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white ${platform.btnStyle}`
                }`}
                disabled={connecting !== null && !isConnecting}
                onClick={(e) => {
                  e.stopPropagation();
                  handleConnect(platform.id);
                }}
              >
                {isConnecting ? (
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
                    <span>Encrypting...</span>
                  </div>
                ) : isConnected ? (
                  <span>Disconnect</span>
                ) : (
                  <span>Connect</span>
                )}
              </Button>
            </Card>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="w-full flex justify-center max-w-2xl"
      >
        <Button 
          size="lg" 
          onClick={handleContinue}
          className="rounded-full px-10 h-14 text-md gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold cursor-pointer shadow-xl shadow-indigo-500/10"
        >
          <span>Continue to Dashboard</span>
          <ArrowRight className="h-5 w-5" />
        </Button>
      </motion.div>
    </div>
  );
}
