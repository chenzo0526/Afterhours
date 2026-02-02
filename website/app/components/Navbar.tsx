import Link from 'next/link';
import StartTrialButton from '@/components/StartTrialButton';

export default function Navbar() {
  return (
    <nav className="border-b border-border bg-background sticky top-0 z-50 backdrop-blur-sm bg-background/95" aria-label="Main navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center text-lg font-semibold text-foreground tracking-tight focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background rounded">
            Afterhours
          </Link>
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/pricing" className="text-muted-foreground hover:text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background rounded">
              Pricing
            </Link>
            {/* CTA rule: "Start Live Trial" uses variant=primary only. No inverted override. */}
            <StartTrialButton variant="primary" size="default" className="rounded-full px-6 py-2.5 font-bold text-base">
              Start Live Trial
            </StartTrialButton>
          </div>
          <div className="md:hidden flex items-center gap-3">
            <Link
              href="/pricing"
              className="text-muted-foreground hover:text-foreground text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background rounded"
            >
              Pricing
            </Link>
            <StartTrialButton variant="primary" size="sm" className="rounded-full px-6 py-2.5 font-bold text-sm">
              Start Live Trial
            </StartTrialButton>
          </div>
        </div>
      </div>
    </nav>
  );
}
