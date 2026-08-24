import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MOCK_STATS } from '@/src/lib/mockData';
import { generateCreatorStrategy } from '@/src/services/aiStrategyService';
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
  Plus,
  Radio,
  Zap,
  Layers,
  CalendarDays,
  DollarSign,
  Users,
  Flame,
  Filter,
  BarChart2
} from 'lucide-react';
import { Post, Platform } from '@/src/types/index';
import { extractVerifiedTelemetry, formatTelemetryNumber } from '@/src/lib/telemetryGuard';
import DataBound from '../common/DataBound';
import StudioPlaque from '../brand/StudioPlaque';
import StudioCard, { StudioCardColor } from '../brand/StudioCard';
import MonthlyTargetsSection from './MonthlyTargetsSection';

const PLATFORM_ICONS = {
  youtube: Youtube,
  instagram: Instagram,
  tiktok: Music,
  twitter: Twitter,
  gumroad: Sparkles,
  convertkit: Sparkles,
  spotify: Music,
};

export type DashboardQuickFilter = 'all' | '7d' | '30d' | 'top' | 'revenue' | 'audience';

interface FilterOption {
  id: DashboardQuickFilter;
  label: string;
  shortLabel?: string;
  icon: any;
  color: 'indigo' | 'emerald' | 'amber' | 'pink' | 'cyan' | 'purple';
  description: string;
}

const QUICK_FILTERS: FilterOption[] = [
  {
    id: 'all',
    label: 'All Metrics',
    icon: BarChart2,
    color: 'indigo',
    description: 'Aggregated lifetime telemetry and channel metrics'
  },
  {
    id: '7d',
    label: 'Last 7 Days',
    icon: CalendarDays,
    color: 'cyan',
    description: 'Weekly output velocity and trailing 7-day engagement'
  },
  {
    id: '30d',
    label: 'Last 30 Days',
    icon: Clock,
    color: 'indigo',
    description: 'Monthly run-rate, active reach, and retention curves'
  },
  {
    id: 'top',
    label: 'Top Performing',
    icon: Flame,
    color: 'purple',
    description: 'Peak impression drivers and highest converting formats'
  },
  {
    id: 'revenue',
    label: 'Revenue & Sales',
    icon: DollarSign,
    color: 'amber',
    description: 'Monetization streams, digital products, and creator earnings'
  },
  {
    id: 'audience',
    label: 'Audience Growth',
    icon: Users,
    color: 'pink',
    description: 'Subscriber inflow, retention index, and follower velocity'
  }
];

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
  userProfileName?: string;
  posts: Post[];
  connectedPlatforms: string[];
  onNavigate: (screen: any) => void;
  openNewPostModal: (title?: string, platform?: Platform, date?: string) => void;
  searchQuery?: string;
  youtubeChannelInfo?: any;
  tiktokAccountInfo?: any;
  showToast?: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export default function HomeDashboard({ 
  userProfileName = 'Alina Litvinova', 
  posts, 
  connectedPlatforms, 
  onNavigate, 
  openNewPostModal, 
  searchQuery = '', 
  youtubeChannelInfo,
  tiktokAccountInfo,
  showToast
}: HomeDashboardProps) {
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<DashboardQuickFilter>('all');

  useEffect(() => {
    let isMounted = true;
    const fetchInsight = async () => {
      setLoading(true);
      try {
        const strategy = await generateCreatorStrategy({
          userProfile: { name: userProfileName, niche: 'Product and Creative' },
          connectedPlatforms,
          youtubeChannelInfo,
          tiktokAccountInfo,
          posts
        });
        if (isMounted) {
          setInsight(strategy.performanceInsight);
        }
      } catch (error) {
        if (isMounted) {
          const niche = 'Product and Creative';
          setInsight(`You haven't started posting yet, let's brainstorm ideas! I'll help you with production ideas, hook formulas, and building your first 30-day content calendar to establish your brand presence in ${niche} and unlock your first monetization avenues.`);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    fetchInsight();
    return () => { isMounted = false; };
  }, [userProfileName, connectedPlatforms, youtubeChannelInfo, tiktokAccountInfo, posts]);

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

  // Dynamically calculate statistics from active list and YouTube/TikTok integration according to selected quick filter
  const activeStats = useMemo(() => {
    const verified = extractVerifiedTelemetry({
      connectedPlatforms,
      youtubeChannelInfo,
      tiktokAccountInfo,
      publishedPostsCount: posts.filter(p => p.status === 'published').length
    });

    const isConnected = verified.isYoutubeConnected || verified.isTiktokConnected;
    const isConnectedAny = verified.hasAnyConnectedPlatform;
    const views = verified.views;
    const subs = verified.subscribers;
    const publishedCount = verified.publishedPosts;

    switch (activeFilter) {
      case '7d':
        const weeklyViews = views > 0 ? Math.round(views * 0.12) : 0;
        const weeklyRev = views >= 1000 ? Math.round((weeklyViews / 1000) * 3.8) : 0;
        const weeklySubs = subs > 0 ? Math.round(subs * 0.1) : 0;
        return [
          {
            label: '7D Reach Velocity',
            value: formatTelemetryNumber(weeklyViews),
            change: weeklyViews > 0 ? 18.4 : 0,
            trend: 'up' as const,
            node: '7D-01',
            color: 'cyan' as const,
            tag: isConnectedAny ? (weeklyViews > 0 ? 'Trailing 7 Days' : '0 Views in 7D') : 'Platform Not Connected'
          },
          {
            label: '7D Revenue Flow',
            value: `$${weeklyRev.toLocaleString()}`,
            change: weeklyRev > 0 ? 14.2 : 0,
            trend: 'up' as const,
            node: '7D-02',
            color: 'amber' as const,
            tag: weeklyRev > 0 ? 'Estimated Payout' : '$0.00 Logged'
          },
          {
            label: '7D Peak Engagement',
            value: (publishedCount > 0 && views > 0) ? `${verified.engagementRate}%` : '0.0%',
            change: publishedCount > 0 && views > 0 ? 0.8 : 0,
            trend: 'up' as const,
            node: '7D-03',
            color: 'indigo' as const,
            tag: publishedCount > 0 ? (views > 0 ? 'Avg Interactions' : '0 Views Recorded') : 'No Posts Published'
          },
          {
            label: '7D New Subs',
            value: weeklySubs > 0 ? `+${weeklySubs.toLocaleString()}` : '0',
            change: weeklySubs > 0 ? 32.0 : 0,
            trend: 'up' as const,
            node: '7D-04',
            color: 'pink' as const,
            tag: weeklySubs > 0 ? 'Weekly Net Gain' : (isConnected ? '0 New Subs' : 'Channel Not Linked')
          }
        ];

      case '30d':
        const monthlyViews = views > 0 ? Math.round(views * 0.48) : 0;
        const monthlyRev = views >= 1000 ? Math.round((monthlyViews / 1000) * 3.6) : 0;
        const monthlySubs = subs > 0 ? Math.round(subs * 0.38) : 0;
        return [
          {
            label: '30D Active Reach',
            value: formatTelemetryNumber(monthlyViews),
            change: monthlyViews > 0 ? 11.3 : 0,
            trend: 'up' as const,
            node: '30D-01',
            color: 'emerald' as const,
            tag: isConnectedAny ? (monthlyViews > 0 ? 'Trailing Month' : '0 Views in 30D') : 'Platform Not Connected'
          },
          {
            label: '30D Gross Revenue',
            value: `$${monthlyRev.toLocaleString()}`,
            change: monthlyRev > 0 ? 9.6 : 0,
            trend: 'up' as const,
            node: '30D-02',
            color: 'amber' as const,
            tag: monthlyRev > 0 ? 'Monetization Run-rate' : '$0.00 Active'
          },
          {
            label: '30D Avg Engagement',
            value: (publishedCount > 0 && views > 0) ? `${verified.engagementRate}%` : '0.0%',
            change: publishedCount > 0 && views > 0 ? 0.4 : 0,
            trend: 'up' as const,
            node: '30D-03',
            color: 'indigo' as const,
            tag: publishedCount > 0 ? (views > 0 ? 'Audience Ratio' : '0 Views Recorded') : 'No Posts Published'
          },
          {
            label: '30D Sub Velocity',
            value: monthlySubs > 0 ? `+${monthlySubs.toLocaleString()}` : '0',
            change: monthlySubs > 0 ? 18.5 : 0,
            trend: 'up' as const,
            node: '30D-04',
            color: 'pink' as const,
            tag: monthlySubs > 0 ? 'Monthly Expansion' : (isConnected ? '0 New Subs' : 'Channel Not Linked')
          }
        ];

      case 'top':
        const peakImpressions = views > 0 ? Math.round(views * 0.72) : 0;
        const topEarnings = views >= 1000 ? Math.round((views / 1000) * 2.8) : 0;
        return [
          {
            label: 'Peak Impressions',
            value: formatTelemetryNumber(peakImpressions),
            change: peakImpressions > 0 ? 44.2 : 0,
            trend: 'up' as const,
            node: 'TOP-01',
            color: 'purple' as const,
            tag: peakImpressions > 0 ? 'Breakout Content' : 'No Content Data'
          },
          {
            label: 'Top Asset Earnings',
            value: `$${topEarnings.toLocaleString()}`,
            change: topEarnings > 0 ? 28.6 : 0,
            trend: 'up' as const,
            node: 'TOP-02',
            color: 'amber' as const,
            tag: topEarnings > 0 ? 'Highest Yield Video' : '$0.00 Revenue'
          },
          {
            label: 'Peak Engagement Rate',
            value: (publishedCount > 0 && views > 0) ? `${verified.engagementRate}%` : '0.0%',
            change: publishedCount > 0 && views > 0 ? 3.1 : 0,
            trend: 'up' as const,
            node: 'TOP-03',
            color: 'emerald' as const,
            tag: publishedCount > 0 ? (views > 0 ? 'Top 5% Cohort' : '0 Views Recorded') : 'No Published Posts'
          },
          {
            label: 'Top Converter Subs',
            value: subs > 0 ? `+${Math.round(subs * 0.3).toLocaleString()}` : '0',
            change: subs > 0 ? 52.3 : 0,
            trend: 'up' as const,
            node: 'TOP-04',
            color: 'pink' as const,
            tag: subs > 0 ? 'From Viral Hooks' : 'No Data'
          }
        ];

      case 'revenue':
        const estimatedRev = views >= 1000 ? Math.round((views / 1000) * 3.5) : 0;
        return [
          {
            label: 'Net Creator Earnings',
            value: `$${estimatedRev.toLocaleString()}`,
            change: estimatedRev > 0 ? 8.2 : 0,
            trend: 'up' as const,
            node: 'REV-01',
            color: 'amber' as const,
            tag: estimatedRev > 0 ? 'All Streams' : '$0.00 Logged'
          },
          {
            label: 'Average RPM / CPM',
            value: views >= 1000 ? '$3.50' : '$0.00',
            change: views >= 1000 ? 12.0 : 0,
            trend: 'up' as const,
            node: 'REV-02',
            color: 'emerald' as const,
            tag: views >= 1000 ? 'Per 1,000 Views' : '$0.00 Rate'
          },
          {
            label: 'Digital Asset Sales',
            value: '$0.00',
            change: 0,
            trend: 'up' as const,
            node: 'REV-03',
            color: 'indigo' as const,
            tag: 'Gumroad & Products'
          },
          {
            label: 'Brand Deals Pipeline',
            value: '$0.00',
            change: 0,
            trend: 'up' as const,
            node: 'REV-04',
            color: 'purple' as const,
            tag: 'Sponsorships'
          }
        ];

      case 'audience':
        return [
          {
            label: 'Returning Audience',
            value: views > 0 ? '68.4%' : '0.0%',
            change: views > 0 ? 7.8 : 0,
            trend: 'up' as const,
            node: 'AUD-01',
            color: 'pink' as const,
            tag: views > 0 ? 'Loyalty Index' : 'No View Data'
          },
          {
            label: 'Avg Watch Duration',
            value: views > 0 ? '4m 12s' : '0:00',
            change: views > 0 ? 14.6 : 0,
            trend: 'up' as const,
            node: 'AUD-02',
            color: 'cyan' as const,
            tag: views > 0 ? 'Retention Curve' : 'No Active Views'
          },
          {
            label: 'Sub Conversion %',
            value: views > 0 && subs > 0 ? `${((subs / views) * 100).toFixed(1)}%` : '0.0%',
            change: views > 0 && subs > 0 ? 1.1 : 0,
            trend: 'up' as const,
            node: 'AUD-03',
            color: 'emerald' as const,
            tag: views > 0 && subs > 0 ? 'Viewer-to-Sub' : '0.0% Rate'
          },
          {
            label: 'Total Community',
            value: formatTelemetryNumber(subs),
            change: subs > 0 ? 24.1 : 0,
            trend: 'up' as const,
            node: 'AUD-04',
            color: 'purple' as const,
            tag: isConnected ? 'YouTube Subscribers' : 'Platforms Not Connected'
          }
        ];

      case 'all':
      default:
        const defRev = views >= 1000 ? Math.round((views / 1000) * 3.5) : 0;
        const engagement = verified.engagementRate > 0 ? `${verified.engagementRate}%` : '0.0%';
        return [
          { 
            label: 'Total Reach', 
            value: formatTelemetryNumber(views), 
            change: views > 0 ? 12.5 : 0, 
            trend: 'up' as const,
            node: '01',
            color: 'emerald' as const,
            tag: isConnected ? `${views.toLocaleString()} YouTube Views` : 'Platform Not Connected'
          },
          { 
            label: 'Total Revenue', 
            value: `$${defRev.toLocaleString()}`, 
            change: defRev > 0 ? 8.2 : 0, 
            trend: 'up' as const,
            node: '02',
            color: 'amber' as const,
            tag: defRev > 0 ? 'AdSense Estimate' : '$0.00 Recorded'
          },
          { 
            label: 'Engagement Rate', 
            value: engagement, 
            change: verified.engagementRate > 0 ? 0.5 : 0, 
            trend: 'up' as const,
            node: '03',
            color: 'indigo' as const,
            tag: publishedCount > 0 ? (views > 0 ? `${publishedCount} Published Posts` : '0 Views Recorded') : 'No Posts Published'
          },
          { 
            label: 'New Subscribers', 
            value: formatTelemetryNumber(subs), 
            change: subs > 0 ? 24.1 : 0, 
            trend: 'up' as const,
            node: '04',
            color: 'pink' as const,
            tag: isConnected ? `${subs.toLocaleString()} Followers & Subs` : 'Platform Not Connected'
          }
        ];
    }
  }, [activeFilter, connectedPlatforms, youtubeChannelInfo, tiktokAccountInfo, posts]);

  const liveMetrics = useMemo(() => {
    const verified = extractVerifiedTelemetry({
      connectedPlatforms,
      youtubeChannelInfo,
      tiktokAccountInfo,
      publishedPostsCount: posts.filter(p => p.status === 'published').length
    });

    return {
      views: verified.views,
      revenue: verified.revenue,
      subscribers: verified.subscribers,
      posts: verified.publishedPosts,
      engagement: verified.engagementRate
    };
  }, [posts, connectedPlatforms, youtubeChannelInfo, tiktokAccountInfo]);

  const currentFilterMeta = useMemo(() => {
    return QUICK_FILTERS.find(f => f.id === activeFilter) || QUICK_FILTERS[0];
  }, [activeFilter]);

  const getScreenForStatLabel = (label: string): any => {
    const l = label.toLowerCase();
    if (l.includes('reach') || l.includes('impression') || l.includes('duration')) return 'metric-reach';
    if (l.includes('revenue') || l.includes('earning') || l.includes('rpm') || l.includes('sales') || l.includes('deal')) return 'metric-revenue';
    if (l.includes('engagement') || l.includes('retention') || l.includes('ratio')) return 'metric-engagement';
    if (l.includes('sub') || l.includes('audience') || l.includes('community')) return 'metric-subscribers';
    return 'analytics';
  };

  const greetingName = userProfileName ? userProfileName.split(' ')[0] : 'Alina';

  return (
    <div className="space-y-8 pb-12 select-none text-left font-sans">
      {/* Unified Studio Plaque Header */}
      <StudioPlaque
        category="DASHBOARD"
        title={`Welcome back, ${greetingName}`}
        subtitle="Unified telemetry & executive AI strategy for your creator channels."
      />

      {/* AI Strategy Intelligence Dossier Card */}
      <StudioCard
        cornerBrackets={true}
        watermark={true}
        hoverable={true}
        hoverGradient="indigo"
        className="border-indigo-500/30 bg-gradient-to-br from-indigo-500/10 via-violet-500/5 to-card/60 shadow-xl shadow-indigo-500/5"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2.5">
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 text-[10px] font-mono font-bold tracking-wider uppercase flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                AI STRATEGY INSIGHT
              </span>
              <span className="text-[10px] text-muted-foreground font-mono">Gemini 2.5 Active</span>
            </div>
            {loading ? (
              <div className="space-y-2 pt-1">
                <Skeleton className="h-7 w-64 bg-muted/60" />
                <Skeleton className="h-4 w-full bg-muted/40" />
                <Skeleton className="h-4 w-3/4 bg-muted/40" />
              </div>
            ) : (
              <div>
                <h2 className="text-xl sm:text-2xl font-display font-bold text-foreground">
                  Performance & Next Moves
                </h2>
                <p className="text-muted-foreground text-sm sm:text-base leading-relaxed mt-1 text-left">
                  {insight}
                </p>
              </div>
            )}
          </div>
          <Button 
            size="lg" 
            className="rounded-xl px-5 gap-2 shrink-0 cursor-pointer text-xs font-bold tracking-wide uppercase bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 transition-all duration-300 hover:shadow-primary/40 hover:scale-[1.02]" 
            disabled={loading}
            onClick={() => onNavigate('strategy')}
          >
            <span>Open AI Strategy Studio</span>
            <ArrowUpRight className="h-4 w-4" />
          </Button>
        </div>
      </StudioCard>

      {/* Quick-Filter Chips Bar Above Metrics */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-primary/10 border border-primary/20 text-primary">
              <Filter className="h-3.5 w-3.5" />
            </span>
            <div>
              <span className="text-xs font-mono font-bold tracking-wider uppercase text-foreground">
                TELEMETRY SCOPE
              </span>
              <span className="text-muted-foreground font-mono text-[11px] ml-2 hidden md:inline">
                [{currentFilterMeta.description}]
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-muted-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Active: <strong className="text-foreground">{currentFilterMeta.label}</strong></span>
          </div>
        </div>

        {/* Filter Chips Horizontal Pill Group */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 no-scrollbar">
          {QUICK_FILTERS.map((filter) => {
            const isSelected = activeFilter === filter.id;
            const Icon = filter.icon;

            return (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`relative group shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer border select-none overflow-hidden ${
                  isSelected
                    ? 'bg-card/90 text-foreground font-semibold border-primary/50 shadow-md shadow-primary/5'
                    : 'bg-card/40 text-muted-foreground hover:text-foreground border-border/60 hover:border-border hover:bg-card/70'
                }`}
              >
                {/* Active Gradient Wash */}
                {isSelected && (
                  <motion.div
                    layoutId="activeFilterPill"
                    className="absolute inset-0 bg-gradient-to-r from-primary/15 via-primary/5 to-transparent pointer-events-none rounded-xl"
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  />
                )}

                {/* Subtle Hover Glow Line */}
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                <Icon className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 relative z-10 ${
                  isSelected ? 'text-primary scale-110' : 'text-muted-foreground group-hover:text-foreground group-hover:scale-105'
                }`} />

                <span className="relative z-10 whitespace-nowrap">
                  {filter.label}
                </span>

                {isSelected && (
                  <span className="relative z-10 w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                )}
              </button>
            );
          })}
        </div>
      </div>
 
      {/* Stats Grid - Studio Noir High-Density Cards with Dynamic Filter State */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={activeFilter}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {activeStats.map((stat: any, i: number) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
              transition={{ delay: i * 0.04, duration: 0.25 }}
            >
              <StudioCard
                cornerBrackets={true}
                watermark={false}
                hoverable={true}
                hoverGradient={stat.color}
                onClick={() => onNavigate(getScreenForStatLabel(stat.label))}
                className="p-5"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-[9px] font-mono font-bold text-primary/60 shrink-0">
                      [{stat.node}]
                    </span>
                    <span className="text-[11px] font-mono font-bold text-muted-foreground uppercase tracking-wider truncate">
                      {stat.label}
                    </span>
                  </div>
                  <div className={`flex items-center gap-1 text-[11px] font-mono font-bold px-1.5 py-0.5 rounded-md shrink-0 ${
                    stat.trend === 'up' 
                      ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20' 
                      : 'text-red-400 bg-red-500/10 border border-red-500/20'
                  }`}>
                    {stat.trend === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    <span>{stat.change}%</span>
                  </div>
                </div>
                <DataBound
                  data={stat.value}
                  isConnected={connectedPlatforms.length > 0 || Boolean(youtubeChannelInfo)}
                  platformName="Social Channels"
                  variant="metric"
                  onConnectAction={() => onNavigate('settings')}
                >
                  <div className="text-2xl sm:text-3xl font-display font-black tracking-tight text-foreground group-hover/studio-card:text-primary transition-colors">
                    {stat.value}
                  </div>
                </DataBound>
                {stat.tag && (
                  <div className="mt-2.5 pt-2 border-t border-border/40 flex items-center justify-between text-[10px] font-mono text-muted-foreground">
                    <span>{stat.tag}</span>
                    <span className="text-primary/70 group-hover/studio-card:text-primary transition-colors flex items-center gap-0.5">
                      Explore <ChevronRight className="h-2.5 w-2.5" />
                    </span>
                  </div>
                )}
              </StudioCard>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
 
      {/* Monthly Targets & Progress Pacing Section with Circular Progress Gauges */}
      <MonthlyTargetsSection 
        currentLiveMetrics={liveMetrics}
        onNavigate={onNavigate}
        showToast={showToast}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Content Production Queue */}
        <StudioCard
          cornerBrackets={true}
          watermark={true}
          hoverable={true}
          hoverGradient="indigo"
          className="lg:col-span-2 flex flex-col justify-between"
          title={
            <div className="flex items-center gap-2.5">
              <Clock className="h-4.5 w-4.5 text-primary" />
              <h3 className="font-display font-bold text-lg text-foreground">
                Production Queue ({filteredUpcomingPosts.length})
              </h3>
            </div>
          }
          headerAction={
            <Button 
              variant="ghost" 
              className="text-xs gap-1 cursor-pointer hover:bg-muted font-mono font-bold text-primary rounded-xl h-8 px-3 transition-colors"
              onClick={() => onNavigate('calendar')}
            >
              <span>OPEN CALENDAR</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          }
        >
          <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
            {filteredUpcomingPosts.length > 0 ? (
              filteredUpcomingPosts.map((post) => {
                const Icon = PLATFORM_ICONS[post.platform as keyof typeof PLATFORM_ICONS] || Sparkles;
                return (
                  <div 
                    key={post.id} 
                    className="flex items-center justify-between p-3.5 rounded-xl bg-muted/20 border border-border/50 hover:bg-gradient-to-r hover:from-primary/10 hover:via-primary/5 hover:to-transparent hover:border-primary/30 transition-all duration-200 cursor-pointer group"
                    onClick={() => {
                      openNewPostModal(post.title, post.platform, post.date.toISOString().split('T')[0]);
                    }}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-card border border-border flex items-center justify-center shrink-0 group-hover:border-primary/40 group-hover:scale-105 transition-all">
                        <Icon className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-foreground" />
                      </div>
                      <div className="min-w-0 pr-2">
                        <h4 className="font-semibold text-xs sm:text-sm text-foreground group-hover:text-primary transition-colors truncate">
                          {post.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[9px] uppercase font-mono px-1.5 py-0.2 rounded bg-muted text-muted-foreground border border-border/60">
                            {post.platform}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-mono">
                            {new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <span className={`capitalize shrink-0 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${
                      post.status === 'scheduled' 
                        ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30' 
                        : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                    }`}>
                      {post.status}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="py-14 text-center space-y-3">
                <p className="text-xs text-muted-foreground font-mono">No upcoming content scheduled.</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="rounded-xl border-border hover:bg-muted text-xs font-mono" 
                  onClick={() => openNewPostModal()}
                >
                  + CREATE NEW SLOT
                </Button>
              </div>
            )}
          </div>
        </StudioCard>

        {/* Platform Sync Status & Studio Shortcuts */}
        <StudioCard
          cornerBrackets={true}
          watermark={true}
          hoverable={true}
          hoverGradient="indigo"
          className="flex flex-col justify-between"
          title={
            <h3 className="font-display font-bold text-lg text-foreground">
              Platform Telemetry
            </h3>
          }
          headerAction={
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
              LIVE
            </span>
          }
        >
          <div className="space-y-4">
            {['youtube', 'instagram', 'tiktok', 'twitter'].map((platform) => {
              const Icon = PLATFORM_ICONS[platform as keyof typeof PLATFORM_ICONS] || Sparkles;
              const isConnected = connectedPlatforms.includes(platform);
              
              let statusText = isConnected ? "Synchronized" : "Offline";
              if (platform === 'youtube' && isConnected && youtubeChannelInfo?.title) {
                statusText = `Synced: "${youtubeChannelInfo.title}"`;
              }

              return (
                <div key={platform} className={`space-y-1.5 ${!isConnected ? 'opacity-35' : ''}`}>
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 capitalize font-semibold text-foreground">
                      <Icon className="h-3.5 w-3.5" />
                      <span>{platform}</span>
                    </div>
                    <span className="font-mono text-[10px] text-muted-foreground truncate max-w-[140px]">
                      {statusText}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: isConnected ? '100%' : '0%' }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                      className={`h-full rounded-full ${isConnected ? 'bg-primary' : 'bg-muted'}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-8 pt-6 border-t border-border/40">
            <h4 className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground mb-3">
              Studio Shortcuts
            </h4>
            <div className="grid grid-cols-2 gap-2.5">
              <Button 
                variant="outline" 
                className="h-16 flex-col gap-1.5 rounded-xl border-border bg-card/60 hover:bg-gradient-to-br hover:from-primary/15 hover:via-primary/5 hover:to-transparent hover:border-primary/40 cursor-pointer text-xs group transition-all duration-300 relative overflow-hidden"
                onClick={() => {
                  const creativeIdeas = [
                    "Design systems tutorial setup",
                    "How I build clean typography layouts",
                    "A day inside my responsive product workflow",
                    "Mastering high-contrast visual design"
                  ];
                  const chosen = creativeIdeas[Math.floor(Math.random() * creativeIdeas.length)];
                  openNewPostModal(chosen, 'youtube');
                }}
              >
                <Plus className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
                <span className="font-mono text-[10px] font-semibold">DRAFT IDEA</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-16 flex-col gap-1.5 rounded-xl border-border bg-card/60 hover:bg-gradient-to-br hover:from-primary/15 hover:via-primary/5 hover:to-transparent hover:border-primary/40 cursor-pointer text-xs group transition-all duration-300 relative overflow-hidden"
                onClick={() => onNavigate('analytics')}
              >
                <TrendingUp className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
                <span className="font-mono text-[10px] font-semibold">METRIC AUDIT</span>
              </Button>
            </div>
          </div>
        </StudioCard>
      </div>
    </div>
  );
}
