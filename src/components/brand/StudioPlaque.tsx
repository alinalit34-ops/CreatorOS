import React from 'react';

interface StudioPlaqueProps {
  nodeId?: string;
  category?: string;
  status?: string;
  statusColor?: 'emerald' | 'indigo' | 'amber' | 'pink' | 'cyan' | 'slate' | 'purple' | 'rose';
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

const STATUS_COLOR_MAP = {
  emerald: { bead: 'bg-emerald-400', glow: 'shadow-emerald-400/50', border: 'border-emerald-500/30', text: 'text-emerald-400' },
  indigo: { bead: 'bg-indigo-400', glow: 'shadow-indigo-400/50', border: 'border-indigo-500/30', text: 'text-indigo-400' },
  amber: { bead: 'bg-amber-400', glow: 'shadow-amber-400/50', border: 'border-amber-500/30', text: 'text-amber-400' },
  pink: { bead: 'bg-pink-400', glow: 'shadow-pink-400/50', border: 'border-pink-500/30', text: 'text-pink-400' },
  purple: { bead: 'bg-purple-400', glow: 'shadow-purple-400/50', border: 'border-purple-500/30', text: 'text-purple-400' },
  rose: { bead: 'bg-rose-400', glow: 'shadow-rose-400/50', border: 'border-rose-500/30', text: 'text-rose-400' },
  cyan: { bead: 'bg-cyan-400', glow: 'shadow-cyan-400/50', border: 'border-cyan-500/30', text: 'text-cyan-400' },
  slate: { bead: 'bg-slate-400', glow: 'shadow-slate-400/50', border: 'border-slate-500/30', text: 'text-slate-400' }
};

export default function StudioPlaque({
  nodeId,
  category,
  status,
  statusColor = 'emerald',
  title,
  subtitle,
  action,
  className = ''
}: StudioPlaqueProps) {
  const color = STATUS_COLOR_MAP[statusColor] || STATUS_COLOR_MAP.emerald;

  return (
    <header className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-border/50 select-none relative ${className}`}>
      <div>
        {/* Category Plaque Tag */}
        {(category || nodeId || status) && (
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-mono font-bold tracking-widest text-muted-foreground uppercase flex items-center gap-1.5">
              {nodeId && <span className="text-foreground/90 font-semibold">{nodeId}</span>}
              {nodeId && category && <span className="opacity-40">//</span>}
              {category && <span>{category}</span>}
              {status && (
                <>
                  <span className="opacity-40">//</span>
                  <span className={`px-1.5 py-0.2 rounded bg-muted/60 border ${color.border} ${color.text} text-[9px]`}>
                    {status}
                  </span>
                </>
              )}
            </span>
          </div>
        )}

        {/* Display Title */}
        <h1 className="text-3xl sm:text-4xl font-display font-black tracking-tight text-foreground">
          {title}
        </h1>

        {/* Subtitle / Description */}
        {subtitle && (
          <p className="text-muted-foreground text-xs sm:text-sm mt-1 max-w-2xl font-sans">
            {subtitle}
          </p>
        )}
      </div>

      {/* Action Slot */}
      {action && (
        <div className="flex items-center gap-2.5 shrink-0">
          {action}
        </div>
      )}
    </header>
  );
}
