import Link from 'next/link';
import { HulyButton } from '@/components/ui/huly-button';
import { CTA_START_TRIAL } from '@/lib/marketingCopy';

export default function Navbar() {
  return (
    <nav
      className="fixed top-0 left-0 right-0 z-[50] border-b border-white/10 bg-black/40 backdrop-blur-xl pt-8"
      aria-label="Main navigation"
      style={{ zIndex: 50 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link
            href="/"
            className="flex items-center text-lg font-semibold text-foreground tracking-tight focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background rounded"
          >
            Afterhours
          </Link>
          <div className="hidden md:flex items-center space-x-6">
            <Link
              href="/how-it-works"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              How It Works
            </Link>
            <Link
              href="/pricing"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Pricing
            </Link>
            <HulyButton variant="primary" className="px-6 py-2.5">
              {CTA_START_TRIAL}
            </HulyButton>
          </div>
          <div className="md:hidden">
            <HulyButton
              variant="primary"
              className="px-4 py-2 text-sm"
            >
              {CTA_START_TRIAL}
            </HulyButton>
          </div>
        </div>
      </div>
    </nav>
  );
}
