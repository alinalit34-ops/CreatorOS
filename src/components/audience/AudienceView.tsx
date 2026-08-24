import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area
} from 'recharts';
import { AUDIENCE_AGE, AUDIENCE_GEO } from '@/src/lib/mockData';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import StudioPlaque from '../brand/StudioPlaque';
import StudioCard from '../brand/StudioCard';
import { 
  Users, 
  MapPin, 
  Clock, 
  Target,
  ArrowUpRight,
  ChevronRight,
  Youtube,
  Instagram,
  Twitter,
  Music,
  Sparkles,
  Check,
  Calendar,
  Zap,
  Info,
  Play,
  Grid,
  LineChart as LucideLineChart,
  Activity
} from 'lucide-react';
import { Post, Platform } from '@/src/types/index';

const COLORS = ['#8B5CF6', '#EC4899', '#3B82F6', '#10B981', '#F59E0B'];

const WEEK_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const WEEK_DAYS_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const getEngagementValue = (dayIndex: number, hour: number, platform: string) => {
  let base = 20;
  const isWeekend = dayIndex >= 5;

  if (isWeekend) {
    if (hour >= 11 && hour <= 22) base += 50;
    else if (hour >= 8 && hour < 11) base += 25;
    else if (hour > 22 || hour < 2) base += 15;
  } else {
    if (hour >= 8 && hour <= 10) base += 40;
    else if (hour >= 18 && hour <= 22) base += 55;
    else if (hour >= 11 && hour <= 17) base += 30;
    else if (hour >= 6 && hour < 8) base += 15;
  }

  if (platform === 'youtube') {
    if (hour >= 19 && hour <= 21) base += 18;
    if (dayIndex === 1 || dayIndex === 6) base += 8;
  } else if (platform === 'instagram') {
    if (hour >= 12 && hour <= 14) base += 10;
    if (hour >= 18 && hour <= 20) base += 15;
  } else if (platform === 'tiktok') {
    if (hour >= 19 && hour <= 23) base += 15;
    if (hour >= 23 || hour <= 1) base += 12;
  } else if (platform === 'twitter') {
    if (hour >= 9 && hour <= 16) base += 15;
    if (isWeekend) base -= 15;
  }

  return Math.min(Math.max(base, 10), 98);
};

const getRecommendation = (dayIndex: number, hour: number, platform: string) => {
  const dayName = WEEK_DAYS[dayIndex];
  
  if (hour >= 0 && hour < 6) {
    return {
      type: "Late Night Chill",
      desc: `Ideal for casual interactive polls, story updates, or scheduling early-morning automated newsletters for global timezones on ${dayName}.`,
      badge: "Low Competition"
    };
  } else if (hour >= 6 && hour < 12) {
    return {
      type: "Morning Commute Dispatch",
      desc: `Best for Twitter/X analytical threads, professional announcements, and detailed industry newsletter issues on ${dayName}.`,
      badge: "High Click-Through"
    };
  } else if (hour >= 12 && hour < 18) {
    return {
      type: "Lunchtime/Afternoon Catch-up",
      desc: `Perfect for bite-sized Instagram Reels, design tips, visual galleries, or creator lifestyle carousels on ${dayName}.`,
      badge: "High Shareability"
    };
  } else {
    return {
      type: "Prime Time Showcase",
      desc: `Maximum active viewers. Release high-fidelity long-form YouTube tutorials, major project launches, or host Live Q&A streams on ${dayName}.`,
      badge: "Maximum Visibility"
    };
  }
};

interface AudienceViewProps {
  posts: Post[];
  setPosts: React.Dispatch<React.SetStateAction<Post[]>>;
  openNewPostModal: (title?: string, platform?: Platform, date?: string) => void;
  youtubeChannelInfo?: any;
  tiktokAccountInfo?: any;
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
  onNavigate: (screen: any) => void;
}

export default function AudienceView({ posts, setPosts, openNewPostModal, youtubeChannelInfo, tiktokAccountInfo, showToast, onNavigate }: AudienceViewProps) {
  const [activePlatform, setActivePlatform] = useState<string>('all');
  const [selectedCell, setSelectedCell] = useState<{ dayIndex: number; hour: number }>({ dayIndex: 1, hour: 19 }); // Tuesday 7pm
  const [viewMode, setViewMode] = useState<'grid' | 'wave'>('grid');
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  const handleCellClick = (dayIndex: number, hour: number) => {
    setSelectedCell({ dayIndex, hour });
  };

  const formatHour = (h: number) => {
    if (h === 0) return "12 AM";
    if (h === 12) return "12 PM";
    return h > 12 ? `${h - 12} PM` : `${h} AM`;
  };

  const selectedData = useMemo(() => {
    const value = getEngagementValue(selectedCell.dayIndex, selectedCell.hour, activePlatform);
    const recommendation = getRecommendation(selectedCell.dayIndex, selectedCell.hour, activePlatform);
    return {
      day: WEEK_DAYS[selectedCell.dayIndex],
      time: formatHour(selectedCell.hour),
      engagement: value,
      recommendation
    };
  }, [selectedCell, activePlatform]);

  const waveChartData = useMemo(() => {
    return Array.from({ length: 24 }).map((_, hour) => {
      return {
        hourName: formatHour(hour),
        hourVal: hour,
        engagement: getEngagementValue(selectedCell.dayIndex, hour, activePlatform),
      };
    });
  }, [selectedCell.dayIndex, activePlatform]);

  const startScanner = () => {
    if (isScanning) return;
    setIsScanning(true);
    setScanProgress(0);
    showToast("Initializing automated user presence sweep...", "info");
    
    let currentHour = 0;
    const interval = setInterval(() => {
      if (currentHour < 24) {
        setScanProgress(currentHour);
        // Find peak day for this hour
        let peakDay = 0;
        let maxVal = -1;
        for (let d = 0; d < 7; d++) {
          const val = getEngagementValue(d, currentHour, activePlatform);
          if (val > maxVal) {
            maxVal = val;
            peakDay = d;
          }
        }
        setSelectedCell({ dayIndex: peakDay, hour: currentHour });
        currentHour++;
      } else {
        clearInterval(interval);
        setIsScanning(false);
        showToast("Presence scanning complete! Optimal peaks registered.", "success");
      }
    }, 100); // Speed of scan
  };

  const handleScheduleAction = () => {
    // Weekday alignment
    // selectedCell.dayIndex runs 0: Monday, 1: Tuesday ... 6: Sunday
    const daysFromMonday = selectedCell.dayIndex;
    const computedDate = new Date();
    const currentDayOfWeek = computedDate.getDay(); // 0: Sunday, 1: Monday...
    
    // Normalize Sunday for Monday-first calculations
    const normalizedToday = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1;
    const diff = daysFromMonday - normalizedToday;
    const distance = diff >= 0 ? diff : diff + 7;
    
    computedDate.setDate(computedDate.getDate() + distance);
    const dateStr = computedDate.toISOString().split('T')[0];

    const draftTitle = `${selectedData.recommendation.type} (${selectedData.time} ${selectedData.day})`;
    const channelMapping: Record<string, Platform> = {
      youtube: 'youtube',
      instagram: 'instagram',
      tiktok: 'tiktok',
      twitter: 'twitter',
    };
    const draftPlatform: Platform = channelMapping[activePlatform] || 'youtube';

    openNewPostModal(draftTitle, draftPlatform, dateStr);
  };

  const getHeatmapColor = (value: number) => {
    if (value > 80) return "bg-pink-600/[0.9] hover:bg-pink-600 border border-pink-500/30";
    if (value > 60) return "bg-pink-500/[0.65] hover:bg-pink-500/80 border border-pink-500/20";
    if (value > 40) return "bg-pink-500/[0.4] hover:bg-pink-500/50 border border-pink-500/10";
    if (value > 20) return "bg-pink-500/[0.18] hover:bg-pink-500/25 border border-zinc-900";
    return "bg-pink-500/[0.05] hover:bg-pink-500/10 border border-zinc-950";
  };

  return (
    <div className="space-y-8 pb-12 select-none text-left font-sans">
      {/* Unified Studio Plaque Header */}
      <StudioPlaque
        nodeId="NODE: 04"
        category="DEMOGRAPHICAL TELEMETRY"
        status="ACTIVE MONITORING"
        statusColor="rose"
        title="Audience Intelligence"
        subtitle="Dissect demographical presence and optimize engagement scheduling queues."
        action={
          <div className="flex bg-muted/70 rounded-xl p-1 border border-border/80 shrink-0">
            {[
              { id: 'all', label: 'All Channels' },
              { id: 'youtube', label: 'YouTube' },
              { id: 'instagram', label: 'Instagram' },
              { id: 'tiktok', label: 'TikTok' },
              { id: 'twitter', label: 'X' },
            ].map((tab) => (
              <button
                 key={tab.id}
                 onClick={() => setActivePlatform(tab.id)}
                 className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold cursor-pointer transition-all ${
                   activePlatform === tab.id
                     ? 'bg-background text-foreground shadow-sm'
                     : 'text-muted-foreground hover:text-foreground'
                 }`}
              >
                 {tab.label}
              </button>
            ))}
          </div>
        }
      />

      {/* Live YouTube Channel Audience Banner */}
      {youtubeChannelInfo && (
        <StudioCard
          cornerBrackets={true}
          watermark={true}
          className="p-6 border-red-500/20 bg-gradient-to-r from-red-500/[0.08] via-background to-background"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              {youtubeChannelInfo.thumbnail ? (
                <img 
                  src={youtubeChannelInfo.thumbnail} 
                  alt={youtubeChannelInfo.title} 
                  className="w-14 h-14 rounded-2xl border-2 border-red-500/40 object-cover shadow-md"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-14 h-14 rounded-2xl bg-red-600/10 border border-red-500/30 flex items-center justify-center">
                  <Youtube className="h-7 w-7 text-red-500" />
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-foreground font-display">{youtubeChannelInfo.title}</h3>
                  <Badge className="bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30 text-[10px] uppercase font-bold font-mono">
                    Live Verified
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                  {youtubeChannelInfo.customUrl || `@${youtubeChannelInfo.title.toLowerCase().replace(/\s+/g, '')}`} • Google OAuth Synchronized
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6 border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0 md:pl-6">
              <div className="text-left">
                <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-wider block">Live Subscribers</span>
                <span className="text-lg font-bold text-foreground font-mono">
                  {typeof youtubeChannelInfo.metrics?.subscribers === 'number' ? youtubeChannelInfo.metrics.subscribers.toLocaleString() : '0'}
                </span>
              </div>
              <div className="text-left">
                <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-wider block">Total Views</span>
                <span className="text-lg font-bold text-foreground font-mono">
                  {typeof youtubeChannelInfo.metrics?.views === 'number' ? youtubeChannelInfo.metrics.views.toLocaleString() : '0'}
                </span>
              </div>
              <div className="text-left">
                <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-wider block">Public Videos</span>
                <span className="text-lg font-bold text-foreground font-mono">
                  {typeof youtubeChannelInfo.metrics?.videos === 'number' 
                    ? youtubeChannelInfo.metrics.videos.toLocaleString() 
                    : (typeof youtubeChannelInfo.metrics?.videoCount === 'number' ? youtubeChannelInfo.metrics.videoCount.toLocaleString() : '0')}
                </span>
              </div>
            </div>
          </div>
        </StudioCard>
      )}

      {/* Live TikTok Account Audience Banner */}
      {tiktokAccountInfo && (
        <StudioCard
          cornerBrackets={true}
          watermark={true}
          className="p-6 border-cyan-500/20 bg-gradient-to-r from-cyan-500/[0.08] via-background to-background"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              {tiktokAccountInfo.avatarUrl ? (
                <img 
                  src={tiktokAccountInfo.avatarUrl} 
                  alt={tiktokAccountInfo.displayName} 
                  className="w-14 h-14 rounded-2xl border-2 border-cyan-500/40 object-cover shadow-md"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-14 h-14 rounded-2xl bg-cyan-600/10 border border-cyan-500/30 flex items-center justify-center">
                  <Music className="h-7 w-7 text-cyan-500" />
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-foreground font-display">{tiktokAccountInfo.displayName}</h3>
                  <Badge className="bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/30 text-[10px] uppercase font-bold font-mono">
                    Live Verified
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                  @{tiktokAccountInfo.displayName?.toLowerCase().replace(/\s+/g, '')} • TikTok OAuth Synchronized
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6 border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0 md:pl-6">
              <div className="text-left">
                <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-wider block">Followers</span>
                <span className="text-lg font-bold text-foreground font-mono">
                  {typeof tiktokAccountInfo.metrics?.followers === 'number' ? tiktokAccountInfo.metrics.followers.toLocaleString() : '0'}
                </span>
              </div>
              <div className="text-left">
                <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-wider block">Total Likes</span>
                <span className="text-lg font-bold text-foreground font-mono">
                  {typeof tiktokAccountInfo.metrics?.likes === 'number' ? tiktokAccountInfo.metrics.likes.toLocaleString() : '0'}
                </span>
              </div>
              <div className="text-left">
                <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-wider block">Public Videos</span>
                <span className="text-lg font-bold text-foreground font-mono">
                  {typeof tiktokAccountInfo.metrics?.videos === 'number' ? tiktokAccountInfo.metrics.videos.toLocaleString() : '0'}
                </span>
              </div>
            </div>
          </div>
        </StudioCard>
      )}

      {/* Main Grid: Heatmap + Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Interactive Heatmap Matrix */}
        <StudioCard
          cornerBrackets={true}
          watermark={false}
          className="lg:col-span-2 p-6 md:p-8 flex flex-col justify-between"
        >
          <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-lg font-bold font-display flex items-center gap-2">
                  <Activity className="h-4.5 w-4.5 text-pink-500 animate-pulse" />
                  Weekly Traffic Density Waves
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">Explore real-time target audience active ratios.</p>
              </div>
              
              {/* Controls Toolbar */}
              <div className="flex items-center gap-3">
                {/* View switcher */}
                <div className="flex bg-muted/60 hover:bg-muted p-0.5 rounded-lg border border-border">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1 px-2.5 rounded-md text-[11px] font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                      viewMode === 'grid' 
                        ? 'bg-background text-foreground shadow-sm font-bold' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Grid className="h-3 w-3" />
                    <span>Grid Matrix</span>
                  </button>
                  <button
                    onClick={() => setViewMode('wave')}
                    className={`p-1 px-2.5 rounded-md text-[11px] font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                      viewMode === 'wave' 
                        ? 'bg-background text-foreground shadow-sm font-bold' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <LucideLineChart className="h-3 w-3" />
                    <span>Stream Spline</span>
                  </button>
                </div>

                {/* Radar scan button */}
                {viewMode === 'grid' && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={startScanner}
                    disabled={isScanning}
                    className="h-8 rounded-lg border-pink-500/20 hover:border-pink-500/40 hover:bg-pink-500/[0.02] text-xs font-bold gap-1.5 cursor-pointer dark:bg-zinc-900/40"
                  >
                    <Play className={`h-3 w-3 text-pink-550 dark:text-pink-400 ${isScanning ? 'animate-spin' : ''}`} />
                    <span>{isScanning ? 'Scanning...' : 'Heat Sweep'}</span>
                  </Button>
                )}
              </div>
            </div>

            {/* Main Visualizations switcher */}
            <AnimatePresence mode="wait">
              {viewMode === 'grid' ? (
                <motion.div
                  key="grid-view"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-4"
                >
                  {/* Legend / Key indicators */}
                  <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 font-bold uppercase select-none pb-2 border-b border-border/40">
                    <span>Active Heat Interval Distribution (Horiz 24H)</span>
                    <div className="flex items-center gap-1.5">
                      <span>Quiet</span>
                      <div className="flex gap-0.5">
                        <div className="w-2 h-2 rounded bg-pink-550/10" />
                        <div className="w-2 h-2 rounded bg-pink-500/35" />
                        <div className="w-2 h-2 rounded bg-pink-500/70" />
                        <div className="w-2 h-2 rounded bg-pink-500" />
                      </div>
                      <span>Peak</span>
                    </div>
                  </div>

                  <div className="overflow-x-auto scrollbar-none py-1 -mx-2 px-2">
                    <div className="min-w-[560px] space-y-2">
                      {/* X-axis labels (times of day) */}
                      <div 
                        className="grid select-none pl-12 mb-1.5 text-[9px] font-mono text-zinc-400 dark:text-zinc-500 font-bold"
                        style={{ display: 'grid', gridTemplateColumns: 'repeat(24, minmax(0, 1fr))', gap: '5px' }}
                      >
                        {Array.from({ length: 24 }).map((_, h) => (
                          <span key={h} className="text-center overflow-visible">
                            {h % 4 === 0 ? (h === 0 ? '12A' : h === 12 ? '12P' : `${h > 12 ? h - 12 : h}`) : ''}
                          </span>
                        ))}
                      </div>

                      {/* Main Matrix Rows */}
                      <div className="space-y-1.5 relative">
                        {WEEK_DAYS.map((dayName, dayIdx) => (
                          <div key={dayIdx} className="flex items-center gap-2">
                            {/* Y-axis label */}
                            <span className="w-10 text-left font-bold text-[10px] uppercase tracking-wider text-muted-foreground select-none shrink-0">
                              {WEEK_DAYS_SHORT[dayIdx]}
                            </span>
                            
                            {/* 24 Heat Cells */}
                            <div 
                              className="flex-1"
                              style={{ display: 'grid', gridTemplateColumns: 'repeat(24, minmax(0, 1fr))', gap: '5px' }}
                            >
                              {Array.from({ length: 24 }).map((_, hourVal) => {
                                const isSelected = selectedCell.dayIndex === dayIdx && selectedCell.hour === hourVal;
                                const eValue = getEngagementValue(dayIdx, hourVal, activePlatform);
                                const isHighlightedByScanner = isScanning && scanProgress === hourVal;

                                return (
                                  <motion.div
                                    key={hourVal}
                                    onClick={() => handleCellClick(dayIdx, hourVal)}
                                    whileHover={{ scale: 1.3, zIndex: 10 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                                    className={`aspect-square rounded-[4px] cursor-pointer transition-all ${getHeatmapColor(eValue)} ${
                                      isSelected ? 'ring-2 ring-pink-500 ring-offset-2 ring-offset-background scale-110 z-10' : ''
                                    } ${
                                      isHighlightedByScanner ? 'ring-2 ring-yellow-400 scale-115 shadow-md shadow-pink-500/50 z-20' : ''
                                    }`}
                                    title={`${dayName} at ${formatHour(hourVal)}: ${eValue}% client velocity`}
                                  />
                                );
                              })}
                            </div>
                          </div>
                        ))}

                        {/* Scan Laser effect overlay */}
                        {isScanning && (
                          <div 
                            className="absolute top-0 bottom-0 w-0.5 bg-gradient-to-b from-yellow-400 via-pink-500 to-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.9)] pointer-events-none transition-all duration-100 ease-linear"
                            style={{
                              left: `calc(2.5rem + 8px + ${(scanProgress / 24) * 89}%)`
                            }}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="wave-view"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-4"
                >
                  {/* Day Picker Pills inside chart mode */}
                  <div className="flex flex-wrap items-center gap-1.5 justify-start md:justify-between pb-3 border-b border-border/40">
                    <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase">Time Profile for Selected Day</span>
                    <div className="flex gap-1 overflow-x-auto scrollbar-none py-0.5">
                      {WEEK_DAYS_SHORT.map((wd, dayIdx) => (
                        <button
                          key={wd}
                          onClick={() => setSelectedCell(prev => ({ ...prev, dayIndex: dayIdx }))}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-tight cursor-pointer transition-all ${
                            selectedCell.dayIndex === dayIdx
                              ? 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border border-pink-500/20'
                              : 'bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground border border-transparent'
                          }`}
                        >
                          {wd}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Spline Area Chart */}
                  <div className="h-[200px] w-full pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={waveChartData}>
                        <defs>
                          <linearGradient id="colorEngagementStream" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#EC4899" stopOpacity={0.35}/>
                            <stop offset="95%" stopColor="#EC4899" stopOpacity={0.01}/>
                          </linearGradient>
                        </defs>
                        <XAxis 
                          dataKey="hourName" 
                          stroke="#71717a" 
                          fontSize={9} 
                          tickLine={false} 
                          axisLine={false}
                          tickFormatter={(val, idx) => {
                            return idx % 4 === 0 ? val : '';
                          }}
                        />
                        <YAxis 
                          stroke="#71717a" 
                          fontSize={9} 
                          tickLine={false} 
                          axisLine={false}
                          domain={[0, 100]}
                          tickFormatter={(tick) => `${tick}%`}
                        />
                        <Tooltip 
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <div className="bg-popover border border-border px-3 py-2 rounded-xl shadow-md text-xs">
                                  <p className="font-bold text-foreground">{data.hourName}</p>
                                  <p className="text-pink-500 font-semibold font-mono mt-0.5">
                                    Engagement: {payload[0].value}%
                                  </p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.04)" />
                        <Area 
                          type="monotone" 
                          dataKey="engagement" 
                          stroke="#EC4899" 
                          strokeWidth={2}
                          fillOpacity={1} 
                          fill="url(#colorEngagementStream)" 
                          activeDot={{ 
                            r: 6, 
                            stroke: '#EC4899', 
                            strokeWidth: 2, 
                            fill: '#fff',
                            onClick: (e, payload) => {
                              if (payload && payload.payload) {
                                setSelectedCell(prev => ({ ...prev, hour: payload.payload.hourVal }));
                              }
                            }
                          }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <p className="text-[10px] text-center text-muted-foreground leading-normal">
                    Click along the line spline coordinates to focus details and pre-stage drafting suggestions.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="mt-6 md:mt-4 bg-muted/20 border border-border rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-green-550 animate-ping" />
              <div className="text-[11px] text-muted-foreground font-mono">
                Currently tracking: <span className="font-bold text-foreground capitalize">{WEEK_DAYS[selectedCell.dayIndex]}</span> at <span className="font-bold text-foreground font-mono">{formatHour(selectedCell.hour)}</span>
              </div>
            </div>
            <span className="text-[10px] font-bold text-pink-605 pointer-events-none font-mono">
              CELL SCORE: {getEngagementValue(selectedCell.dayIndex, selectedCell.hour, activePlatform)}/100
            </span>
          </div>
        </StudioCard>
 
        {/* Selected Slot Strategy Briefings Sidebar */}
        <div>
          <AnimatePresence mode="wait">
            <motion.div
              key={`${selectedCell.dayIndex}-${selectedCell.hour}-${activePlatform}`}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.2 }}
            >
              <StudioCard
                cornerBrackets={true}
                watermark={true}
                className="p-6 md:p-8 border-pink-500/20 bg-gradient-to-b from-pink-500/[0.04] to-card/60 h-full flex flex-col justify-between"
              >
                <div>
                  <h4 className="font-bold flex items-center justify-between border-b border-border/45 pb-3 mb-6 font-display text-sm text-foreground">
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-pink-550 dark:text-pink-400" />
                      Slot Breakdown
                    </span>
                    <Badge variant="outline" className="text-[10px] bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20 font-bold font-mono uppercase">
                      {selectedData.day}
                    </Badge>
                  </h4>
 
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="p-4 rounded-2xl bg-card border border-border space-y-1">
                      <span className="text-[9px] text-muted-foreground font-mono font-bold uppercase tracking-wider block">Local Peak Hour</span>
                      <div className="text-sm font-bold text-foreground font-mono italic">{selectedData.time}</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-card border border-border space-y-1">
                      <span className="text-[9px] text-muted-foreground font-mono font-bold uppercase tracking-wider block">Availability Velocity</span>
                      <div className="text-sm font-bold text-pink-600 dark:text-pink-400 flex items-center gap-1 font-mono italic">
                        <Zap className="h-3.5 w-3.5 fill-pink-600 dark:fill-pink-400 text-pink-600 dark:text-pink-400" />
                        {selectedData.engagement}%
                      </div>
                    </div>
                  </div>
 
                  <div className="space-y-4 pt-1 bg-muted/40 p-5 rounded-2xl border border-border">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground block font-sans">AI Strategy Proposal</span>
                      <Badge className="text-[9px] py-0 px-2 rounded-full uppercase bg-pink-500/15 text-pink-600 dark:text-pink-400 border border-pink-500/25 font-mono font-bold">
                        {selectedData.recommendation.badge}
                      </Badge>
                    </div>
                    <div>
                      <h5 className="font-bold text-foreground text-sm font-display mb-1.5">{selectedData.recommendation.type}</h5>
                      <p className="text-xs text-muted-foreground leading-relaxed text-left">
                        {selectedData.recommendation.desc}
                      </p>
                    </div>
                  </div>
                </div>
 
                <div className="pt-6 mt-6 border-t border-border space-y-3">
                  <Button
                    onClick={handleScheduleAction}
                    className="w-full gap-2 rounded-xl h-11 text-xs font-mono font-bold bg-pink-600 dark:bg-pink-500 hover:bg-pink-700 dark:hover:bg-pink-600 text-white cursor-pointer select-none"
                  >
                    <Calendar className="h-4 w-4" />
                    <span>Schedule Draft for this Space</span>
                  </Button>
                  <p className="text-[9px] text-muted-foreground font-mono text-center leading-normal">
                    Pre-fills and inserts a creative placeholder slot matching this timezone into your content feed.
                  </p>
                </div>
              </StudioCard>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Demographics & Interests Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Interests & Demographics tag block */}
        <StudioCard
          cornerBrackets={true}
          watermark={true}
          className="p-6 md:p-8"
          title="Audience Interest Saturation"
        >
          <div className="flex flex-wrap gap-3.5 mb-8">
            {[
              { tag: 'Graphic Design', weight: 'text-2xl font-bold text-zinc-100' },
              { tag: 'Productivity', weight: 'text-xl font-semibold text-zinc-300' },
              { tag: 'AI Tools', weight: 'text-3xl font-extrabold text-pink-500 dark:text-pink-400' },
              { tag: 'Freelancing', weight: 'text-lg font-medium text-zinc-400' },
              { tag: 'Tech Reviews', weight: 'text-2xl font-bold text-zinc-100' },
              { tag: 'Minimalism', weight: 'text-base font-normal text-zinc-500' },
              { tag: 'Creative Business', weight: 'text-xl font-semibold text-zinc-300' },
              { tag: 'Web Development', weight: 'text-lg font-medium text-zinc-400' },
              { tag: 'Typography', weight: 'text-sm font-light text-zinc-650' },
            ].map((item) => (
              <motion.span
                key={item.tag}
                whileHover={{ scale: 1.08 }}
                className={`${item.weight} cursor-pointer hover:text-pink-500 transition-colors origin-left font-display`}
                onClick={() => {
                  showToast(`Assigned assist topic query to: "${item.tag}"`);
                  onNavigate('ai');
                  localStorage.setItem('assistant_default_prompt', `Dissect the latest viral trends regarding the ${item.tag} niche for creators.`);
                }}
              >
                {item.tag}
              </motion.span>
            ))}
          </div>
          
          <div className="p-5 rounded-2xl bg-muted/20 border border-border/60">
            {posts.length > 0 ? (
              <>
                <h4 className="font-bold text-sm mb-1.5 flex items-center gap-1.5 text-foreground">
                  <ArrowUpRight className="h-4.5 w-4.5 text-emerald-400" />
                  Active Content Topic Focus: {posts[0].platform.toUpperCase()}
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed text-left">
                  Your recent scheduled draft "{posts[0].title}" targets upcoming audience engagement windows. Click below to analyze content distribution.
                </p>
                <Button 
                  variant="link" 
                  className="p-0 h-auto mt-4 text-xs font-mono font-bold text-pink-650 dark:text-pink-400 gap-1 select-none hover:underline shrink-0"
                  onClick={() => {
                    showToast('Launching AI Assistant audit...');
                    onNavigate('ai');
                    localStorage.setItem('assistant_default_prompt', `Analyze audience demand and structure an optimized hook for "${posts[0].title}".`);
                  }}
                >
                  <span>Analyze Content Angle</span> 
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </>
            ) : (
              <>
                <h4 className="font-bold text-sm mb-1.5 flex items-center gap-1.5 text-foreground">
                  <Sparkles className="h-4 w-4 text-amber-400" />
                  Audience Baseline: 0 Posts Published
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed text-left">
                  No live posts or video tags detected yet. Start drafting or schedule your first content slot to gather audience retention telemetry.
                </p>
                <Button 
                  variant="link" 
                  className="p-0 h-auto mt-4 text-xs font-mono font-bold text-pink-650 dark:text-pink-400 gap-1 select-none hover:underline shrink-0"
                  onClick={() => {
                    showToast('Generating launch blueprint...');
                    onNavigate('ai');
                    localStorage.setItem('assistant_default_prompt', 'Provide 3 high-impact content ideas to launch my channel and gain initial traction from zero subscribers.');
                  }}
                >
                  <span>Brainstorm Launch Ideas (From 0)</span> 
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </>
            )}
          </div>
        </StudioCard>

        {/* Heatmap Insights Guide */}
        <StudioCard
          cornerBrackets={true}
          watermark={false}
          className="p-6 md:p-8 flex flex-col justify-between"
          title="Platform Heatmap Insights"
        >
          <div>
            <ul className="space-y-4.5 text-xs">
              <li className="flex gap-4">
                <Badge variant="outline" className="h-6 shrink-0 bg-red-500/10 dark:bg-red-500/20 border-red-500/20 text-red-600 dark:text-red-400 font-mono font-bold">YouTube</Badge>
                <p className="text-muted-foreground text-xs leading-relaxed text-left">
                  Optimal posting schedule is concentrated on Sunday & Tuesday evenings (7 PM - 9 PM) targeting deep-dive analytical view sessions.
                </p>
              </li>
              <li className="flex gap-4">
                <Badge variant="outline" className="h-6 shrink-0 bg-pink-500/10 dark:bg-pink-500/20 border-pink-500/20 text-pink-600 dark:text-pink-400 font-mono font-bold">Instagram</Badge>
                <p className="text-muted-foreground text-xs leading-relaxed text-left">
                  Lunchtime activity spikes across mid-week indices represent perfect opportunistic slots for visually-arresting lifestyle updates.
                </p>
              </li>
              <li className="flex gap-4">
                <Badge variant="outline" className="h-6 shrink-0 bg-cyan-500/10 dark:bg-cyan-500/20 border-cyan-500/20 text-cyan-600 dark:text-cyan-400 font-mono font-bold">TikTok</Badge>
                <p className="text-muted-foreground text-xs leading-relaxed text-left">
                  Late-night scrolling activity between Mon-Fri represents highly responsive, lower competition intervals for casual Reels.
                </p>
              </li>
              <li className="flex gap-4">
                <Badge variant="outline" className="h-6 shrink-0 bg-sky-500/10 dark:bg-sky-500/20 border-sky-500/20 text-sky-600 dark:text-sky-400 font-mono font-bold">X</Badge>
                <p className="text-muted-foreground text-xs leading-relaxed text-left">
                  Professional workflow schedules between 9 AM and 4 PM weekdays show a high CTR index but require deep intellectual threads to stand out.
                </p>
              </li>
            </ul>
          </div>

          <div className="bg-pink-500/5 dark:bg-pink-500/10 border border-pink-500/15 dark:border-pink-500/30 rounded-2xl p-4 mt-6 flex gap-3 items-start">
            <Zap className="h-4.5 w-4.5 text-pink-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-mono font-bold text-xs text-foreground">Aggregate Prime Active Slot</h4>
              <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5 text-left">
                Across all channels, your unified active subscriber peak occurs on **Tuesdays at 7:00 PM** where composite user velocity hits an active 94% ceiling.
              </p>
            </div>
          </div>
        </StudioCard>

      </div>
    </div>
  );
}
