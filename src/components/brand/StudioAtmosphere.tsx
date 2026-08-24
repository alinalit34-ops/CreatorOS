import React from 'react';
import { motion } from 'motion/react';

interface StudioAtmosphereProps {
  currentScreen?: string;
}

const SCREEN_AMBIENT_COLORS: Record<string, { primary: string; secondary: string }> = {
  welcome: { primary: 'rgba(99, 102, 241, 0.12)', secondary: 'rgba(168, 85, 247, 0.08)' },
  onboarding: { primary: 'rgba(99, 102, 241, 0.12)', secondary: 'rgba(56, 189, 248, 0.08)' },
  dashboard: { primary: 'rgba(99, 102, 241, 0.08)', secondary: 'rgba(147, 51, 234, 0.05)' },
  calendar: { primary: 'rgba(59, 130, 246, 0.08)', secondary: 'rgba(14, 165, 233, 0.05)' },
  analytics: { primary: 'rgba(16, 185, 129, 0.08)', secondary: 'rgba(52, 211, 153, 0.04)' },
  monetization: { primary: 'rgba(245, 158, 11, 0.08)', secondary: 'rgba(251, 191, 36, 0.04)' },
  audience: { primary: 'rgba(236, 72, 153, 0.08)', secondary: 'rgba(244, 114, 182, 0.04)' },
  strategy: { primary: 'rgba(168, 85, 247, 0.10)', secondary: 'rgba(99, 102, 241, 0.06)' },
  ai: { primary: 'rgba(6, 182, 212, 0.09)', secondary: 'rgba(99, 102, 241, 0.06)' },
  settings: { primary: 'rgba(100, 116, 139, 0.06)', secondary: 'rgba(148, 163, 184, 0.04)' },
};

export default function StudioAtmosphere({ currentScreen = 'dashboard' }: StudioAtmosphereProps) {
  const activeColor = SCREEN_AMBIENT_COLORS[currentScreen] || SCREEN_AMBIENT_COLORS.dashboard;

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* Studio Dot Matrix Canvas Grid */}
      <div 
        className="absolute inset-0 opacity-[0.035] dark:opacity-[0.06]"
        style={{
          backgroundImage: `radial-gradient(currentColor 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />

      {/* Top Studio Beam Glow */}
      <motion.div 
        className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full blur-[140px] transition-colors duration-700"
        animate={{
          background: `radial-gradient(circle, ${activeColor.primary} 0%, transparent 70%)`
        }}
      />

      {/* Subtle Bottom Accent Glow */}
      <motion.div 
        className="absolute -bottom-[20%] right-[10%] w-[600px] h-[400px] rounded-full blur-[120px] transition-colors duration-700"
        animate={{
          background: `radial-gradient(circle, ${activeColor.secondary} 0%, transparent 70%)`
        }}
      />
    </div>
  );
}
