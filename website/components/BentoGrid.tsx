'use client';

import { useState } from 'react';
import { BorderBeam } from '@/components/ui/border-beam';
import { motion } from 'framer-motion';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  className?: string;
  delay?: number;
  keywords: string;
}

function FeatureCard({ title, description, icon, className = '', delay = 0, keywords }: FeatureCardProps & { keywords: string }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className={`group relative rounded-2xl border border-border/50 bg-card/40 backdrop-blur-xl p-8 transition-all duration-300 hover:border-primary/50 hover:bg-card/60 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.5, delay }}
      aria-label={`${title} - ${keywords} feature card`}
    >
      {/* Border Beam Effect on Hover */}
      {isHovered && (
        <BorderBeam
          size={200}
          duration={12}
          anchor={90}
          borderWidth={1.5}
          colorFrom="#3b82f6"
          colorTo="#8b5cf6"
        />
      )}

      {/* Glassmorphism Overlay */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10">
        <div className="mb-4 flex items-center justify-center w-16 h-16 rounded-xl bg-primary/10 border border-primary/20 group-hover:bg-primary/20 transition-colors">
          {icon}
        </div>
        <h3 className="text-2xl font-semibold mb-3 text-foreground group-hover:text-primary transition-colors">
          {title}: {keywords}
        </h3>
        <p className="text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>
    </motion.div>
  );
}

export default function BentoGrid() {
  const features = [
    {
      title: 'Emergency Triage',
      description: 'Instant detection of high-stakes keywords like burst pipe or AC out.',
      icon: (
        <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      keywords: 'Emergency Answering Service',
    },
    {
      title: 'Digital Dispatcher',
      description: 'Low-latency, professional voice that handles every call with precision.',
      icon: (
        <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
      ),
      keywords: 'Intake System',
    },
    {
      title: 'CRM Live-Sync',
      description: 'Secure CRM Sync for instant lead capture.',
      icon: (
        <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ),
      keywords: 'Automated Lead Capture',
    },
    {
      title: 'Smart Filtering',
      description: 'Automatically kills robocalls and spam before they reach your bill.',
      icon: (
        <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
      ),
      keywords: 'Spam Call Filtering',
    },
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background" aria-label="Features section">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-semibold mb-4 text-foreground">
            Built for Service Trades
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to never miss another call when your office is closed
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <FeatureCard
              key={feature.title}
              title={feature.title}
              description={feature.description}
              icon={feature.icon}
              delay={index * 0.1}
              keywords={feature.keywords}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
