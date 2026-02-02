import type { Metadata } from 'next';
import FAQ from '@/app/components/FAQ';
import { createMetadata } from '@/metadata';
import { SEO } from '@/lib/marketingCopy';

export const metadata: Metadata = createMetadata({
  title: SEO.faq?.title || 'Frequently Asked Questions | Afterhours',
  description: SEO.faq?.description || 'Common questions about Afterhours call handling service.',
});

export default function FAQPage() {
  return (
    <div className="relative min-h-screen bg-[#030303] text-foreground">
      <div className="relative z-10">
        <FAQ />
      </div>
    </div>
  );
}
