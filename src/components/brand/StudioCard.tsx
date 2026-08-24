import React from 'react';

export type StudioCardColor = 'indigo' | 'emerald' | 'amber' | 'pink' | 'cyan' | 'purple' | 'slate' | 'default';

interface StudioCardProps {
  children: React.ReactNode;
  className?: string;
  badge?: string;
  badgeColor?: 'indigo' | 'emerald' | 'amber' | 'pink' | 'cyan' | 'slate' | 'purple';
  title?: React.ReactNode;
  subtitle?: string;
  headerAction?: React.ReactNode;
  cornerBrackets?: boolean;
  watermark?: boolean;
  onClick?: () => void;
  hoverable?: boolean;
  hoverGradient?: boolean | StudioCardColor;
}

const BADGE_COLOR_MAP: Record<string, string> = {
  indigo: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
  emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  pink: 'text-pink-400 bg-pink-500/10 border-pink-500/20',
  purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
  slate: 'text-slate-400 bg-slate-500/10 border-slate-500/20'
};

const GRADIENT_THEMES: Record<StudioCardColor, {
  hoverBg: string;
  hoverBorder: string;
  topShimmer: string;
  cornerGlow: string;
  shadowGlow: string;
}> = {
  default: {
    hoverBg: 'from-primary/[0.08] via-primary/[0.03] to-transparent',
    hoverBorder: 'hover:border-primary/40',
    topShimmer: 'via-primary/50',
    cornerGlow: 'group-hover/studio-card:border-primary/60',
    shadowGlow: 'hover:shadow-lg hover:shadow-primary/5'
  },
  indigo: {
    hoverBg: 'from-indigo-500/[0.12] via-indigo-500/[0.03] to-transparent',
    hoverBorder: 'hover:border-indigo-500/40',
    topShimmer: 'via-indigo-400/60',
    cornerGlow: 'group-hover/studio-card:border-indigo-400/70',
    shadowGlow: 'hover:shadow-lg hover:shadow-indigo-500/10'
  },
  emerald: {
    hoverBg: 'from-emerald-500/[0.12] via-emerald-500/[0.03] to-transparent',
    hoverBorder: 'hover:border-emerald-500/40',
    topShimmer: 'via-emerald-400/60',
    cornerGlow: 'group-hover/studio-card:border-emerald-400/70',
    shadowGlow: 'hover:shadow-lg hover:shadow-emerald-500/10'
  },
  amber: {
    hoverBg: 'from-amber-500/[0.12] via-amber-500/[0.03] to-transparent',
    hoverBorder: 'hover:border-amber-500/40',
    topShimmer: 'via-amber-400/60',
    cornerGlow: 'group-hover/studio-card:border-amber-400/70',
    shadowGlow: 'hover:shadow-lg hover:shadow-amber-500/10'
  },
  pink: {
    hoverBg: 'from-pink-500/[0.12] via-pink-500/[0.03] to-transparent',
    hoverBorder: 'hover:border-pink-500/40',
    topShimmer: 'via-pink-400/60',
    cornerGlow: 'group-hover/studio-card:border-pink-400/70',
    shadowGlow: 'hover:shadow-lg hover:shadow-pink-500/10'
  },
  purple: {
    hoverBg: 'from-purple-500/[0.12] via-purple-500/[0.03] to-transparent',
    hoverBorder: 'hover:border-purple-500/40',
    topShimmer: 'via-purple-400/60',
    cornerGlow: 'group-hover/studio-card:border-purple-400/70',
    shadowGlow: 'hover:shadow-lg hover:shadow-purple-500/10'
  },
  cyan: {
    hoverBg: 'from-cyan-500/[0.12] via-cyan-500/[0.03] to-transparent',
    hoverBorder: 'hover:border-cyan-500/40',
    topShimmer: 'via-cyan-400/60',
    cornerGlow: 'group-hover/studio-card:border-cyan-400/70',
    shadowGlow: 'hover:shadow-lg hover:shadow-cyan-500/10'
  },
  slate: {
    hoverBg: 'from-slate-500/[0.12] via-slate-500/[0.03] to-transparent',
    hoverBorder: 'hover:border-slate-500/40',
    topShimmer: 'via-slate-400/60',
    cornerGlow: 'group-hover/studio-card:border-slate-400/70',
    shadowGlow: 'hover:shadow-lg hover:shadow-slate-500/10'
  }
};

export default function StudioCard({
  children,
  className = '',
  badge,
  badgeColor = 'indigo',
  title,
  subtitle,
  headerAction,
  cornerBrackets = true,
  watermark = false,
  onClick,
  hoverable = false,
  hoverGradient = true
}: StudioCardProps) {
  const gradientColorKey: StudioCardColor = 
    typeof hoverGradient === 'string' 
      ? hoverGradient 
      : badgeColor && GRADIENT_THEMES[badgeColor as StudioCardColor] 
        ? (badgeColor as StudioCardColor) 
        : 'default';

  const theme = GRADIENT_THEMES[gradientColorKey] || GRADIENT_THEMES.default;
  const isHoverActive = hoverable || Boolean(hoverGradient);

  return (
    <div
      onClick={onClick}
      className={`group/studio-card relative bg-card/65 backdrop-blur-xl border border-border/80 rounded-2xl overflow-hidden transition-all duration-300 ${
        isHoverActive ? `hover:bg-card/85 ${theme.hoverBorder} ${theme.shadowGlow}` : ''
      } ${onClick || hoverable ? 'cursor-pointer' : ''} ${className}`}
    >
      {/* Animated Subtle Hover Gradient Wash */}
      {hoverGradient && (
        <div 
          className={`absolute inset-0 bg-gradient-to-br ${theme.hoverBg} opacity-0 group-hover/studio-card:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl`} 
        />
      )}

      {/* Animated Shimmer Line at Top Edge */}
      {hoverGradient && (
        <div 
          className={`absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent ${theme.topShimmer} to-transparent opacity-0 group-hover/studio-card:opacity-100 transition-all duration-400 pointer-events-none`} 
        />
      )}

      {/* Structural Corner Brackets */}
      {cornerBrackets && (
        <>
          <div className={`absolute top-1.5 left-1.5 w-1.5 h-1.5 border-t border-l border-primary/30 ${theme.cornerGlow} transition-colors duration-300 pointer-events-none`} />
          <div className={`absolute top-1.5 right-1.5 w-1.5 h-1.5 border-t border-r border-primary/30 ${theme.cornerGlow} transition-colors duration-300 pointer-events-none`} />
          <div className={`absolute bottom-1.5 left-1.5 w-1.5 h-1.5 border-b border-l border-primary/30 ${theme.cornerGlow} transition-colors duration-300 pointer-events-none`} />
          <div className={`absolute bottom-1.5 right-1.5 w-1.5 h-1.5 border-b border-r border-primary/30 ${theme.cornerGlow} transition-colors duration-300 pointer-events-none`} />
        </>
      )}

      {/* Geometric Prism Facet Watermark */}
      {watermark && (
        <div className="absolute -top-6 -right-6 w-24 h-24 opacity-[0.035] dark:opacity-[0.06] group-hover/studio-card:opacity-[0.08] dark:group-hover/studio-card:opacity-[0.11] transition-opacity duration-300 pointer-events-none select-none">
          <svg viewBox="0 0 36 36" fill="none" className="w-full h-full text-foreground">
            <path
              d="M18 3L31 10.5V25.5L18 33L5 25.5V10.5L18 3Z"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path
              d="M18 3L18 18M18 18L31 25.5M18 18L5 25.5"
              stroke="currentColor"
              strokeWidth="1.2"
            />
          </svg>
        </div>
      )}

      {/* Header if title or badge provided */}
      {(title || badge || headerAction) && (
        <div className="relative z-10 p-5 pb-3 flex items-start justify-between gap-4 border-b border-border/40">
          <div className="min-w-0">
            {badge && (
              <span className={`inline-flex items-center gap-1 text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border mb-2 ${BADGE_COLOR_MAP[badgeColor] || BADGE_COLOR_MAP.indigo}`}>
                <span className="w-1 h-1 rounded-full bg-current" />
                {badge}
              </span>
            )}
            {typeof title === 'string' ? (
              <h3 className="font-display font-bold text-base sm:text-lg text-foreground tracking-tight">
                {title}
              </h3>
            ) : (
              title
            )}
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-0.5 font-sans">
                {subtitle}
              </p>
            )}
          </div>
          {headerAction && (
            <div className="shrink-0 flex items-center gap-2">
              {headerAction}
            </div>
          )}
        </div>
      )}

      {/* Body content */}
      <div className={`relative z-10 ${title || badge || headerAction ? 'p-5 pt-4' : 'p-5'}`}>
        {children}
      </div>
    </div>
  );
}
