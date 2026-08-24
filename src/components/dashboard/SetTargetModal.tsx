import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Target, 
  Eye, 
  DollarSign, 
  Users, 
  Video, 
  Percent, 
  Sparkles, 
  Check, 
  TrendingUp, 
  Calendar, 
  Info,
  Trash2,
  RotateCcw
} from 'lucide-react';
import { MonthlyGoal, GoalMetricType } from '@/src/types/index';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { playStudioTap, playStudioSuccess } from '@/src/lib/soundEngine';
import CircularProgress from '../common/CircularProgress';

interface SetTargetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (goal: MonthlyGoal) => void;
  onDelete?: (id: string) => void;
  initialGoal?: MonthlyGoal | null;
  currentLiveMetrics?: {
    views: number;
    revenue: number;
    subscribers: number;
    posts: number;
    engagement: number;
  };
  showToast?: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

const METRIC_CONFIGS: Record<GoalMetricType, {
  label: string;
  defaultTitle: string;
  unit: string;
  prefix?: string;
  suffix?: string;
  icon: any;
  defaultColor: 'indigo' | 'emerald' | 'amber' | 'pink' | 'cyan' | 'purple';
  presets: number[];
  formatDisplay: (val: number) => string;
  step: number;
  min: number;
  max: number;
  description: string;
}> = {
  views: {
    label: 'Channel Views / Reach',
    defaultTitle: 'Monthly Views Target',
    unit: 'views',
    suffix: ' views',
    icon: Eye,
    defaultColor: 'emerald',
    presets: [250000, 500000, 1000000, 1500000, 2500000],
    formatDisplay: (v: number) => (v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v.toLocaleString()),
    step: 50000,
    min: 10000,
    max: 100000000,
    description: 'Target for unique impressions and video views this calendar month.'
  },
  revenue: {
    label: 'Gross Creator Revenue',
    defaultTitle: 'Monthly Revenue Goal',
    unit: '$',
    prefix: '$',
    icon: DollarSign,
    defaultColor: 'amber',
    presets: [3000, 5000, 10000, 15000, 25000],
    formatDisplay: (v: number) => `$${v.toLocaleString()}`,
    step: 500,
    min: 100,
    max: 1000000,
    description: 'Aggregate revenue from AdSense, sponsorships, courses, and digital products.'
  },
  subscribers: {
    label: 'New Subscribers / Followers',
    defaultTitle: 'Subscriber Growth Goal',
    unit: 'subs',
    prefix: '+',
    suffix: ' subs',
    icon: Users,
    defaultColor: 'pink',
    presets: [500, 1000, 2500, 5000, 10000],
    formatDisplay: (v: number) => `+${v >= 1000 ? `${(v / 1000).toFixed(1)}K` : v.toLocaleString()}`,
    step: 100,
    min: 50,
    max: 1000000,
    description: 'Net new audience members joining your community this month.'
  },
  posts: {
    label: 'Content Publishing Output',
    defaultTitle: 'Publishing Velocity',
    unit: 'posts',
    suffix: ' posts',
    icon: Video,
    defaultColor: 'indigo',
    presets: [8, 12, 16, 20, 30],
    formatDisplay: (v: number) => `${v} posts`,
    step: 1,
    min: 1,
    max: 120,
    description: 'Target number of scheduled or published multi-platform posts.'
  },
  engagement: {
    label: 'Target Engagement Rate',
    defaultTitle: 'Engagement Rate Goal',
    unit: '%',
    suffix: '%',
    icon: Percent,
    defaultColor: 'purple',
    presets: [3.5, 4.5, 6.0, 8.0, 10.0],
    formatDisplay: (v: number) => `${v}%`,
    step: 0.5,
    min: 0.5,
    max: 50,
    description: 'Target ratio of comments, shares, and interactions per view.'
  }
};

const COLOR_OPTIONS = [
  { id: 'emerald', label: 'Emerald Glow', bg: 'bg-emerald-500', ring: 'ring-emerald-400' },
  { id: 'amber', label: 'Amber Gold', bg: 'bg-amber-500', ring: 'ring-amber-400' },
  { id: 'indigo', label: 'Studio Indigo', bg: 'bg-indigo-500', ring: 'ring-indigo-400' },
  { id: 'pink', label: 'Neon Pink', bg: 'bg-pink-500', ring: 'ring-pink-400' },
  { id: 'cyan', label: 'Cyber Cyan', bg: 'bg-cyan-500', ring: 'ring-cyan-400' },
  { id: 'purple', label: 'Violet Purple', bg: 'bg-purple-500', ring: 'ring-purple-400' }
] as const;

export default function SetTargetModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialGoal,
  currentLiveMetrics,
  showToast
}: SetTargetModalProps) {
  const [metricType, setMetricType] = useState<GoalMetricType>('views');
  const [title, setTitle] = useState('');
  const [targetValue, setTargetValue] = useState<number>(1500000);
  const [currentValue, setCurrentValue] = useState<number>(1215000);
  const [month, setMonth] = useState('August 2026');
  const [color, setColor] = useState<'indigo' | 'emerald' | 'amber' | 'pink' | 'cyan' | 'purple'>('emerald');
  const [autoSync, setAutoSync] = useState(true);
  const [notes, setNotes] = useState('');

  // Synchronize state when initialGoal or modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialGoal) {
        setMetricType(initialGoal.metricType);
        setTitle(initialGoal.title);
        setTargetValue(initialGoal.targetValue);
        setCurrentValue(initialGoal.currentValue);
        setMonth(initialGoal.month || 'August 2026');
        setColor(initialGoal.color);
        setAutoSync(initialGoal.autoSync ?? true);
        setNotes(initialGoal.notes || '');
      } else {
        // Defaults for new goal
        const defaultType: GoalMetricType = 'views';
        const config = METRIC_CONFIGS[defaultType];
        setMetricType(defaultType);
        setTitle(config.defaultTitle);
        setTargetValue(1500000);
        const liveVal = currentLiveMetrics?.views ?? 1215000;
        setCurrentValue(liveVal);
        setMonth('August 2026');
        setColor(config.defaultColor);
        setAutoSync(true);
        setNotes('');
      }
    }
  }, [isOpen, initialGoal, currentLiveMetrics]);

  // Handle metric type switch
  const handleSelectMetricType = (type: GoalMetricType) => {
    playStudioTap();
    setMetricType(type);
    const config = METRIC_CONFIGS[type];
    
    // Suggest default title and color if user hasn't heavily customized
    if (!initialGoal || title === METRIC_CONFIGS[metricType].defaultTitle) {
      setTitle(config.defaultTitle);
      setColor(config.defaultColor);
    }
    
    // Choose appropriate default target
    if (!initialGoal) {
      if (type === 'views') {
        setTargetValue(1500000);
        setCurrentValue(currentLiveMetrics?.views ?? 1215000);
      } else if (type === 'revenue') {
        setTargetValue(15000);
        setCurrentValue(currentLiveMetrics?.revenue ?? 12450);
      } else if (type === 'subscribers') {
        setTargetValue(10000);
        setCurrentValue(currentLiveMetrics?.subscribers ?? 8420);
      } else if (type === 'posts') {
        setTargetValue(16);
        setCurrentValue(currentLiveMetrics?.posts ?? 12);
      } else if (type === 'engagement') {
        setTargetValue(6.0);
        setCurrentValue(currentLiveMetrics?.engagement ?? 4.8);
      }
    }
  };

  const handlePresetSelect = (preset: number) => {
    playStudioTap();
    setTargetValue(preset);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetValue || targetValue <= 0) {
      showToast?.('Please specify a positive target value', 'error');
      return;
    }

    const config = METRIC_CONFIGS[metricType];
    const goal: MonthlyGoal = {
      id: initialGoal ? initialGoal.id : `goal-${Date.now()}`,
      metricType,
      title: title.trim() || config.defaultTitle,
      targetValue: Number(targetValue),
      currentValue: Number(currentValue),
      unit: config.unit,
      prefix: config.prefix,
      suffix: config.suffix,
      month,
      color,
      notes: notes.trim(),
      autoSync,
      createdAt: initialGoal?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    playStudioSuccess();
    onSave(goal);
    showToast?.(`Target for "${goal.title}" saved successfully.`, 'success');
    onClose();
  };

  const handleDelete = () => {
    if (initialGoal && onDelete) {
      playStudioTap();
      onDelete(initialGoal.id);
      showToast?.(`Target removed.`, 'info');
      onClose();
    }
  };

  const config = METRIC_CONFIGS[metricType];
  const percentage = targetValue > 0 ? Math.round((currentValue / targetValue) * 100) : 0;
  const remaining = Math.max(0, targetValue - currentValue);
  
  // Calculate days left in month (for August 2026: 31 days total, current day ~ 23 = 8 days left)
  const daysRemaining = 8;
  const dailyNeeded = remaining > 0 ? Math.round(remaining / daysRemaining) : 0;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-2xl bg-card border border-border/80 rounded-2xl shadow-2xl shadow-black/40 overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border/60 bg-muted/20">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <Target className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-display font-bold text-foreground">
                  {initialGoal ? 'Adjust Monthly Target' : 'Set New Monthly Target'}
                </h2>
                <p className="text-xs text-muted-foreground font-mono">
                  Configure goals and track telemetry pacing against monthly milestones
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Body Form */}
          <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6 flex-1">
            
            {/* Metric Type Selector */}
            <div className="space-y-2">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">
                SELECT TARGET METRIC
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {(Object.keys(METRIC_CONFIGS) as GoalMetricType[]).map((type) => {
                  const item = METRIC_CONFIGS[type];
                  const Icon = item.icon;
                  const isSelected = metricType === type;
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => handleSelectMetricType(type)}
                      className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-primary/10 border-primary/50 text-foreground font-semibold shadow-sm'
                          : 'bg-muted/30 border-border/60 text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      }`}
                    >
                      <Icon className={`h-4 w-4 shrink-0 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                      <span className="text-xs truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Target Value Input with Speed-Dial Presets */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                  <span>MONTHLY TARGET VALUE</span>
                  <span className="text-[10px] text-primary lowercase">({config.unit})</span>
                </label>
                <div className="relative">
                  {config.prefix && (
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground font-mono font-bold text-sm">
                      {config.prefix}
                    </span>
                  )}
                  <Input
                    type="number"
                    value={targetValue || ''}
                    onChange={(e) => setTargetValue(Number(e.target.value))}
                    step={config.step}
                    min={config.min}
                    max={config.max}
                    className={`font-mono text-base font-bold bg-muted/20 border-border/70 rounded-xl h-11 ${config.prefix ? 'pl-8' : ''}`}
                    placeholder="Enter target amount"
                    required
                  />
                  {config.suffix && (
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground font-mono text-xs">
                      {config.suffix}
                    </span>
                  )}
                </div>

                {/* Speed Dial Presets */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {config.presets.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handlePresetSelect(preset)}
                      className={`text-[10px] font-mono px-2 py-1 rounded-lg border transition-all cursor-pointer ${
                        targetValue === preset
                          ? 'bg-primary text-primary-foreground border-primary font-bold shadow-xs'
                          : 'bg-muted/30 border-border/50 text-muted-foreground hover:text-foreground hover:bg-muted/60'
                      }`}
                    >
                      {config.formatDisplay(preset)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Current Progress / Live Value */}
              <div className="space-y-2">
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                  <span>CURRENT ACHIEVED VALUE</span>
                  <span className="text-[10px] text-emerald-400">Live Telemetry</span>
                </label>
                <div className="relative">
                  {config.prefix && (
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground font-mono font-bold text-sm">
                      {config.prefix}
                    </span>
                  )}
                  <Input
                    type="number"
                    value={currentValue || ''}
                    onChange={(e) => setCurrentValue(Number(e.target.value))}
                    className={`font-mono text-base font-bold bg-muted/20 border-border/70 rounded-xl h-11 ${config.prefix ? 'pl-8' : ''}`}
                    placeholder="Current progress"
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground pt-1">
                  <span>Month: <strong className="text-foreground">{month}</strong></span>
                  <span className="text-emerald-400">
                    {percentage >= 100 ? 'Target Achieved 🎉' : `${percentage}% Completed`}
                  </span>
                </div>
              </div>
            </div>

            {/* Live Interactive Visualization Preview Banner with Circular Progress */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-card/80 via-muted/20 to-card border border-border/80 flex flex-col sm:flex-row items-center justify-between gap-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-center gap-4">
                <CircularProgress
                  value={currentValue}
                  target={targetValue}
                  size={105}
                  strokeWidth={8}
                  color={color}
                  centerSubtitle={config.unit}
                />

                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-primary uppercase">
                      LIVE PREVIEW
                    </span>
                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                      percentage >= 100 ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : 'bg-primary/10 text-primary'
                    }`}>
                      {percentage >= 100 ? 'AHEAD OF GOAL' : 'IN PROGRESS'}
                    </span>
                  </div>
                  <div className="text-sm font-bold text-foreground">
                    {config.formatDisplay(currentValue)} of {config.formatDisplay(targetValue)}
                  </div>
                  <div className="text-xs text-muted-foreground font-mono">
                    {remaining > 0 ? (
                      <span>Gap: <strong>{config.formatDisplay(remaining)}</strong> remaining ({daysRemaining} days left)</span>
                    ) : (
                      <span className="text-emerald-400 font-bold">Milestone exceeded by {config.formatDisplay(currentValue - targetValue)}!</span>
                    )}
                  </div>
                  {remaining > 0 && dailyNeeded > 0 && (
                    <div className="text-[11px] font-mono text-primary/80">
                      Run-rate needed: ~{config.formatDisplay(dailyNeeded)}/day
                    </div>
                  )}
                </div>
              </div>

              {/* Color Selector */}
              <div className="flex flex-col items-center sm:items-end gap-1.5">
                <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase">
                  ACCENT COLOR
                </span>
                <div className="flex items-center gap-1.5">
                  {COLOR_OPTIONS.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        playStudioTap();
                        setColor(c.id);
                      }}
                      className={`w-6 h-6 rounded-full ${c.bg} transition-all cursor-pointer flex items-center justify-center ${
                        color === c.id ? `ring-2 ring-offset-2 ring-offset-card ${c.ring} scale-110` : 'opacity-60 hover:opacity-100'
                      }`}
                      title={c.label}
                    >
                      {color === c.id && <Check className="h-3 w-3 text-white stroke-[3]" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Target Title & Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">
                  TARGET LABEL / TITLE
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={config.defaultTitle}
                  className="bg-muted/20 border-border/70 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">
                  TARGET MONTH
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    className="pl-9 bg-muted/20 border-border/70 rounded-xl font-mono text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Strategic Notes / Execution Tactic */}
            <div className="space-y-2">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                <span>EXECUTION STRATEGY / FOCUS NOTES</span>
                <span className="text-[10px] text-muted-foreground font-mono">Optional</span>
              </label>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g., Publish 3 Shorts/week & release new Digital Preset Pack"
                className="bg-muted/20 border-border/70 rounded-xl text-xs"
              />
            </div>
          </form>

          {/* Footer Actions */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-border/60 bg-muted/20">
            {initialGoal && onDelete ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10 gap-1.5 font-mono text-xs cursor-pointer rounded-xl"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete Target</span>
              </Button>
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <span>Calculated with active channel velocity</span>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="rounded-xl text-xs cursor-pointer font-mono"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSubmit}
                className="rounded-xl text-xs font-bold uppercase tracking-wider bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 shadow-lg shadow-primary/20 cursor-pointer"
              >
                <Check className="h-4 w-4" />
                <span>Save Target</span>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
