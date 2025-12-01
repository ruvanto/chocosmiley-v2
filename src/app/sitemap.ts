// src/app/sitemap.ts

import { client } from '@/lib/sanity';
import { MetadataRoute } from 'next' // Make sure this path is correct

type SanitySlug = {
  slug: {
    current: string;
  };
  _updatedAt: string;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://chocosmiley.com';

  // Get all product slugs from Sanity
  const productSlugs: SanitySlug[] = await client.fetch(`*[_type == "product" && defined(slug.current)]{
    slug,
    _updatedAt
  }`);
  
  const productUrls = productSlugs.map(item => ({
    url: `${baseUrl}/product/${item.slug.current}`,
    lastModified: new Date(item._updatedAt).toISOString(),
    changeFrequency: 'weekly' as 'weekly',
    priority: 0.8,
  }));

  // Add your static pages
  const staticUrls = [
    { 
      url: baseUrl, 
      lastModified: new Date().toISOString(), 
      changeFrequency: 'monthly' as 'monthly', 
      priority: 1.0 
    },
    { 
      url: `${baseUrl}/search`, 
      lastModified: new Date().toISOString(), 
      changeFrequency: 'weekly' as 'weekly', 
      priority: 0.7 
    },
    { 
      url: `${baseUrl}/about`, 
      lastModified: new Date().toISOString(), 
      changeFrequency: 'monthly' as 'monthly', 
      priority: 0.5 
    },
    { 
      url: `${baseUrl}/faq`, 
      lastModified: new Date().toISOString(), 
      changeFrequency: 'monthly' as 'monthly', 
      priority: 0.5 
    },
    { 
      url: `${baseUrl}/privacy`, 
      lastModified: new Date().toISOString(), 
      changeFrequency: 'yearly' as 'yearly', 
      priority: 0.3 
    },
    { 
      url: `${baseUrl}/terms`, 
      lastModified: new Date().toISOString(), 
      changeFrequency: 'yearly' as 'yearly', 
      priority: 0.3 
    },
  ];

  return [
    ...staticUrls,
    ...productUrls
  ];
}