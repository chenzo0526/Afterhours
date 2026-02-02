'use client';

import { useEffect, useState } from 'react';

interface GeoData {
  city: string | null;
  region: string | null;
  country: string | null;
}

export function useGeoPersonalization() {
  const [geoData, setGeoData] = useState<GeoData>({
    city: null,
    region: null,
    country: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get geo data from cookies (set by middleware)
    const getCookie = (name: string): string | null => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
      return null;
    };

    const city = getCookie('city');
    const region = getCookie('region');
    const country = getCookie('country');

    setGeoData({ city, region, country });
    setIsLoading(false);
  }, []);

  const getGreeting = (industry?: string): string => {
    if (isLoading || !geoData.city) {
      return industry ? `Answering calls for ${industry}` : 'Answering calls for service trades';
    }

    const location = geoData.city;
    const industryText = industry ? `${location} ${industry}` : `${location} service businesses`;

    return `Answering calls for ${industryText}`;
  };

  return {
    ...geoData,
    isLoading,
    getGreeting,
  };
}
