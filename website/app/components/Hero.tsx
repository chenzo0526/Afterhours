import Link from 'next/link';
import { HulyButton } from '@/components/ui/huly-button';

export default function Hero() {
  return (
    <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
          Stop losing emergency calls while you're asleep.
        </h1>
        <p className="text-xl sm:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Afterhours answers late-night calls, captures the details, and only alerts your on-call staff member when it's actually urgent.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <Link href="/#start-trial" className="w-full sm:w-auto">
            <HulyButton variant="primary" className="w-full sm:w-auto px-8 py-4">
              Start Live Trial
            </HulyButton>
          </Link>
          <Link href="/pricing" className="w-full sm:w-auto">
            <HulyButton variant="secondary" className="w-full sm:w-auto px-8 py-4">
              See Pricing
            </HulyButton>
          </Link>
        </div>
        <div className="mt-16">
          <p className="text-sm text-muted-foreground mb-6">Built for local service teams</p>
          <div className="flex justify-center items-center gap-8 opacity-60">
            <div className="h-8 w-24 bg-foreground/20 rounded"></div>
            <div className="h-8 w-24 bg-foreground/20 rounded"></div>
            <div className="h-8 w-24 bg-foreground/20 rounded"></div>
            <div className="h-8 w-24 bg-foreground/20 rounded"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
