import React, { useState, useMemo } from 'react';
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
  Heart
} from 'lucide-react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

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

import { Post, Platform } from './types/index';
import { MOCK_POSTS } from './lib/mockData';

type Screen = 'welcome' | 'onboarding' | 'dashboard' | 'calendar' | 'analytics' | 'monetization' | 'audience' | 'ai' | 'strategy' | 'settings';

const SIGNATURE_STYLES: Record<string, {
  hoverBg: string;
  activeBg: string;
  iconActive: string;
  iconHover: string;
  borderActive: string;
  accentBg: string;
}> = {
  dashboard: {
    hoverBg: 'hover:bg-indigo-500/10 dark:hover:bg-indigo-500/15',
    activeBg: 'bg-indigo-500/10 dark:bg-indigo-500/15',
    iconActive: 'text-indigo-600 dark:text-indigo-400',
    iconHover: 'group-hover:text-indigo-600 dark:group-hover:text-indigo-400',
    borderActive: 'border-indigo-500 dark:border-indigo-400',
    accentBg: 'from-indigo-500/[0.03] via-zinc-100/5 to-zinc-50 dark:from-indigo-950/15 dark:via-zinc-950/20 dark:to-zinc-950/30'
  },
  calendar: {
    hoverBg: 'hover:bg-blue-500/10 dark:hover:bg-blue-500/15',
    activeBg: 'bg-blue-500/10 dark:bg-blue-500/15',
    iconActive: 'text-blue-600 dark:text-blue-400',
    iconHover: 'group-hover:text-blue-600 dark:group-hover:text-blue-400',
    borderActive: 'border-blue-500 dark:border-blue-400',
    accentBg: 'from-blue-500/[0.03] via-zinc-100/5 to-zinc-50 dark:from-blue-950/15 dark:via-zinc-950/20 dark:to-zinc-950/30'
  },
  analytics: {
    hoverBg: 'hover:bg-emerald-500/10 dark:hover:bg-emerald-500/15',
    activeBg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
    iconActive: 'text-emerald-600 dark:text-[#34D399]',
    iconHover: 'group-hover:text-emerald-600 dark:group-hover:text-[#34D399]',
    borderActive: 'border-emerald-500 dark:border-emerald-400',
    accentBg: 'from-emerald-500/[0.03] via-zinc-100/5 to-zinc-50 dark:from-emerald-950/15 dark:via-zinc-950/20 dark:to-zinc-950/30'
  },
  monetization: {
    hoverBg: 'hover:bg-amber-500/10 dark:hover:bg-amber-500/15',
    activeBg: 'bg-amber-500/10 dark:bg-amber-500/15',
    iconActive: 'text-amber-500 dark:text-[#FBBF24]',
    iconHover: 'group-hover:text-amber-500 dark:group-hover:text-[#FBBF24]',
    borderActive: 'border-amber-500 dark:border-amber-400',
    accentBg: 'from-amber-500/[0.03] via-zinc-100/5 to-zinc-50 dark:from-amber-950/15 dark:via-amber-950/20 dark:to-zinc-950/30'
  },
  audience: {
    hoverBg: 'hover:bg-pink-500/10 dark:hover:bg-pink-500/15',
    activeBg: 'bg-pink-500/10 dark:bg-pink-500/15',
    iconActive: 'text-pink-600 dark:text-pink-400',
    iconHover: 'group-hover:text-pink-600 dark:group-hover:text-pink-400',
    borderActive: 'border-pink-500 dark:border-pink-400',
    accentBg: 'from-pink-500/[0.03] via-zinc-100/5 to-zinc-50 dark:from-pink-950/15 dark:via-zinc-950/20 dark:to-zinc-950/30'
  },
  strategy: {
    hoverBg: 'hover:bg-purple-500/10 dark:hover:bg-purple-500/15',
    activeBg: 'bg-purple-500/10 dark:bg-purple-500/15',
    iconActive: 'text-purple-600 dark:text-purple-450',
    iconHover: 'group-hover:text-purple-600 dark:group-hover:text-purple-450',
    borderActive: 'border-purple-500 dark:border-purple-400',
    accentBg: 'from-purple-500/[0.03] via-zinc-100/5 to-zinc-50 dark:from-purple-950/15 dark:via-zinc-950/20 dark:to-zinc-950/30'
  },
  ai: {
    hoverBg: 'hover:bg-cyan-500/10 dark:hover:bg-cyan-500/15',
    activeBg: 'bg-cyan-500/10 dark:bg-cyan-500/15',
    iconActive: 'text-cyan-600 dark:text-cyan-400',
    iconHover: 'group-hover:text-cyan-600 dark:group-hover:text-cyan-400',
    borderActive: 'border-cyan-500 dark:border-cyan-400',
    accentBg: 'from-cyan-500/[0.03] via-zinc-100/5 to-zinc-50 dark:from-cyan-950/15 dark:via-zinc-950/20 dark:to-zinc-950/30'
  },
  settings: {
    hoverBg: 'hover:bg-slate-500/10 dark:hover:bg-slate-500/15',
    activeBg: 'bg-slate-500/10 dark:bg-slate-500/15',
    iconActive: 'text-slate-600 dark:text-slate-400',
    iconHover: 'group-hover:text-slate-600 dark:group-hover:text-slate-400',
    borderActive: 'border-slate-500 dark:border-slate-400',
    accentBg: 'from-slate-500/[0.03] via-zinc-100/5 to-zinc-50 dark:from-slate-950/15 dark:via-zinc-950/20 dark:to-zinc-950/30'
  }
};

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('welcome');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // --- Centralized Shared App State ---
  const [posts, setPosts] = useState<Post[]>(() => {
    return [...MOCK_POSTS];
  });

  const [connectedPlatforms, setConnectedPlatforms] = useState<string[]>(['youtube', 'tiktok']);

  const [userProfile, setUserProfile] = useState({
    name: 'Alex Rivers',
    email: 'alex@rivers.com',
    niche: 'Tech & Design',
    location: 'London, UK',
    plan: 'Pro Plan',
    avatar: 'https://picsum.photos/seed/creator/100'
  });

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    aiInsights: true,
    theme: 'light'
  });

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
  
  // New Post Form fields states
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostPlatform, setNewPostPlatform] = useState<Platform>('youtube');
  const [newPostDate, setNewPostDate] = useState('');
  const [newPostStatus, setNewPostStatus] = useState<'draft' | 'scheduled'>('scheduled');

  // Interactive Global search query
  const [searchQuery, setSearchQuery] = useState('');

  // Toast System
  const [toast, setToast] = useState<{message: string, type: 'success' | 'info' | 'error'} | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(prev => prev?.message === message ? null : prev);
    }, 4000);
  };

  // Triggering the pre-filled post creator modal from other screens
  const openNewPostModal = (title?: string, platform?: Platform, date?: string) => {
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

    setPosts(prev => [createdPost, ...prev]);
    setIsNewPostOpen(false);
    showToast(`"${createdPost.title}" scheduled successfully on ${newPostPlatform}!`);
    // Clear fields
    setNewPostTitle('');
  };

  const handleMarkNotificationsAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
    showToast('All notifications marked as read', 'info');
  };

  const hasUnreadNotifications = useMemo(() => {
    return notifications.some(n => n.unread);
  }, [notifications]);

  // Navigate utility passed to children
  const handleNavigate = (screen: Screen) => {
    setCurrentScreen(screen);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'welcome': 
        return (
          <WelcomeSplash 
            onNext={() => setCurrentScreen('onboarding')} 
          />
        );
      case 'onboarding': 
        return (
          <ConnectPlatforms 
            onNext={() => setCurrentScreen('dashboard')} 
            connectedPlatforms={connectedPlatforms}
            setConnectedPlatforms={setConnectedPlatforms}
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
          />
        );
      case 'calendar': 
        return (
          <CreatorCalendar 
            posts={posts}
            setPosts={setPosts}
            openNewPostModal={openNewPostModal}
            showToast={showToast}
          />
        );
      case 'analytics': 
        return (
          <AnalyticsView 
            posts={posts}
            connectedPlatforms={connectedPlatforms}
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
            setPosts={setPosts}
            openNewPostModal={openNewPostModal}
            showToast={showToast}
            onNavigate={handleNavigate}
          />
        );
      case 'strategy': 
        return (
          <AIStrategyView 
            openNewPostModal={openNewPostModal}
            showToast={showToast}
          />
        );
      case 'ai': 
        return (
          <AIAssistant 
            onNavigate={handleNavigate} 
            showToast={showToast}
            openNewPostModal={openNewPostModal}
          />
        );
      case 'settings': 
        return (
          <SettingsView 
            userProfile={userProfile}
            setUserProfile={setUserProfile}
            connectedPlatforms={connectedPlatforms}
            setConnectedPlatforms={setConnectedPlatforms}
            preferences={preferences}
            setPreferences={setPreferences}
            showToast={showToast}
            onSignOut={() => {
              setCurrentScreen('welcome');
              setConnectedPlatforms([]);
              showToast('Logged out successfully!', 'info');
            }}
          />
        );
      default: 
        return <HomeDashboard posts={posts} connectedPlatforms={connectedPlatforms} onNavigate={handleNavigate} openNewPostModal={openNewPostModal} searchQuery={searchQuery} />;
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

  if (currentScreen === 'welcome' || currentScreen === 'onboarding') {
    return (
      <TooltipProvider>
        <div className="min-h-screen bg-background text-foreground grid-bg overflow-hidden relative">
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
      <div className="h-screen bg-background text-foreground flex overflow-hidden relative">
        {/* Sidebar */}
        <motion.aside 
          initial={false}
          animate={{ width: isSidebarOpen ? 265 : 80 }}
          className="border-r border-border bg-card/50 backdrop-blur-xl flex flex-col z-40 shrink-0 h-screen max-h-screen sticky top-0"
        >
          <div className="p-6 flex items-center justify-between border-b border-border/40">
            {isSidebarOpen && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => handleNavigate('dashboard')}
              >
                <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                  <Sparkles className="h-4.5 w-4.5 text-primary-foreground fill-primary-foreground" />
                </div>
                <span className="font-display font-bold text-xl tracking-tight">
                  Creator OS
                </span>
              </motion.div>
            )}
            {!isSidebarOpen && (
              <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center cursor-pointer mx-auto shadow-lg shadow-primary/20" onClick={() => setIsSidebarOpen(true)}>
                <Sparkles className="h-4 w-4 text-primary-foreground fill-primary-foreground" />
              </div>
            )}
            {isSidebarOpen && (
              <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(false)} className="rounded-xl">
                <Menu className="h-5 w-5" />
              </Button>
            )}
          </div>

          <ScrollArea className="flex-1 px-3">
            <div className="space-y-1.5 py-6">
               {navItems.map((item) => {
                const isSelected = currentScreen === item.id;
                const style = SIGNATURE_STYLES[item.id as Screen] || SIGNATURE_STYLES.dashboard;
                return (
                  <Button
                    key={item.id}
                    variant="ghost"
                    className={`w-full justify-start gap-4 h-11 rounded-xl font-semibold group transition-all duration-200 border-l-4 ${
                      isSelected 
                        ? `${style.activeBg} text-zinc-950 dark:text-zinc-50 border-l-4 ${style.borderActive} pl-3` 
                        : `text-zinc-700 dark:text-zinc-350 border-transparent bg-transparent pl-4 ${style.hoverBg} hover:text-zinc-950 dark:hover:text-zinc-50`
                    } ${!isSidebarOpen && 'px-0 justify-center border-l-0 pl-0'}`}
                    onClick={() => setCurrentScreen(item.id as Screen)}
                  >
                    <item.icon className={`h-5 w-5 shrink-0 transition-colors duration-200 ${
                      isSelected ? style.iconActive : `text-zinc-400 group-hover:${style.iconActive}`
                    }`} />
                    {isSidebarOpen && <span>{item.label}</span>}
                    {item.id === 'strategy' && isSidebarOpen && (
                      <Badge variant="outline" className="ml-auto text-[10px] px-1.5 h-4.5 bg-purple-500/10 text-purple-650 dark:text-purple-400 border-purple-500/20 font-bold">PRO</Badge>
                    )}
                    {item.id === 'ai' && isSidebarOpen && (
                      <Badge variant="secondary" className="ml-auto text-[10px] px-1.5 h-4.5 bg-cyan-500/10 text-cyan-600 border-cyan-500/20 font-mono font-bold">GEMINI</Badge>
                    )}
                  </Button>
                );
              })}
            </div>
          </ScrollArea>

          <div className="p-4 border-t border-border space-y-2">
            {(() => {
              const isSettingsSelected = currentScreen === 'settings';
              const sStyle = SIGNATURE_STYLES.settings;
              return (
                <Button
                  variant="ghost"
                  className={`w-full justify-start gap-4 h-11 rounded-xl font-semibold group transition-all duration-200 border-l-4 ${
                    isSettingsSelected 
                      ? `${sStyle.activeBg} text-zinc-950 dark:text-zinc-50 border-l-4 ${sStyle.borderActive} pl-3` 
                      : `text-zinc-700 dark:text-zinc-350 border-transparent bg-transparent pl-4 ${sStyle.hoverBg} hover:text-zinc-950 dark:hover:text-zinc-50`
                  } ${!isSidebarOpen && 'px-0 justify-center border-l-0 pl-0'}`}
                  onClick={() => setCurrentScreen('settings')}
                >
                  <Settings className={`h-5 w-5 shrink-0 transition-colors duration-200 ${
                    isSettingsSelected ? sStyle.iconActive : `text-zinc-400 group-hover:${sStyle.iconActive}`
                  }`} />
                  {isSidebarOpen && <span>Settings</span>}
                </Button>
              );
            })()}
            <div 
              className={`flex items-center gap-3 p-2 rounded-xl transition-colors hover:bg-muted/30 cursor-pointer ${!isSidebarOpen && 'justify-center p-0 py-2'}`}
              onClick={() => handleNavigate('settings')}
            >
              <Avatar className="h-9 w-9 border border-border shrink-0">
                <AvatarImage src={userProfile.avatar} />
                <AvatarFallback>{userProfile.name.split(' ').map(n=>n[0]).join('')}</AvatarFallback>
              </Avatar>
              {isSidebarOpen && (
                <div className="flex flex-col overflow-hidden text-left">
                  <span className="text-sm font-medium truncate text-foreground">{userProfile.name}</span>
                  <span className="text-xs text-muted-foreground truncate">{userProfile.plan} • {userProfile.niche}</span>
                </div>
              )}
            </div>
          </div>
        </motion.aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col relative overflow-hidden">
          {/* Header */}
          <header className="h-16 border-b border-border/60 flex items-center justify-between px-8 bg-background/50 backdrop-blur-md z-30 shrink-0">
            <div className="flex items-center gap-4 flex-1 max-w-xl">
              <div className="relative w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-zinc-400" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search content, draft ideas, or type commands..." 
                  className="w-full bg-muted/40 border border-border/80 rounded-full py-2 pl-11 pr-5 text-sm focus:bg-background focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-zinc-500"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground">
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Notifications bell with Popover Dropdown */}
              <div className="relative">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={`rounded-full h-10 w-10 relative ${isNotificationOpen ? 'bg-muted' : ''}`}
                  onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                >
                  <Bell className="h-5 w-5 text-zinc-300" />
                  {hasUnreadNotifications && (
                    <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-background animate-pulse"></span>
                  )}
                </Button>

                <AnimatePresence>
                  {isNotificationOpen && (
                    <>
                      {/* Click outside backdrop */}
                      <div className="fixed inset-0 z-40" onClick={() => setIsNotificationOpen(false)} />
                      
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 5, scale: 0.95 }}
                        className="absolute right-0 mt-2.5 w-85 bg-zinc-950 border border-zinc-850 rounded-2xl shadow-2xl p-4 z-50 overflow-hidden"
                      >
                        <div className="flex items-center justify-between mb-3 pb-2 border-b border-border/40">
                          <span className="font-bold text-sm text-zinc-100 flex items-center gap-1.5">
                            <Bell className="h-4 w-4 text-primary" />
                            Notifications
                          </span>
                          <button 
                            onClick={handleMarkNotificationsAllRead}
                            className="text-[10px] font-bold text-primary hover:underline"
                          >
                            Mark all read
                          </button>
                        </div>
                        <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
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
                                ? 'bg-zinc-900 border-zinc-800' 
                                : 'bg-transparent border-zinc-900/40 hover:bg-zinc-900/50'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <span className="font-bold text-xs text-zinc-200">{notif.title}</span>
                                {notif.unread && <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1" />}
                              </div>
                              <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">{notif.desc}</p>
                              <span className="text-[9px] font-mono text-zinc-500 mt-1.5 block">{notif.time}</span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              {/* Dynamic Header "New Post" Activator */}
              <Button 
                onClick={() => openNewPostModal()}
                className="gap-2 rounded-full px-5 bg-gradient-to-r from-primary to-primary/90 hover:opacity-90 shadow-md shadow-primary/10 cursor-pointer h-10 text-sm font-medium"
              >
                <Plus className="h-4.5 w-4.5" />
                <span>New Post</span>
              </Button>
            </div>
          </header>

          {/* Screen Content */}
          {(() => {
            const activeStyle = SIGNATURE_STYLES[currentScreen as Screen] || SIGNATURE_STYLES.dashboard;
            return (
              <div className={`flex-1 overflow-auto p-8 bg-gradient-to-br ${activeStyle.accentBg}`}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentScreen}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="max-w-7xl mx-auto h-full"
                  >
                    {renderScreen()}
                  </motion.div>
                </AnimatePresence>
              </div>
            );
          })()}
        </main>
      </div>

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
