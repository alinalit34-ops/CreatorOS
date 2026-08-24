import React from 'react';
import { Unplug, WifiOff, ArrowUpRight, ShieldAlert, Sparkles, Database } from 'lucide-react';
import { motion } from 'motion/react';

export type DataBoundFallbackType = 'connection-required' | 'no-data' | 'auto';
export type DataBoundVariant = 'metric' | 'inline' | 'card' | 'section';

export interface DataBoundProps<T = any> {
  /**
   * The data value or object to validate.
   * Can be a number, string, object, array, or null/undefined.
   */
  data?: T;

  /**
   * Explicit connection state flag. If false, forces 'connection-required' state.
   */
  isConnected?: boolean;

  /**
   * Custom validation function or boolean flag.
   */
  hasValidData?: boolean | ((val: T | undefined) => boolean);

  /**
   * Whether numerical 0, "0", "$0.00", "0.0%" should be treated as valid data (true) or empty/no-data (false).
   * Default: false (zero/empty yields the fallback state).
   */
  allowZero?: boolean;

  /**
   * Type of fallback state to present.
   * 'connection-required': When the platform API is unlinked.
   * 'no-data': When the platform is connected but has 0 records/events.
   * 'auto': Decides automatically based on isConnected and data value.
   * Default: 'auto'
   */
  fallbackType?: DataBoundFallbackType;

  /**
   * Visual layout format.
   * 'metric': Replaces the metric number inside a KPI card with an aligned, elegant badge.
   * 'inline': Compact text replacement.
   * 'card': Formats a container block (e.g., inside charts, tables, lists).
   * 'section': Full section placeholder with title, description, and action button.
   * Default: 'metric'
   */
  variant?: DataBoundVariant;

  /**
   * Optional platform name (e.g. 'YouTube', 'Instagram', 'Social Accounts') for dynamic copy.
   */
  platformName?: string;

  /**
   * Optional custom label or headline for the fallback state.
   */
  customMessage?: string;

  /**
   * Optional subtext or instructions.
   */
  customSubtext?: string;

  /**
   * Optional action button trigger (e.g., open Settings / Connect modal).
   */
  onConnectAction?: () => void;

  /**
   * Custom CSS class name.
   */
  className?: string;

  /**
   * The content to render when data is verified and present.
   * Can be a ReactNode or a render function receiving the verified data.
   */
  children?: React.ReactNode | ((data: NonNullable<T>) => React.ReactNode);
}

/**
 * Checks if a value is genuinely empty, zero, or null.
 */
export function isTelemetryEmpty(val: any, allowZero = false): boolean {
  if (val === null || val === undefined) return true;
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (trimmed === '' || trimmed === 'N/A' || trimmed === '--') return true;
    if (!allowZero) {
      if (
        trimmed === '0' ||
        trimmed === '0.0%' ||
        trimmed === '0%' ||
        trimmed === '$0.00' ||
        trimmed === '$0' ||
        trimmed === '0:00' ||
        trimmed.toLowerCase().includes('not connected')
      ) {
        return true;
      }
    }
    return false;
  }
  if (typeof val === 'number') {
    if (Number.isNaN(val)) return true;
    if (!allowZero && val === 0) return true;
    return false;
  }
  if (Array.isArray(val)) {
    return val.length === 0;
  }
  if (typeof val === 'object') {
    return Object.keys(val).length === 0;
  }
  return false;
}

/**
 * Centralized DataBound Wrapper Component
 * 
 * Enforces genuine platform telemetry. Prevents synthetic or fabricated metric numbers.
 * Displays clean, clear 'Connection Required' or 'No Data Available' states when data is missing.
 */
export default function DataBound<T = any>({
  data,
  isConnected = true,
  hasValidData,
  allowZero = false,
  fallbackType = 'auto',
  variant = 'metric',
  platformName,
  customMessage,
  customSubtext,
  onConnectAction,
  className = '',
  children
}: DataBoundProps<T>) {
  // Determine validity
  let isValid = true;

  if (typeof hasValidData === 'boolean') {
    isValid = hasValidData;
  } else if (typeof hasValidData === 'function') {
    isValid = hasValidData(data);
  } else {
    const isEmpty = isTelemetryEmpty(data, allowZero);
    isValid = isConnected && !isEmpty;
  }

  // If valid, render children directly
  if (isValid && isConnected) {
    if (typeof children === 'function') {
      return <>{children(data as NonNullable<T>)}</>;
    }
    return <>{children}</>;
  }

  // Determine fallback mode
  const resolvedType: 'connection-required' | 'no-data' =
    fallbackType !== 'auto'
      ? fallbackType
      : !isConnected
      ? 'connection-required'
      : 'no-data';

  const defaultTitle =
    resolvedType === 'connection-required'
      ? platformName
        ? `${platformName} Unlinked`
        : 'Connection Required'
      : 'No Activity Recorded';

  const defaultSubtext =
    resolvedType === 'connection-required'
      ? platformName
        ? `Connect your ${platformName} account in Settings to sync authentic metrics.`
        : 'Connect your accounts in Settings to stream verified platform data.'
      : 'Zero telemetry recorded. Metrics will populate automatically once platform activity occurs.';

  const title = customMessage || defaultTitle;
  const subtext = customSubtext || defaultSubtext;

  // 1. Metric Value Variant (Inside KPI cards, Stat items)
  if (variant === 'metric') {
    return (
      <div className={`flex flex-col items-start gap-1 select-none ${className}`}>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted/60 border border-border/80 text-muted-foreground">
          {resolvedType === 'connection-required' ? (
            <Unplug className="h-3.5 w-3.5 text-amber-500/80 shrink-0" />
          ) : (
            <WifiOff className="h-3.5 w-3.5 text-muted-foreground/80 shrink-0" />
          )}
          <span className="text-xs font-mono font-semibold tracking-tight text-foreground/80">
            {resolvedType === 'connection-required' ? 'Unlinked' : 'No Data'}
          </span>
        </div>
        <span className="text-[10px] font-mono text-muted-foreground/70 leading-tight">
          {resolvedType === 'connection-required'
            ? platformName ? `Requires ${platformName}` : 'Requires Sync'
            : '0 Events'}
        </span>
      </div>
    );
  }

  // 2. Inline Text / Pill Variant
  if (variant === 'inline') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-mono border ${
          resolvedType === 'connection-required'
            ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
            : 'bg-muted text-muted-foreground border-border'
        } ${className}`}
      >
        {resolvedType === 'connection-required' ? (
          <Unplug className="h-3 w-3 shrink-0" />
        ) : (
          <WifiOff className="h-3 w-3 shrink-0" />
        )}
        <span className="truncate">{title}</span>
      </span>
    );
  }

  // 3. Card Variant (Inside Chart blocks, Target cards, Sub-sections)
  if (variant === 'card') {
    return (
      <div
        className={`w-full py-8 px-5 rounded-2xl border border-dashed border-border/70 bg-card/40 flex flex-col items-center justify-center text-center select-none ${className}`}
      >
        <div
          className={`h-10 w-10 rounded-xl flex items-center justify-center mb-3 border ${
            resolvedType === 'connection-required'
              ? 'bg-amber-500/10 border-amber-500/20 text-amber-500'
              : 'bg-muted/70 border-border text-muted-foreground'
          }`}
        >
          {resolvedType === 'connection-required' ? (
            <Unplug className="h-5 w-5" />
          ) : (
            <Database className="h-5 w-5" />
          )}
        </div>
        <h4 className="text-sm font-display font-bold text-foreground mb-1">{title}</h4>
        <p className="text-xs text-muted-foreground max-w-sm leading-relaxed mb-4">{subtext}</p>
        {onConnectAction && (
          <button
            type="button"
            onClick={onConnectAction}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold text-primary bg-primary/10 hover:bg-primary/20 border border-primary/20 rounded-xl transition-all cursor-pointer"
          >
            <span>Configure Connection</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    );
  }

  // 4. Section Variant (Large view replacement)
  return (
    <div
      className={`w-full py-16 px-6 rounded-3xl border border-border/80 bg-card/60 flex flex-col items-center justify-center text-center select-none ${className}`}
    >
      <div
        className={`h-14 w-14 rounded-2xl flex items-center justify-center mb-4 border ${
          resolvedType === 'connection-required'
            ? 'bg-amber-500/10 border-amber-500/25 text-amber-500'
            : 'bg-muted border-border text-muted-foreground'
        }`}
      >
        {resolvedType === 'connection-required' ? (
          <Unplug className="h-7 w-7" />
        ) : (
          <WifiOff className="h-7 w-7" />
        )}
      </div>
      <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">
        {resolvedType === 'connection-required' ? 'Integration Required' : 'Zero Records'}
      </span>
      <h3 className="text-xl font-display font-black tracking-tight text-foreground mb-2">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground max-w-md leading-relaxed mb-6">
        {subtext}
      </p>
      {onConnectAction ? (
        <button
          type="button"
          onClick={onConnectAction}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-mono font-bold text-background bg-primary hover:bg-primary/90 rounded-xl transition-all shadow-md shadow-primary/10 cursor-pointer"
        >
          <span>Connect Social Platforms</span>
          <ArrowUpRight className="h-4 w-4" />
        </button>
      ) : (
        <div className="inline-flex items-center gap-1.5 text-xs font-mono text-muted-foreground/80 px-3 py-1 rounded-lg bg-muted border border-border">
          <ShieldAlert className="h-3.5 w-3.5 text-amber-500" />
          <span>Real Telemetry Guard Active</span>
        </div>
      )}
    </div>
  );
}
