'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { ChevronDown, AlertCircle, Calendar, Shield } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { HulyButton } from '@/components/ui/huly-button';

const digestIconMap = { urgent: AlertCircle, scheduling: Calendar, spam: Shield } as const;

function getCurrentDate() {
  const today = new Date();
  return today.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

const digestItems = [
  {
    id: 'urgent-1',
    type: 'urgent' as const,
    title: 'Urgent Intake: Main Water Leak',
    action: 'Escalated',
    icon: AlertCircle,
    details: {
      caller: '+1 (555) 234-5678',
      timestamp: '2:34 AM',
      location: '123 Main St, Apt 4B',
      issue: 'Burst pipe in kitchen, water spreading to living room',
      estimatedValue: '$1,200',
      status: 'Escalated',
    },
  },
  {
    id: 'scheduling-1',
    type: 'scheduling' as const,
    title: 'Scheduling: Leaky Faucet Repair',
    action: 'Scheduled Mon 10am',
    icon: Calendar,
    details: {
      caller: '+1 (555) 876-5432',
      timestamp: '11:22 PM',
      location: '456 Oak Ave',
      issue: 'Leaky faucet in kitchen, not urgent',
      estimatedValue: '$150',
      status: 'Scheduled Mon 10am',
    },
  },
  {
    id: 'spam-1',
    type: 'spam' as const,
    title: 'Spam/Robocall',
    action: 'Filtered',
    icon: Shield,
    details: {
      caller: '+1 (555) 000-0000',
      timestamp: '3:15 AM',
      location: 'N/A',
      issue: 'Automated telemarketing call detected',
      estimatedValue: '$0',
      status: 'Filtered',
    },
  },
];

export default function InteractiveMorningDigest() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const phoneRef = useRef<HTMLDivElement>(null);
  const isPhoneInView = useInView(phoneRef, { once: true, margin: '-100px' });

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleStartTrial = useCallback(() => {
    const target = document.getElementById('start-trial');
    if (target) {
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      if (window.location.hash !== '#start-trial') {
        window.history.replaceState(null, '', window.location.pathname + '#start-trial');
      }
    }
  }, []);

  // Track scroll progress for Sunrise Amber glow transition
  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;

      const rect = sectionRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const sectionTop = rect.top;
      
      const entryPoint = windowHeight;
      const transitionRange = windowHeight * 0.5;
      const progress = Math.max(0, Math.min(1, (entryPoint - sectionTop) / transitionRange));
      setScrollProgress(progress);
    };

    let rafId: number;
    const onScroll = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(handleScroll);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative border-t border-border/50 bg-[#020202] py-16 sm:py-20 lg:py-24 overflow-hidden"
      aria-labelledby="morning-digest-heading"
    >
      {/* Sunrise Amber Glow - transitions from transparent to amber-500/10 */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: scrollProgress,
          background: `radial-gradient(ellipse at center, rgba(251, 191, 36, ${scrollProgress * 0.1}), transparent 70%)`,
          transition: 'opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      />

      <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12">
          <p className="text-xs uppercase tracking-[0.2em] text-primary">MORNING DIGEST</p>
          <h2 id="morning-digest-heading" className="mt-3 text-3xl font-semibold sm:text-4xl text-foreground tracking-tighter">
            Wake up knowing exactly what happened overnight.
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto text-base sm:text-lg">
            While you were closed, every serious call was captured, every urgent situation was handled, and everything else was organized. You start the day with clarity—not cleanup.
          </p>
        </div>

        <div className="text-center mb-8 max-w-2xl mx-auto">
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Each morning, you receive a concise summary by text or email showing:
          </p>
          <ul className="mt-4 text-sm sm:text-base text-muted-foreground space-y-2 text-left max-w-md mx-auto">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Which calls were urgent and escalated</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Which requests were scheduled for follow-up</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>What was filtered out as spam or robocalls</span>
            </li>
          </ul>
        </div>

        {/* iPhone Mockup - Obsidian Glass */}
        <div className="flex justify-center mb-8">
          <motion.div
            ref={phoneRef}
            initial={{ y: 50, opacity: 0 }}
            animate={isPhoneInView ? { y: 0, opacity: 1 } : { y: 50, opacity: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-sm"
          >
            {/* Phone Frame - Obsidian Glass */}
            <div className="relative rounded-[3rem] border border-white/10 bg-black p-3 shadow-2xl shadow-amber-500/10">
              {/* Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-b-2xl border-x border-b border-white/10" />
              
              {/* Screen - Deep Black */}
              <div className="rounded-[2.5rem] bg-black overflow-hidden">
                {/* Status Bar */}
                <div className="px-6 pt-4 pb-2 flex items-center justify-between text-xs text-zinc-400">
                  <span>9:41</span>
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-2 border border-zinc-400 rounded-sm" />
                    <div className="w-6 h-2 border border-zinc-400 rounded-sm" />
                  </div>
                </div>

                {/* Header */}
                <div className="px-6 pb-4 text-center border-b border-white/5">
                  <h3 className="text-lg font-bold text-white mb-1">Your Morning Digest</h3>
                  <p className="text-xs text-zinc-400">{getCurrentDate()}</p>
                </div>

                {/* Notification Stack */}
                <div className="px-4 py-4 space-y-3 max-h-[500px] overflow-y-auto">
                  {digestItems.map((item) => {
                    const Icon = item.icon;
                    const isExpanded = expandedId === item.id;
                    const isUrgent = item.type === 'urgent';
                    const isSpam = item.type === 'spam';

                    return (
                      <motion.div
                        key={item.id}
                        className={`rounded-2xl border overflow-hidden backdrop-blur-xl transition-all ${
                          isUrgent
                            ? 'border-red-500/20 bg-white/[0.03]'
                            : isSpam
                            ? 'border-white/[0.05] bg-white/[0.03]'
                            : 'border-white/[0.05] bg-white/[0.03]'
                        }`}
                        whileHover={{
                          scale: 1.02,
                          transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] },
                        }}
                      >
                        {/* Item Header */}
                        <button
                          onClick={() => toggleExpand(item.id)}
                          className="w-full px-4 py-3 flex items-start justify-between gap-3 text-left hover:bg-white/5 transition-colors"
                          aria-expanded={isExpanded}
                          aria-controls={`digest-details-${item.id}`}
                        >
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <div
                              className={`flex-shrink-0 mt-0.5 ${
                                isUrgent ? 'text-red-400' : isSpam ? 'text-zinc-500' : 'text-blue-400'
                              }`}
                            >
                              <Icon className="h-5 w-5" aria-hidden />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-white leading-snug mb-1">
                                {item.title}
                              </p>
                              <p className="text-xs text-zinc-400">
                                → {item.action}
                              </p>
                            </div>
                          </div>
                          <ChevronDown
                            className={`h-5 w-5 text-zinc-500 flex-shrink-0 transition-transform ${
                              isExpanded ? 'transform rotate-180' : ''
                            }`}
                            aria-hidden
                          />
                        </button>

                        {/* Expandable Details */}
                        {isExpanded && (
                          <div
                            id={`digest-details-${item.id}`}
                            className="px-4 pb-4 pt-2 border-t border-zinc-800/50 bg-black/30"
                          >
                            <div className="space-y-3 text-xs">
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <p className="text-zinc-500 mb-1">Caller</p>
                                  <p className="text-zinc-300 font-medium">{item.details.caller}</p>
                                </div>
                                <div>
                                  <p className="text-zinc-500 mb-1">Time</p>
                                  <p className="text-zinc-300 font-medium">{item.details.timestamp}</p>
                                </div>
                              </div>
                              <div>
                                <p className="text-zinc-500 mb-1">Location</p>
                                <p className="text-zinc-300 font-medium">{item.details.location}</p>
                              </div>
                              <div>
                                <p className="text-zinc-500 mb-1">Issue</p>
                                <p className="text-zinc-300">{item.details.issue}</p>
                              </div>
                              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-zinc-800/50">
                                <div>
                                  <p className="text-zinc-500 mb-1">Est. Value</p>
                                  <p className="text-zinc-300 font-semibold">{item.details.estimatedValue}</p>
                                </div>
                                <div>
                                  <p className="text-zinc-500 mb-1">Status</p>
                                  <p className="text-zinc-300 text-[10px] leading-relaxed">{item.details.status}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-12">
          <p className="text-sm sm:text-base text-muted-foreground mb-6 max-w-2xl mx-auto">
            Your phones pick back up exactly where the system left off—or exactly where you left them if nothing came in.
          </p>
          <HulyButton
            type="button"
            variant="primary"
            onClick={handleStartTrial}
            className="text-base sm:text-lg px-8 py-6 mx-auto"
          >
            Start Live Trial
          </HulyButton>
        </div>
      </div>
    </section>
  );
}
