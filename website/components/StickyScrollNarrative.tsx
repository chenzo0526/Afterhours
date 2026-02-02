'use client';

import { Phone, MessageSquare, AlertCircle, CheckCircle } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import { motion, useScroll } from 'framer-motion';

const steps = [
  {
    id: 'pickup',
    step: 1,
    title: 'PICKUP',
    body: 'Calls are answered in <1 second with a warm, expert greeting.',
    icon: Phone,
  },
  {
    id: 'intake',
    step: 2,
    title: 'INTAKE',
    body: 'We identify emergencies and provide callers with immediate safety instructions while your team is notified.',
    icon: MessageSquare,
  },
  {
    id: 'triage',
    step: 3,
    title: 'TRIAGE',
    body: 'Urgent leads hit your primary tech instantly. If they don\'t answer, we cycle through your backup hierarchy automatically.',
    icon: AlertCircle,
  },
  {
    id: 'next-step',
    step: 4,
    title: 'NEXT STEP',
    body: 'Non-urgent requests are booked into your calendar for the next morning. You wake up to a full schedule, not a full voicemail.',
    icon: CheckCircle,
  },
];

/**
 * Sticky Scroll Narrative — Scroll-Lock Physics with Obsidian Glass aesthetic.
 * Container: h-[300vh] (non-negotiable) for scroll room.
 * Cards fade/scale in place, perfectly centered. No jumping.
 */
export default function StickyScrollNarrative() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  
  // Track scroll progress through the container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Update active index based on scroll progress (throttled for performance)
  useEffect(() => {
    const unsubscribe = scrollYProgress.on('change', (progress) => {
      const newIndex = Math.min(
        Math.floor(progress * steps.length),
        steps.length - 1
      );
      setActiveIndex(newIndex);
    });
    return unsubscribe;
  }, [scrollYProgress]);

  return (
    <div className="relative overflow-visible" ref={containerRef} role="presentation">
      {/* Section Header */}
      <section className="border-t border-border/50 bg-[#020202] pb-16 sm:pb-20 lg:pb-24">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 lg:pt-24">
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-primary">
              HOW CALLS ARE HANDLED WHEN YOU'RE CLOSED
            </p>
            <h2 className="mt-3 text-3xl font-semibold sm:text-4xl lg:text-5xl text-foreground">
              Your business stays open—without you being awake.
            </h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto text-base sm:text-lg">
              When calls come in outside normal business hours, they're handled calmly, professionally, and intelligently—so customers feel taken care of and you only get involved when it actually matters.
            </p>
          </div>
        </div>
      </section>

      {/* Scroll-Lock Container - h-[300vh] non-negotiable */}
      <div className="relative h-[300vh]">
        {/* Sticky Wrapper - Cards stay centered */}
        <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden px-4 sm:px-6 lg:px-8">
          {steps.map(({ id, step, title, body, icon: Icon }, index) => {
            const isActive = activeIndex === index;
            
            return (
              <motion.div
                key={id}
                className="absolute inset-0 flex items-center justify-center"
                initial={false}
                animate={{
                  opacity: isActive ? 1 : 0.45,
                  zIndex: isActive ? 10 : 5 - index,
                }}
                transition={{ duration: 0.3 }}
              >
                <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8">
                  {/* Obsidian Glass Card */}
                  <motion.div
                    className={`relative rounded-[2rem] border border-white/10 bg-neutral-900/40 backdrop-blur-xl p-8 sm:p-10 lg:p-14 overflow-hidden transition-all duration-300 ${
                      isActive 
                        ? 'shadow-lg shadow-white/10' 
                        : ''
                    }`}
                    animate={{
                      scale: isActive ? 1 : 0.95,
                    }}
                    transition={{ duration: 0.3 }}
                  >

                    {/* Card Content */}
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-6">
                        <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
                          Step {step}
                        </span>
                        <span className="text-xs text-muted-foreground">—</span>
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          {title}
                        </span>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/5 border border-white/10">
                          <Icon className="h-6 w-6 text-primary" aria-hidden />
                        </div>
                        <div>
                          <p className="text-base sm:text-lg text-white leading-relaxed max-w-2xl">
                            {body}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
