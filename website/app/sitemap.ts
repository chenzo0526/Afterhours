import { MetadataRoute } from 'next';
import { metadataBase } from '@/metadata';
import { getAllIndustrySlugs } from '@/lib/industry-data';

// Define static routes
const staticRoutes = [
  { path: '', priority: 1.0, changeFrequency: 'monthly' as const },
  { path: '/pricing', priority: 0.9, changeFrequency: 'monthly' as const },
  { path: '/how-it-works', priority: 0.8, changeFrequency: 'monthly' as const },
  { path: '/get-started', priority: 0.9, changeFrequency: 'monthly' as const },
  { path: '/privacy', priority: 0.3, changeFrequency: 'yearly' as const },
  { path: '/terms', priority: 0.3, changeFrequency: 'yearly' as const },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = metadataBase.toString().replace(/\/$/, '');

  const routes: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${baseUrl}${route.path}`,
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  // Add dynamic industry routes from industry-data
  const industrySlugs = getAllIndustrySlugs();
  const industryRoutesList: MetadataRoute.Sitemap = industrySlugs.map((slug) => ({
    url: `${baseUrl}/industries/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  return [...routes, ...industryRoutesList];
}
