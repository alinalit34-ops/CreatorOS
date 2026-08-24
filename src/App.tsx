import React, { useState, useMemo, useEffect } from 'react';
import { auth, db, handleFirestoreError, OperationType } from './lib/firebase';
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, collection, getDocs, query, where, deleteDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Calendar, 
  BarChart3, 
  DollarSign, 
  Users, 
  MessageSquare, 
  Settings, 
  Plus, 
  Bell, 
  Search, 
  Menu, 
  Sparkles, 
  X, 
  Check, 
  AlertCircle, 
  Clock, 
  Heart, 
  Sun, 
  Moon, 
  Command,
  Volume2,
  VolumeX,
  Radio
} from 'lucide-react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

// Brand & Character Components
import CreatorOSLogo from './components/brand/CreatorOSLogo';
import StudioAtmosphere from './components/brand/StudioAtmosphere';
import StudioCursor from './components/brand/StudioCursor';
import CommandPalette from './components/common/CommandPalette';
import { playStudioTap, playStudioSuccess, playStudioAiSparkle, setSoundEnabled, isSoundEnabled } from './lib/soundEngine';

// Screens
import WelcomeSplash from './components/welcome/WelcomeSplash';
import ConnectPlatforms from './components/onboarding/ConnectPlatforms';
import HomeDashboard from './components/dashboard/HomeDashboard';
import CreatorCalendar from './components/calendar/CreatorCalendar';
import AnalyticsView from './components/analytics/AnalyticsView';
import MonetizationView from './components/monetization/MonetizationView';
import AudienceView from './components/audience/AudienceView';
import AIAssistant from './components/ai/AIAssistant';
import AIStrategyView from './components/ai/AIStrategyView';
import SettingsView from './components/settings/SettingsView';
import MetricReportView from './components/dashboard/MetricReportView';

import { Post, Platform } from './types/index';
import { MOCK_POSTS } from './lib/mockData';

type Screen = 'welcome' | 'onboarding' | 'dashboard' | 'calendar' | 'analytics' | 'monetization' | 'audience' | 'ai' | 'strategy' | 'settings' | 'metric-reach' | 'metric-revenue' | 'metric-engagement' | 'metric-subscribers';

const SIGNATURE_STYLES: Record<string, {
  hoverBg: string;
  activeBg: string;
  iconActive: string;
  iconHover: string;
  borderActive: string;
  accentBg: string;
  gradientHover: string;
  gradientActive: string;
  glowShimmer: string;
  pillColor: string;
}> = {
  dashboard: {
    hoverBg: 'hover:bg-indigo-500/10 dark:hover:bg-indigo-500/15',
    activeBg: 'bg-indigo-500/10 dark:bg-indigo-500/15',
    iconActive: 'text-indigo-600 dark:text-indigo-400',
    iconHover: 'group-hover:text-indigo-600 dark:group-hover:text-indigo-400',
    borderActive: 'border-indigo-500/40 dark:border-indigo-400/40',
    accentBg: 'from-indigo-500/[0.03] via-zinc-100/5 to-zinc-50 dark:from-indigo-950/15 dark:via-zinc-950/20 dark:to-zinc-950/30',
    gradientHover: 'from-indigo-500/15 via-indigo-500/5 to-transparent',
    gradientActive: 'from-indigo-500/20 via-indigo-500/10 to-indigo-500/[0.03]',
    glowShimmer: 'via-indigo-400/60',
    pillColor: 'bg-indigo-500 dark:bg-indigo-400'
  },
  calendar: {
    hoverBg: 'hover:bg-blue-500/10 dark:hover:bg-blue-500/15',
    activeBg: 'bg-blue-500/10 dark:bg-blue-500/15',
    iconActive: 'text-blue-600 dark:text-blue-400',
    iconHover: 'group-hover:text-blue-600 dark:group-hover:text-blue-400',
    borderActive: 'border-blue-500/40 dark:border-blue-400/40',
    accentBg: 'from-blue-500/[0.03] via-zinc-100/5 to-zinc-50 dark:from-blue-950/15 dark:via-zinc-950/20 dark:to-zinc-950/30',
    gradientHover: 'from-blue-500/15 via-blue-500/5 to-transparent',
    gradientActive: 'from-blue-500/20 via-blue-500/10 to-blue-500/[0.03]',
    glowShimmer: 'via-blue-400/60',
    pillColor: 'bg-blue-500 dark:bg-blue-400'
  },
  analytics: {
    hoverBg: 'hover:bg-emerald-500/10 dark:hover:bg-emerald-500/15',
    activeBg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
    iconActive: 'text-emerald-600 dark:text-[#34D399]',
    iconHover: 'group-hover:text-emerald-600 dark:group-hover:text-[#34D399]',
    borderActive: 'border-emerald-500/40 dark:border-emerald-400/40',
    accentBg: 'from-emerald-500/[0.03] via-zinc-100/5 to-zinc-50 dark:from-emerald-950/15 dark:via-zinc-950/20 dark:to-zinc-950/30',
    gradientHover: 'from-emerald-500/15 via-emerald-500/5 to-transparent',
    gradientActive: 'from-emerald-500/20 via-emerald-500/10 to-emerald-500/[0.03]',
    glowShimmer: 'via-emerald-400/60',
    pillColor: 'bg-emerald-500 dark:bg-emerald-400'
  },
  monetization: {
    hoverBg: 'hover:bg-amber-500/10 dark:hover:bg-amber-500/15',
    activeBg: 'bg-amber-500/10 dark:bg-amber-500/15',
    iconActive: 'text-amber-500 dark:text-[#FBBF24]',
    iconHover: 'group-hover:text-amber-500 dark:group-hover:text-[#FBBF24]',
    borderActive: 'border-amber-500/40 dark:border-amber-400/40',
    accentBg: 'from-amber-500/[0.03] via-zinc-100/5 to-zinc-50 dark:from-amber-950/15 dark:via-amber-950/20 dark:to-zinc-950/30',
    gradientHover: 'from-amber-500/15 via-amber-500/5 to-transparent',
    gradientActive: 'from-amber-500/20 via-amber-500/10 to-amber-500/[0.03]',
    glowShimmer: 'via-amber-400/60',
    pillColor: 'bg-amber-500 dark:bg-amber-400'
  },
  audience: {
    hoverBg: 'hover:bg-pink-500/10 dark:hover:bg-pink-500/15',
    activeBg: 'bg-pink-500/10 dark:bg-pink-500/15',
    iconActive: 'text-pink-600 dark:text-pink-400',
    iconHover: 'group-hover:text-pink-600 dark:group-hover:text-pink-400',
    borderActive: 'border-pink-500/40 dark:border-pink-400/40',
    accentBg: 'from-pink-500/[0.03] via-zinc-100/5 to-zinc-50 dark:from-pink-950/15 dark:via-zinc-950/20 dark:to-zinc-950/30',
    gradientHover: 'from-pink-500/15 via-pink-500/5 to-transparent',
    gradientActive: 'from-pink-500/20 via-pink-500/10 to-pink-500/[0.03]',
    glowShimmer: 'via-pink-400/60',
    pillColor: 'bg-pink-500 dark:bg-pink-400'
  },
  strategy: {
    hoverBg: 'hover:bg-purple-500/10 dark:hover:bg-purple-500/15',
    activeBg: 'bg-purple-500/10 dark:bg-purple-500/15',
    iconActive: 'text-purple-600 dark:text-purple-450',
    iconHover: 'group-hover:text-purple-600 dark:group-hover:text-purple-450',
    borderActive: 'border-purple-500/40 dark:border-purple-400/40',
    accentBg: 'from-purple-500/[0.03] via-zinc-100/5 to-zinc-50 dark:from-purple-950/15 dark:via-zinc-950/20 dark:to-zinc-950/30',
    gradientHover: 'from-purple-500/15 via-purple-500/5 to-transparent',
    gradientActive: 'from-purple-500/20 via-purple-500/10 to-purple-500/[0.03]',
    glowShimmer: 'via-purple-400/60',
    pillColor: 'bg-purple-500 dark:bg-purple-400'
  },
  ai: {
    hoverBg: 'hover:bg-cyan-500/10 dark:hover:bg-cyan-500/15',
    activeBg: 'bg-cyan-500/10 dark:bg-cyan-500/15',
    iconActive: 'text-cyan-600 dark:text-cyan-400',
    iconHover: 'group-hover:text-cyan-600 dark:group-hover:text-cyan-400',
    borderActive: 'border-cyan-500/40 dark:border-cyan-400/40',
    accentBg: 'from-cyan-500/[0.03] via-zinc-100/5 to-zinc-50 dark:from-cyan-950/15 dark:via-zinc-950/20 dark:to-zinc-950/30',
    gradientHover: 'from-cyan-500/15 via-cyan-500/5 to-transparent',
    gradientActive: 'from-cyan-500/20 via-cyan-500/10 to-cyan-500/[0.03]',
    glowShimmer: 'via-cyan-400/60',
    pillColor: 'bg-cyan-500 dark:bg-cyan-400'
  },
  settings: {
    hoverBg: 'hover:bg-slate-500/10 dark:hover:bg-slate-500/15',
    activeBg: 'bg-slate-500/10 dark:bg-slate-500/15',
    iconActive: 'text-slate-600 dark:text-slate-400',
    iconHover: 'group-hover:text-slate-600 dark:group-hover:text-slate-400',
    borderActive: 'border-slate-500/40 dark:border-slate-400/40',
    accentBg: 'from-slate-500/[0.03] via-zinc-100/5 to-zinc-50 dark:from-slate-950/15 dark:via-zinc-950/20 dark:to-zinc-950/30',
    gradientHover: 'from-slate-500/15 via-slate-500/5 to-transparent',
    gradientActive: 'from-slate-500/20 via-slate-500/10 to-slate-500/[0.03]',
    glowShimmer: 'via-slate-400/60',
    pillColor: 'bg-slate-500 dark:bg-slate-400'
  }
};

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('welcome');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // --- Centralized Shared App State ---
  const [posts, setPosts] = useState<Post[]>(() => {
    return [];
  });

  const [connectedPlatforms, setConnectedPlatforms] = useState<string[]>(() => {
    try {
      const cached = localStorage.getItem('creator_os_connected_platforms');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  const [youtubeChannelInfo, setYoutubeChannelInfo] = useState<any>(() => {
    try {
      const cached = localStorage.getItem('creator_os_youtube_info');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });

  const [tiktokAccountInfo, setTiktokAccountInfo] = useState<any>(() => {
    try {
      const cached = localStorage.getItem('creator_os_tiktok_info');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });

  const fetchLiveYouTubeMetrics = async (accessToken: string) => {
    try {
      const resp = await fetch(`/api/youtube/stats?accessToken=${encodeURIComponent(accessToken)}`);
      if (resp.ok) {
        const data = await resp.json();
        if (data.success) {
          setYoutubeChannelInfo(data);
          localStorage.setItem('creator_os_youtube_info', JSON.stringify(data));
        }
      }
    } catch (e) {
      console.error("Failed fetching live YouTube metrics:", e);
    }
  };

  const fetchLiveTikTokMetrics = async (accessToken: string) => {
    try {
      const resp = await fetch(`/api/tiktok/stats?accessToken=${encodeURIComponent(accessToken)}`);
      if (resp.ok) {
        const data = await resp.json();
        if (data.success) {
          setTiktokAccountInfo(data);
          localStorage.setItem('creator_os_tiktok_info', JSON.stringify(data));
        }
      }
    } catch (e) {
      console.error("Failed fetching live TikTok metrics:", e);
    }
  };

  const [userProfile, setUserProfile] = useState({
    name: 'Alina Litvinova',
    email: 'aslitvinova@outlook.com',
    niche: 'Product and Creative',
    location: 'Valencia, Spain',
    plan: 'Pro Plan',
    avatar: 'https://picsum.photos/seed/creator/100'
  });

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    aiInsights: true,
    theme: 'dark'
  });

  const setUserProfileAndSync = (value: any) => {
    setUserProfile((prev) => {
      const nextProfile = typeof value === 'function' ? value(prev) : value;
      if (auth.currentUser && currentScreen !== 'onboarding' && currentScreen !== 'welcome') {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        setDoc(userRef, {
          uid: auth.currentUser.uid,
          name: nextProfile.name,
          email: nextProfile.email,
          niche: nextProfile.niche,
          location: nextProfile.location,
          plan: nextProfile.plan,
          avatar: nextProfile.avatar,
          connectedPlatforms,
          preferences,
          youtubeChannelInfo: youtubeChannelInfo || null,
          tiktokAccountInfo: tiktokAccountInfo || null
        }, { merge: true }).catch(err => {
          console.error("Error saving profile", err);
        });
      }
      return nextProfile;
    });
  };

  const setConnectedPlatformsAndSync = (value: any) => {
    setConnectedPlatforms((prev) => {
      const nextPlatforms = typeof value === 'function' ? value(prev) : value;
      if (auth.currentUser && currentScreen !== 'onboarding' && currentScreen !== 'welcome') {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        updateDoc(userRef, { connectedPlatforms: nextPlatforms }).catch(err => console.error("Error saving platforms", err));
      }
      return nextPlatforms;
    });
  };

  const setPreferencesAndSync = (value: any) => {
    setPreferences((prev) => {
      const nextPrefs = typeof value === 'function' ? value(prev) : value;
      if (auth.currentUser && currentScreen !== 'onboarding' && currentScreen !== 'welcome') {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        updateDoc(userRef, { preferences: nextPrefs }).catch(err => console.error("Error saving preferences", err));
      }
      return nextPrefs;
    });
  };

  const setPostsAndSync: React.Dispatch<React.SetStateAction<Post[]>> = (value) => {
    setPosts((prev) => {
      const nextPosts = typeof value === 'function' ? value(prev) : value;
      if (auth.currentUser) {
        const deleted = prev.filter(p => !nextPosts.some(n => n.id === p.id));
        deleted.forEach(async (p) => {
          try {
            await deleteDoc(doc(db, 'posts', p.id));
          } catch (e) {
            console.error("Error deleting post from firestore", e);
          }
        });

        nextPosts.forEach(async (p) => {
          const old = prev.find(o => o.id === p.id);
          if (!old || JSON.stringify(old) !== JSON.stringify(p)) {
            try {
              const postData = {
                id: p.id,
                userId: auth.currentUser?.uid || 'anonymous',
                title: p.title,
                platform: p.platform,
                status: p.status,
                date: p.date instanceof Date ? p.date.toISOString().split('T')[0] : String(p.date),
                views: p.views || 0,
                likes: p.likes || 0,
                comments: p.comments || 0,
                engagement: p.engagement || 0,
                audienceReach: p.audienceReach || 0,
                revenue: p.revenue || 0
              };
              await setDoc(doc(db, 'posts', p.id), postData);
            } catch (e) {
              console.error("Error writing/syncing post to firestore", e);
            }
          }
        });
      }
      return nextPosts;
    });
  };

  const fetchUserPostsFromFirestore = async (uid: string) => {
    try {
      const postsQuery = query(collection(db, 'posts'), where('userId', '==', uid));
      const querySnapshot = await getDocs(postsQuery);
      const fetchedPosts: Post[] = [];
      querySnapshot.forEach((doc) => {
        const d = doc.data();
        fetchedPosts.push({
          id: d.id,
          title: d.title,
          platform: d.platform as Platform,
          status: d.status as 'draft' | 'scheduled' | 'published',
          date: new Date(d.date),
          views: d.views || 0,
          likes: d.likes || 0,
          comments: d.comments || 0,
          engagement: d.engagement || 0,
          audienceReach: d.audienceReach || 0,
          revenue: d.revenue || 0
        });
      });
      
      if (fetchedPosts.length > 0) {
        setPosts(fetchedPosts);
      } else {
        await seedDefaultPostsForUser(uid);
      }
    } catch (error) {
      console.error("Error loading posts from database", error);
    }
  };

  const seedDefaultPostsForUser = async (uid: string) => {
    try {
      const batchPosts = MOCK_POSTS.map(post => ({
        ...post,
        userId: uid,
        date: post.date instanceof Date ? post.date.toISOString().split('T')[0] : String(post.date)
      }));
      
      for (const p of batchPosts) {
        await setDoc(doc(db, 'posts', p.id), p);
      }
      setPosts(MOCK_POSTS.map(post => ({ ...post, userId: uid })));
    } catch (e) {
      console.error("Error seeding initial posts", e);
    }
  };

  const handleSaveProfileAndNavigate = async (nextScreen: Screen, updatedProfile = userProfile, updatedPlatforms = connectedPlatforms, updatedPrefs = preferences) => {
    if (auth.currentUser) {
      try {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        await setDoc(userRef, {
          uid: auth.currentUser.uid,
          name: updatedProfile.name,
          email: updatedProfile.email,
          niche: updatedProfile.niche,
          location: updatedProfile.location,
          plan: updatedProfile.plan,
          avatar: updatedProfile.avatar,
          connectedPlatforms: updatedPlatforms,
          preferences: updatedPrefs,
          youtubeChannelInfo: youtubeChannelInfo || null,
          tiktokAccountInfo: tiktokAccountInfo || null
        }, { merge: true });
        
        const postsQuery = query(collection(db, 'posts'), where('userId', '==', auth.currentUser.uid));
        const querySnapshot = await getDocs(postsQuery);
        if (querySnapshot.empty) {
          await seedDefaultPostsForUser(auth.currentUser.uid);
        }
      } catch (err) {
        console.error("Failed saving profile to firestore", err);
        showToast("Relational sync failure. Saving profile locally.", "error");
      }
    }
    setCurrentScreen(nextScreen);
  };

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setIsAuthLoading(true);
      if (user) {
        setCurrentUser(user);
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);
          
          if (userDocSnap.exists()) {
            const data = userDocSnap.data();
            setUserProfile({
              name: data.name || user.displayName || 'Alina Litvinova',
              email: data.email || user.email || 'aslitvinova@outlook.com',
              niche: data.niche || 'Product and Creative',
              location: data.location || 'Valencia, Spain',
              plan: data.plan || 'Pro Plan',
              avatar: data.avatar || user.photoURL || 'https://picsum.photos/seed/creator/100'
            });
            if (data.connectedPlatforms) {
              setConnectedPlatforms(data.connectedPlatforms);
            }
            if (data.preferences) {
              setPreferences(data.preferences);
            }
            if (data.youtubeChannelInfo) {
              setYoutubeChannelInfo(data.youtubeChannelInfo);
            }
            if (data.youtubeTokens && data.youtubeTokens.access_token) {
              fetchLiveYouTubeMetrics(data.youtubeTokens.access_token);
            }
            if (data.tiktokAccountInfo) {
              setTiktokAccountInfo(data.tiktokAccountInfo);
            }
            if (data.tiktokTokens && data.tiktokTokens.access_token) {
              fetchLiveTikTokMetrics(data.tiktokTokens.access_token);
            }
            await fetchUserPostsFromFirestore(user.uid);
            setCurrentScreen('dashboard');
          } else {
            setUserProfile({
              name: user.displayName || 'Alina Litvinova',
              email: user.email || 'aslitvinova@outlook.com',
              niche: 'Product and Creative',
              location: 'Valencia, Spain',
              plan: 'Pro Plan',
              avatar: user.photoURL || 'https://picsum.photos/seed/creator/100'
            });
            setCurrentScreen('onboarding');
          }
        } catch (error) {
          console.error("Error reading profile", error);
          showToast("Could not load user space. Standard sandbox active.", "error");
          setCurrentScreen('onboarding');
        }
      } else {
        setCurrentUser(null);
        setCurrentScreen('welcome');
      }
      setIsAuthLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  // Set up message bridge and storage listeners for OAuth Success (YouTube, TikTok, etc.)
  React.useEffect(() => {
    const handleAuthSuccessPayload = async (data: any) => {
      if (!data || data.type !== 'OAUTH_AUTH_SUCCESS') {
        return;
      }

      if (data.provider === 'youtube') {
        const { tokens, youtubeStats } = data;
        showToast('YouTube connected successfully. Syncing live analytics...', 'success');

        // Connect on UI side
        setConnectedPlatformsAndSync(prev => {
          if (!prev.includes('youtube')) {
            const next = [...prev, 'youtube'];
            try { localStorage.setItem('creator_os_connected_platforms', JSON.stringify(next)); } catch {}
            return next;
          }
          return prev;
        });

        if (youtubeStats) {
          setYoutubeChannelInfo(youtubeStats);
          try { localStorage.setItem('creator_os_youtube_info', JSON.stringify(youtubeStats)); } catch {}
        }

        if (tokens?.access_token && !youtubeStats) {
          await fetchLiveYouTubeMetrics(tokens.access_token);
        }

        // Sync tokens & channel data to user document if logged in
        if (auth.currentUser) {
          try {
            const userRef = doc(db, 'users', auth.currentUser.uid);
            await updateDoc(userRef, {
              youtubeTokens: tokens || null,
              youtubeChannelInfo: youtubeStats || null
            });
          } catch (e) {
            console.error("Failed saving youtube data to firestore", e);
          }
        }
      } else if (data.provider === 'tiktok') {
        const { tokens, tiktokStats } = data;
        showToast('TikTok connected successfully. Syncing live analytics...', 'success');

        // Connect on UI side
        setConnectedPlatformsAndSync(prev => {
          if (!prev.includes('tiktok')) {
            const next = [...prev, 'tiktok'];
            try { localStorage.setItem('creator_os_connected_platforms', JSON.stringify(next)); } catch {}
            return next;
          }
          return prev;
        });

        if (tiktokStats) {
          setTiktokAccountInfo(tiktokStats);
          try { localStorage.setItem('creator_os_tiktok_info', JSON.stringify(tiktokStats)); } catch {}
        }

        if (tokens?.access_token && !tiktokStats) {
          await fetchLiveTikTokMetrics(tokens.access_token);
        }

        // Sync tokens & account data to user document if logged in
        if (auth.currentUser) {
          try {
            const userRef = doc(db, 'users', auth.currentUser.uid);
            await updateDoc(userRef, {
              tiktokTokens: tokens || null,
              tiktokAccountInfo: tiktokStats || null
            });
          } catch (e) {
            console.error("Failed saving tiktok data to firestore", e);
          }
        }
      }
    };

    const handleOAuthMessage = (event: MessageEvent) => {
      const origin = event.origin;
      if (!origin.endsWith('.run.app') && !origin.includes('localhost')) {
        return;
      }
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        handleAuthSuccessPayload(event.data);
      }
    };

    const handleStorageEvent = (event: StorageEvent) => {
      if (event.key === 'CREATOR_OS_AUTH_COMPLETED' && event.newValue) {
        try {
          const payload = JSON.parse(event.newValue);
          handleAuthSuccessPayload(payload);
        } catch (e) {
          console.warn("Could not parse auth storage event", e);
        }
      }
    };

    window.addEventListener('message', handleOAuthMessage);
    window.addEventListener('storage', handleStorageEvent);
    return () => {
      window.removeEventListener('message', handleOAuthMessage);
      window.removeEventListener('storage', handleStorageEvent);
    };
  }, [currentUser]);

  // Automatically apply the selected theme class to the document root element
  React.useEffect(() => {
    const root = window.document.documentElement;
    if (preferences.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [preferences.theme]);

  const [notifications, setNotifications] = useState([
    { id: 'n1', title: 'Viral Velocity Alert!', desc: '"Morning Routine Reel" engagement is spiking +38% above median.', time: '2 mins ago', unread: true },
    { id: 'n2', title: 'Smart Budget recommendation', desc: 'Brand sponsorship offer received from NordVPN for $2,200.', time: '1 hour ago', unread: true },
    { id: 'n3', title: 'Weekly digest ready', desc: 'Your content report for May 24 - May 30 is compiled.', time: '1 day ago', unread: false }
  ]);

  // UI Flow toggles
  const [isNewPostOpen, setIsNewPostOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isSoundMuted, setIsSoundMuted] = useState(false);
  
  // New Post Form fields states
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostPlatform, setNewPostPlatform] = useState<Platform>('youtube');
  const [newPostDate, setNewPostDate] = useState('');
  const [newPostStatus, setNewPostStatus] = useState<'draft' | 'scheduled'>('scheduled');

  // Interactive Global search query
  const [searchQuery, setSearchQuery] = useState('');

  // Global Keyboard Shortcuts (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Toast System
  const [toast, setToast] = useState<{message: string, type: 'success' | 'info' | 'error'} | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    if (type === 'success') {
      playStudioSuccess();
    } else {
      playStudioTap();
    }
    setTimeout(() => {
      setToast(prev => prev?.message === message ? null : prev);
    }, 4000);
  };

  // Triggering the pre-filled post creator modal from other screens
  const openNewPostModal = (title?: string, platform?: Platform, date?: string) => {
    playStudioTap();
    setNewPostTitle(title || '');
    setNewPostPlatform(platform || 'youtube');
    // Default to today or provided date
    if (date) {
      setNewPostDate(date);
    } else {
      const today = new Date();
      setNewPostDate(today.toISOString().split('T')[0]);
    }
    setNewPostStatus('scheduled');
    setIsNewPostOpen(true);
  };

  const handleCreatePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostTitle.trim()) {
      showToast('Please enter a content title', 'error');
      return;
    }
    if (!newPostDate) {
      showToast('Please pick a publication date', 'error');
      return;
    }

    const createdPost: Post = {
      id: Math.random().toString(),
      title: newPostTitle.trim(),
      platform: newPostPlatform,
      status: newPostStatus,
      date: new Date(newPostDate)
    };

    setPostsAndSync(prev => [createdPost, ...prev]);
    setIsNewPostOpen(false);
    playStudioSuccess();
    showToast(`"${createdPost.title}" scheduled successfully on ${newPostPlatform}!`);
    // Clear fields
    setNewPostTitle('');
  };

  const handleMarkNotificationsAllRead = () => {
    playStudioTap();
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
    showToast('All notifications marked as read', 'info');
  };

  const hasUnreadNotifications = useMemo(() => {
    return notifications.some(n => n.unread);
  }, [notifications]);

  // Navigate utility passed to children
  const handleNavigate = (screen: Screen) => {
    playStudioTap();
    setCurrentScreen(screen);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'welcome': 
        return (
          <WelcomeSplash 
            onNext={() => setCurrentScreen('onboarding')} 
            onSignInSuccess={(user) => {
              // Authentication listener handles redirection
            }}
            showToast={showToast}
          />
        );
      case 'onboarding': 
        return (
          <ConnectPlatforms 
            onNext={async () => {
              await handleSaveProfileAndNavigate('dashboard');
            }} 
            connectedPlatforms={connectedPlatforms}
            setConnectedPlatforms={setConnectedPlatformsAndSync}
            userId={auth.currentUser?.uid}
            showToast={showToast}
          />
        );
      case 'dashboard': 
        return (
          <HomeDashboard 
            posts={posts}
            connectedPlatforms={connectedPlatforms}
            onNavigate={handleNavigate}
            openNewPostModal={openNewPostModal}
            searchQuery={searchQuery}
            youtubeChannelInfo={youtubeChannelInfo}
            tiktokAccountInfo={tiktokAccountInfo}
          />
        );
      case 'calendar': 
        return (
          <CreatorCalendar 
            posts={posts}
            setPosts={setPostsAndSync}
            openNewPostModal={openNewPostModal}
            showToast={showToast}
          />
        );
      case 'analytics': 
        return (
          <AnalyticsView 
            posts={posts}
            connectedPlatforms={connectedPlatforms}
            youtubeChannelInfo={youtubeChannelInfo}
            tiktokAccountInfo={tiktokAccountInfo}
            showToast={showToast}
          />
        );
      case 'monetization': 
        return (
          <MonetizationView 
            showToast={showToast}
          />
        );
      case 'audience': 
        return (
          <AudienceView 
            posts={posts}
            setPosts={setPostsAndSync}
            openNewPostModal={openNewPostModal}
            youtubeChannelInfo={youtubeChannelInfo}
            tiktokAccountInfo={tiktokAccountInfo}
            showToast={showToast}
            onNavigate={handleNavigate}
          />
        );
      case 'strategy': 
        return (
          <AIStrategyView 
            openNewPostModal={openNewPostModal}
            showToast={showToast}
            userProfile={userProfile}
            connectedPlatforms={connectedPlatforms}
            youtubeChannelInfo={youtubeChannelInfo}
            tiktokAccountInfo={tiktokAccountInfo}
            posts={posts}
          />
        );
      case 'ai': 
        return (
          <AIAssistant 
            onNavigate={handleNavigate} 
            showToast={showToast}
            openNewPostModal={openNewPostModal}
            userProfile={userProfile}
            connectedPlatforms={connectedPlatforms}
            youtubeChannelInfo={youtubeChannelInfo}
            tiktokAccountInfo={tiktokAccountInfo}
            posts={posts}
          />
        );
      case 'settings': 
        return (
          <SettingsView 
            userProfile={userProfile}
            userId={auth.currentUser?.uid}
            setUserProfile={setUserProfileAndSync}
            connectedPlatforms={connectedPlatforms}
            setConnectedPlatforms={setConnectedPlatformsAndSync}
            preferences={preferences}
            setPreferences={setPreferencesAndSync}
            showToast={showToast}
            onSignOut={async () => {
              try {
                await signOut(auth);
                showToast('Signed out of Creator OS securely.', 'info');
              } catch (e) {
                console.error("Error signing out", e);
                showToast('Signout error.', 'error');
              }
            }}
          />
        );
      case 'metric-reach':
        return (
          <MetricReportView 
            type="reach"
            onBack={() => setCurrentScreen('dashboard')}
            youtubeChannelInfo={youtubeChannelInfo}
            tiktokAccountInfo={tiktokAccountInfo}
            showToast={showToast}
          />
        );
      case 'metric-revenue':
        return (
          <MetricReportView 
            type="revenue"
            onBack={() => setCurrentScreen('dashboard')}
            youtubeChannelInfo={youtubeChannelInfo}
            tiktokAccountInfo={tiktokAccountInfo}
            showToast={showToast}
          />
        );
      case 'metric-engagement':
        return (
          <MetricReportView 
            type="engagement"
            onBack={() => setCurrentScreen('dashboard')}
            youtubeChannelInfo={youtubeChannelInfo}
            tiktokAccountInfo={tiktokAccountInfo}
            showToast={showToast}
          />
        );
      case 'metric-subscribers':
        return (
          <MetricReportView 
            type="subscribers"
            onBack={() => setCurrentScreen('dashboard')}
            youtubeChannelInfo={youtubeChannelInfo}
            tiktokAccountInfo={tiktokAccountInfo}
            showToast={showToast}
          />
        );
      default: 
        return (
          <HomeDashboard 
            userProfileName={userProfile.name} 
            posts={posts} 
            connectedPlatforms={connectedPlatforms} 
            onNavigate={handleNavigate} 
            openNewPostModal={openNewPostModal} 
            searchQuery={searchQuery} 
            youtubeChannelInfo={youtubeChannelInfo}
            tiktokAccountInfo={tiktokAccountInfo}
            showToast={showToast}
          />
        );
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'calendar', label: 'Content Calendar', icon: Calendar },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'monetization', label: 'Monetization', icon: DollarSign },
    { id: 'audience', label: 'Audience', icon: Users },
    { id: 'strategy', label: 'AI Strategy', icon: Sparkles },
    { id: 'ai', label: 'AI Assistant', icon: MessageSquare },
  ];

  if (isAuthLoading) {
    return (
      <div className="h-screen w-screen bg-zinc-950 flex flex-col items-center justify-center text-zinc-400 font-mono text-xs select-none">
        <div className="space-y-4 text-center">
          <div className="relative w-12 h-12 mx-auto">
            <div className="absolute inset-0 rounded-full border-2 border-indigo-500/20 animate-pulse" />
            <div className="absolute inset-0 rounded-full border-t-2 border-indigo-500 animate-spin" />
          </div>
          <p className="tracking-widest uppercase text-[10px] text-zinc-400 font-bold">ESTABLISHING SECURE CREATOR OS TUNNEL</p>
        </div>
      </div>
    );
  }

  if (currentScreen === 'welcome' || currentScreen === 'onboarding') {
    return (
      <TooltipProvider>
        <div className="min-h-screen bg-background text-foreground grid-bg overflow-hidden relative">
          <StudioCursor />
          <StudioAtmosphere currentScreen={currentScreen} />
          <AnimatePresence mode="wait">
            {renderScreen()}
          </AnimatePresence>

          {/* Floated Toast Container */}
          <AnimatePresence>
            {toast && (
              <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 30, scale: 0.95 }}
                className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-card border border-border text-sm shadow-2xl overflow-hidden font-sans transition-colors"
              >
                <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />
                {toast.type === 'success' && <Check className="h-4.5 w-4.5 text-emerald-600 dark:text-emerald-400 shrink-0" />}
                {toast.type === 'error' && <AlertCircle className="h-4.5 w-4.5 text-red-500 shrink-0" />}
                {toast.type === 'info' && <Sparkles className="h-4.5 w-4.5 text-blue-600 dark:text-blue-400 shrink-0" />}
                <span className="font-medium text-foreground">{toast.message}</span>
                <button onClick={() => setToast(null)} className="ml-3 p-1 rounded-lg text-muted-foreground hover:text-foreground">
                  <X className="h-3.5 w-3.5" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <div className="h-screen bg-background text-foreground flex overflow-hidden relative font-sans">
        {/* Studio Precision Cursor */}
        <StudioCursor />

        {/* Studio Dynamic Atmosphere & Ambient Grid */}
        <StudioAtmosphere currentScreen={currentScreen} />

        {/* Sidebar - Studio Noir Rail */}
        <motion.aside 
          initial={false}
          animate={{ width: isSidebarOpen ? 260 : 76 }}
          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
          className="border-r border-border/80 bg-card/75 backdrop-blur-2xl flex flex-col z-40 shrink-0 h-screen max-h-screen sticky top-0"
        >
          {/* Brand header */}
          <div className="p-4 flex items-center justify-between border-b border-border/50">
            {isSidebarOpen ? (
              <div 
                className="cursor-pointer"
                onClick={() => handleNavigate('dashboard')}
              >
                <CreatorOSLogo size="md" />
              </div>
            ) : (
              <div 
                className="cursor-pointer mx-auto" 
                onClick={() => setIsSidebarOpen(true)}
              >
                <CreatorOSLogo size="md" variant="icon" />
              </div>
            )}
            {isSidebarOpen && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsSidebarOpen(false)} 
                className="rounded-xl h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted/50"
              >
                <Menu className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Navigation Links */}
          <ScrollArea className="flex-1 px-3 py-4">
            <div className="space-y-1">
              <div className="px-3 pb-2 pt-1 text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground/70 select-none flex items-center justify-between">
                <span>{isSidebarOpen ? 'WORKSPACE' : '•••'}</span>
              </div>
              {navItems.map((item) => {
                const isSelected = currentScreen === item.id || 
                  (item.id === 'dashboard' && currentScreen.startsWith('metric-'));
                const style = SIGNATURE_STYLES[item.id] || SIGNATURE_STYLES.dashboard;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigate(item.id as Screen)}
                    className={`w-full flex items-center gap-3.5 h-10 px-3 rounded-xl font-medium text-sm transition-all duration-200 relative group overflow-hidden border ${
                      isSelected 
                        ? `text-foreground font-semibold border-border/80 dark:${style.borderActive} shadow-sm shadow-black/5` 
                        : 'text-muted-foreground hover:text-foreground border-transparent hover:border-border/60'
                    } ${!isSidebarOpen ? 'justify-center px-0' : ''}`}
                  >
                    {/* Subtle Animated Hover Gradient Background */}
                    <div 
                      className={`absolute inset-0 bg-gradient-to-r ${style.gradientHover} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-xl`} 
                    />

                    {/* Subtle Hover Shimmer Highlight across top edge */}
                    <div 
                      className={`absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent ${style.glowShimmer} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`}
                    />

                    {/* Active Gradient Background */}
                    {isSelected && (
                      <div 
                        className={`absolute inset-0 bg-gradient-to-r ${style.gradientActive} pointer-events-none rounded-xl`}
                      />
                    )}

                    {/* Active left indicator pill */}
                    {isSelected && (
                      <motion.div 
                        layoutId="activeNavIndicator"
                        className={`absolute left-0 top-2 bottom-2 w-1 rounded-r-full ${style.pillColor} shadow-sm`}
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                    
                    <item.icon className={`h-4.5 w-4.5 shrink-0 transition-all duration-200 relative z-10 ${
                      isSelected ? style.iconActive : `text-muted-foreground ${style.iconHover} group-hover:scale-105`
                    }`} />
                    
                    {isSidebarOpen && (
                      <span className="truncate relative z-10 transition-transform duration-200 group-hover:translate-x-0.5">{item.label}</span>
                    )}

                    {item.id === 'strategy' && isSidebarOpen && (
                      <span className="ml-auto relative z-10 text-[9px] px-1.5 py-0.5 rounded-md bg-purple-500/15 text-purple-400 border border-purple-500/30 font-mono font-bold tracking-wider group-hover:border-purple-500/50 group-hover:bg-purple-500/25 transition-all">
                        PRO
                      </span>
                    )}
                    {item.id === 'ai' && isSidebarOpen && (
                      <span className="ml-auto relative z-10 text-[9px] px-1.5 py-0.5 rounded-md bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 font-mono font-bold tracking-wider group-hover:border-cyan-500/50 group-hover:bg-cyan-500/25 transition-all">
                        AI
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </ScrollArea>

          {/* Bottom user profile & settings */}
          <div className="p-3 border-t border-border/50 space-y-1.5 bg-card/20">
            <button
              onClick={() => handleNavigate('settings')}
              className={`w-full flex items-center gap-3.5 h-10 px-3 rounded-xl font-medium text-sm transition-all duration-200 relative group overflow-hidden border ${
                currentScreen === 'settings' 
                  ? 'text-foreground font-semibold border-border/80 dark:border-slate-500/40 shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground border-transparent hover:border-border/60'
              } ${!isSidebarOpen ? 'justify-center px-0' : ''}`}
            >
              {/* Animated subtle gradient hover */}
              <div 
                className={`absolute inset-0 bg-gradient-to-r ${SIGNATURE_STYLES.settings.gradientHover} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-xl`} 
              />
              <div 
                className={`absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent ${SIGNATURE_STYLES.settings.glowShimmer} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`}
              />
              {currentScreen === 'settings' && (
                <>
                  <div 
                    className={`absolute inset-0 bg-gradient-to-r ${SIGNATURE_STYLES.settings.gradientActive} pointer-events-none rounded-xl`}
                  />
                  <motion.div 
                    layoutId="activeNavIndicator"
                    className={`absolute left-0 top-2 bottom-2 w-1 rounded-r-full ${SIGNATURE_STYLES.settings.pillColor}`}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                </>
              )}
              <Settings className={`h-4.5 w-4.5 shrink-0 transition-all duration-200 relative z-10 ${
                currentScreen === 'settings' ? SIGNATURE_STYLES.settings.iconActive : 'text-muted-foreground group-hover:text-foreground group-hover:rotate-45'
              }`} />
              {isSidebarOpen && <span className="relative z-10 transition-transform duration-200 group-hover:translate-x-0.5">Settings</span>}
            </button>

            <div 
              className={`flex items-center gap-3 p-2 rounded-xl transition-all duration-200 hover:bg-muted/40 cursor-pointer border border-transparent hover:border-border/60 relative group overflow-hidden ${!isSidebarOpen && 'justify-center p-1'}`}
              onClick={() => handleNavigate('settings')}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-xl" />
              <div className="relative z-10">
                <Avatar className="h-8 w-8 ring-1 ring-border group-hover:ring-primary/40 shrink-0 rounded-lg transition-all duration-200">
                  <AvatarImage src={userProfile.avatar} />
                  <AvatarFallback className="rounded-lg bg-primary/20 text-primary font-bold text-xs">
                    {userProfile.name.split(' ').map(n=>n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-background animate-pulse" />
              </div>
              {isSidebarOpen && (
                <div className="flex flex-col overflow-hidden text-left relative z-10">
                  <span className="text-xs font-semibold truncate text-foreground group-hover:text-primary transition-colors">{userProfile.name}</span>
                  <span className="text-[10px] text-muted-foreground truncate font-mono">{userProfile.plan}</span>
                </div>
              )}
            </div>
          </div>
        </motion.aside>

        {/* Main Workspace Stage */}
        <main className="flex-1 flex flex-col relative overflow-hidden bg-background/80 z-10">
          {/* Header - Studio Command Line */}
          <header className="h-16 border-b border-border/70 flex items-center justify-between px-8 bg-card/40 backdrop-blur-xl z-30 shrink-0">
            <div className="flex items-center gap-4 flex-1 max-w-xl">
              <div 
                className="relative w-full cursor-pointer"
                onClick={() => setIsCommandPaletteOpen(true)}
              >
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search drafts, channels, metrics, or press Cmd+K for Studio Command..." 
                  className="w-full bg-muted/30 border border-border/80 rounded-xl py-2 pl-10 pr-20 text-xs font-sans focus:bg-background focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none transition-all placeholder:text-muted-foreground text-foreground cursor-pointer"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none">
                  {searchQuery ? (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSearchQuery('');
                      }} 
                      className="pointer-events-auto p-0.5 rounded hover:bg-muted text-muted-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  ) : (
                    <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[9px] font-mono font-medium text-muted-foreground bg-muted rounded border border-border/80">
                      <Command className="h-2.5 w-2.5" /> K
                    </kbd>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Studio Audio Feedback Toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="rounded-xl h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-border/50"
                onClick={() => {
                  const nextMuted = !isSoundMuted;
                  setIsSoundMuted(nextMuted);
                  setSoundEnabled(!nextMuted);
                  if (!nextMuted) playStudioSuccess();
                  showToast(nextMuted ? 'Studio audio cues muted.' : 'Studio audio cues active.', 'info');
                }}
                title={isSoundMuted ? 'Unmute Studio Audio' : 'Mute Studio Audio'}
              >
                {isSoundMuted ? (
                  <VolumeX className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Volume2 className="h-4 w-4 text-indigo-400" />
                )}
              </Button>

              {/* Theme Toggle (Moon / Sun) */}
              <Button
                variant="ghost"
                size="icon"
                className="rounded-xl h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-border/50"
                onClick={() => {
                  const nextTheme = preferences.theme === 'dark' ? 'light' : 'dark';
                  setPreferencesAndSync({ ...preferences, theme: nextTheme });
                  showToast(`Switched to ${nextTheme === 'dark' ? 'Studio Noir (Dark)' : 'Editorial (Light)'} theme.`, 'info');
                }}
                title={`Toggle theme (Current: ${preferences.theme})`}
              >
                {preferences.theme === 'dark' ? (
                  <Sun className="h-4 w-4 text-amber-400" />
                ) : (
                  <Moon className="h-4 w-4 text-indigo-500" />
                )}
              </Button>

              {/* Notifications bell with Popover Dropdown */}
              <div className="relative">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={`rounded-xl h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-border/50 relative ${isNotificationOpen ? 'bg-muted text-foreground' : ''}`}
                  onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                >
                  <Bell className="h-4 w-4" />
                  {hasUnreadNotifications && (
                    <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full ring-2 ring-background animate-pulse" />
                  )}
                </Button>

                <AnimatePresence>
                  {isNotificationOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsNotificationOpen(false)} />
                      
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.96 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-3 w-88 bg-card border border-border rounded-2xl shadow-2xl p-4 z-50 overflow-hidden"
                      >
                        <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-border/60">
                          <span className="font-display font-bold text-xs text-foreground flex items-center gap-2">
                            <Bell className="h-3.5 w-3.5 text-primary" />
                            TELEMETRY FEED
                          </span>
                          <button 
                            onClick={handleMarkNotificationsAllRead}
                            className="text-[10px] font-mono font-bold text-primary hover:underline cursor-pointer"
                          >
                            Mark all read
                          </button>
                        </div>
                        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                          {notifications.map((notif) => (
                            <div 
                              key={notif.id} 
                              onClick={() => {
                                setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, unread: false } : n));
                                setIsNotificationOpen(false);
                                if (notif.id === 'n1') handleNavigate('dashboard');
                                if (notif.id === 'n2') handleNavigate('monetization');
                              }}
                              className={`p-3 rounded-xl border transition-all text-left cursor-pointer ${
                                notif.unread 
                                ? 'bg-primary/5 border-primary/20' 
                                : 'bg-muted/20 border-border/40 hover:bg-muted/50'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <span className="font-semibold text-xs text-foreground">{notif.title}</span>
                                {notif.unread && <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1" />}
                              </div>
                              <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{notif.desc}</p>
                              <span className="text-[9px] font-mono text-muted-foreground/70 mt-1.5 block">{notif.time}</span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              {/* Kinetic "New Post" Activator */}
              <Button 
                onClick={() => openNewPostModal()}
                className="gap-2 rounded-xl px-4 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 cursor-pointer h-9 text-xs font-semibold tracking-wide"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>New Content</span>
              </Button>
            </div>
          </header>

          {/* Screen Content Viewport */}
          <div className="flex-1 overflow-auto p-8 relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentScreen}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="max-w-7xl mx-auto h-full"
              >
                {renderScreen()}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Global Studio Command Palette Spotlight */}
      <CommandPalette 
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigate={(screen) => handleNavigate(screen as Screen)}
        openNewPostModal={() => openNewPostModal()}
        onToggleTheme={() => {
          const nextTheme = preferences.theme === 'dark' ? 'light' : 'dark';
          setPreferencesAndSync({ ...preferences, theme: nextTheme });
          showToast(`Switched to ${nextTheme === 'dark' ? 'Studio Noir (Dark)' : 'Editorial (Light)'} theme.`, 'info');
        }}
        currentTheme={preferences.theme}
      />

      {/* --- Dynamic New Post Creation Modal Overlay --- */}
      <AnimatePresence>
        {isNewPostOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-zinc-950/80 backdrop-blur-md" 
              onClick={() => setIsNewPostOpen(false)}
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-lg bg-card border border-border rounded-3xl p-8 shadow-2xl z-10 text-left"
            >
              <button 
                onClick={() => setIsNewPostOpen(false)}
                className="absolute top-6 right-6 p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground font-display">Schedule New Content</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Publish design pieces, articles, tutorials, or newsletters.</p>
                </div>
              </div>

              <form onSubmit={handleCreatePostSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground tracking-wider uppercase block">Post Title</label>
                  <input 
                    type="text" 
                    value={newPostTitle}
                    onChange={(e) => setNewPostTitle(e.target.value)}
                    placeholder="e.g. Masterclass on UI Balance & Alignment font sizes"
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:border-primary outline-none transition-all placeholder:text-muted-foreground/60 text-foreground"
                    autoFocus
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground tracking-wider uppercase block">Publishing Channel</label>
                    <select
                      value={newPostPlatform}
                      onChange={(e) => setNewPostPlatform(e.target.value as Platform)}
                      className="w-full bg-background border border-border rounded-xl px-3 py-3 text-sm focus:border-primary outline-none text-foreground capitalize"
                    >
                      <option value="youtube">YouTube</option>
                      <option value="instagram">Instagram</option>
                      <option value="tiktok">TikTok</option>
                      <option value="twitter">Twitter / X</option>
                      <option value="gumroad">Gumroad product</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground tracking-wider uppercase block">Status</label>
                    <select
                      value={newPostStatus}
                      onChange={(e) => setNewPostStatus(e.target.value as 'draft' | 'scheduled')}
                      className="w-full bg-background border border-border rounded-xl px-3 py-3 text-sm focus:border-primary outline-none text-foreground"
                    >
                      <option value="scheduled">Scheduled queue</option>
                      <option value="draft">Empty sketch draft</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground tracking-wider uppercase block">Release Date</label>
                  <input 
                    type="date"
                    value={newPostDate}
                    onChange={(e) => setNewPostDate(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:border-primary outline-none text-foreground"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3 border-t border-border">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    className="rounded-xl px-5 text-muted-foreground hover:text-foreground"
                    onClick={() => setIsNewPostOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="rounded-xl px-6 bg-primary hover:opacity-95 text-primary-foreground font-semibold flex items-center gap-1.5"
                  >
                    <Check className="h-4 w-4" />
                    <span>Create & Link slot</span>
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floated Toast Container */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-card border border-border text-sm shadow-2xl overflow-hidden font-sans transition-colors"
          >
            <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />
            {toast.type === 'success' && <Check className="h-4.5 w-4.5 text-emerald-600 dark:text-emerald-400 shrink-0" />}
            {toast.type === 'error' && <AlertCircle className="h-4.5 w-4.5 text-red-500 shrink-0" />}
            {toast.type === 'info' && <Sparkles className="h-4.5 w-4.5 text-blue-600 dark:text-blue-400 shrink-0" />}
            <span className="font-medium text-foreground">{toast.message}</span>
            <button onClick={() => setToast(null)} className="ml-3 p-1 rounded-lg text-muted-foreground hover:text-foreground">
              <X className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </TooltipProvider>
  );
}
