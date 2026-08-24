import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Target, 
  Plus, 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  ChevronRight, 
  Edit3, 
  Zap, 
  ArrowUpRight,
  Flame,
  Layers,
  RotateCcw
} from 'lucide-react';
import { MonthlyGoal, GoalMetricType } from '@/src/types/index';
import StudioCard from '../brand/StudioCard';
import CircularProgress from '../common/CircularProgress';
import SetTargetModal from './SetTargetModal';
import { playStudioTap, playStudioSuccess } from '@/src/lib/soundEngine';
import { Button } from '@/components/ui/button';

interface MonthlyTargetsSectionProps {
  currentLiveMetrics?: {
    views: number;
    revenue: number;
    subscribers: number;
    posts: number;
    engagement: number;
  };
  onNavigate?: (screen: string) => void;
  showToast?: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

const STORAGE_KEY = 'creator_os_monthly_targets_v2';

export function getDefaultMonthlyGoals(liveMetrics?: {
  views: number;
  revenue: number;
  subscribers: number;
  posts: number;
  engagement: number;
}): MonthlyGoal[] {
  const views = liveMetrics?.views ?? 0;
  const revenue = liveMetrics?.revenue ?? 0;
  const subs = liveMetrics?.subscribers ?? 0;
  const posts = liveMetrics?.posts ?? 0;

  const isZeroState = views === 0 && subs === 0 && posts === 0;

  return [
    {
      id: 'default-views',
      metricType: 'views',
      title: 'Monthly Views Target',
      targetValue: isZeroState ? 10000 : Math.max(views * 1.25, 25000),
      currentValue: views,
      unit: 'views',
      suffix: ' views',
      month: 'August 2026',
      color: 'emerald',
      notes: isZeroState ? 'Focus on publishing your first 3 anchor videos to trigger algorithmic indexing' : 'Focus on high-converting typography short tutorials & AI workflow breakdowns',
      autoSync: true,
      createdAt: '2026-08-01T00:00:00Z'
    },
    {
      id: 'default-revenue',
      metricType: 'revenue',
      title: 'Creator Gross Revenue',
      targetValue: isZeroState ? 500 : Math.max(revenue * 1.3, 2000),
      currentValue: revenue,
      unit: '$',
      prefix: '$',
      month: 'August 2026',
      color: 'amber',
      notes: isZeroState ? 'Set up your first digital template on Gumroad or secure initial affiliate links' : 'Scale Notion templates & launch Q3 Creator OS Preset Bundle',
      autoSync: true,
      createdAt: '2026-08-01T00:00:00Z'
    },
    {
      id: 'default-subs',
      metricType: 'subscribers',
      title: 'New Subscriber Goal',
      targetValue: isZeroState ? 100 : Math.max(subs * 1.2, 500),
      currentValue: subs,
      unit: 'subs',
      prefix: '+',
      suffix: ' subs',
      month: 'August 2026',
      color: 'pink',
      notes: isZeroState ? 'Win your first 100 organic subscribers through consistent value delivery' : 'Community engagement pushes and YouTube Shorts algorithmic distribution',
      autoSync: true,
      createdAt: '2026-08-01T00:00:00Z'
    },
    {
      id: 'default-posts',
      metricType: 'posts',
      title: 'Content Output Velocity',
      targetValue: isZeroState ? 8 : Math.max(posts + 6, 12),
      currentValue: posts,
      unit: 'posts',
      suffix: ' posts',
      month: 'August 2026',
      color: 'indigo',
      notes: isZeroState ? 'Launch cadence: 2 foundational YouTube videos + 4 short-form clips' : 'Publishing schedule: 2 long-form YouTube videos + 4 cross-platform Shorts/week',
      autoSync: true,
      createdAt: '2026-08-01T00:00:00Z'
    }
  ];
}

export default function MonthlyTargetsSection({
  currentLiveMetrics,
  onNavigate,
  showToast
}: MonthlyTargetsSectionProps) {
  const [goals, setGoals] = useState<MonthlyGoal[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn("Could not load saved goals", e);
    }
    return getDefaultMonthlyGoals(currentLiveMetrics);
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<MonthlyGoal | null>(null);

  // Sync live metrics into autoSync goals when live metrics change
  useEffect(() => {
    if (!currentLiveMetrics) return;

    setGoals((prevGoals) => {
      let changed = false;
      const updated = prevGoals.map((g) => {
        if (!g.autoSync) return g;
        let nextVal = g.currentValue;
        if (g.metricType === 'views' && typeof currentLiveMetrics.views === 'number') nextVal = currentLiveMetrics.views;
        if (g.metricType === 'revenue' && typeof currentLiveMetrics.revenue === 'number') nextVal = currentLiveMetrics.revenue;
        if (g.metricType === 'subscribers' && typeof currentLiveMetrics.subscribers === 'number') nextVal = currentLiveMetrics.subscribers;
        if (g.metricType === 'posts' && typeof currentLiveMetrics.posts === 'number') nextVal = currentLiveMetrics.posts;
        if (g.metricType === 'engagement' && typeof currentLiveMetrics.engagement === 'number') nextVal = currentLiveMetrics.engagement;

        if (nextVal !== g.currentValue) {
          changed = true;
          return { ...g, currentValue: nextVal };
        }
        return g;
      });

      if (changed) {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch {}
        return updated;
      }
      return prevGoals;
    });
  }, [currentLiveMetrics]);

  // Persist goals whenever they change
  const saveGoals = (updated: MonthlyGoal[]) => {
    setGoals(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  };

  const handleOpenNewGoal = () => {
    playStudioTap();
    setEditingGoal(null);
    setIsModalOpen(true);
  };

  const handleOpenEditGoal = (goal: MonthlyGoal) => {
    playStudioTap();
    setEditingGoal(goal);
    setIsModalOpen(true);
  };

  const handleSaveGoal = (goal: MonthlyGoal) => {
    const existingIdx = goals.findIndex((g) => g.id === goal.id);
    let updated: MonthlyGoal[];
    if (existingIdx >= 0) {
      updated = [...goals];
      updated[existingIdx] = goal;
    } else {
      updated = [...goals, goal];
    }
    saveGoals(updated);
  };

  const handleDeleteGoal = (goalId: string) => {
    const updated = goals.filter((g) => g.id !== goalId);
    saveGoals(updated);
  };

  const handleResetDefaults = () => {
    playStudioTap();
    const defaults = getDefaultMonthlyGoals(currentLiveMetrics);
    saveGoals(defaults);
    showToast?.('Reset targets to default recommendations.', 'info');
  };

  // Composite calculation
  const compositeStats = useMemo(() => {
    if (goals.length === 0) return { avgPercentage: 0, completedCount: 0, total: 0 };
    const totalPercentage = goals.reduce((acc, g) => {
      const p = g.targetValue > 0 ? (g.currentValue / g.targetValue) * 100 : 0;
      return acc + p;
    }, 0);
    const avgPercentage = Math.round(totalPercentage / goals.length);
    const completedCount = goals.filter((g) => g.currentValue >= g.targetValue).length;
    return { avgPercentage, completedCount, total: goals.length };
  }, [goals]);

  // Days remaining in current month calculation (August: 31 days total, current ~ day 23 -> 8 days left)
  const daysInMonth = 31;
  const daysElapsed = 23;
  const daysRemaining = daysInMonth - daysElapsed;
  const expectedPacePercentage = Math.round((daysElapsed / daysInMonth) * 100); // ~74%

  const formatDisplay = (val: number, goal: MonthlyGoal) => {
    if (goal.metricType === 'views') {
      return val >= 1000000 ? `${(val / 1000000).toFixed(1)}M` : val >= 1000 ? `${(val / 1000).toFixed(0)}K` : val.toLocaleString();
    }
    if (goal.metricType === 'revenue') {
      return `$${val.toLocaleString()}`;
    }
    if (goal.metricType === 'subscribers') {
      return `+${val >= 1000 ? `${(val / 1000).toFixed(1)}K` : val.toLocaleString()}`;
    }
    if (goal.metricType === 'posts') {
      return `${val} posts`;
    }
    if (goal.metricType === 'engagement') {
      return `${val}%`;
    }
    return `${goal.prefix || ''}${val.toLocaleString()}${goal.suffix || ''}`;
  };

  const getPaceStatus = (goal: MonthlyGoal) => {
    const percentage = goal.targetValue > 0 ? Math.round((goal.currentValue / goal.targetValue) * 100) : 0;
    if (percentage >= 100) {
      return {
        label: 'Goal Achieved',
        color: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30',
        icon: CheckCircle2,
        desc: `Target reached (+${percentage - 100}% over)`
      };
    }
    if (percentage >= expectedPacePercentage) {
      return {
        label: 'Ahead of Pace',
        color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
        icon: TrendingUp,
        desc: `${percentage - expectedPacePercentage}% ahead of monthly timeline`
      };
    }
    if (percentage >= expectedPacePercentage - 15) {
      return {
        label: 'On Track',
        color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
        icon: Zap,
        desc: 'Pacing evenly with calendar progress'
      };
    }
    return {
      label: 'Needs Push',
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      icon: Flame,
      desc: 'Increase release velocity to hit target'
    };
  };

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/10 border border-indigo-500/30 flex items-center justify-center text-primary shadow-sm">
            <Target className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-bold text-base text-foreground">
                MONTHLY TARGETS & PROGRESS PACING
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-semibold">
                August 2026
              </span>
            </div>
            <p className="text-xs text-muted-foreground font-mono">
              Live circular tracking of monthly milestones ({compositeStats.completedCount}/{compositeStats.total} goals met • {compositeStats.avgPercentage}% composite pacing)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetDefaults}
            className="h-8 px-2.5 rounded-xl border-border/70 text-[11px] font-mono text-muted-foreground hover:text-foreground cursor-pointer gap-1.5"
            title="Reset to default targets"
          >
            <RotateCcw className="h-3 w-3" />
            <span className="hidden sm:inline">Reset</span>
          </Button>

          <Button
            size="sm"
            onClick={handleOpenNewGoal}
            className="h-8 px-3 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold font-mono tracking-wide uppercase gap-1.5 shadow-md shadow-primary/20 cursor-pointer transition-all duration-200 hover:scale-[1.02]"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Set Target</span>
          </Button>
        </div>
      </div>

      {/* Target Goals Grid with Circular Progress Bars */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {goals.map((goal, idx) => {
          const percentage = goal.targetValue > 0 ? Math.round((goal.currentValue / goal.targetValue) * 100) : 0;
          const remaining = Math.max(0, goal.targetValue - goal.currentValue);
          const dailyRequired = remaining > 0 ? Math.round(remaining / daysRemaining) : 0;
          const pace = getPaceStatus(goal);
          const PaceIcon = pace.icon;

          return (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05, duration: 0.25 }}
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
            >
              <StudioCard
                cornerBrackets={true}
                watermark={false}
                hoverable={true}
                hoverGradient={goal.color}
                onClick={() => handleOpenEditGoal(goal)}
                className="p-5 flex flex-col justify-between h-full group/goal cursor-pointer border-border/70 relative"
              >
                {/* Card Top Label & Edit Action */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-mono font-bold text-primary/70">
                        [TARGET-0{idx + 1}]
                      </span>
                      <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${pace.color} flex items-center gap-1`}>
                        <PaceIcon className="h-2.5 w-2.5" />
                        <span>{pace.label}</span>
                      </span>
                    </div>
                    <h4 className="text-xs font-mono font-bold text-foreground truncate mt-1 group-hover/goal:text-primary transition-colors">
                      {goal.title}
                    </h4>
                  </div>
                  <div className="p-1 rounded-lg text-muted-foreground opacity-0 group-hover/goal:opacity-100 hover:text-foreground hover:bg-muted/50 transition-all">
                    <Edit3 className="h-3.5 w-3.5" />
                  </div>
                </div>

                {/* Circular Progress Gauge in Center */}
                <div className="my-2 flex flex-col items-center justify-center">
                  <div className="relative group-hover/goal:scale-105 transition-transform duration-300">
                    <CircularProgress
                      value={goal.currentValue}
                      target={goal.targetValue}
                      size={120}
                      strokeWidth={9}
                      color={goal.color}
                      centerSubtitle={goal.unit}
                    />
                  </div>

                  {/* Formatted Target Counter Breakdown */}
                  <div className="mt-3 text-center">
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="font-display font-extrabold text-lg text-foreground">
                        {formatDisplay(goal.currentValue, goal)}
                      </span>
                      <span className="text-xs font-mono text-muted-foreground font-semibold">
                        / {formatDisplay(goal.targetValue, goal)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Pacing & Target Remaining Insight Footer */}
                <div className="mt-3 pt-2.5 border-t border-border/40 space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-muted-foreground">
                      {remaining > 0 ? (
                        <span>Remaining: <strong className="text-foreground">{formatDisplay(remaining, goal)}</strong></span>
                      ) : (
                        <span className="text-emerald-400 font-bold">Goal Complete (+{percentage - 100}%)</span>
                      )}
                    </span>
                    <span className="text-primary flex items-center gap-0.5 group-hover/goal:translate-x-0.5 transition-transform font-bold">
                      Edit <ChevronRight className="h-3 w-3" />
                    </span>
                  </div>

                  {remaining > 0 && dailyRequired > 0 && (
                    <div className="text-[9px] font-mono text-muted-foreground/80 flex items-center justify-between">
                      <span>Pace needed:</span>
                      <span className="text-primary font-bold">~{formatDisplay(dailyRequired, goal)}/day ({daysRemaining}d left)</span>
                    </div>
                  )}
                </div>
              </StudioCard>
            </motion.div>
          );
        })}

        {/* Quick Add Goal Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: goals.length * 0.05, duration: 0.25 }}
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
        >
          <button
            onClick={handleOpenNewGoal}
            className="w-full h-full min-h-[220px] p-5 rounded-2xl border-2 border-dashed border-border/70 hover:border-primary/50 bg-card/20 hover:bg-gradient-to-br hover:from-primary/10 hover:via-primary/5 hover:to-transparent flex flex-col items-center justify-center text-center gap-3 transition-all duration-300 group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-2xl bg-muted/40 border border-border/80 flex items-center justify-center text-muted-foreground group-hover:text-primary group-hover:border-primary/40 group-hover:scale-110 transition-all duration-300">
              <Plus className="h-6 w-6" />
            </div>
            <div>
              <div className="text-xs font-mono font-bold text-foreground group-hover:text-primary transition-colors">
                + ADD CUSTOM TARGET
              </div>
              <div className="text-[10px] font-mono text-muted-foreground max-w-[140px] mt-1">
                Track custom revenue milestones, views, or post targets
              </div>
            </div>
          </button>
        </motion.div>
      </div>

      {/* Target Modal for Adjusting or Creating Goals */}
      <SetTargetModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingGoal(null);
        }}
        onSave={handleSaveGoal}
        onDelete={handleDeleteGoal}
        initialGoal={editingGoal}
        currentLiveMetrics={currentLiveMetrics}
        showToast={showToast}
      />
    </div>
  );
}
