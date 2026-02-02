'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

export default function BackgroundBeams() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [beams, setBeams] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);

  useEffect(() => {
    // Generate random beam positions
    const generateBeams = () => {
      const newBeams = Array.from({ length: 12 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 2,
      }));
      setBeams(newBeams);
    };

    generateBeams();
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative h-24 w-full overflow-hidden border-t border-border/50 bg-background"
      aria-hidden="true"
    >
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
      
      {/* Beams */}
      {beams.map((beam) => (
        <motion.div
          key={beam.id}
          className="absolute h-full w-px bg-gradient-to-b from-transparent via-primary/20 to-transparent"
          style={{
            left: `${beam.x}%`,
            top: `${beam.y}%`,
          }}
          initial={{ opacity: 0, scaleY: 0 }}
          animate={{
            opacity: [0, 0.5, 0.3, 0.5, 0],
            scaleY: [0, 1, 1.2, 1, 0],
          }}
          transition={{
            duration: 3,
            delay: beam.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(to right, currentColor 1px, transparent 1px),
            linear-gradient(to bottom, currentColor 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />
    </div>
  );
}
