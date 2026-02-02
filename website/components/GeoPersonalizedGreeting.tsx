'use client';

import { useGeoPersonalization } from '@/lib/geo-personalization';

interface GeoPersonalizedGreetingProps {
  industry?: string;
  className?: string;
}

export default function GeoPersonalizedGreeting({ 
  industry, 
  className = '' 
}: GeoPersonalizedGreetingProps) {
  const { getGreeting, isLoading } = useGeoPersonalization();

  if (isLoading) {
    return (
      <span className={className}>
        Answering calls for {industry || 'service trades'}
      </span>
    );
  }

  return <span className={className}>{getGreeting(industry)}</span>;
}
