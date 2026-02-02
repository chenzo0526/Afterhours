import { MetadataRoute } from 'next';
import { metadataBase } from '@/metadata';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = metadataBase.toString().replace(/\/$/, '');
  
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/v2-preview/', '/app_v2/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
