import type { Metadata } from "next";
import HowItWorksContent from "./HowItWorksContent";
import { createMetadata } from "@/metadata";
import { SEO } from "@/lib/marketingCopy";

export const metadata: Metadata = createMetadata({
  title: SEO.howItWorks.title,
  description: SEO.howItWorks.description,
  openGraph: {
    title: SEO.howItWorks.title,
    description: SEO.howItWorks.descriptionShort,
  },
  twitter: {
    title: SEO.howItWorks.title,
    description: SEO.howItWorks.descriptionShort,
  },
});

export default function HowItWorks() {
  return <HowItWorksContent />;
}
