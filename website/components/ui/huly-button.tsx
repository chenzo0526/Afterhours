'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface HulyButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  className?: string;
  children?: React.ReactNode;
}

/**
 * HulyButton — Elite Huly-style CTA component.
 * Variant A (Primary): Hyper Blue with glowing shadow.
 * Variant B (Secondary): Obsidian Glass with subtle borders.
 * Both variants feature a subtle inner shine for 3D tactile feel.
 */
const HulyButton = React.forwardRef<HTMLButtonElement, HulyButtonProps>(
  ({ variant = 'secondary', className, children, ...props }, ref) => {
    const isPrimary = variant === 'primary';

    return (
      <button
        ref={ref}
        className={cn(
          // Base styles
          'rounded-full font-medium tracking-wide transition-all duration-300',
          'relative overflow-hidden',
          // Inner shine effect (3D tactile feel)
          'before:absolute before:inset-x-0 before:top-0 before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent before:pointer-events-none',
          
          // Variant A: Primary (Hyper Blue)
          isPrimary && [
            'bg-[#0070f3] text-white',
            'hover:bg-[#0080ff] hover:shadow-[0_0_30px_-5px_rgba(0,112,243,0.5)]',
            'active:bg-[#0060e0]',
          ],
          
          // Variant B: Secondary (Obsidian Glass)
          !isPrimary && [
            'bg-white/5 border border-white/10 text-white',
            'hover:bg-white/10 hover:border-white/20',
            'active:bg-white/15',
          ],
          
          className
        )}
        {...props}
      >
        <span className="relative z-10">{children}</span>
      </button>
    );
  }
);

HulyButton.displayName = 'HulyButton';

export { HulyButton };
