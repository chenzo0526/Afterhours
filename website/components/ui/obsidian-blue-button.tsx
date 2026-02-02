'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface ObsidianBlueButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  children?: React.ReactNode;
}

/**
 * Obsidian Blue Primary CTA — Deep blue with 3D glass effect.
 * Style: Deep Blue (bg-[#0070f3]) with top inner-highlight (border-t border-white/20).
 * Hover: Glows slightly brighter, no color change.
 */
const ObsidianBlueButton = React.forwardRef<HTMLButtonElement, ObsidianBlueButtonProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'relative overflow-hidden bg-[#0070f3] border-t border-white/20',
          'px-6 py-3 rounded-xl text-white font-semibold',
          'transition-all duration-300',
          'hover:brightness-110 hover:shadow-[0_0_20px_rgba(0,112,243,0.4)]',
          'before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/10 before:to-transparent before:pointer-events-none',
          // Match LaserButton font and shape
          'text-base sm:text-lg',
          className
        )}
        {...props}
      >
        <span className="relative z-10">{children}</span>
      </button>
    );
  }
);

ObsidianBlueButton.displayName = 'ObsidianBlueButton';

export { ObsidianBlueButton };
