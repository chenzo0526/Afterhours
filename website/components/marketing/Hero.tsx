import type { ReactNode } from "react";
import Link from "next/link";
import { HulyButton } from "@/components/ui/huly-button";

type HeroProps = {
  title: ReactNode;
  subtitle?: string;
  ctaLabel: string;
  ctaHref: string;
  ctaNote?: string;
  eyebrow?: string;
};

export default function Hero({ title, subtitle, ctaLabel, ctaHref, ctaNote, eyebrow }: HeroProps) {
  return (
    <section className="border-b border-border bg-gradient-to-b from-background via-background to-muted/20">
      <div className="container mx-auto px-6 py-16 sm:py-20 lg:py-24">
        <div className="max-w-3xl motion-fade">
          {eyebrow ? (
            <p className="text-xs uppercase tracking-[0.2em] text-primary">{eyebrow}</p>
          ) : null}
          <h1 className="mt-3 text-4xl font-semibold leading-tight sm:text-5xl">{title}</h1>
          {subtitle ? (
            <p className="mt-5 text-lg text-muted-foreground sm:text-xl">{subtitle}</p>
          ) : null}
          <div className="mt-8">
            <Link href={ctaHref} className="inline-block">
              <HulyButton variant="primary" className="px-8 py-4">{ctaLabel}</HulyButton>
            </Link>
            {ctaNote ? <p className="mt-6 text-sm text-muted-foreground">{ctaNote}</p> : null}
          </div>
        </div>
      </div>
    </section>
  );
}
