'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface ShimmerButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  children?: React.ReactNode;
}

/**
 * Glass Shimmer Button — The ONLY button style used on homepage.
 * Dark glass background, thin white border, shimmer animation every 3 seconds.
 */
const ShimmerButton = React.forwardRef<HTMLButtonElement, ShimmerButtonProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'relative overflow-hidden bg-black/50 border border-white/10 text-white',
          'px-6 py-3 rounded-xl',
          'transition-all duration-300',
          'hover:scale-[1.02] hover:brightness-110',
          'before:absolute before:inset-0 before:bg-[linear-gradient(90deg,transparent,transparent,rgba(255,255,255,0.2),transparent,transparent)]',
          'before:bg-[length:200%_100%] before:bg-[position:-100%_0]',
          'before:animate-shimmer before:pointer-events-none',
          className
        )}
        {...props}
      >
        <span className="relative z-10">{children}</span>
      </button>
    );
  }
);

ShimmerButton.displayName = 'ShimmerButton';

export { ShimmerButton };
