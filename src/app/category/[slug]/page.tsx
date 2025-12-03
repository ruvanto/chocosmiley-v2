
// @/app/category/[slug]/page.tsx
import { client } from '@/lib/sanity';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import SearchClientPage from '@/app/search/search-client-page';
import type { StructuredFilter } from '@/types';
import { getTrendingSuggestions } from '@/app/actions';
import { Suspense } from 'react';

// Define the shape of a category item from the homepage
interface Category {
  _key: string;
  name: string;
  subtitle: string;
  slug: { current: string };
  imageUrl: string;
}

// Fetches the entire homepage document to find the category
async function getCategory(slug: string): Promise<Category | undefined> {
  const homepage = await client.fetch(`*[_type == "homepage"][0]{
    exploreCategories[]{
      _key,
      name,
      subtitle,
      slug,
      "imageUrl": image.asset->url
    }
  }`);
  
  if (!homepage || !homepage.exploreCategories) {
    return undefined;
  }
  
  return homepage.exploreCategories.find((cat: Category) => cat.slug?.current === slug);
}

// Generate dynamic metadata for the page
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const category = await getCategory(params.slug);

  if (!category) {
    return {
      title: 'Category Not Found | ChocoSmiley',
      description: 'The category you are looking for could not be found.',
    };
  }

  return {
    title: `${category.name} | ChocoSmiley`,
    description: category.subtitle,
    openGraph: {
      title: `${category.name} | ChocoSmiley`,
      description: category.subtitle,
      images: [
        {
          url: category.imageUrl || '/CS preview.png',
          width: 800,
          height: 600,
          alt: category.name,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${category.name} | ChocoSmiley`,
      description: category.subtitle,
      images: [category.imageUrl || '/CS preview.png'],
    },
    alternates: {
        canonical: `https://www.chocosmiley.com/category/${params.slug}`,
    },
  };
}


// Fetch filters from Sanity for the search client page
async function getFilters(): Promise<StructuredFilter[]> {
  const query = `{
    "categories": *[_type == "filterCategory"] | order(orderRank) {_id, title, "icon": icon.asset->url},
    "options": *[_type == "filterOption"]{_id, title, "categoryId": category->_id},
    "flavours": *[_type == "flavour"] | order(orderRank) {_id, "title": name}
  }`;

  try {
    const { categories, options, flavours } = await client.fetch(query);

    const sortedOptions = [...options].sort((a, b) => a.title.localeCompare(b.title));

    return categories.map((category: any) => {
      if (category.title === 'Flavours & Fillings') {
        return { ...category, options: flavours };
      }
      return {
        ...category,
        options: sortedOptions.filter((opt: any) => opt.categoryId === category._id),
      };
    });
  } catch (error) {
    console.error('Failed to fetch filter data:', error);
    return [];
  }
}


// The main page component
export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const category = await getCategory(params.slug);

  // If no category matches the slug, show the 404 page
  if (!category) {
    notFound();
  }

  // Pre-fetch filters and trending suggestions for the client page
  const filters = await getFilters();
  const trendingSuggestions = await getTrendingSuggestions();

  // JSON-LD for structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": `${category.name} Chocolates`,
    "description": category.subtitle,
    "url": `https://www.chocosmiley.com/category/${params.slug}`,
    "mainEntity": {
        "@type": "ItemList",
        "itemListElement": [] // Can be populated on the client if needed
    }
  };

  return (
    <>
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/*
            Instead of building a new UI, we can reuse the existing powerful SearchClientPage
            and simply pass the category name as the initial search query.
            This is efficient and maintains a consistent user experience.
        */}
        <Suspense>
            <SearchClientPage initialFilters={filters} trendingSuggestions={trendingSuggestions} />
        </Suspense>
    </>
  );
}
