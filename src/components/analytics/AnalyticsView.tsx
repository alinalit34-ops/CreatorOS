import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { ANALYTICS_DATA } from '@/src/lib/mockData';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Youtube, 
  Instagram, 
  Twitter, 
  Music,
  Filter,
  Download,
  X,
  Check,
  TrendingUp,
  FileSpreadsheet
} from 'lucide-react';
import { Post } from '@/src/types/index';

// Premium platform metadata
const PLATFORM_META = [
  { id: 'youtube', name: 'YouTube', icon: Youtube, color: '#FF0000', baseReach: 840000, baseGrowth: '+12%', suffix: 'K' },
  { id: 'instagram', name: 'Instagram', icon: Instagram, color: '#E4405F', baseReach: 210000, baseGrowth: '+5%', suffix: 'K' },
  { id: 'tiktok', name: 'TikTok', icon: Music, color: '#00F2FE', baseReach: 450000, baseGrowth: '+24%', suffix: 'K' },
  { id: 'twitter', name: 'X', icon: Twitter, color: '#1DA1F2', baseReach: 850000, baseGrowth: '-2%', suffix: 'K' },
];

const PLATFORM_BRAND_STYLES: Record<string, { nameText: string; statAccent: string; bgSoft: string; borderSoft: string }> = {
  youtube: {
    nameText: 'text-red-650 dark:text-red-400',
    statAccent: 'text-red-650 dark:text-red-400 font-extrabold',
    bgSoft: 'bg-red-500/[0.04] dark:bg-red-500/[0.08]',
    borderSoft: 'border-red-500/20 dark:border-red-500/30'
  },
  instagram: {
    nameText: 'text-pink-600 dark:text-pink-400',
    statAccent: 'text-pink-600 dark:text-pink-400 font-extrabold',
    bgSoft: 'bg-pink-500/[0.04] dark:bg-pink-500/[0.08]',
    borderSoft: 'border-pink-500/20 dark:border-pink-500/30'
  },
  tiktok: {
    nameText: 'text-cyan-600 dark:text-cyan-400',
    statAccent: 'text-cyan-600 dark:text-cyan-400 font-extrabold',
    bgSoft: 'bg-cyan-500/[0.04] dark:bg-cyan-500/[0.08]',
    borderSoft: 'border-cyan-500/20 dark:border-cyan-500/30'
  },
  twitter: {
    nameText: 'text-sky-600 dark:text-sky-400',
    statAccent: 'text-sky-600 dark:text-[#38BDF8] font-extrabold',
    bgSoft: 'bg-sky-500/[0.04] dark:bg-sky-500/[0.08]',
    borderSoft: 'border-sky-500/20 dark:border-sky-500/30'
  }
};

interface AnalyticsViewProps {
  posts?: Post[];
  connectedPlatforms?: string[];
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export default function AnalyticsView({ posts = [], connectedPlatforms = ['youtube', 'tiktok'], showToast }: AnalyticsViewProps) {
  const [activeTimeRange, setActiveTimeRange] = useState<'24h' | '7d' | '30d' | 'all'>('7d');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<string[]>(['youtube', 'instagram', 'tiktok', 'twitter']);
  const [exporting, setExporting] = useState(false);
  const [showDetailedRep, setShowDetailedRep] = useState(false);

  // Time-range multiplier helper
  const rangeMultiplier = useMemo(() => {
    switch (activeTimeRange) {
      case '24h': return 0.15;
      case '7d': return 1.0;
      case '30d': return 4.3;
      case 'all': return 12.5;
    }
  }, [activeTimeRange]);

  // Total calculated metrics
  const calculatedMetrics = useMemo(() => {
    const scale = rangeMultiplier;
    // Sum only upselected platform values
    let totalReach = 0;
    let totalImpressions = 0;
    let totalEngagement = 184000;

    PLATFORM_META.forEach(p => {
      if (selectedFilters.includes(p.id)) {
        totalReach += p.baseReach;
        totalImpressions += p.baseReach * 3.4;
      }
    });

    return {
      reach: Math.round(totalReach * scale),
      impressions: Math.round(totalImpressions * scale),
      engagement: Math.round(totalEngagement * scale),
      watchTime: activeTimeRange === '24h' ? '1:12' : activeTimeRange === '7d' ? '4:22' : '18:45'
    };
  }, [activeTimeRange, selectedFilters, rangeMultiplier]);

  // Adjust Recharts plots dynamically based on filtered channels & active time selector
  const chartPlotData = useMemo(() => {
    const scale = rangeMultiplier;
    // Aggregate values that match active selections
    const hasYt = selectedFilters.includes('youtube');
    const hasIg = selectedFilters.includes('instagram');
    const hasTk = selectedFilters.includes('tiktok');
    const hasTw = selectedFilters.includes('twitter');

    return ANALYTICS_DATA.map((entry, idx) => {
      let reachVal = entry.reach;
      if (!hasYt && !hasIg && !hasTk && !hasTw) reachVal = 0;
      else {
        // Adjust weight
        let multiplier = 0;
        if (hasYt) multiplier += 0.4;
        if (hasIg) multiplier += 0.15;
        if (hasTk) multiplier += 0.35;
        if (hasTw) multiplier += 0.1;
        reachVal = Math.round(entry.reach * scale * multiplier * 1.5);
      }
      return {
        ...entry,
        reach: reachVal
      };
    });
  }, [selectedFilters, rangeMultiplier]);

  const activeMainColor = useMemo(() => {
    if (selectedFilters.length === 1) {
      const activeId = selectedFilters[0];
      const meta = PLATFORM_META.find(p => p.id === activeId);
      if (meta) return meta.color;
    }
    return "#10B981"; // Default Emerald
  }, [selectedFilters]);

  const handleToggleFilter = (id: string) => {
    setSelectedFilters(prev => {
      if (prev.includes(id)) {
        const next = prev.filter(item => item !== id);
        return next;
      } else {
        return [...prev, id];
      }
    });
  };

  const handleExportDataSubmit = () => {
    setExporting(true);
    setTimeout(() => {
      setExporting(false);
      showToast(`Exported report: Creator_OS_${activeTimeRange}_Metrics.csv was compiled successfully!`, 'success');
    }, 2000);
  };

  return (
    <div className="space-y-8 pb-12 select-none text-left">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold mb-2">Analytics</h1>
          <p className="text-muted-foreground text-sm">Deep dive into your cross-platform performance metrics.</p>
        </div>
        <div className="flex items-center gap-3 relative">
          
          {/* Custom interactive platform filter checkbox popover */}
          <Button 
            variant={isFilterOpen ? "secondary" : "outline"}
            className="rounded-full gap-2 text-xs font-semibold cursor-pointer border-border"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
          >
            <Filter className="h-3.5 w-3.5" />
            <span>Filter Channel ({selectedFilters.length})</span>
          </Button>

          <AnimatePresence>
            {isFilterOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsFilterOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.95 }}
                  className="absolute right-36 top-12 w-56 bg-popover border border-border rounded-2xl shadow-2xl p-4 z-50 space-y-3"
                >
                  <div className="flex items-center justify-between pb-1 border-b border-border/30">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Channels</span>
                    <button 
                      onClick={() => setSelectedFilters(['youtube', 'instagram', 'tiktok', 'twitter'])} 
                      className="text-[9px] hover:underline text-emerald-500 hover:text-emerald-600 dark:text-emerald-400 font-bold"
                    >
                      Reset
                    </button>
                  </div>
                  <div className="space-y-2">
                    {PLATFORM_META.map((p) => {
                      const isChecked = selectedFilters.includes(p.id);
                      return (
                        <div 
                          key={p.id}
                          className="flex items-center justify-between p-1.5 rounded-lg hover:bg-muted cursor-pointer text-xs"
                          onClick={() => handleToggleFilter(p.id)}
                        >
                          <div className="flex items-center gap-2 text-foreground">
                            <p.icon className="h-4 w-4" style={{ color: p.color }} />
                            <span>{p.name}</span>
                          </div>
                          <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                            isChecked ? 'bg-emerald-500 border-emerald-500 text-zinc-950 font-bold' : 'border-border'
                          }`}>
                            {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          <Button 
            variant="outline" 
            className="rounded-full gap-2 text-xs font-semibold cursor-pointer border-border"
            onClick={handleExportDataSubmit}
            disabled={exporting}
          >
            <Download className={`h-3.5 w-3.5 ${exporting ? 'animate-bounce' : ''}`} />
            <span>{exporting ? 'Exporting...' : 'Export XLS'}</span>
          </Button>
        </div>
      </header>

      {/* Hero Metric Overview Card */}
      <Card className="p-8 overflow-hidden relative rounded-3xl border-emerald-500/15 bg-gradient-to-br from-emerald-500/[0.05] to-emerald-500/[0.01]">
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none mb-1">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartPlotData}>
              <Area type="monotone" dataKey="reach" stroke={activeMainColor} fill={activeMainColor} fillOpacity={0.15} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-muted-foreground mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Estimated Reach</span>
            <Badge className="bg-green-500/10 text-green-600 dark:text-green-500 border-green-500/20 font-bold">+18.4% above median</Badge>
          </div>
          <div className="text-6xl font-display font-extrabold mb-8 text-foreground/90">
            {calculatedMetrics.reach.toLocaleString()}
          </div>
          
          <div className="flex flex-wrap gap-12 border-t border-border/70 pt-8 mt-4">
            <div className="space-y-1">
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest block">Impressions</span>
              <div className="text-2xl font-bold text-foreground">{(calculatedMetrics.impressions).toLocaleString()}</div>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest block">Engagement</span>
              <div className="text-2xl font-bold text-foreground">{calculatedMetrics.engagement.toLocaleString()}</div>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest block">Avg. Watch Time</span>
              <div className="text-2xl font-bold text-foreground font-mono">{calculatedMetrics.watchTime}</div>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart Card */}
        <Card className="lg:col-span-2 p-8 rounded-3xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <h3 className="text-lg font-bold font-display">Time-Series Engagement Reach</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Aggregate user reach based on selected channels.</p>
            </div>
            <Tabs 
              value={activeTimeRange} 
              onValueChange={(val) => setActiveTimeRange(val as any)}
              className="w-auto shrink-0"
            >
              <TabsList className="rounded-full bg-muted border border-border p-1">
                <TabsTrigger value="24h" className="rounded-full text-xs py-1 px-3 text-muted-foreground data-[state=active]:text-foreground data-[state=active]:bg-background">24h</TabsTrigger>
                <TabsTrigger value="7d" className="rounded-full text-xs py-1 px-3 text-muted-foreground data-[state=active]:text-foreground data-[state=active]:bg-background">7d</TabsTrigger>
                <TabsTrigger value="30d" className="rounded-full text-xs py-1 px-3 text-muted-foreground data-[state=active]:text-foreground data-[state=active]:bg-background">30d</TabsTrigger>
                <TabsTrigger value="all" className="rounded-full text-xs py-1 px-3 text-muted-foreground data-[state=active]:text-foreground data-[state=active]:bg-background">All</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartPlotData}>
                <defs>
                  <linearGradient id="colorReach" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={activeMainColor} stopOpacity={0.25}/>
                    <stop offset="95%" stopColor={activeMainColor} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#888888', fontSize: 11 }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#888888', fontSize: 11 }}
                  tickFormatter={(value) => `${value}`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '14px', textAlign: 'left' }}
                  itemStyle={{ color: '#fff' }}
                  labelStyle={{ color: '#888', fontSize: '10px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="reach" 
                  stroke={activeMainColor} 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorReach)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Platform Breakdown Side Card */}
        <Card className="p-8 rounded-3xl">
          <h3 className="text-lg font-bold font-display mb-6">Channel Performance</h3>
          <div className="space-y-5">
            {PLATFORM_META.map((p) => {
              const isActive = selectedFilters.includes(p.id);
              const customVal = Math.round(p.baseReach * rangeMultiplier);
              const brand = PLATFORM_BRAND_STYLES[p.id];
              return (
                <div 
                  key={p.name} 
                  className={`flex items-center justify-between p-3 rounded-2xl transition-all cursor-pointer border ${
                    isActive 
                      ? brand 
                        ? `${brand.bgSoft} ${brand.borderSoft}`
                        : 'bg-muted/80 border-border'
                      : 'opacity-35 hover:opacity-75 border-transparent'
                  }`}
                  onClick={() => handleToggleFilter(p.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl bg-card border flex items-center justify-center shrink-0 ${
                      isActive && brand ? brand.borderSoft : 'border-border'
                    }`}>
                      <p.icon className="h-5 w-5" style={{ color: p.color }} />
                    </div>
                    <div className="text-left">
                      <h4 className={`font-bold text-sm ${isActive && brand ? brand.nameText : 'text-foreground'}`}>{p.name}</h4>
                      <p className={`text-xs mt-0.5 ${isActive && brand ? brand.statAccent : 'text-muted-foreground'}`}>{customVal.toLocaleString()} reach</p>
                    </div>
                  </div>
                  <div className={`flex items-center gap-1 text-xs font-bold font-mono ${p.baseGrowth.startsWith('+') ? 'text-green-600 dark:text-green-500' : 'text-red-500'}`}>
                    {p.baseGrowth.startsWith('+') ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                    {p.baseGrowth}
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-8 pt-6 border-t border-border">
            <Button 
              variant="outline" 
              className="w-full rounded-xl text-xs font-bold border-border hover:bg-muted hover:text-emerald-500 hover:border-emerald-500/20 cursor-pointer"
              onClick={() => {
                setShowDetailedRep(prev => !prev);
                showToast(showDetailedRep ? 'Collapsed detail log' : 'Populated full analytical audit overview', 'info');
              }}
            >
              {showDetailedRep ? 'Hide Detailed Overviews' : 'Generate Detailed Audit Report'}
            </Button>
          </div>
        </Card>
      </div>

      {/* Slide-out Detailed Report section */}
      <AnimatePresence>
        {showDetailedRep && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <Card className="p-8 rounded-3xl border border-emerald-500/15 bg-emerald-500/[0.02]">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0 mt-1">
                  <FileSpreadsheet className="h-6 w-6 text-emerald-500" />
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-lg font-bold text-foreground font-display">Global Content Audit • June 2026</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">Automated visual report card calculated from connected feeds.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                    <div className="p-4 rounded-2xl bg-card border border-border space-y-1">
                      <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block">Audience Saturation</span>
                      <div className="text-base font-bold text-foreground">High • Over-indexing design tags</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-card border border-border space-y-1">
                      <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block">Fatigue Index</span>
                      <div className="text-base font-bold text-foreground">Low (8% deviation risk)</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-card border border-border space-y-1">
                      <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block">Recommended Posts/wk</span>
                      <div className="text-base font-bold text-foreground">5 pieces (Optimal cadence)</div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider border shrink-0 ${className}`}>
      {children}
    </span>
  );
}
