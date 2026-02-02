'use client';

import { useScroll, useTransform, motion, MotionValue } from 'framer-motion';
import { useRef, useState } from 'react';
import { HulyButton } from '@/components/ui/huly-button';
import Link from 'next/link';
import { Wrench, Flame, Droplets } from 'lucide-react';

// Voice Waveform Component
function VoiceWaveform({ scale, opacity }: { scale: MotionValue<number>; opacity: MotionValue<number> }) {
  // Use seeded random for consistent bar heights
  const bars = Array.from({ length: 40 }, (_, i) => {
    const seed = i * 0.1;
    const height = (Math.sin(seed) * 0.5 + 0.5) * 80 + 20; // 20-100%
    const delay = (Math.sin(seed * 2) * 0.5 + 0.5) * 0.5;
    const duration = 0.8 + (Math.sin(seed * 3) * 0.5 + 0.5) * 0.4;
    return { id: i, height, delay, duration };
  });
  
  return (
    <motion.div 
      className="absolute inset-0 flex items-center justify-center"
      style={{ opacity, scale }}
    >
      <div className="flex items-end justify-center gap-1 h-64 w-full max-w-2xl px-8">
        {bars.map((bar) => (
          <motion.div
            key={bar.id}
            className="bg-gradient-to-t from-primary via-primary/80 to-primary/40 rounded-full w-2"
            style={{
              height: `${bar.height}%`,
            }}
            animate={{
              height: [`${bar.height}%`, `${bar.height * 1.5}%`, `${bar.height}%`],
            }}
            transition={{
              duration: bar.duration,
              repeat: Infinity,
              delay: bar.delay,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}

// 3D Glassmorphic Phone Frame Component
function GlassmorphicPhone({ scale, opacity, rotateY }: { scale: MotionValue<number>; opacity: MotionValue<number>; rotateY: MotionValue<number> }) {
  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center"
      style={{ 
        opacity,
        scale,
        rotateY,
      }}
    >
      <div className="relative w-80 h-[600px] perspective-1000">
        {/* Phone Frame */}
        <div className="absolute inset-0 rounded-[3rem] border-4 border-white/20 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl shadow-2xl preserve-3d">
          {/* Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-background rounded-b-2xl" />
          
          {/* Screen Content */}
          <div className="absolute inset-4 rounded-[2.5rem] bg-gradient-to-br from-primary/20 via-primary/10 to-transparent overflow-hidden">
            {/* Call Interface Simulation */}
            <div className="p-8 h-full flex flex-col items-center justify-center space-y-6">
              <div className="w-24 h-24 rounded-full bg-primary/30 border-4 border-primary/50 flex items-center justify-center">
                <svg className="w-12 h-12 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div className="text-center space-y-2">
                <div className="text-lg font-semibold text-foreground">Afterhours</div>
                <div className="text-sm text-muted-foreground">Answering in &lt;1 second</div>
              </div>
              
              {/* Animated Waveform */}
              <div className="w-full px-4">
                <div className="flex items-end justify-center gap-1 h-16">
                  {Array.from({ length: 20 }, (_, i) => {
                    const seed = i * 0.15;
                    const height = (Math.sin(seed) * 0.5 + 0.5) * 60 + 20; // 20-80%
                    const delay = (Math.sin(seed * 2) * 0.5 + 0.5) * 0.5;
                    const duration = 0.8 + (Math.sin(seed * 3) * 0.5 + 0.5) * 0.4;
                    return { id: i, height, delay, duration };
                  }).map((bar) => (
                    <motion.div
                      key={bar.id}
                      className="bg-primary/60 rounded-full w-1"
                      style={{ height: `${bar.height}%` }}
                      animate={{
                        height: [`${bar.height}%`, `${bar.height * 1.8}%`, `${bar.height}%`],
                      }}
                      transition={{
                        duration: bar.duration,
                        repeat: Infinity,
                        delay: bar.delay,
                        ease: 'easeInOut',
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Glass Reflection Effect */}
        <div className="absolute inset-0 rounded-[3rem] bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none" />
      </div>
    </motion.div>
  );
}

// Trust Icons: Plumbing, HVAC, Restoration
function TrustIcons() {
  const icons = [
    { Icon: Wrench, label: 'Plumbing' },
    { Icon: Flame, label: 'HVAC' },
    { Icon: Droplets, label: 'Restoration' },
  ];

  return (
    <div className="flex items-center justify-center gap-12 py-10 border-t border-border/50 bg-[#09090B]">
      {icons.map(({ Icon, label }) => (
        <div
          key={label}
          className="flex flex-col items-center gap-2 text-muted-foreground"
        >
          <Icon className="h-8 w-8 text-primary" strokeWidth={1.5} aria-hidden />
          <span className="text-xs font-medium tracking-wide uppercase">{label}</span>
        </div>
      ))}
    </div>
  );
}

export default function ScrollHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  // Transform scroll progress to scale and opacity
  const phoneScale = useTransform(scrollYProgress, [0, 1], [0.6, 1.5]);
  const phoneOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.8, 0.3]);
  const phoneRotateY = useTransform(scrollYProgress, [0, 1], [10, -10]);
  
  const waveformScale = useTransform(scrollYProgress, [0, 1], [0.8, 2]);
  const waveformOpacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.3, 0.6, 0.8, 0.4]);

  const textOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const textY = useTransform(scrollYProgress, [0, 0.5], [0, -50]);

  const handleDemoCall = async () => {
    setIsDemoLoading(true);
    try {
      const res = await fetch('/api/demo/call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'interactive' }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.configured && data.callUrl) {
        window.open(data.callUrl, '_blank');
      } else if (res.ok && data.callId) {
        window.alert('Demo call initiated. You should receive a call shortly.');
      } else {
        window.alert(data.message ?? 'Demo call service is not configured. Please contact support.');
      }
    } catch {
      window.alert('Unable to start demo call. Please try again.');
    } finally {
      setIsDemoLoading(false);
    }
  };

  return (
    <section 
      ref={containerRef}
      className="relative min-h-[200vh] bg-[#09090B] overflow-hidden"
    >
      {/* Sticky Container */}
      <div className="sticky top-0 h-screen flex items-center justify-center bg-[#09090B] pt-20">
        {/* Content Container */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text Content */}
            <motion.div
              className="space-y-8"
              style={{ opacity: textOpacity, y: textY }}
            >
              <div className="space-y-6">
                <motion.h1
                  className="text-4xl md:text-6xl lg:text-8xl font-semibold tracking-tight leading-tight"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  Capture Every Opportunity. Day or Night.
                </motion.h1>
                
                <motion.p
                  className="text-xl sm:text-2xl text-muted-foreground leading-relaxed max-w-2xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                >
                  Professional 24/7 intake that qualifies every lead, filters the noise, and keeps your team focused on the jobs that matter.
                </motion.p>
              </div>

              {/* CTA Buttons */}
              <motion.div
                className="flex flex-col sm:flex-row gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <HulyButton
                  variant="primary"
                  className="text-lg px-8 py-6"
                >
                  <Link href="/">Start Free Trial</Link>
                </HulyButton>
                
                <HulyButton
                  variant="secondary"
                  className="text-lg px-8 py-6"
                  onClick={handleDemoCall}
                  disabled={isDemoLoading}
                >
                  {isDemoLoading ? 'Connecting…' : 'Speak with Afterhours (Live Demo).'}
                </HulyButton>
              </motion.div>
            </motion.div>

            {/* Right: Animated Visual */}
            <div className="relative h-[600px] lg:h-[700px] flex items-center justify-center">
              {/* Phone Frame - Shows initially, fades as you scroll */}
              <GlassmorphicPhone 
                scale={phoneScale} 
                opacity={phoneOpacity}
                rotateY={phoneRotateY}
              />
              
              {/* Waveform - Expands as you scroll */}
              <VoiceWaveform 
                scale={waveformScale} 
                opacity={waveformOpacity} 
              />
            </div>
          </div>
        </div>
      </div>

      {/* Trust Icons - Below the fold */}
      <div className="absolute bottom-0 left-0 right-0 z-20">
        <TrustIcons />
      </div>
    </section>
  );
}
