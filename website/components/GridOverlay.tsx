'use client';

import { useEffect, useRef } from 'react';

/**
 * Interactive Grid Overlay — Light-following effect (Huly-style).
 * Grid pattern is only visible near the user's mouse cursor using CSS mask.
 */
export default function GridOverlay() {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;

    const handleMouseMove = (e: MouseEvent) => {
      const x = e.clientX;
      const y = e.clientY;
      const radius = 200; // Size of the visible area around cursor

      // Create a radial gradient mask that reveals the grid near the cursor
      overlay.style.maskImage = `radial-gradient(circle ${radius}px at ${x}px ${y}px, white 0%, transparent 70%)`;
      overlay.style.webkitMaskImage = `radial-gradient(circle ${radius}px at ${x}px ${y}px, white 0%, transparent 70%)`;
    };

    // Initialize mask at center of viewport
    const initialX = window.innerWidth / 2;
    const initialY = window.innerHeight / 2;
    overlay.style.maskImage = `radial-gradient(circle 200px at ${initialX}px ${initialY}px, white 0%, transparent 70%)`;
    overlay.style.webkitMaskImage = `radial-gradient(circle 200px at ${initialX}px ${initialY}px, white 0%, transparent 70%)`;

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div
      ref={overlayRef}
      className="pointer-events-none fixed inset-0 z-0"
      aria-hidden
      style={{
        backgroundImage: `
          linear-gradient(to right, rgba(255,255,255,1) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(255,255,255,1) 1px, transparent 1px)
        `,
        backgroundSize: '4rem 4rem',
        opacity: 0.05,
      }}
    />
  );
}
