'use client';

/**
 * StarfieldGrid — Fixed 40px dashed grid overlay at z-0.
 * Opacity 3% (0.03), covers entire screen.
 */
export default function StarfieldGrid() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0"
      aria-hidden
      style={{
        backgroundImage: `
          repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(255, 255, 255, 0.03) 39px, rgba(255, 255, 255, 0.03) 40px),
          repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(255, 255, 255, 0.03) 39px, rgba(255, 255, 255, 0.03) 40px)
        `,
        backgroundSize: '40px 40px',
      }}
    />
  );
}
