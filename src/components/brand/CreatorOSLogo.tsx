import React from 'react';
import { motion } from 'motion/react';

interface CreatorOSLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon' | 'mark';
  animated?: boolean;
  className?: string;
}

export default function CreatorOSLogo({
  size = 'md',
  variant = 'full',
  animated = true,
  className = ''
}: CreatorOSLogoProps) {
  // Dimensions mapping
  const sizeMap = {
    sm: { icon: 24, box: 'w-6 h-6', text: 'text-base', sub: 'text-[8px]', gap: 'gap-2' },
    md: { icon: 32, box: 'w-8 h-8', text: 'text-lg', sub: 'text-[9px]', gap: 'gap-2.5' },
    lg: { icon: 44, box: 'w-11 h-11', text: 'text-2xl', sub: 'text-[10px]', gap: 'gap-3' },
    xl: { icon: 64, box: 'w-16 h-16', text: 'text-4xl', sub: 'text-xs', gap: 'gap-4' }
  };

  const currentSize = sizeMap[size];

  const logoMark = (
    <motion.div
      className={`relative ${currentSize.box} rounded-xl shrink-0 flex items-center justify-center select-none ${className}`}
      whileHover={animated ? { scale: 1.06, rotate: 2 } : undefined}
      whileTap={animated ? { scale: 0.96 } : undefined}
    >
      {/* Background chromatic glow */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 opacity-80 blur-[6px] group-hover:opacity-100 transition-opacity" />
      
      {/* Outer structural shield */}
      <div className="relative w-full h-full rounded-xl bg-gradient-to-br from-zinc-900 via-indigo-950 to-zinc-950 p-[1px] border border-white/20 shadow-xl overflow-hidden flex items-center justify-center">
        {/* Subtle interior gradient reflection */}
        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600/30 via-transparent to-purple-400/20" />
        
        {/* Geometric Kinetic Studio Prism SVG */}
        <svg
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-[78%] h-[78%] relative z-10 drop-shadow-[0_2px_8px_rgba(99,102,241,0.5)]"
        >
          {/* Outer faceted aperture hexagon */}
          <path
            d="M18 3L31 10.5V25.5L18 33L5 25.5V10.5L18 3Z"
            stroke="url(#prism_stroke)"
            strokeWidth="1.75"
            strokeLinejoin="round"
          />

          {/* Isometric creative node facets */}
          <path
            d="M18 3L18 18M18 18L31 25.5M18 18L5 25.5"
            stroke="url(#prism_inner)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Central energetic studio spark */}
          <path
            d="M18 13.5L19.5 16.5L22.5 18L19.5 19.5L18 22.5L16.5 19.5L13.5 18L16.5 16.5L18 13.5Z"
            fill="url(#spark_fill)"
            className="animate-pulse"
          />

          {/* Orbiting distribution satellite nodes */}
          <circle cx="18" cy="3" r="1.75" fill="#818CF8" />
          <circle cx="31" cy="10.5" r="1.5" fill="#C084FC" />
          <circle cx="31" cy="25.5" r="1.5" fill="#F472B6" />
          <circle cx="18" cy="33" r="1.75" fill="#34D399" />
          <circle cx="5" cy="25.5" r="1.5" fill="#38BDF8" />
          <circle cx="5" cy="10.5" r="1.5" fill="#818CF8" />

          {/* Gradients */}
          <defs>
            <linearGradient id="prism_stroke" x1="5" y1="3" x2="31" y2="33" gradientUnits="userSpaceOnUse">
              <stop stopColor="#818CF8" />
              <stop offset="0.5" stopColor="#C084FC" />
              <stop offset="1" stopColor="#38BDF8" />
            </linearGradient>
            <linearGradient id="prism_inner" x1="18" y1="3" x2="18" y2="33" gradientUnits="userSpaceOnUse">
              <stop stopColor="#E0E7FF" stopOpacity="0.9" />
              <stop offset="1" stopColor="#A5B4FC" stopOpacity="0.4" />
            </linearGradient>
            <linearGradient id="spark_fill" x1="13.5" y1="13.5" x2="22.5" y2="22.5" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FFFFFF" />
              <stop offset="0.6" stopColor="#A5B4FC" />
              <stop offset="1" stopColor="#818CF8" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </motion.div>
  );

  if (variant === 'icon' || variant === 'mark') {
    return logoMark;
  }

  return (
    <div className={`flex items-center ${currentSize.gap} select-none group`}>
      {logoMark}
      <div className="flex flex-col text-left">
        <span className={`font-display font-black tracking-tight text-foreground ${currentSize.text} leading-none`}>
          CREATOR<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">OS</span>
        </span>
      </div>
    </div>
  );
}
