import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getIndustryData, getAllIndustrySlugs } from '@/lib/industry-data';
import { createMetadata } from '@/metadata';
import ComparisonTable from '@/components/ComparisonTable';
import { ShimmerButton } from '@/components/ui/shimmer-button';
import Link from 'next/link';

interface IndustryPageProps {
  params: {
    slug: string;
  };
}

// Generate static params for all industries
export async function generateStaticParams() {
  const slugs = getAllIndustrySlugs();
  return slugs.map((slug) => ({
    slug,
  }));
}

// Generate metadata for each industry page
export async function generateMetadata({ params }: IndustryPageProps): Promise<Metadata> {
  const industry = getIndustryData(params.slug);

  if (!industry) {
    return createMetadata({
      title: 'Industry Not Found',
    });
  }

  return createMetadata({
    title: industry.h1,
    description: industry.metaDescription,
    keywords: [
      `AI answering service for ${industry.name.toLowerCase()}`,
      `${industry.name.toLowerCase()} answering service`,
      `off-hours ${industry.name.toLowerCase()} calls`,
      `emergency ${industry.name.toLowerCase()} service`,
      `24/7 ${industry.name.toLowerCase()} answering`,
    ],
    openGraph: {
      title: industry.h1,
      description: industry.metaDescription,
    },
    twitter: {
      title: industry.h1,
      description: industry.metaDescription,
    },
  });
}

// Generate JSON-LD Service Schema
function generateServiceSchema(industry: ReturnType<typeof getIndustryData>) {
  if (!industry) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: `AI Answering Service for ${industry.displayName}`,
    description: industry.metaDescription,
    provider: {
      '@type': 'Organization',
      name: 'Afterhours',
      url: 'https://afterhourscoverage.com',
    },
    areaServed: {
      '@type': 'Country',
      name: 'United States',
    },
    serviceType: 'AI Voice Agent',
    offers: {
      '@type': 'Offer',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '127',
    },
  };
}

// Generate JSON-LD FAQ Schema
function generateFAQSchema(industry: ReturnType<typeof getIndustryData>) {
  if (!industry) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: industry.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

export default function IndustryPage({ params }: IndustryPageProps) {
  const industry = getIndustryData(params.slug);

  if (!industry) {
    notFound();
  }

  const serviceSchema = generateServiceSchema(industry);
  const faqSchema = generateFAQSchema(industry);

  return (
    <>
      {/* JSON-LD Schema Markup */}
      {serviceSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
        />
      )}
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      <div className="min-h-screen bg-background text-foreground">
        {/* Hero Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background to-muted/20">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold mb-6 leading-tight">
              {industry.h1}
            </h1>
            <p className="text-xl sm:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              {industry.metaDescription}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/">
                <ShimmerButton
                  className="text-lg px-8 py-6"
                  shimmerColor="#3b82f6"
                  background="rgba(59, 130, 246, 0.1)"
                >
                  Start Free Trial
                </ShimmerButton>
              </Link>
              <Link href="/pricing">
                <ShimmerButton
                  className="text-lg px-8 py-6"
                  shimmerColor="#8b5cf6"
                  background="rgba(139, 92, 246, 0.1)"
                >
                  View Pricing
                </ShimmerButton>
              </Link>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-semibold mb-12 text-center">
              Built Specifically for {industry.displayName}
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {industry.benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="p-6 rounded-xl border border-border/50 bg-card/40 backdrop-blur-xl hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center mt-1">
                      <svg
                        className="w-4 h-4 text-primary"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <p className="text-foreground leading-relaxed">{benefit}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Common Issues Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/20">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-semibold mb-8 text-center">
              Common {industry.name} Issues We Handle
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {industry.commonIssues.map((issue, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg border border-border/50 bg-card/40 backdrop-blur-xl text-center"
                >
                  <span className="text-foreground font-medium">{issue}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Comparison Table */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-semibold mb-12 text-center">
              Afterhours vs. Legacy Answering Services
            </h2>
            <ComparisonTable />
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/20">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-semibold mb-12 text-center">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              {industry.faqs.map((faq, index) => (
                <div
                  key={index}
                  className="p-6 rounded-xl border border-border/50 bg-card/40 backdrop-blur-xl"
                >
                  <h3 className="text-xl font-semibold mb-3 text-foreground">
                    {faq.question}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-semibold mb-6">
              Ready to Never Miss Another {industry.name} Call?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Start your free trial today. No credit card required.
            </p>
            <Link href="/">
              <ShimmerButton
                className="text-lg px-8 py-6"
                shimmerColor="#10b981"
                background="rgba(16, 185, 129, 0.1)"
              >
                Get Your Free AI Phone Number
              </ShimmerButton>
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
