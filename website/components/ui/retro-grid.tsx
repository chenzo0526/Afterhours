'use client';

import { cn } from '@/lib/utils';

interface RetroGridProps {
  className?: string;
  angle?: number;
}

export function RetroGrid({ className, angle = -65 }: RetroGridProps) {
  return (
    <div
      className={cn(
        'pointer-events-none absolute h-full w-full overflow-hidden opacity-50 [perspective:200px]',
        className
      )}
      style={{ '--grid-angle': `${angle}deg` } as React.CSSProperties}
    >
      {/* Grid pattern */}
      <div className="absolute inset-0 [transform:rotateX(var(--grid-angle))]">
        <div
          className={cn(
            'animate-grid',
            '[background-image:linear-gradient(to_right,rgba(0,0,0,0.1)_1px,transparent_0),linear-gradient(to_bottom,rgba(0,0,0,0.1)_1px,transparent_0)]',
            '[background-size:4rem_4rem]',
            '[width:calc(100%+4rem)]',
            '[height:calc(100%+4rem)]',
            'absolute',
            '[background-position:0_0,0_0,50%_50%,50%_50%]',
            '[background-repeat:repeat]'
          )}
        />
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
    </div>
  );
}
