'use client';

import { useEffect, useRef } from 'react';

/**
 * Global providers — Lenis smooth scroll.
 * Foundation for the "Sebastian Martinez" fluid feel. Uses native window scroll
 * (no wrapper) so sticky sections stay stable; lerp + syncTouchLerp reduce jitter.
 */
export default function Providers({ children }: { children: React.ReactNode }) {
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    let lenis: import('@studio-freight/lenis').default | null = null;

    const init = async () => {
      const Lenis = (await import('@studio-freight/lenis')).default;
      lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        lerp: 0.08,
        smoothWheel: true,
        syncTouch: true,
        syncTouchLerp: 0.1,
        autoResize: true,
      });

      const raf = (time: number) => {
        lenis?.raf(time);
        rafRef.current = requestAnimationFrame(raf);
      };
      rafRef.current = requestAnimationFrame(raf);
    };

    init();

    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      lenis?.destroy();
    };
  }, []);

  return <>{children}</>;
}
