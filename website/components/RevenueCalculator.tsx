'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { HulyButton } from '@/components/ui/huly-button';
import Link from 'next/link';
import { REVENUE_CALCULATOR } from '@/lib/marketingCopy';

export default function RevenueCalculator() {
  const [averageJobValue, setAverageJobValue] = useState(500);
  const [missedCallsPerMonth, setMissedCallsPerMonth] = useState(10);
  const [isActivated, setIsActivated] = useState(false);

  // Calculate revenue loss
  const monthlyLoss = averageJobValue * missedCallsPerMonth;
  const annualLoss = monthlyLoss * 12;
  const savedAmount = monthlyLoss * 1.00; // 100% capture rate

  // Color transition based on missed calls and activation state
  const lossIntensity = Math.min(missedCallsPerMonth / 20, 1); // Normalize to 0-1
  const isHighLoss = monthlyLoss > 1000 && !isActivated; // Red alert triggers when potential loss exceeds $1,000

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#020202]" aria-label="Revenue calculator">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl sm:text-5xl font-semibold mb-4 text-center text-foreground">
          {REVENUE_CALCULATOR.headline}
        </h2>
        <p className="text-xl text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
          {REVENUE_CALCULATOR.subhead}
        </p>

        <div className="bg-card/40 backdrop-blur-xl border border-border/50 rounded-2xl p-8 md:p-12">
          {/* Input Controls */}
          <div className="space-y-8 mb-12">
            {/* Average Job Value Slider */}
            <div>
              <label
                htmlFor="job-value"
                className="block text-lg font-medium mb-4 text-foreground"
              >
                {REVENUE_CALCULATOR.labelJobValue}
                <motion.span
                  className="ml-2 text-2xl font-semibold text-primary inline-block"
                  key={averageJobValue}
                  initial={{ scale: 1.2, opacity: 0.7 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3, type: 'spring', stiffness: 300 }}
                >
                  {formatCurrency(averageJobValue)}
                </motion.span>
              </label>
              <motion.div
                className="relative"
                whileHover={{ scale: 1.01 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                <input
                  id="job-value"
                  type="range"
                  min="100"
                  max="5000"
                  step="50"
                  value={averageJobValue}
                  onChange={(e) => setAverageJobValue(Number(e.target.value))}
                  className="w-full h-3 bg-muted rounded-lg appearance-none cursor-pointer slider transition-all duration-300"
                  aria-label={REVENUE_CALCULATOR.ariaJobValue}
                />
                <div className="flex justify-between text-sm text-muted-foreground mt-2">
                  <span>$100</span>
                  <span>$5,000</span>
                </div>
              </motion.div>
            </div>

            {/* Missed Calls Slider */}
            <div>
              <label
                htmlFor="missed-calls"
                className="block text-lg font-medium mb-4 text-foreground"
              >
                {REVENUE_CALCULATOR.labelMissedCalls}
                <motion.span
                  className="ml-2 text-2xl font-semibold text-primary inline-block"
                  key={missedCallsPerMonth}
                  initial={{ scale: 1.2, opacity: 0.7 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3, type: 'spring', stiffness: 300 }}
                >
                  {missedCallsPerMonth}
                </motion.span>
              </label>
              <motion.div
                className="relative"
                whileHover={{ scale: 1.01 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                <input
                  id="missed-calls"
                  type="range"
                  min="0"
                  max="50"
                  step="1"
                  value={missedCallsPerMonth}
                  onChange={(e) => setMissedCallsPerMonth(Number(e.target.value))}
                  className="w-full h-3 bg-muted rounded-lg appearance-none cursor-pointer slider transition-all duration-300"
                  aria-label={REVENUE_CALCULATOR.ariaMissedCalls}
                />
                <div className="flex justify-between text-sm text-muted-foreground mt-2">
                  <span>0</span>
                  <span>50+</span>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Activation Toggle */}
          <div className="mb-8 flex items-center justify-center">
            <button
              onClick={() => setIsActivated(!isActivated)}
              className={`relative inline-flex h-14 w-32 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background ${
                isActivated ? 'bg-primary' : 'bg-muted'
              }`}
              aria-label={isActivated ? 'Deactivate Afterhours' : 'Activate Afterhours'}
            >
              <motion.span
                className={`inline-block h-12 w-12 transform rounded-full bg-white shadow-lg transition-transform ${
                  isActivated ? 'translate-x-16' : 'translate-x-1'
                }`}
                layout
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
              <span className="absolute left-4 text-sm font-semibold text-foreground">
                {isActivated ? 'ON' : 'OFF'}
              </span>
            </button>
            <span className="ml-4 text-sm text-muted-foreground">
              {isActivated ? 'Afterhours Activated' : 'Activate Afterhours'}
            </span>
          </div>

          {/* Money Leak Counter - Changes color based on activation */}
          <motion.div
            className={`relative rounded-xl p-8 mb-8 border-2 transition-all duration-500 ${
              isActivated
                ? 'bg-primary/10 border-primary/50'
                : isHighLoss
                ? 'bg-destructive/15 border-destructive/70 shadow-lg shadow-destructive/20'
                : 'bg-muted/30 border-border'
            }`}
            animate={{
              backgroundColor: isActivated
                ? 'rgba(59, 130, 246, 0.1)'
                : isHighLoss
                ? ['rgba(239, 68, 68, 0.15)', 'rgba(239, 68, 68, 0.2)', 'rgba(239, 68, 68, 0.15)']
                : 'rgba(0, 0, 0, 0.1)',
              borderColor: isActivated
                ? 'rgba(59, 130, 246, 0.5)'
                : isHighLoss
                ? ['rgba(239, 68, 68, 0.7)', 'rgba(239, 68, 68, 0.9)', 'rgba(239, 68, 68, 0.7)']
                : 'rgba(255, 255, 255, 0.1)',
              boxShadow: isHighLoss
                ? ['0 0 20px rgba(239, 68, 68, 0.2)', '0 0 30px rgba(239, 68, 68, 0.3)', '0 0 20px rgba(239, 68, 68, 0.2)']
                : 'none',
            }}
            transition={{ duration: 1.5, repeat: isHighLoss ? Infinity : 0, ease: 'easeInOut' }}
          >
            <div className="text-center">
              <div className="text-sm font-medium mb-2 uppercase tracking-wider">
                {isActivated ? (
                  <span className="text-primary">Money Saved</span>
                ) : isHighLoss ? (
                  <span className="text-destructive">Money Leaking Out</span>
                ) : (
                  <span className="text-muted-foreground">Potential Monthly Loss</span>
                )}
              </div>
              <motion.div
                className={`text-5xl md:text-6xl font-bold mb-2 ${
                  isActivated
                    ? 'text-primary'
                    : isHighLoss
                    ? 'text-destructive'
                    : 'text-foreground'
                }`}
                key={isActivated ? savedAmount : monthlyLoss}
                initial={{ scale: 1.1, opacity: 0.8 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {isActivated ? formatCurrency(savedAmount) : formatCurrency(monthlyLoss)}
              </motion.div>
              <div className="text-lg text-muted-foreground">
                {isActivated ? 'saved per month' : 'per month'}
              </div>
              {!isActivated && (
                <div className="mt-4 text-sm text-muted-foreground">
                  Annual loss: <span className="font-semibold text-foreground">{formatCurrency(annualLoss)}</span>
                </div>
              )}
              {isActivated && (
                <div className="mt-4 text-sm text-primary">
                  Capturing {missedCallsPerMonth} of {missedCallsPerMonth} leads
                </div>
              )}
            </div>

            {/* Animated Indicator */}
            {isActivated ? (
              <motion.div
                className="absolute top-0 right-0 w-16 h-16"
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.7, 1, 0.7],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <svg
                  className="w-full h-full text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </motion.div>
            ) : isHighLoss ? (
              <>
                {/* Pulsing glow effect */}
                <motion.div
                  className="absolute top-0 right-0 w-20 h-20 rounded-full bg-destructive/20"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.4, 0.8, 0.4],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
                {/* Alert icon */}
                <motion.div
                  className="absolute top-0 right-0 w-20 h-20 flex items-center justify-center"
                  animate={{
                    scale: [1, 1.15, 1],
                    opacity: [0.8, 1, 0.8],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  <svg
                    className="w-full h-full text-destructive drop-shadow-lg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </motion.div>
              </>
            ) : null}
          </motion.div>

          {/* Additional Stats when Activated */}
          {isActivated && (
            <motion.div
              className="rounded-xl p-6 mb-8 bg-primary/5 border border-primary/20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary">
                    {formatCurrency(savedAmount * 12)}
                  </div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">
                    {REVENUE_CALCULATOR.annualSavings}
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">
                    100%
                  </div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">
                    {REVENUE_CALCULATOR.callCaptureRate}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* CTA Button */}
          <div className="text-center">
            <Link href="#start-trial">
              <HulyButton
                variant="primary"
                className="text-lg px-8 py-6 w-full sm:w-auto"
              >
                {REVENUE_CALCULATOR.cta}
              </HulyButton>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              {REVENUE_CALCULATOR.microcopy}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
