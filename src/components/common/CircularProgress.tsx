import React, { useId } from 'react';
import { motion } from 'motion/react';

export type CircularProgressColor = 'indigo' | 'emerald' | 'amber' | 'pink' | 'cyan' | 'purple' | 'blue';

interface CircularProgressProps {
  value: number; // current value
  target: number; // target value
  percentage?: number; // optional explicit percentage
  size?: number; // in pixels, default 130
  strokeWidth?: number; // in pixels, default 9
  color?: CircularProgressColor;
  showCenterPercentage?: boolean;
  centerSubtitle?: string;
  className?: string;
  animate?: boolean;
  glow?: boolean;
}

const COLOR_GRADIENTS: Record<CircularProgressColor, {
  start: string;
  end: string;
  track: string;
  glow: string;
  text: string;
}> = {
  indigo: {
    start: '#818cf8',
    end: '#6366f1',
    track: 'rgba(99, 102, 241, 0.12)',
    glow: 'rgba(99, 102, 241, 0.4)',
    text: 'text-indigo-400'
  },
  emerald: {
    start: '#34d399',
    end: '#10b981',
    track: 'rgba(16, 185, 129, 0.12)',
    glow: 'rgba(16, 185, 129, 0.4)',
    text: 'text-emerald-400'
  },
  amber: {
    start: '#fbbf24',
    end: '#f59e0b',
    track: 'rgba(245, 158, 11, 0.12)',
    glow: 'rgba(245, 158, 11, 0.4)',
    text: 'text-amber-400'
  },
  pink: {
    start: '#f472b6',
    end: '#ec4899',
    track: 'rgba(236, 72, 153, 0.12)',
    glow: 'rgba(236, 72, 153, 0.4)',
    text: 'text-pink-400'
  },
  cyan: {
    start: '#22d3ee',
    end: '#06b6d4',
    track: 'rgba(6, 182, 212, 0.12)',
    glow: 'rgba(6, 182, 212, 0.4)',
    text: 'text-cyan-400'
  },
  purple: {
    start: '#c084fc',
    end: '#a855f7',
    track: 'rgba(168, 85, 247, 0.12)',
    glow: 'rgba(168, 85, 247, 0.4)',
    text: 'text-purple-400'
  },
  blue: {
    start: '#60a5fa',
    end: '#3b82f6',
    track: 'rgba(59, 130, 246, 0.12)',
    glow: 'rgba(59, 130, 246, 0.4)',
    text: 'text-blue-400'
  }
};

export default function CircularProgress({
  value,
  target,
  percentage: explicitPercentage,
  size = 130,
  strokeWidth = 9,
  color = 'indigo',
  showCenterPercentage = true,
  centerSubtitle,
  className = '',
  animate = true,
  glow = true
}: CircularProgressProps) {
  const gradientId = useId();
  const filterId = useId();

  // Compute percentage (handle division by zero and cap or show over-target)
  const calculatedPercentage = target > 0 ? Math.round((value / target) * 100) : 0;
  const percentage = explicitPercentage !== undefined ? explicitPercentage : calculatedPercentage;
  
  // Progress clamping for SVG circumference arc (100% max for standard circle, or clamped to 100 visually while showing 120% in text)
  const clampedProgress = Math.min(Math.max(percentage, 0), 100);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clampedProgress / 100) * circumference;

  const theme = COLOR_GRADIENTS[color] || COLOR_GRADIENTS.indigo;
  const isGoalReached = percentage >= 100;

  return (
    <div 
      className={`relative flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
      role="progressbar"
      aria-valuenow={percentage}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90 origin-center"
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={theme.start} />
            <stop offset="100%" stopColor={theme.end} />
          </linearGradient>
          {glow && (
            <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow 
                dx="0" 
                dy="0" 
                stdDeviation={isGoalReached ? "4" : "2.5"} 
                floodColor={theme.glow} 
                floodOpacity={isGoalReached ? "0.8" : "0.5"}
              />
            </filter>
          )}
        </defs>

        {/* Background Track Ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/40 dark:text-border/60"
        />

        {/* Subtle decorative inner tick ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius - strokeWidth / 2 - 4}
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray="2 4"
          className="text-border/40 opacity-50"
        />

        {/* Animated Progress Ring */}
        {animate ? (
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            strokeLinecap="round"
            filter={glow ? `url(#${filterId})` : undefined}
          />
        ) : (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            filter={glow ? `url(#${filterId})` : undefined}
          />
        )}
      </svg>

      {/* Center Percentage & Info */}
      {showCenterPercentage && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
          <div className="flex items-baseline justify-center">
            <span className="font-display font-black text-xl sm:text-2xl tracking-tight text-foreground">
              {percentage}
            </span>
            <span className={`text-xs font-mono font-bold ml-0.5 ${theme.text}`}>%</span>
          </div>
          {centerSubtitle && (
            <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider font-semibold truncate max-w-[85%] mt-0.5">
              {centerSubtitle}
            </span>
          )}
          {isGoalReached && (
            <span className="inline-flex items-center gap-0.5 text-[8px] font-mono font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/15 px-1 py-0.2 rounded border border-emerald-500/30 mt-0.5">
              REACHED
            </span>
          )}
        </div>
      )}
    </div>
  );
}
