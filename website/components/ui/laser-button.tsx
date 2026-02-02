'use client';

import React, { useState, useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { cn } from '@/lib/utils';

interface LaserButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  children?: React.ReactNode;
}

/**
 * Laser-Reactive Button — Mouse-following spotlight effect.
 * Default: Deep Obsidian (bg-black, border-white/10).
 * On hover: Laser spotlight follows cursor inside button borders.
 */
const LaserButton = React.forwardRef<HTMLButtonElement, LaserButtonProps>(
  ({ className, children, ...props }, ref) => {
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [isHovered, setIsHovered] = useState(false);
    
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    
    const springConfig = { damping: 25, stiffness: 200 };
    const xSpring = useSpring(x, springConfig);
    const ySpring = useSpring(y, springConfig);

    const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!buttonRef.current) return;
      
      const rect = buttonRef.current.getBoundingClientRect();
      const localX = e.clientX - rect.left;
      const localY = e.clientY - rect.top;
      
      x.set(localX);
      y.set(localY);
    };

    const handleMouseLeave = () => {
      setIsHovered(false);
      if (!buttonRef.current) return;
      const rect = buttonRef.current.getBoundingClientRect();
      x.set(rect.width / 2);
      y.set(rect.height / 2);
    };

    return (
      <motion.button
        ref={(node) => {
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
          buttonRef.current = node;
        }}
        className={cn(
          'relative overflow-hidden bg-black border border-white/10 text-white',
          'px-6 py-3 rounded-xl',
          'transition-all duration-300',
          'hover:scale-[1.02] hover:brightness-110',
          className
        )}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        {/* Laser Spotlight - follows mouse */}
        {isHovered && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(circle 120px at ${xSpring}px ${ySpring}px, rgba(255, 255, 255, 0.15), transparent 70%)`,
            }}
          />
        )}
        <span className="relative z-10">{children}</span>
      </motion.button>
    );
  }
);

LaserButton.displayName = 'LaserButton';

export { LaserButton };
