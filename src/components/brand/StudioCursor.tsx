import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';

export default function StudioCursor() {
  const [mousePosition, setMousePosition] = useState({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isClicking, setIsClicking] = useState(false);

  useEffect(() => {
    // Only activate for non-touch pointers
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);

      const target = e.target as HTMLElement | null;
      if (!target) return;

      const isInteractive = Boolean(
        target.closest('button') ||
        target.closest('a') ||
        target.closest('input') ||
        target.closest('select') ||
        target.closest('textarea') ||
        target.closest('[role="button"]') ||
        target.closest('.cursor-pointer') ||
        target.classList.contains('cursor-pointer')
      );

      setIsHovered(isInteractive);
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);
    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden select-none">
      {/* Precision Core Dot */}
      <motion.div
        className="fixed top-0 left-0 w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]"
        animate={{
          x: mousePosition.x - 3,
          y: mousePosition.y - 3,
          scale: isClicking ? 0.7 : isHovered ? 1.4 : 1,
        }}
        transition={{ type: 'spring', stiffness: 1200, damping: 50, mass: 0.1 }}
      />

      {/* Trailing Hexagonal / Studio Reticle Ring */}
      <motion.div
        className="fixed top-0 left-0 rounded-full border border-indigo-400/40 dark:border-indigo-400/50"
        animate={{
          x: mousePosition.x - (isHovered ? 16 : 10),
          y: mousePosition.y - (isHovered ? 16 : 10),
          width: isHovered ? 32 : 20,
          height: isHovered ? 32 : 20,
          borderColor: isHovered ? 'rgba(129, 140, 248, 0.7)' : 'rgba(99, 102, 241, 0.3)',
          backgroundColor: isHovered ? 'rgba(99, 102, 241, 0.08)' : 'transparent',
          scale: isClicking ? 0.85 : 1,
        }}
        transition={{ type: 'spring', stiffness: 350, damping: 28, mass: 0.4 }}
      >
        {/* Subtle reticle crosshair ticks when hovering interactive items */}
        {isHovered && (
          <>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-0.5 w-1 h-0.5 bg-indigo-400/80" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-0.5 w-1 h-0.5 bg-indigo-400/80" />
            <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-0.5 w-0.5 h-1 bg-indigo-400/80" />
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-0.5 w-0.5 h-1 bg-indigo-400/80" />
          </>
        )}
      </motion.div>
    </div>
  );
}
