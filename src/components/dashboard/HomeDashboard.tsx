import { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { MOCK_STATS, MOCK_INSIGHTS } from '@/src/lib/mockData';
import { generateCreatorStrategy } from '@/src/services/aiStrategyService';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  Sparkles, 
  Youtube, 
  Instagram, 
  Twitter, 
  Music,
  Clock,
  ChevronRight,
  Plus
} from 'lucide-react';
import { Post, Platform } from '@/src/types/index';

const PLATFORM_ICONS = {
  youtube: Youtube,
  instagram: Instagram,
  tiktok: Music,
  twitter: Twitter,
  gumroad: Sparkles,
  convertkit: Sparkles,
  spotify: Music,
};

const PLATFORM_BRAND = {
  youtube: {
    text: 'text-red-500',
    icon: 'text-[#FF0000]',
    bg: 'bg-[#FF0000]',
  },
  instagram: {
    text: 'text-pink-500',
    icon: 'text-[#E4405F]',
    bg: 'bg-[#E4405F]',
  },
  tiktok: {
    text: 'text-cyan-500',
    icon: 'text-[#00F2FE]',
    bg: 'bg-[#00F2FE]',
  },
  twitter: {
    text: 'text-sky-500',
    icon: 'text-[#1DA1F2]',
    bg: 'bg-[#1DA1F2]',
  }
};

interface HomeDashboardProps {
  posts: Post[];
  connectedPlatforms: string[];
  onNavigate: (screen: any) => void;
  openNewPostModal: (title?: string, platform?: Platform, date?: string) => void;
  searchQuery?: string;
}

export default function HomeDashboard({ posts, connectedPlatforms, onNavigate, openNewPostModal, searchQuery = '' }: HomeDashboardProps) {
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsight = async () => {
      try {
        const strategy = await generateCreatorStrategy();
        setInsight(strategy.performanceInsight);
      } catch (error) {
        setInsight(MOCK_INSIGHTS[0].description);
      } finally {
        setLoading(false);
      }
    };
    fetchInsight();
  }, []);

  // Filter posts based on search query in header
  const filteredUpcomingPosts = useMemo(() => {
    const upcoming = posts.filter(p => p.status !== 'published');
    if (!searchQuery.trim()) return upcoming;
    const q = searchQuery.toLowerCase();
    return upcoming.filter(p => 
      p.title.toLowerCase().includes(q) || 
      p.platform.toLowerCase().includes(q)
    );
  }, [posts, searchQuery]);

  // Dynamically calculate statistics from active list
  const activeStats = useMemo(() => {
    // Basic reactive changes if user schedules posts
    const scheduledCount = posts.filter(p => p.status === 'scheduled').length;
    const baseStats = [...MOCK_STATS];
    // Leverage state to tweak subscriber counts/reach slightly to make it feel highly alive
    return baseStats.map(s => {
      if (s.label === 'New Subscribers') {
        return { ...s, value: (8420 + scheduledCount * 200).toLocaleString() };
      }
      return s;
    });
  }, [posts]);

  return (
    <div className="space-y-8 pb-12 select-none text-left">
      <header>
        <h1 className="text-3xl font-display font-bold mb-2">Welcome back, Alex</h1>
        <p className="text-muted-foreground text-sm">Here's what's happening across your creative ecosystem today.</p>
      </header>

      {/* AI Insight Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative overflow-hidden rounded-3xl p-8 bg-gradient-to-br from-indigo-500/10 via-violet-500/5 to-indigo-500/[0.02] border border-indigo-500/20"
      >
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <Sparkles className="h-32 w-32 text-indigo-400" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-4">
              <Badge className="bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-indigo-500 dark:hover:bg-indigo-600 font-bold text-[10px]">AI INSIGHT</Badge>
              <span className="text-[10px] text-muted-foreground font-mono">Just now</span>
            </div>
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-64 bg-zinc-800" />
                <Skeleton className="h-4 w-full bg-zinc-800" />
                <Skeleton className="h-4 w-3/4 bg-zinc-800" />
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold mb-2 text-zinc-900 dark:text-zinc-100 font-display">Strategy Update</h2>
                <p className="text-muted-foreground text-base leading-relaxed text-left">
                  {insight}
                </p>
              </>
            )}
          </div>
          <Button 
            size="lg" 
            className="rounded-xl px-6 gap-2 shrink-0 cursor-pointer text-sm font-bold bg-indigo-650 text-white hover:bg-indigo-750 dark:bg-indigo-500 dark:hover:bg-indigo-600" 
            disabled={loading}
            onClick={() => onNavigate('strategy')}
          >
            <span>View Full Strategy</span>
            <ArrowUpRight className="h-4 w-4 text-white" />
          </Button>
        </div>
      </motion.div>
 
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {activeStats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Card className="p-6 hover:border-indigo-500/50 transition-colors group rounded-2xl cursor-pointer" onClick={() => onNavigate('analytics')}>
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{stat.label}</span>
                <div className={`flex items-center gap-1 text-xs font-bold ${stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                  {stat.trend === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {stat.change}%
                </div>
              </div>
              <div className="text-3xl font-display font-bold group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors origin-left">{stat.value}</div>
            </Card>
          </motion.div>
        ))}
      </div>
 
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upcoming Posts */}
        <Card className="lg:col-span-2 p-8 rounded-3xl">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Clock className="h-5 w-5 text-indigo-500" />
              Upcoming Content ({filteredUpcomingPosts.length})
            </h3>
            <Button 
              variant="ghost" 
              className="text-xs gap-1 cursor-pointer hover:bg-muted font-bold text-indigo-600 dark:text-indigo-400 rounded-xl"
              onClick={() => onNavigate('calendar')}
            >
              <span>View Calendar</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-3.5 max-h-[380px] overflow-y-auto pr-1">
            {filteredUpcomingPosts.length > 0 ? (
              filteredUpcomingPosts.map((post) => {
                const Icon = PLATFORM_ICONS[post.platform as keyof typeof PLATFORM_ICONS] || Sparkles;
                return (
                  <div 
                    key={post.id} 
                    className="flex items-center justify-between p-4 rounded-2xl bg-muted/20 border border-border/50 hover:bg-muted/40 transition-colors cursor-pointer group"
                    onClick={() => {
                      // Pre-fill creation modal with current title to easily reschedule/overwrite
                      openNewPostModal(post.title, post.platform, post.date.toISOString().split('T')[0]);
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-xl bg-card border border-border flex items-center justify-center shrink-0">
                        <Icon className="h-5 w-5 shrink-0" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors pr-2 truncate max-w-sm sm:max-w-md">{post.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-[9px] uppercase font-mono py-0 px-1.5">{post.platform}</Badge>
                          <span className="text-[10px] text-muted-foreground">{new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                      </div>
                    </div>
                    <Badge className={`capitalize shrink-0 text-[10px] px-2 h-5.5 rounded-full ${
                      post.status === 'scheduled' 
                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' 
                        : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                    }`}>
                      {post.status}
                    </Badge>
                  </div>
                );
              })
            ) : (
              <div className="py-16 text-center space-y-4">
                <p className="text-sm text-zinc-500">No matching upcoming events scheduled.</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="rounded-xl border-border hover:bg-muted" 
                  onClick={() => openNewPostModal()}
                >
                  Create slot
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* Quick Actions / Platform Health */}
        <Card className="p-8 rounded-3xl">
          <h3 className="text-xl font-bold mb-8">Platform Sync Status</h3>
          <div className="space-y-6">
            {['youtube', 'instagram', 'tiktok', 'twitter'].map((platform) => {
              const Icon = PLATFORM_ICONS[platform as keyof typeof PLATFORM_ICONS] || Sparkles;
              const isConnected = connectedPlatforms.includes(platform);
              const health = isConnected ? 98 : 0;
              const brand = PLATFORM_BRAND[platform as keyof typeof PLATFORM_BRAND];
              return (
                <div key={platform} className={`space-y-2 ${!isConnected ? 'opacity-30' : ''}`}>
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 capitalize font-semibold text-zinc-800 dark:text-zinc-200">
                      <Icon className={`h-4 w-4 ${isConnected && brand ? brand.icon : ''}`} />
                      <span className={isConnected && brand ? brand.text : ''}>{platform}</span>
                    </div>
                    <span className={`font-mono font-semibold ${isConnected && brand ? brand.text : 'text-muted-foreground'}`}>
                      {isConnected ? "Operational" : "Disconnected"}
                    </span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${health}%` }}
                      transition={{ duration: 1, delay: 0.3 }}
                      className={`h-full rounded-full ${isConnected && brand ? brand.bg : 'bg-zinc-200 dark:bg-zinc-800'}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-10 pt-8 border-t border-border">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4">Quick Shortcuts</h4>
            <div className="grid grid-cols-2 gap-2.5">
              <Button 
                variant="outline" 
                className="h-20 flex-col gap-2 rounded-2xl border-border hover:bg-muted cursor-pointer text-xs hover:text-indigo-550 dark:hover:text-indigo-400"
                onClick={() => {
                  // Prefilled action ideas triggers
                  const creativeIdeas = [
                    "Design systems tutorial setup",
                    "How I build clean typography layouts",
                    "A day inside my responsive product workflow",
                    "Is Gemini replacing layout code?"
                  ];
                  const chosen = creativeIdeas[Math.floor(Math.random() * creativeIdeas.length)];
                  openNewPostModal(chosen, 'instagram');
                }}
              >
                <Plus className="h-4.5 w-4.5 text-indigo-500" />
                <span>Idea Draft</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex-col gap-2 rounded-2xl border-border hover:bg-muted cursor-pointer text-xs hover:text-indigo-550 dark:hover:text-indigo-400"
                onClick={() => onNavigate('analytics')}
              >
                <TrendingUp className="h-4.5 w-4.5 text-indigo-500" />
                <span>Deep Audit</span>
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
