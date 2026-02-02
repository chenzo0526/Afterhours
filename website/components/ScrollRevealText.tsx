'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * ScrollRevealText — Applies a mask-image gradient that reveals text based on scroll position.
 * Creates a "lit up" effect as the user scrolls down.
 */
export default function ScrollRevealText({
  children,
  className = '',
  startOffset = 0,
  endOffset = 0.5,
}: {
  children: React.ReactNode;
  className?: string;
  startOffset?: number;
  endOffset?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [maskProgress, setMaskProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!ref.current) return;

      const rect = ref.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const elementTop = rect.top;
      const elementHeight = rect.height;

      // Calculate when element enters viewport (element top reaches viewport bottom)
      const entryPoint = windowHeight;
      // Calculate when element should be fully revealed (element top reaches viewport top)
      const revealPoint = 0;

      // Current progress: 0 = element just entering, 1 = element at top of viewport
      const rawProgress = (entryPoint - elementTop) / (entryPoint - revealPoint + elementHeight);
      const clampedProgress = Math.max(0, Math.min(1, rawProgress));

      // Map to start/end offsets
      const revealRange = Math.max(0.1, endOffset - startOffset);
      const mappedProgress = Math.max(
        0,
        Math.min(1, (clampedProgress - startOffset) / revealRange)
      );

      setMaskProgress(mappedProgress);
    };

    // Use requestAnimationFrame for smooth updates
    let rafId: number;
    const onScroll = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(handleScroll);
    };

    // Initial calculation
    handleScroll();

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [startOffset, endOffset]);

  // Calculate mask gradient position based on scroll progress
  // The gradient moves from top to bottom, revealing text as it goes
  const maskPosition = `${Math.max(0, Math.min(100, maskProgress * 100))}%`;

  return (
    <div
      ref={ref}
      className={className}
      style={{
        WebkitMaskImage: `linear-gradient(to bottom, transparent 0%, transparent ${maskPosition}, black ${maskPosition}, black 100%)`,
        maskImage: `linear-gradient(to bottom, transparent 0%, transparent ${maskPosition}, black ${maskPosition}, black 100%)`,
        WebkitMaskSize: '100% 100%',
        maskSize: '100% 100%',
        WebkitMaskRepeat: 'no-repeat',
        maskRepeat: 'no-repeat',
      }}
    >
      {children}
    </div>
  );
}
