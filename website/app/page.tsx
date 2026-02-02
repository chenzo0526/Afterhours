import type { Metadata } from 'next';
import PrecisionHero from '@/components/PrecisionHero';
import StickyScrollNarrative from '@/components/StickyScrollNarrative';
import InteractiveMorningDigest from '@/components/InteractiveMorningDigest';
import RevenueCalculator from '@/components/RevenueCalculator';
import StarfieldGrid from '@/components/StarfieldGrid';
import MouseSpotlight from '@/components/MouseSpotlight';
import StartTrialForm from '@/app/start/StartTrialForm';
import { createMetadata } from '@/metadata';
import { SEO, START_TRIAL_SECTION } from '@/lib/marketingCopy';

export const metadata: Metadata = createMetadata({
  title: SEO.home.title,
  description: SEO.home.description,
  openGraph: {
    title: SEO.home.title,
    description: SEO.home.description,
  },
  twitter: {
    title: SEO.home.title,
    description: SEO.home.description,
  },
});

const statusOptions = new Set(['miss', 'some', 'covered']);
type StatusKey = 'miss' | 'some' | 'covered';

function StartTrialSection({
  searchParams,
}: {
  searchParams?: { status?: string; source?: string } | null;
}) {
  const rawStatus = (searchParams?.status ?? '').toLowerCase();
  const status = statusOptions.has(rawStatus) ? (rawStatus as StatusKey) : 'miss';
  const source = typeof searchParams?.source === 'string' ? searchParams.source.trim() || 'website' : 'website';

  return (
    <section
      id="start-trial"
      className="border-t border-border/50 bg-[#020202] py-16 sm:py-20 lg:py-24"
      aria-labelledby="start-trial-heading"
    >
      <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center mb-12">
          <p className="text-xs uppercase tracking-[0.2em] text-primary">{START_TRIAL_SECTION.eyebrow}</p>
          <h2 id="start-trial-heading" className="mt-3 text-3xl font-semibold sm:text-4xl text-foreground">
            {START_TRIAL_SECTION.heading}
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base">
            {START_TRIAL_SECTION.subhead}
          </p>
        </div>
        <div className="flex flex-col items-center text-center mx-auto max-w-xl">
          <StartTrialForm status={status} source={source} />
        </div>
      </div>
    </section>
  );
}

export default function HomePage({
  searchParams,
}: {
  searchParams?: { status?: string; source?: string };
}) {
  return (
    <div className="relative min-h-screen bg-[#020202] text-foreground">
      {/* Z-Index 0: StarfieldGrid */}
      <StarfieldGrid />
      
      {/* Z-Index 1: MouseSpotlight */}
      <MouseSpotlight />
      
      {/* Z-Index 10: Content Sections */}
      <div className="relative z-10">
        <PrecisionHero />
        <StickyScrollNarrative />
        <InteractiveMorningDigest />
        <RevenueCalculator />
        <StartTrialSection searchParams={searchParams ?? undefined} />
      </div>
    </div>
  );
}
