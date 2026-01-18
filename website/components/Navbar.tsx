import Link from 'next/link';
import { Button } from './ui/button';
import StartTrialButton from './StartTrialButton';

export default function Navbar() {
  return (
    <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/start" className="flex items-center text-lg font-semibold text-foreground tracking-tight">
            Afterhours
          </Link>
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">
              How It Works
            </Link>
            <Link href="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </Link>
            <StartTrialButton className="inline-flex items-center justify-center rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background transition hover:bg-foreground/90">
              Start Live Trial
            </StartTrialButton>
          </div>
          <div className="md:hidden">
            <StartTrialButton className="inline-flex items-center justify-center rounded-full bg-foreground px-4 py-2 text-xs font-semibold text-background transition hover:bg-foreground/90">
              Start Live Trial
            </StartTrialButton>
          </div>
        </div>
      </div>
    </nav>
  );
}
