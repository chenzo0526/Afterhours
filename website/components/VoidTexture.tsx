'use client';

/**
 * Void Texture — Fixed background layer with dashed grid and vignette effect.
 * 40px x 40px dashed grid (border-white/[0.02]) that fades out at edges.
 */
export default function VoidTexture() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0"
      aria-hidden
      style={{
        backgroundImage: `
          repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(255, 255, 255, 0.02) 39px, rgba(255, 255, 255, 0.02) 40px),
          repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(255, 255, 255, 0.02) 39px, rgba(255, 255, 255, 0.02) 40px)
        `,
        backgroundSize: '40px 40px',
        maskImage: 'radial-gradient(circle at center, white, transparent 80%)',
        WebkitMaskImage: 'radial-gradient(circle at center, white, transparent 80%)',
      }}
    />
  );
}
