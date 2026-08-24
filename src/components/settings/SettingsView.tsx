import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Bell, 
  Shield, 
  CreditCard, 
  Link as LinkIcon, 
  Moon, 
  Sun,
  Music,
  LogOut,
  Sparkles,
  ShoppingBag,
  Briefcase,
  Check,
  Plus,
  ArrowRight
} from 'lucide-react';

// Brand-specific premium SVG assets for SettingsView
const YouTubeBrandIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.871.508 9.388.508 9.388.508s7.517 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837z" fill="#FF0000"/>
    <path d="M9.545 8.432l6.273 3.568-6.273 3.568V8.432z" fill="#FFFFFF"/>
  </svg>
);

const InstagramBrandIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 fill-none stroke-[2]" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="ig-gradient-settings-card" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#fdf497" />
        <stop offset="28%" stopColor="#fd5949" />
        <stop offset="75%" stopColor="#d6249f" />
        <stop offset="100%" stopColor="#285AEB" />
      </linearGradient>
    </defs>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" stroke="url(#ig-gradient-settings-card)"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" stroke="url(#ig-gradient-settings-card)"/>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" stroke="url(#ig-gradient-settings-card)"/>
  </svg>
);

const TikTokBrandIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 fill-current text-zinc-900 dark:text-zinc-100" xmlns="http://www.w3.org/2000/svg">
    <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.89-.6-4.08-1.51-.77-.6-1.39-1.39-1.83-2.29-.04 2.87.04 5.75-.02 8.62-.1 1.83-.75 3.71-2.03 5.04-1.44 1.54-3.64 2.4-5.78 2.22-2.34-.14-4.7-1.53-5.63-3.71-.97-2.19-.64-4.9.89-6.75 1.34-1.63 3.53-2.52 5.64-2.23.01 1.41-.01 2.81 0 4.22-1-.22-2.18-.06-2.94.68-.69.64-.99 1.64-.81 2.57.19 1.15 1.11 2.11 2.3 2.23 1.15.11 2.38-.56 2.76-1.65.25-.66.21-1.38.22-2.08-.01-4.75-.01-9.51 0-14.26z"/>
  </svg>
);

const XBrandIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4.5 w-4.5 shrink-0 fill-current text-zinc-900 dark:text-zinc-100" xmlns="http://www.w3.org/2000/svg">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const SpotifyBrandIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424c-.18.295-.563.387-.857.207-2.377-1.454-5.37-1.785-8.893-1.02-.335.072-.667-.14-.739-.475-.072-.334.14-.667.475-.739 3.858-.88 7.15-.502 9.807 1.124.295.18.387.564.207.858zm1.225-2.72c-.227.367-.707.487-1.074.26-2.72-1.672-6.87-2.158-10.082-1.182-.413.125-.85-.107-.975-.52-.125-.413.107-.85.52-.975 3.672-1.114 8.243-.574 11.353 1.34.367.227.487.707.26 1.074zm.106-2.827C14.453 8.8 8.08 8.583 4.364 9.712c-.575.174-1.18-.158-1.354-.733-.174-.576.158-1.18.733-1.355 4.264-1.294 11.31-1.043 15.394 1.382.517.307.684.975.377 1.492-.307.518-.975.684-1.492.377z" fill="#1DB954"/>
  </svg>
);

const GumroadBrandIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 stroke-[2] fill-none stroke-[#FF90C3]" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
);

interface SettingsViewProps {
  userProfile: {
    name: string;
    email: string;
    niche: string;
    location: string;
    plan: string;
    avatar: string;
  };
  userId?: string;
  setUserProfile: React.Dispatch<React.SetStateAction<any>>;
  connectedPlatforms: string[];
  setConnectedPlatforms: React.Dispatch<React.SetStateAction<string[]>>;
  preferences: {
    emailNotifications: boolean;
    aiInsights: boolean;
    theme: string;
  };
  setPreferences: React.Dispatch<React.SetStateAction<any>>;
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
  onSignOut: () => void;
}

export default function SettingsView({
  userProfile,
  userId,
  setUserProfile,
  connectedPlatforms,
  setConnectedPlatforms,
  preferences,
  setPreferences,
  showToast,
  onSignOut
}: SettingsViewProps) {
  // Local edit states
  const [editName, setEditName] = useState(userProfile.name);
  const [editEmail, setEditEmail] = useState(userProfile.email);
  const [editNiche, setEditNiche] = useState(userProfile.niche);
  const [editLocation, setEditLocation] = useState(userProfile.location);

  const handleSaveChangesSubmit = () => {
    if (!editName.trim()) {
      showToast('Name cannot be blank', 'error');
      return;
    }
    setUserProfile(prev => ({
      ...prev,
      name: editName.trim(),
      email: editEmail.trim(),
      niche: editNiche.trim(),
      location: editLocation.trim()
    }));
    showToast('Profile configuration saved successfully!', 'success');
  };

  const togglePreference = (key: 'emailNotifications' | 'aiInsights') => {
    setPreferences(prev => {
      const nextVal = !prev[key];
      showToast(`AI preferences updated: ${key === 'emailNotifications' ? 'Digest emails' : 'Proactive insight models'} are now ${nextVal ? 'ENABLED' : 'DISABLED'}.`);
      return {
        ...prev,
        [key]: nextVal
      };
    });
  };

  const [popupBlockedUrl, setPopupBlockedUrl] = useState<string | null>(null);

  const handlePlatformToggle = async (id: string, name: string) => {
    const isConnected = connectedPlatforms.includes(id);
    if (isConnected) {
      showToast(`Disconnected your ${name} channel feeds.`, 'info');
      setConnectedPlatforms(prev => prev.filter(p => p !== id));
      setPopupBlockedUrl(null);
      return;
    }
    setPopupBlockedUrl(null);

    // YouTube real OAuth flow trigger in Settings Panel
    if (id === 'youtube') {
      try {
        const currentUid = userId || `user_${Date.now()}`;
        showToast('Requesting Google OAuth authorization...', 'info');
        const res = await fetch(`/api/auth/google/url?uid=${encodeURIComponent(currentUid)}`);
        
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data.message || data.error || "OAuth route not configured.");
        }

        if (!data.url) {
          throw new Error("Invalid response from server (missing auth URL).");
        }

        const sessionId = data.sessionId || currentUid;

        // Background polling to capture completion
        const pollTimer = setInterval(async () => {
          try {
            const check = await fetch(`/api/auth/google/session?uid=${encodeURIComponent(sessionId)}`);
            const session = await check.json();
            if (session.completed) {
              clearInterval(pollTimer);
              setPopupBlockedUrl(null);
              
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
          showToast('Popup blocked. Please click the button to authorize.', 'info');
        } else {
          showToast('Consent prompt opened. Securely authorize with Google.', 'info');
        }
      } catch (err: any) {
        console.error("YouTube settings toggle error:", err);
        showToast(err.message || "Failed to initialize YouTube connection.", 'error');
      }
      return;
    }

    // TikTok real OAuth flow trigger in Settings Panel
    if (id === 'tiktok') {
      try {
        const currentUid = userId || `user_${Date.now()}`;
        showToast('Requesting TikTok OAuth authorization...', 'info');
        const res = await fetch(`/api/auth/tiktok/url?uid=${encodeURIComponent(currentUid)}`);
        
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data.message || data.error || "TikTok OAuth route not configured.");
        }

        if (!data.url) {
          throw new Error("Invalid response from server (missing auth URL).");
        }

        const sessionId = data.sessionId || currentUid;

        // Background polling to capture completion
        const pollTimer = setInterval(async () => {
          try {
            const check = await fetch(`/api/auth/tiktok/session?uid=${encodeURIComponent(sessionId)}`);
            const session = await check.json();
            if (session.completed) {
              clearInterval(pollTimer);
              setPopupBlockedUrl(null);
              
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
          showToast('Popup blocked. Please click the button to authorize.', 'info');
        } else {
          showToast('Consent prompt opened. Securely authorize with TikTok.', 'info');
        }
      } catch (err: any) {
        console.error("TikTok settings toggle error:", err);
        showToast(err.message || "Failed to initialize TikTok connection.", 'error');
      }
      return;
    }

    // Standard simulation helper for other channels
    showToast(`Successfully linked your ${name} account metrics.`, 'success');
    setConnectedPlatforms(prev => [...prev, id]);
  };

  const listConfigPlatforms = [
    { id: 'youtube', name: 'YouTube', icon: YouTubeBrandIcon, color: '' },
    { id: 'instagram', name: 'Instagram', icon: InstagramBrandIcon, color: '' },
    { id: 'tiktok', name: 'TikTok', icon: TikTokBrandIcon, color: '' },
    { id: 'twitter', name: 'X (formerly Twitter)', icon: XBrandIcon, color: '' },
    { id: 'spotify', name: 'Spotify Podcast', icon: SpotifyBrandIcon, color: '' },
    { id: 'gumroad', name: 'Gumroad Store', icon: GumroadBrandIcon, color: '' }
  ];

  return (
    <div className="space-y-8 pb-12 max-w-4xl text-left select-none">
      <header>
        <h1 className="text-3xl font-display font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground text-sm">Manage your account metadata, channels, preferences, and subscriptions.</p>
      </header>

      <div className="space-y-12">
        {/* Profile Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 border-b border-border pb-2">
            <User className="h-5 w-5 text-slate-500" />
            <h2 className="text-xl font-bold font-display text-foreground">Profile</h2>
          </div>
          <Card className="p-8">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="relative group self-center md:self-start">
                <div className="w-24 h-24 rounded-2xl bg-muted border border-border overflow-hidden relative shadow-2xl">
                  <img src={userProfile.avatar} alt="Profile" className="w-full h-full object-cover" />
                </div>
                <Button 
                  size="icon" 
                  variant="secondary" 
                  className="absolute -bottom-2.5 -right-2.5 rounded-xl h-8 w-8 border border-border cursor-pointer shadow-md"
                  onClick={() => showToast('Avatar uploading is currently linked to your Google Account.', 'info')}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 w-full text-foreground">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">Display Name</label>
                  <Input 
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="rounded-xl border-border bg-background focus:border-slate-500 focus:ring-1 focus:ring-slate-500 text-sm h-11"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">Email Address</label>
                  <Input 
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="rounded-xl border-border bg-background focus:border-slate-500 focus:ring-1 focus:ring-slate-500 text-sm h-11"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">Primary Niche</label>
                  <Input 
                    value={editNiche}
                    onChange={(e) => setEditNiche(e.target.value)}
                    className="rounded-xl border-border bg-background focus:border-slate-500 focus:ring-1 focus:ring-slate-500 text-sm h-11"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">Location</label>
                  <Input 
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    className="rounded-xl border-border bg-background focus:border-slate-500 focus:ring-1 focus:ring-slate-500 text-sm h-11"
                  />
                </div>
              </div>
            </div>
            <div className="mt-8 flex justify-end">
              <Button onClick={handleSaveChangesSubmit} className="rounded-xl px-8 h-11 bg-slate-600 hover:bg-slate-700 text-white font-bold cursor-pointer">
                Save Changes
              </Button>
            </div>
          </Card>
        </section>

        {/* Connected Platforms */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 border-b border-border pb-2">
            <LinkIcon className="h-5 w-5 text-slate-500" />
            <h2 className="text-xl font-bold font-display text-foreground">Connected Platforms</h2>
          </div>

          {popupBlockedUrl && (
            <div className="bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-indigo-400 shrink-0" />
                <span>Browser popup was blocked. Click to open Google Authorization:</span>
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
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {listConfigPlatforms.map((p) => {
              const isConnected = connectedPlatforms.includes(p.id);
              return (
                <Card key={p.id} className={`p-5 flex items-center justify-between rounded-2xl transition-all border ${
                  isConnected ? 'bg-slate-500/[0.02] border-slate-500/25' : 'bg-muted/10 border-border'
                }`}>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center shrink-0">
                      <p.icon className={`h-5 w-5 ${p.color}`} />
                    </div>
                    <div className="text-left">
                      <span className="font-semibold text-sm block text-foreground">{p.name}</span>
                      <span className="text-[10px] text-muted-foreground tracking-wide font-mono mt-0.5 block">
                        {isConnected ? 'LIVE SYNCED' : 'OFFLINE'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={isConnected ? 'default' : 'outline'} className={`text-[9px] uppercase font-bold tracking-wider rounded-md ${
                      isConnected ? 'bg-slate-600 text-white' : 'text-muted-foreground border-border'
                    }`}>
                      {isConnected ? 'Connected' : 'Detached'}
                    </Badge>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handlePlatformToggle(p.id, p.name)}
                      className={`text-xs h-8.5 rounded-lg font-semibold cursor-pointer ${
                        isConnected ? 'text-red-400 hover:bg-red-500/10' : 'text-slate-600 hover:bg-slate-500/10 dark:text-slate-400 dark:hover:bg-slate-500/15'
                      }`}
                    >
                      {isConnected ? 'Disconnect' : 'Connect'}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Preferences */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 border-b border-border pb-2">
            <Bell className="h-5 w-5 text-slate-500" />
            <h2 className="text-xl font-bold font-display text-foreground">Preferences</h2>
          </div>
          <Card className="p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-foreground">Email Notifications</h4>
                <p className="text-xs text-muted-foreground mt-0.5">Receive weekly performance summaries and viral highlights.</p>
              </div>
              <Button 
                variant={preferences.emailNotifications ? "default" : "outline"}
                className={`rounded-xl px-5 h-9 text-xs font-semibold cursor-pointer select-none ${
                  preferences.emailNotifications ? 'bg-slate-600 hover:bg-slate-700 text-white' : 'border-border'
                }`}
                onClick={() => togglePreference('emailNotifications')}
              >
                {preferences.emailNotifications ? 'Enabled' : 'Disabled'}
              </Button>
            </div>
            <Separator className="bg-border/60" />
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-foreground">AI Proactive Insights</h4>
                <p className="text-xs text-muted-foreground mt-0.5">Allow AI models to surface proactive trends and niche ideas dynamically.</p>
              </div>
              <Button 
                variant={preferences.aiInsights ? "default" : "outline"}
                className={`rounded-xl px-5 h-9 text-xs font-semibold cursor-pointer select-none ${
                  preferences.aiInsights ? 'bg-slate-600 hover:bg-slate-700 text-white' : 'border-border'
                }`}
                onClick={() => togglePreference('aiInsights')}
              >
                {preferences.aiInsights ? 'Enabled' : 'Disabled'}
              </Button>
            </div>
            <Separator className="bg-border/60" />
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-foreground">Workspace Appearance</h4>
                <p className="text-xs text-muted-foreground mt-0.5">Toggle default system rendering interface.</p>
              </div>
              <div className="flex bg-muted border border-border rounded-xl p-1 shrink-0">
                <Button 
                  variant={preferences.theme === 'light' ? 'secondary' : 'ghost'} 
                  size="sm" 
                  className="rounded-lg h-8 px-3 text-xs gap-1 cursor-pointer"
                  onClick={() => {
                    setPreferences(p => ({ ...p, theme: 'light' }));
                    showToast('Applying high-contrast light theme preset...', 'info');
                  }}
                >
                  <Sun className="h-3.5 w-3.5" />
                  <span>Light</span>
                </Button>
                <Button 
                  variant={preferences.theme === 'dark' ? 'secondary' : 'ghost'} 
                  size="sm" 
                  className="rounded-lg h-8 px-3 text-xs gap-1 cursor-pointer"
                  onClick={() => {
                    setPreferences(p => ({ ...p, theme: 'dark' }));
                    showToast('Applying cyber security dark theme preset...', 'info');
                  }}
                >
                  <Moon className="h-3.5 w-3.5" />
                  <span>Dark</span>
                </Button>
              </div>
            </div>
          </Card>
        </section>

        {/* Danger Zone */}
        <section className="pt-4 flex justify-start border-t border-red-500/10">
          <Button 
            variant="destructive" 
            className="rounded-xl px-6 h-11 text-xs font-bold gap-2 cursor-pointer shadow-lg shadow-red-500/10"
            onClick={onSignOut}
          >
            <LogOut className="h-4 w-4" />
            Sign Out & Reset Session
          </Button>
        </section>
      </div>
    </div>
  );
}
