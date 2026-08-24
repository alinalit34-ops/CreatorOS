import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import StudioPlaque from '../brand/StudioPlaque';
import StudioCard from '../brand/StudioCard';
import { 
  DollarSign, 
  TrendingUp, 
  ArrowUpRight, 
  Youtube, 
  Instagram, 
  Twitter, 
  Music,
  ShoppingBag,
  Users,
  Briefcase,
  X,
  Check,
  Plus,
  ArrowRight,
  TrendingDown,
  ChevronRight,
  Sparkles
} from 'lucide-react';

const AMBER_PALETTE = ['#F59E0B', '#D97706', '#FBBF24', '#FCD34D', '#B45309'];

const PLATFORM_ICONS = {
  youtube: Youtube,
  instagram: Instagram,
  tiktok: Music,
  twitter: Twitter,
  gumroad: ShoppingBag,
  convertkit: Briefcase,
  spotify: Music,
};

const COLORS = ['#8B5CF6', '#EC4899', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#14B8A6'];

const PLATFORM_BRAND_COLORS: Record<string, { text: string; statAccent: string; bgSoft: string; borderSoft: string }> = {
  youtube: {
    text: 'text-red-500 dark:text-red-400',
    statAccent: 'text-red-650 dark:text-red-400 font-extrabold',
    bgSoft: 'bg-red-500/[0.04] dark:bg-red-500/[0.08]',
    borderSoft: 'border-red-500/20 dark:border-red-500/30 font-bold'
  },
  instagram: {
    text: 'text-pink-500 dark:text-pink-400',
    statAccent: 'text-pink-600 dark:text-pink-400 font-extrabold',
    bgSoft: 'bg-pink-500/[0.04] dark:bg-pink-500/[0.08]',
    borderSoft: 'border-pink-500/20 dark:border-pink-500/30 font-bold'
  },
  tiktok: {
    text: 'text-cyan-500 dark:text-cyan-400',
    statAccent: 'text-cyan-650 dark:text-cyan-400 font-extrabold',
    bgSoft: 'bg-cyan-500/[0.04] dark:bg-cyan-500/[0.08]',
    borderSoft: 'border-cyan-500/20 dark:border-cyan-500/30 font-bold'
  },
  twitter: {
    text: 'text-sky-500 dark:text-sky-400',
    statAccent: 'text-sky-600 dark:text-sky-400 font-extrabold',
    bgSoft: 'bg-sky-500/[0.04] dark:bg-sky-500/[0.08]',
    borderSoft: 'border-sky-500/20 dark:border-sky-500/30 font-bold'
  },
  gumroad: {
    text: 'text-emerald-500 dark:text-emerald-400',
    statAccent: 'text-emerald-600 dark:text-emerald-400 font-extrabold',
    bgSoft: 'bg-emerald-500/[0.04] dark:bg-emerald-500/[0.08]',
    borderSoft: 'border-emerald-500/20 dark:border-emerald-500/30 font-bold'
  },
  convertkit: {
    text: 'text-indigo-500 dark:text-indigo-400',
    statAccent: 'text-indigo-600 dark:text-indigo-400 font-extrabold',
    bgSoft: 'bg-indigo-500/[0.04] dark:bg-indigo-500/[0.08]',
    borderSoft: 'border-indigo-500/20 dark:border-indigo-500/30 font-bold'
  },
  spotify: {
    text: 'text-green-500 dark:text-green-400',
    statAccent: 'text-green-600 dark:text-green-400 font-extrabold',
    bgSoft: 'bg-green-500/[0.04] dark:bg-green-500/[0.08]',
    borderSoft: 'border-green-500/20 dark:border-green-500/30 font-bold'
  }
};

export default function MonetizationView({ showToast }: { showToast: (msg: string, type?: 'success' | 'info' | 'error') => void }) {
  // Localized state for dynamic income streams with localStorage persistence
  const [incomeStreams, setIncomeStreams] = useState<Array<{
    name: string;
    platform: string;
    type: string;
    amount: number;
    growth: string;
  }>>(() => {
    try {
      const saved = localStorage.getItem('creator_os_income_streams');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Dynamic sponsor pipeline with localStorage persistence
  const [pipeline, setPipeline] = useState<Array<{
    id: string;
    brand: string;
    status: string;
    value: number;
    date: string;
  }>>(() => {
    try {
      const saved = localStorage.getItem('creator_os_pipeline_deals');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Modal states
  const [isAddStreamOpen, setIsAddStreamOpen] = useState(false);
  const [isPipelineOpen, setIsPipelineOpen] = useState(false);

  // Add Stream inputs
  const [streamName, setStreamName] = useState('');
  const [streamPlatform, setStreamPlatform] = useState('youtube');
  const [streamType, setStreamType] = useState('Sponsorships');
  const [streamAmount, setStreamAmount] = useState('');

  // Add Deal inputs
  const [dealBrand, setDealBrand] = useState('');
  const [dealStatus, setDealStatus] = useState('Briefing');
  const [dealValue, setDealValue] = useState('');
  const [dealDate, setDealDate] = useState('');

  // Calculations
  const totalRevenue = useMemo(() => {
    return incomeStreams.reduce((acc, curr) => acc + curr.amount, 0);
  }, [incomeStreams]);

  const activeSponsorshipsSum = useMemo(() => {
    return pipeline.reduce((acc, curr) => acc + curr.value, 0);
  }, [pipeline]);

  const handleAddStreamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!streamName.trim() || !streamAmount) {
      showToast('Please fill out all income stream parameters', 'error');
      return;
    }

    const value = parseFloat(streamAmount);
    if (isNaN(value) || value <= 0) {
      showToast('Amount must be a positive number', 'error');
      return;
    }

    const nextStream = {
      name: streamName.trim(),
      platform: streamPlatform,
      type: streamType,
      amount: value,
      growth: '+0%'
    };

    setIncomeStreams(prev => {
      const updated = [...prev, nextStream];
      try {
        localStorage.setItem('creator_os_income_streams', JSON.stringify(updated));
      } catch (err) {
        console.error("Failed to save income streams", err);
      }
      return updated;
    });
    setIsAddStreamOpen(false);
    setStreamName('');
    setStreamAmount('');
    showToast(`Added income stream: ${nextStream.name} ($${value.toLocaleString()})!`);
  };

  const handleAddDealSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dealBrand.trim() || !dealValue) {
      showToast('Please input a brand name and compensation', 'error');
      return;
    }

    const value = parseFloat(dealValue);
    if (isNaN(value) || value <= 0) {
      showToast('Deal value must be a positive number', 'error');
      return;
    }

    const nextDeal = {
      id: Math.random().toString(),
      brand: dealBrand.trim(),
      status: dealStatus,
      value: value,
      date: dealDate || 'Aug 2026'
    };

    setPipeline(prev => {
      const updated = [...prev, nextDeal];
      try {
        localStorage.setItem('creator_os_pipeline_deals', JSON.stringify(updated));
      } catch (err) {
        console.error("Failed to save deals", err);
      }
      return updated;
    });
    setIsPipelineOpen(false);
    setDealBrand('');
    setDealValue('');
    setDealDate('');
    showToast(`Registered deal interest with ${nextDeal.brand}!`);
  };

  const promoteDealStatus = (id: string, current: string) => {
    const nextMap: Record<string, string> = {
      Briefing: 'Negotiating',
      Negotiating: 'Signed',
      Signed: 'Briefing'
    };
    const nextStatus = nextMap[current] || 'Briefing';
    setPipeline(prev => {
      const updated = prev.map(d => d.id === id ? { ...d, status: nextStatus } : d);
      try {
        localStorage.setItem('creator_os_pipeline_deals', JSON.stringify(updated));
      } catch (err) {
        console.error("Failed to update deals", err);
      }
      return updated;
    });
    showToast(`Updated deal to: ${nextStatus}`);
  };

  const handleRemoveDeal = (id: string, brand: string) => {
    setPipeline(prev => {
      const updated = prev.filter(d => d.id !== id);
      try {
        localStorage.setItem('creator_os_pipeline_deals', JSON.stringify(updated));
      } catch (err) {
        console.error("Failed to remove deal", err);
      }
      return updated;
    });
    showToast(`Removed sponsorship entry for ${brand}.`, 'info');
  };

  return (
    <div className="space-y-8 pb-12 select-none text-left font-sans">
      {/* Unified Studio Plaque Header */}
      <StudioPlaque
        nodeId="NODE: 02"
        category="CAPITAL & MONETIZATION"
        status="REVENUE ACTIVE"
        statusColor="amber"
        title="Monetization"
        subtitle="Multi-stream revenue tracking, deal pipeline valuation, and rate curves."
        action={
          <Button 
            onClick={() => setIsAddStreamOpen(true)} 
            className="rounded-xl gap-2 bg-amber-400 hover:bg-amber-300 text-zinc-950 font-mono font-bold px-4 h-9 text-xs cursor-pointer shadow-lg shadow-amber-500/10"
          >
            <Plus className="h-4 w-4 text-zinc-950 stroke-[3]" />
            <span>NEW REVENUE STREAM</span>
          </Button>
        }
      />
 
      {/* Revenue Hero */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <StudioCard
          cornerBrackets={true}
          watermark={true}
          className="lg:col-span-2 p-6 sm:p-8 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-card/60 border-amber-500/20 text-foreground relative overflow-hidden shadow-lg shadow-amber-500/5"
        >
          <div className="absolute top-0 right-0 w-full h-full opacity-30 pointer-events-none">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={incomeStreams}>
                <Bar dataKey="amount" fill="#F59E0B" fillOpacity={0.12} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-400">PROJECTED MONTHLY REVENUE</span>
              {totalRevenue > 0 ? (
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[9px] font-mono font-bold">+12.5% MTD</span>
              ) : (
                <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-500 border border-amber-500/30 text-[9px] font-mono font-bold">$0.00 LOGGED / NO ACTIVE STREAMS</span>
              )}
            </div>
            <div className="text-5xl sm:text-7xl font-display font-black tracking-tight mb-8 text-foreground">${totalRevenue.toLocaleString()}</div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-amber-500/20">
              <div className="space-y-1">
                <span className="text-[9px] uppercase font-mono font-bold tracking-wider block text-muted-foreground">Sponsorships</span>
                <div className="text-lg font-mono font-bold text-foreground">${incomeStreams.filter(s => s.type === 'Sponsorships').reduce((a,c)=>a+c.amount, 0).toLocaleString()}</div>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] uppercase font-mono font-bold tracking-wider block text-muted-foreground">Product Sales</span>
                <div className="text-lg font-mono font-bold text-foreground">${incomeStreams.filter(s => s.type === 'Product Sales').reduce((a,c)=>a+c.amount, 0).toLocaleString()}</div>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] uppercase font-mono font-bold tracking-wider block text-muted-foreground">Memberships</span>
                <div className="text-lg font-mono font-bold text-foreground">${incomeStreams.filter(s => s.type === 'Memberships').reduce((a,c)=>a+c.amount, 0).toLocaleString()}</div>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] uppercase font-mono font-bold tracking-wider block text-muted-foreground">Platform Ads</span>
                <div className="text-lg font-mono font-bold text-foreground">${incomeStreams.filter(s => s.type === 'Platform Ads').reduce((a,c)=>a+c.amount, 0).toLocaleString()}</div>
              </div>
            </div>
          </div>
        </StudioCard>

        {/* Breakdown Donut */}
        <StudioCard
          cornerBrackets={true}
          watermark={false}
          className="flex flex-col items-center justify-center text-center"
        >
          <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-muted-foreground mb-4 font-display">Revenue Allocation</h3>
          <div className="h-[170px] w-full flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={incomeStreams}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="amount"
                >
                  {incomeStreams.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={AMBER_PALETTE[index % AMBER_PALETTE.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '12px', fontFamily: 'monospace' }}
                  itemStyle={{ fontSize: 11, color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col justify-center">
              <span className="text-[9px] font-mono uppercase font-bold text-muted-foreground tracking-wider">Streams</span>
              <span className="text-lg font-mono font-bold text-foreground">{incomeStreams.length}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-2 mt-4 w-full pt-4 border-t border-border/50">
            {incomeStreams.map((source, i) => (
              <div key={source.name} className="flex items-center gap-2 text-xs text-left">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: AMBER_PALETTE[i % AMBER_PALETTE.length] }} />
                <span className="text-muted-foreground truncate text-[11px] font-mono">{source.name}</span>
              </div>
            ))}
          </div>
        </StudioCard>
      </div>
 
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income Streams Ledger */}
        <StudioCard
          cornerBrackets={true}
          watermark={false}
          title="Income Streams Ledger"
          headerAction={
            <span className="text-[10px] font-mono font-bold text-muted-foreground">{incomeStreams.length} ACTIVE STREAMS</span>
          }
        >
          {incomeStreams.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-border/80 rounded-2xl bg-muted/10 space-y-3">
              <DollarSign className="h-8 w-8 text-amber-500/60 mx-auto" />
              <div>
                <h4 className="text-xs font-mono font-bold text-foreground">No Income Streams Recorded</h4>
                <p className="text-[11px] text-muted-foreground mt-1 max-w-sm mx-auto font-sans">
                  Revenue is currently at $0.00. Add your digital products, AdSense payouts, or newsletter subscriptions to begin tracking earnings.
                </p>
              </div>
              <Button
                onClick={() => setIsAddStreamOpen(true)}
                size="sm"
                className="rounded-xl gap-1.5 text-xs font-mono font-bold bg-amber-400 hover:bg-amber-300 text-zinc-950 h-8 px-3 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>LOG INCOME STREAM</span>
              </Button>
            </div>
          ) : (
            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {incomeStreams.map((source) => {
                const Icon = PLATFORM_ICONS[source.platform as keyof typeof PLATFORM_ICONS] || Briefcase;
                return (
                  <div 
                    key={source.name} 
                    className="flex items-center justify-between p-3.5 rounded-xl bg-card border border-border/70 transition-all cursor-pointer group hover:border-amber-500/30"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-muted/40 border border-border/80 flex items-center justify-center shrink-0">
                        <Icon className="h-4 w-4 text-foreground" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-xs text-foreground group-hover:text-amber-400 transition-colors font-mono">{source.name}</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[9px] uppercase font-mono px-1.5 py-0.2 rounded bg-muted text-muted-foreground">{source.type}</span>
                          <span className="text-[9px] uppercase font-mono font-bold text-muted-foreground">{source.platform}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-xs text-foreground">${source.amount.toLocaleString()}</div>
                      <div className="text-[10px] text-emerald-400 flex items-center justify-end gap-1 font-bold font-mono">
                        <TrendingUp className="h-3 w-3" />
                        {source.growth}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </StudioCard>
 
        {/* Active Sponsorship Board */}
        <StudioCard
          cornerBrackets={true}
          watermark={true}
          className="flex flex-col justify-between"
          title="Brand Pipeline Board"
          headerAction={
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsPipelineOpen(true)}
              className="h-7 rounded-lg text-[10px] font-mono font-bold border-border/80 gap-1 px-2 text-foreground"
            >
              <Plus className="h-3 w-3" />
              <span>ADD DEAL</span>
            </Button>
          }
        >
          {pipeline.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-border/80 rounded-2xl bg-muted/10 space-y-3 my-auto">
              <Briefcase className="h-8 w-8 text-amber-500/60 mx-auto" />
              <div>
                <h4 className="text-xs font-mono font-bold text-foreground">Pipeline Empty ($0.00)</h4>
                <p className="text-[11px] text-muted-foreground mt-1 max-w-sm mx-auto font-sans">
                  No active sponsorship negotiations logged. Click 'Add Deal' to log incoming brand leads, quotes, and commitments.
                </p>
              </div>
              <Button
                onClick={() => setIsPipelineOpen(true)}
                size="sm"
                className="rounded-xl gap-1.5 text-xs font-mono font-bold bg-muted hover:bg-muted/80 text-foreground border border-border h-8 px-3 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>ADD BRAND DEAL</span>
              </Button>
            </div>
          ) : (
            <div>
              <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
                {pipeline.map((deal) => (
                  <div 
                    key={deal.brand} 
                    className="flex items-center justify-between p-3.5 rounded-xl bg-card border border-border/70 hover:border-amber-500/30 transition-all cursor-pointer group"
                    onClick={() => promoteDealStatus(deal.id, deal.status)}
                    title="Click to advance status"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center font-bold text-xs text-amber-400 shrink-0 font-display">
                        {deal.brand[0]}
                      </div>
                      <div className="text-left">
                        <h4 className="font-semibold text-xs text-foreground group-hover:text-amber-400 transition-colors font-mono">{deal.brand}</h4>
                        <p className="text-[10px] font-mono text-muted-foreground flex items-center gap-1.5 mt-0.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            deal.status === 'Signed' ? 'bg-emerald-400' : deal.status === 'Negotiating' ? 'bg-amber-400' : 'bg-blue-400'
                          }`} />
                          <span>{deal.status}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="font-mono font-bold text-xs text-foreground">${deal.value.toLocaleString()}</div>
                        <p className="text-[9px] font-mono text-muted-foreground mt-0.5">Expires {deal.date}</p>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveDeal(deal.id, deal.brand);
                        }}
                        className="p-1 rounded opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-400 transition-all shrink-0"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <Button 
            variant="outline" 
            className="w-full rounded-xl mt-4 border-border/80 hover:bg-muted font-mono font-bold text-xs cursor-pointer h-9 text-foreground"
            onClick={() => setIsPipelineOpen(!isPipelineOpen)}
          >
            {isPipelineOpen ? 'HIDE REGISTRATION PANEL' : 'REGISTER DEAL OFFER'}
          </Button>
        </StudioCard>
      </div>

      {/* Slideout Intake Pipeline Panel */}
      <AnimatePresence>
        {isPipelineOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mt-4"
          >
            <div className="p-6 rounded-2xl border border-border/80 bg-card text-left">
              <h4 className="text-sm font-bold text-foreground mb-4 font-display flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-400" />
                Register Sponsorship Pitch Offer
              </h4>
              <form onSubmit={handleAddDealSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                <div className="space-y-1">
                  <label className="text-[9px] font-mono font-bold text-muted-foreground uppercase block">Brand Name</label>
                  <input
                    type="text"
                    value={dealBrand}
                    onChange={(e) => setDealBrand(e.target.value)}
                    placeholder="e.g. Notion, Framer"
                    className="w-full bg-background border border-border/80 rounded-xl px-3 py-2 text-xs text-foreground outline-none focus:border-amber-400 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-mono font-bold text-muted-foreground uppercase block">Deal Value ($)</label>
                  <input
                    type="number"
                    value={dealValue}
                    onChange={(e) => setDealValue(e.target.value)}
                    placeholder="e.g. 2400"
                    className="w-full bg-background border border-border/80 rounded-xl px-3 py-2 text-xs text-foreground outline-none focus:border-amber-400 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-mono font-bold text-muted-foreground uppercase block">Status</label>
                  <select
                    value={dealStatus}
                    onChange={(e) => setDealStatus(e.target.value)}
                    className="w-full bg-background border border-border/80 rounded-xl px-2.5 py-2 text-xs text-foreground outline-none focus:border-amber-400 font-mono"
                  >
                    <option value="Briefing">Briefing Pitch</option>
                    <option value="Negotiating">Negotiating Terms</option>
                    <option value="Signed">Agreement Signed</option>
                  </select>
                </div>
                <Button type="submit" className="rounded-xl w-full text-xs font-mono font-bold h-9 bg-amber-400 hover:bg-amber-300 text-zinc-950 cursor-pointer">
                  REGISTER DEAL
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Stream Dialog Popups */}
      <AnimatePresence>
        {isAddStreamOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm" 
              onClick={() => setIsAddStreamOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-md bg-card border border-border/80 rounded-2xl p-6 z-10 text-left shadow-2xl"
            >
              <button 
                onClick={() => setIsAddStreamOpen(false)} 
                className="absolute top-5 right-5 p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                  <DollarSign className="h-4 w-4 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground font-display">New Revenue Stream</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Integrate transactional products, sponsor pay outs or ads.</p>
                </div>
              </div>

              <form onSubmit={handleAddStreamSubmit} className="space-y-3.5 font-mono text-xs">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block">Stream Name</label>
                  <input
                    type="text"
                    value={streamName}
                    onChange={(e) => setStreamName(e.target.value)}
                    placeholder="e.g. Masterclass Course Sales"
                    className="w-full bg-background border border-border/80 rounded-xl px-3 py-2 text-xs outline-none focus:border-amber-400 text-foreground"
                    autoFocus
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block">Channel Type</label>
                    <select
                      value={streamPlatform}
                      onChange={(e) => setStreamPlatform(e.target.value)}
                      className="w-full bg-background border border-border/80 rounded-xl px-2.5 py-2 text-xs outline-none text-foreground capitalize"
                    >
                      <option value="youtube">YouTube ads</option>
                      <option value="instagram">Instagram</option>
                      <option value="gumroad">Gumroad sales</option>
                      <option value="convertkit">ConvertKit membership</option>
                      <option value="twitter">X Threads</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block">Category</label>
                    <select
                      value={streamType}
                      onChange={(e) => setStreamType(e.target.value)}
                      className="w-full bg-background border border-border/80 rounded-xl px-2.5 py-2 text-xs outline-none text-foreground"
                    >
                      <option value="Platform Ads">Platform Ads</option>
                      <option value="Sponsorships">Sponsorships</option>
                      <option value="Product Sales">Product Sales</option>
                      <option value="Memberships">Memberships</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block">Estimated Amount ($)</label>
                  <input
                    type="number"
                    value={streamAmount}
                    onChange={(e) => setStreamAmount(e.target.value)}
                    placeholder="e.g. 1500"
                    className="w-full bg-background border border-border/80 rounded-xl px-3 py-2 text-xs outline-none focus:border-amber-400 text-foreground"
                  />
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-border/50 mt-5 justify-end">
                  <Button type="button" variant="ghost" className="rounded-xl px-3 text-xs font-mono font-semibold text-muted-foreground h-9" onClick={() => setIsAddStreamOpen(false)}>CANCEL</Button>
                  <Button type="submit" className="rounded-xl px-4 text-xs font-mono font-bold bg-amber-400 hover:bg-amber-300 text-zinc-950 h-9">ADD STREAM</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
