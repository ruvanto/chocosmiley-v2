// src/app/sitemap.ts

import { client } from '@/lib/sanity';
import { MetadataRoute } from 'next'

type SanitySlug = {
  slug: {
    current: string;
  };
  _updatedAt: string;
}

// Helper interface for Homepage categories
interface HomepageCategory {
  exploreCategories: {
    slug: { current: string };
  }[];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.chocosmiley.com';

  // 1. Fetch Product Slugs
  const productSlugs: SanitySlug[] = await client.fetch(`*[_type == "product" && defined(slug.current)]{
    slug,
    _updatedAt
  }`);

  // 2. NEW: Fetch Category Slugs from Homepage
  const homepageCategories: HomepageCategory = await client.fetch(`*[_type == "homepage"][0]{
    exploreCategories[]{
      slug
    }
  }`);

  // Build Product URLs
  const productUrls = productSlugs.map(item => ({
    url: `${baseUrl}/product/${item.slug.current}`,
    lastModified: new Date(item._updatedAt).toISOString(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Build Category URLs
  const categoryUrls = (homepageCategories?.exploreCategories || []).map(cat => ({
    url: `${baseUrl}/category/${cat.slug.current}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Static Pages
  const staticUrls = [
    { 
      url: baseUrl, 
      lastModified: new Date().toISOString(), 
      changeFrequency: 'monthly' as const, 
      priority: 1.0 
    },
    { 
      url: `${baseUrl}/search`, 
      lastModified: new Date().toISOString(), 
      changeFrequency: 'weekly' as const, 
      priority: 0.7 
    },
    { 
      url: `${baseUrl}/about`, 
      lastModified: new Date().toISOString(), 
      changeFrequency: 'monthly' as const, 
      priority: 0.5 
    },
    { 
      url: `${baseUrl}/faq`, 
      lastModified: new Date().toISOString(), 
      changeFrequency: 'monthly' as const, 
      priority: 0.5 
    },
    { 
      url: `${baseUrl}/privacy`, 
      lastModified: new Date().toISOString(), 
      changeFrequency: 'yearly' as const, 
      priority: 0.3 
    },
    { 
      url: `${baseUrl}/terms`, 
      lastModified: new Date().toISOString(), 
      changeFrequency: 'yearly' as const, 
      priority: 0.3 
    },
  ];

  return [
    ...staticUrls,
    ...categoryUrls, // Add the categories here
    ...productUrls
  ];
}