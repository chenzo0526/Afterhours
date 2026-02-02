import type { Metadata } from "next";
import PricingContent from "./PricingContent";
import { createMetadata } from "@/metadata";
import { SEO } from "@/lib/marketingCopy";

export const metadata: Metadata = createMetadata({
  title: SEO.pricing.title,
  description: SEO.pricing.description,
  openGraph: {
    title: SEO.pricing.title,
    description: SEO.pricing.descriptionShort,
  },
  twitter: {
    title: SEO.pricing.title,
    description: SEO.pricing.descriptionShort,
  },
});

export default function Pricing() {
  return <PricingContent />;
}
