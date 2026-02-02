import { Metadata } from 'next';

export const metadataBase = new URL('https://afterhourscoverage.com');

export const defaultMetadata: Metadata = {
  metadataBase,
  title: {
    template: '%s | Afterhours',
    default: 'Afterhours',
  },
  description:
    'AI call handling for home services. Missed calls outside business hours? Emergency call triage, on-call alerts, morning report. Stop losing calls when closed. Plumbers, HVAC, electrical, restoration.',
  keywords: [
    'missed calls outside business hours',
    'AI call handling for home services',
    'emergency call triage',
    'stop losing calls when closed',
    'call answering when office closed',
    'off-hours call handling',
    'plumbing HVAC electrical call answering',
    'on-call notification',
    'automated call handling',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Afterhours',
    title: 'Afterhours',
    description:
      'AI call handling for home services. Missed calls outside business hours? Emergency call triage, on-call alerts, morning report. Stop losing calls when closed.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Afterhours',
    description:
      'AI call handling for home services. Missed calls outside business hours? Emergency call triage, on-call alerts, morning report. Stop losing calls when closed.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
      { url: '/favicon.ico' },
    ],
    shortcut: '/favicon.ico',
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
  },
};

/**
 * Helper function to create page-specific metadata
 */
export function createMetadata(overrides: Partial<Metadata> = {}): Metadata {
  return {
    ...defaultMetadata,
    ...overrides,
    title: overrides.title
      ? typeof overrides.title === 'string'
        ? overrides.title
        : { ...(typeof defaultMetadata.title === 'object' && defaultMetadata.title !== null ? defaultMetadata.title : {}), ...overrides.title }
      : defaultMetadata.title,
    openGraph: overrides.openGraph
      ? { ...defaultMetadata.openGraph!, ...overrides.openGraph }
      : defaultMetadata.openGraph,
    twitter: overrides.twitter
      ? { ...defaultMetadata.twitter!, ...overrides.twitter }
      : defaultMetadata.twitter,
  };
}
