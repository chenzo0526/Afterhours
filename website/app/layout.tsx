import type { Metadata } from 'next';
import './globals.css';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

export const metadata: Metadata = {
  title: 'Afterhours',
  description:
    'After-hours call intake for local service businesses. Capture details and notify your on-call contact.',
  keywords: [
    'after-hours call intake',
    'plumbing after-hours calls',
    'HVAC after-hours calls',
    'electrical after-hours calls',
    'local service business',
    'call summaries',
    'on-call notification',
    'overflow call intake',
  ],
  openGraph: {
    title: 'Afterhours',
    description:
      'After-hours call intake for local service businesses. Capture details and notify your on-call contact.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Afterhours',
    description:
      'After-hours call intake for local service businesses. Capture details and notify your on-call contact.',
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
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
