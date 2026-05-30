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
  // Localized state for dynamic income streams
  const [incomeStreams, setIncomeStreams] = useState([
    { name: 'AdSense Revenue', platform: 'youtube', type: 'Platform Ads', amount: 4500, growth: '+7%' },
    { name: 'Design Assets Sale', platform: 'gumroad', type: 'Product Sales', amount: 2800, growth: '+14%' },
    { name: 'Substack Pro Subscriptions', platform: 'convertkit', type: 'Memberships', amount: 2150, growth: '+3%' },
    { name: 'TechCo Sponsorship', platform: 'youtube', type: 'Sponsorships', amount: 3000, growth: '+0%' }
  ]);

  // Dynamic sponsor pipeline
  const [pipeline, setPipeline] = useState([
    { id: '1', brand: 'TechCo', status: 'Signed', value: 3000, date: 'Jun 15' },
    { id: '2', brand: 'Skillshare', status: 'Negotiating', value: 2500, date: 'Jun 28' },
    { id: '3', brand: 'NordVPN', status: 'Briefing', value: 1800, date: 'Jul 04' }
  ]);

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
      growth: '+10%'
    };

    setIncomeStreams(prev => [...prev, nextStream]);
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
      date: dealDate || 'Jul 15'
    };

    setPipeline(prev => [...prev, nextDeal]);
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
    setPipeline(prev => prev.map(d => d.id === id ? { ...d, status: nextStatus } : d));
    showToast(`Updated deal to: ${nextStatus}`);
  };

  const handleRemoveDeal = (id: string, brand: string) => {
    setPipeline(prev => prev.filter(d => d.id !== id));
    showToast(`Removed sponsorship entry for ${brand}.`, 'info');
  };

  return (
    <div className="space-y-8 pb-12 select-none text-left">
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold mb-2">Monetization</h1>
          <p className="text-muted-foreground text-sm">Track your dynamic income streams and brand pipeline value.</p>
        </div>
        <Button onClick={() => setIsAddStreamOpen(true)} className="rounded-full gap-2 bg-amber-500 hover:bg-amber-600 text-zinc-950 dark:text-zinc-950 font-bold px-5 h-10 text-sm cursor-pointer shadow-lg shadow-amber-500/10">
          <Plus className="h-4.5 w-4.5 text-zinc-950" />
          <span>Add Income Stream</span>
        </Button>
      </header>
 
      {/* Revenue Hero */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 p-8 bg-gradient-to-br from-amber-500/[0.04] to-amber-500/[0.01] border border-amber-500/15 text-foreground relative overflow-hidden rounded-3xl shadow-sm">
          <div className="absolute top-0 right-0 w-full h-full opacity-30 pointer-events-none">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={incomeStreams}>
                <Bar dataKey="amount" fill="#F59E0B" fillOpacity={0.12} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-bold uppercase tracking-widest text-amber-650 dark:text-amber-400">Gross Revenue (Monthly Estimate)</span>
              <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 font-bold">+12.5% vs MTD</Badge>
            </div>
            <div className="text-6xl sm:text-7xl font-display font-extrabold mb-8 text-foreground">${totalRevenue.toLocaleString()}</div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-4 border-t border-amber-500/20">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider block text-zinc-500 dark:text-zinc-400">Sponsorships</span>
                <div className="text-xl font-bold text-foreground">${incomeStreams.filter(s => s.type === 'Sponsorships').reduce((a,c)=>a+c.amount, 0).toLocaleString()}</div>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider block text-zinc-500 dark:text-zinc-400">Product Sales</span>
                <div className="text-xl font-bold text-foreground">${incomeStreams.filter(s => s.type === 'Product Sales').reduce((a,c)=>a+c.amount, 0).toLocaleString()}</div>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider block text-zinc-500 dark:text-zinc-400">Memberships</span>
                <div className="text-xl font-bold text-foreground">${incomeStreams.filter(s => s.type === 'Memberships').reduce((a,c)=>a+c.amount, 0).toLocaleString()}</div>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider block text-zinc-500 dark:text-zinc-400">Platform Ads</span>
                <div className="text-xl font-bold text-foreground">${incomeStreams.filter(s => s.type === 'Platform Ads').reduce((a,c)=>a+c.amount, 0).toLocaleString()}</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Breakdown Donut */}
        <Card className="p-8 flex flex-col items-center justify-center text-center rounded-3xl">
          <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400 mb-6 font-display">Revenue Allocation</h3>
          <div className="h-[180px] w-full flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={incomeStreams}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="amount"
                >
                  {incomeStreams.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={AMBER_PALETTE[index % AMBER_PALETTE.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '12px' }}
                  itemStyle={{ fontSize: 11, color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col justify-center">
              <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Streams</span>
              <span className="text-xl font-bold font-display text-foreground">{incomeStreams.length}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-6 w-full pt-4 border-t border-border">
            {incomeStreams.map((source, i) => (
              <div key={source.name} className="flex items-center gap-2 text-xs text-left">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: AMBER_PALETTE[i % AMBER_PALETTE.length] }} />
                <span className="text-zinc-400 truncate font-medium">{source.name}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
 
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Income Streams Ledger */}
        <Card className="p-8 rounded-3xl">
          <h3 className="text-xl font-bold mb-8 font-display">Income Streams Ledger</h3>
          <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
            {incomeStreams.map((source) => {
              const Icon = PLATFORM_ICONS[source.platform as keyof typeof PLATFORM_ICONS] || Briefcase;
              const brand = PLATFORM_BRAND_COLORS[source.platform as keyof typeof PLATFORM_BRAND_COLORS];
              return (
                <div 
                  key={source.name} 
                  className={`flex items-center justify-between p-4.5 rounded-2xl bg-muted/20 border transition-all cursor-pointer group hover:bg-muted/40 ${
                    brand ? brand.borderSoft : 'border-border/60'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border transition-colors ${
                      brand ? `${brand.bgSoft} ${brand.borderSoft}` : 'bg-card border-border'
                    }`}>
                      <Icon className={`h-5 w-5 ${brand ? brand.text : 'text-foreground'}`} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm group-hover:text-amber-500 transition-colors text-foreground">{source.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-[9px] uppercase font-mono py-0">{source.type}</Badge>
                        <span className={`text-[9px] uppercase font-mono font-bold ${brand ? brand.text : 'text-[#A1A1AA]'}`}>{source.platform}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold text-sm ${brand ? brand.text : 'text-foreground'}`}>${source.amount.toLocaleString()}</div>
                    <div className="text-[10px] text-green-500 flex items-center justify-end gap-1 font-bold font-mono">
                      <TrendingUp className="h-3 w-3" />
                      {source.growth}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
 
        {/* Active Sponsorship Board */}
        <Card className="p-8 rounded-3xl">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold font-display">Brand Sponsorship Board</h3>
            <span className="text-[10px] font-mono font-bold text-amber-500 dark:text-amber-400">PIPELINE: ${activeSponsorshipsSum.toLocaleString()}</span>
          </div>
          
          <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
            {pipeline.map((deal) => (
              <div 
                key={deal.brand} 
                className="flex items-center justify-between p-4.5 rounded-2xl bg-muted/20 border border-border/60 hover:bg-muted/40 transition-all cursor-pointer group"
                onClick={() => promoteDealStatus(deal.id, deal.status)}
                title="Click to advance status"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center font-bold text-sm text-amber-600 dark:text-amber-400 shrink-0 font-display">
                    {deal.brand[0]}
                  </div>
                  <div className="text-left">
                    <h4 className="font-bold text-sm text-foreground group-hover:text-amber-500 transition-colors">{deal.brand}</h4>
                    <p className="text-[10px] text-[#A1A1AA] flex items-center gap-1.5 mt-0.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        deal.status === 'Signed' ? 'bg-emerald-500' : deal.status === 'Negotiating' ? 'bg-amber-500' : 'bg-blue-400'
                      }`} />
                      <span>{deal.status} (Click to shift)</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="font-bold text-sm text-foreground">${deal.value.toLocaleString()}</div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Expires {deal.date}</p>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveDeal(deal.id, deal.brand);
                    }}
                    className="p-1 rounded opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-400 hover:bg-muted transition-all shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <Button 
            variant="outline" 
            className="w-full rounded-xl mt-6 border-border hover:bg-muted font-bold text-xs cursor-pointer h-11 hover:text-amber-500"
            onClick={() => setIsPipelineOpen(!isPipelineOpen)}
          >
            {isPipelineOpen ? 'Hide Negotiation Panel' : 'Manage Pipeline Intake'}
          </Button>
        </Card>
      </div>

      {/* Slideout Intake Pipeline Panel */}
      <AnimatePresence>
        {isPipelineOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mt-6"
          >
            <Card className="p-8 rounded-3xl border border-border bg-card text-left">
              <h4 className="text-base font-bold text-foreground mb-6 font-display flex items-center gap-2">
                <Sparkles className="h-4.5 w-4.5 text-amber-500" />
                Register Sponsorship Pitch Offer
              </h4>
              <form onSubmit={handleAddDealSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase block">Brand Name</label>
                  <input
                    type="text"
                    value={dealBrand}
                    onChange={(e) => setDealBrand(e.target.value)}
                    placeholder="e.g. Notion, Framer"
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground outline-none focus:border-amber-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase block">Deal Value ($)</label>
                  <input
                    type="number"
                    value={dealValue}
                    onChange={(e) => setDealValue(e.target.value)}
                    placeholder="e.g. 2400"
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground outline-none focus:border-amber-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase block">Status</label>
                  <select
                    value={dealStatus}
                    onChange={(e) => setDealStatus(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-2 py-2 text-xs text-foreground outline-none focus:border-amber-500"
                  >
                    <option value="Briefing">Briefing Pitch</option>
                    <option value="Negotiating">Negotiating Terms</option>
                    <option value="Signed">Agreement Signed</option>
                  </select>
                </div>
                <Button type="submit" className="rounded-xl w-full text-xs font-bold h-9 bg-amber-500 hover:bg-amber-600 text-zinc-950 cursor-pointer">
                  Register Interest
                </Button>
              </form>
            </Card>
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
              className="absolute inset-0 bg-black/60 backdrop-blur-md" 
              onClick={() => setIsAddStreamOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-md bg-card border border-border rounded-3xl p-8 z-10 text-left shadow-2xl"
            >
              <button 
                onClick={() => setIsAddStreamOpen(false)} 
                className="absolute top-6 right-6 p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground font-display">New Revenue Feed</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Integrate transactional products, sponsor pay outs or ads.</p>
                </div>
              </div>

              <form onSubmit={handleAddStreamSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Stream Name</label>
                  <input
                    type="text"
                    value={streamName}
                    onChange={(e) => setStreamName(e.target.value)}
                    placeholder="e.g. Masterclass PDF Sales"
                    className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-amber-500 text-foreground"
                    autoFocus
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Channel Type</label>
                    <select
                      value={streamPlatform}
                      onChange={(e) => setStreamPlatform(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm outline-none text-foreground capitalize"
                    >
                      <option value="youtube">YouTube ads</option>
                      <option value="instagram">Instagram</option>
                      <option value="gumroad">Gumroad sales</option>
                      <option value="convertkit">ConvertKit membership</option>
                      <option value="twitter">X Threads</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Category</label>
                    <select
                      value={streamType}
                      onChange={(e) => setStreamType(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm outline-none text-foreground"
                    >
                      <option value="Platform Ads">Platform Ads</option>
                      <option value="Sponsorships">Sponsorships</option>
                      <option value="Product Sales">Product Sales</option>
                      <option value="Memberships">Memberships</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Estimated Amount ($)</label>
                  <input
                    type="number"
                    value={streamAmount}
                    onChange={(e) => setStreamAmount(e.target.value)}
                    placeholder="e.g. 1500"
                    className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-amber-500 text-foreground"
                  />
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-border mt-6 justify-end">
                  <Button type="button" variant="ghost" className="rounded-xl px-4 text-xs font-semibold text-muted-foreground" onClick={() => setIsAddStreamOpen(false)}>Cancel</Button>
                  <Button type="submit" className="rounded-xl px-5 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-zinc-950">Add Stream</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
