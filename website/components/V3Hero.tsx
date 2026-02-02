'use client';

import { useRef, useState, useEffect } from 'react';
import { useScroll, useTransform, motion, useInView } from 'framer-motion';
import SignalWave from '@/components/visual/SignalWave';
import { HulyButton } from '@/components/ui/huly-button';
import { Input } from '@/components/ui/input';
import { Wrench, Flame, Droplets } from 'lucide-react';

// Premium Dashboard Widget - Revenue Calculator
function RevenueDashboardWidget() {
  const [averageJobValue, setAverageJobValue] = useState(500);
  const [missedCallsPerMonth, setMissedCallsPerMonth] = useState(10);
  const [isActivated, setIsActivated] = useState(false);

  const monthlyLoss = averageJobValue * missedCallsPerMonth;
  const annualLoss = monthlyLoss * 12;
  const savedAmount = monthlyLoss * 0.95;
  const isHighLoss = missedCallsPerMonth > 5 && !isActivated;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="relative w-full bg-[#020202] p-6">
      <p className="text-sm font-medium text-muted-foreground mb-6 text-center">
        Stop Bleeding Jobs. One saved emergency call pays for your entire year.
      </p>

      {/* Compact Sliders */}
      <div className="space-y-4 mb-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs text-muted-foreground">Avg Job Value</label>
            <span className="text-sm font-semibold text-foreground">{formatCurrency(averageJobValue)}</span>
          </div>
          <input
            type="range"
            min="100"
            max="5000"
            step="50"
            value={averageJobValue}
            onChange={(e) => setAverageJobValue(Number(e.target.value))}
            className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer slider"
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs text-muted-foreground">Missed Calls/Month</label>
            <span className="text-sm font-semibold text-foreground">{missedCallsPerMonth}</span>
          </div>
          <input
            type="range"
            min="0"
            max="50"
            step="1"
            value={missedCallsPerMonth}
            onChange={(e) => setMissedCallsPerMonth(Number(e.target.value))}
            className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer slider"
          />
        </div>
      </div>

      {/* Toggle */}
      <div className="mb-6 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Afterhours Status</span>
        <button
          onClick={() => setIsActivated(!isActivated)}
          className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors ${
            isActivated ? 'bg-primary' : 'bg-muted'
          }`}
        >
          <motion.span
            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ${
              isActivated ? 'translate-x-8' : 'translate-x-1'
            }`}
            layout
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        </button>
      </div>

      {/* Result Display — no box, solid #050505 */}
      <div className="p-4 bg-[#020202]">
        <div className="text-center">
          <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">
            {isActivated ? 'Saved' : isHighLoss ? 'Leaking' : 'Potential Loss'}
          </div>
          <motion.div
            className={`text-3xl font-bold ${
              isActivated ? 'text-primary' : isHighLoss ? 'text-destructive' : 'text-foreground'
            }`}
            key={isActivated ? savedAmount : monthlyLoss}
            initial={{ scale: 1.05 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            {isActivated ? formatCurrency(savedAmount) : formatCurrency(monthlyLoss)}
          </motion.div>
          <div className="text-xs text-muted-foreground mt-1">per month</div>
        </div>
      </div>
    </div>
  );
}

// Trust Bar: Plumbing, HVAC, Restoration — Lucide icons, sharp labels
function TrustBar() {
  const trades = [
    { label: 'Plumbing', Icon: Wrench },
    { label: 'HVAC', Icon: Flame },
    { label: 'Restoration', Icon: Droplets },
  ];

  return (
    <div className="flex items-center justify-center gap-10 py-6 border-t border-b border-border/50">
      {trades.map(({ label, Icon }) => (
        <div key={label} className="flex flex-col items-center gap-2">
          <Icon className="h-6 w-6 text-primary" strokeWidth={1.5} aria-hidden />
          <span className="text-xs font-semibold uppercase tracking-wider text-foreground">{label}</span>
        </div>
      ))}
    </div>
  );
}

// 3D Glassmorphic Phone Component
function GlassmorphicPhone({ isVisible, signalIntensity }: { isVisible: boolean; signalIntensity: 'low' | 'medium' | 'high' }) {
  return (
    <motion.div
      className="relative w-80 h-[600px]"
      style={{ perspective: '1000px' }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{
        opacity: isVisible ? 1 : 0,
        scale: isVisible ? 1 : 0.8,
      }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="absolute inset-0 rounded-[3rem] border-4 border-white/20 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl shadow-glass-lg" style={{ transformStyle: 'preserve-3d' }}>
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-background rounded-b-2xl" />
        
        {/* Screen Content */}
        <div className="absolute inset-4 rounded-[2.5rem] bg-gradient-to-br from-primary/20 via-primary/10 to-transparent overflow-hidden">
          <div className="p-8 h-full flex flex-col items-center justify-center space-y-6">
            {/* Call Interface */}
            <div className="w-20 h-20 rounded-full bg-primary/30 border-4 border-primary/50 flex items-center justify-center" aria-label="Afterhours live intake call active">
              <svg className="w-10 h-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            
            <div className="text-center space-y-2">
              <div className="text-base font-semibold text-foreground">Afterhours</div>
              <div className="text-xs text-muted-foreground">Live Call Active</div>
            </div>
            
            {/* SignalWave */}
            <div className="w-full px-4" role="img" aria-label="Afterhours intake call in progress">
              <SignalWave intensity={signalIntensity} className="w-full" />
            </div>
            
            {/* Call Status */}
            <div className="text-center space-y-1">
              <div className="text-xs text-muted-foreground">Capturing details...</div>
              <div className="flex items-center justify-center gap-2 text-xs text-primary">
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                <span>Qualifying lead</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Glass Reflection */}
      <div className="absolute inset-0 rounded-[3rem] bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none" />
    </motion.div>
  );
}

export default function V3Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const phoneInView = useInView(containerRef, { once: true, margin: '-100px' });

  // Transform scroll progress
  const h1Opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const h1Y = useTransform(scrollYProgress, [0, 0.3], [0, -100]);
  const phoneOpacity = useTransform(scrollYProgress, [0.2, 0.6], [0, 1]);
  const phoneScale = useTransform(scrollYProgress, [0.2, 0.6], [0.7, 1]);
  const phoneRotateY = useTransform(scrollYProgress, [0.2, 0.6], [-30, 0]);

  // Signal intensity based on scroll
  const [signalIntensity, setSignalIntensity] = useState<'low' | 'medium' | 'high'>('low');
  useEffect(() => {
    const unsubscribe = scrollYProgress.on('change', (latest) => {
      if (latest > 0.4) {
        setSignalIntensity('high');
      } else if (latest > 0.2) {
        setSignalIntensity('medium');
      } else {
        setSignalIntensity('low');
      }
    });
    return () => unsubscribe();
  }, [scrollYProgress]);

  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isCalling, setIsCalling] = useState(false);

  const handleDemoCall = async () => {
    setShowPhoneModal(true);
  };

  const handleSubmitPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim()) return;

    setIsCalling(true);
    try {
      const response = await fetch('/api/demo/call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phoneNumber: phoneNumber.trim(),
          type: 'interactive' 
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.callId) {
          alert(`Demo call initiated! Call ID: ${data.callId}. You should receive a call shortly.`);
          setShowPhoneModal(false);
          setPhoneNumber('');
        } else if (data.callUrl) {
          window.open(data.callUrl, '_blank');
          setShowPhoneModal(false);
        } else {
          alert('Demo call initiated! Check your phone.');
          setShowPhoneModal(false);
          setPhoneNumber('');
        }
      } else {
        const error = await response.json();
        alert(error.message || 'Demo call service is temporarily unavailable. Please try again later.');
      }
    } catch (error) {
      console.error('Demo call error:', error);
      alert('Unable to initiate demo call. Please contact support.');
    } finally {
      setIsCalling(false);
    }
  };

  return (
    <section
      ref={containerRef}
      className="relative min-h-[200vh] bg-[#020202] overflow-hidden"
    >
      {/* Sticky Container */}
      <div className="sticky top-0 h-screen flex items-center justify-center pt-32 pb-16">
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text Content */}
            <motion.div
              className="space-y-8 relative z-10"
              style={{ opacity: h1Opacity, y: h1Y }}
            >
              <motion.h1
                className="text-6xl md:text-8xl font-bold leading-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-white/70 relative"
                style={{ letterSpacing: '-0.04em' }}
                initial={{ opacity: 1, y: 0 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              >
                Stop Bleeding Opportunities After Normal Business Hours.
              </motion.h1>
              
              <motion.p
                className="text-xl sm:text-2xl text-muted-foreground leading-relaxed max-w-2xl"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              >
                Replace inconsistent call centers and missed voicemails with a digital intake expert that knows your trade, provides real-time emergency instructions, and never lets a lead go cold.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                className="flex flex-col sm:flex-row gap-4"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <button
                  className="text-lg px-8 py-6 bg-white/10 border border-white/20 text-white rounded-xl transition-all hover:bg-white/20"
                  onClick={handleDemoCall}
                >
                  Talk to Afterhours (Live Intake Demo)
                </button>
                
                <button
                  className="text-lg px-8 py-6 bg-white/10 border border-white/20 text-white rounded-xl transition-all hover:bg-white/20"
                >
                  <a href="#start-trial">Start Free Trial</a>
                </button>
              </motion.div>

              {/* Phone Number Modal */}
              {showPhoneModal && (
                <motion.div
                  className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={() => setShowPhoneModal(false)}
                >
                  <motion.div
                    className="relative rounded-2xl border border-border/50 bg-card/95 backdrop-blur-xl shadow-glass-lg p-8 max-w-md w-full mx-4"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <h3 className="text-2xl font-semibold mb-2">Speak with Afterhours</h3>
                    <p className="text-sm text-muted-foreground mb-6">
                      Enter your phone number. Our digital intake system will qualify you as a lead—we&apos;ll follow up.
                    </p>
                    <form onSubmit={handleSubmitPhone} className="space-y-4">
                      <Input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="+1 (555) 123-4567"
                        required
                        pattern="^\+?[1-9]\d{1,14}$"
                        className="w-full"
                      />
                      <div className="flex gap-3">
                        <HulyButton
                          type="button"
                          variant="secondary"
                          className="flex-1 px-4 py-3"
                          onClick={() => {
                            setShowPhoneModal(false);
                            setPhoneNumber('');
                          }}
                        >
                          Cancel
                        </HulyButton>
                        <HulyButton
                          type="submit"
                          variant="primary"
                          className="flex-1 px-4 py-3"
                          disabled={isCalling}
                        >
                          {isCalling ? 'Connecting…' : 'Call Me'}
                        </HulyButton>
                      </div>
                    </form>
                  </motion.div>
                </motion.div>
              )}

              {/* Trust Bar */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <TrustBar />
              </motion.div>
            </motion.div>

            {/* Right: 3D Phone + Dashboard Widget */}
            <div className="relative h-[700px] flex flex-col items-center justify-center gap-8">
              {/* 3D Phone */}
              <motion.div
                style={{
                  opacity: phoneOpacity,
                  scale: phoneScale,
                  rotateY: phoneRotateY,
                }}
              >
                <GlassmorphicPhone isVisible={phoneInView} signalIntensity={signalIntensity} />
              </motion.div>

              {/* Revenue Dashboard Widget */}
              <motion.div
                className="w-full max-w-sm"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: phoneInView ? 1 : 0, y: phoneInView ? 0 : 50 }}
                transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <RevenueDashboardWidget />
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
