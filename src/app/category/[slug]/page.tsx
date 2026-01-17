// @/app/category/[slug]/page.tsx
import { client } from '@/lib/sanity';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import SearchClientPage from '@/app/search/search-client-page';
import type { SanityProduct, StructuredFilter } from '@/types';
import { getTrendingSuggestions } from '@/app/actions';
import { Suspense } from 'react';

export const dynamic = 'force-dynamic';

// Define the shape of a category item from the homepage
interface Category {
  _key: string;
  name: string;
  subtitle: string;
  slug: { current: string };
  imageUrl: string;
}

// Fetches the entire homepage document from Sanity to find the details of a specific category by its slug.
async function getCategory(slug: string): Promise<Category | undefined> {
  // Fetch the 'exploreCategories' array from the single 'homepage' document.
  const homepage = await client.fetch(`*[_type == "homepage"][0]{
    exploreCategories[]{
      _key,
      name,
      subtitle,
      slug,
      "imageUrl": image.asset->url
    }
  }`);
  
  // Return undefined if the homepage or its categories are not found.
  if (!homepage || !homepage.exploreCategories) {
    return undefined;
  }
  
  // Find the specific category that matches the provided slug.
  return homepage.exploreCategories.find((cat: Category) => cat.slug?.current === slug);
}

// Fetches an initial batch of products for Server-Side Rendering (SSR) to improve SEO.
async function getInitialProducts(term: string): Promise<SanityProduct[]> {
    // Return empty if there's no search term.
    if (!term) return [];

    // GROQ query to find products matching the term in name, bestFor, or tags.
    // It orders them by creation date and limits to the first 8 results.
    const query = `
      *[_type == "product" && (
        lower(name) match "*${term.toLowerCase()}*" || 
        lower(bestFor) match "*${term.toLowerCase()}*" || 
        tags[] match "*${term.toLowerCase()}*"
      )] | order(_createdAt desc)[0...8] {
        _id, name, slug, mrp, discountedPrice, weight, packageType, composition, isOutOfStock, 
        "images": images[].asset->url,
        "availableFlavours": availableFlavours[]-> | order(orderRank) { _id, name, "imageUrl": image.asset->url, "price": coalesce(price, 0) },
        numberOfChocolates, bestFor, "tags": tags[].value
      }`;
    
    try {
        // Execute the query.
        const products = await client.fetch(query);
        return products;
    } catch (error) {
        // Log errors and return an empty array on failure.
        console.error("Failed to fetch initial products:", error);
        return [];
    }
}

// Generates dynamic metadata for the page based on the category slug. This is crucial for SEO.
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  // Fetch category details.
  const category = await getCategory(params.slug);

  // If the category doesn't exist, return metadata for a "Not Found" page.
  if (!category) {
    return {
      title: 'Category Not Found | ChocoSmiley',
      description: 'The category you are looking for could not be found.',
    };
  }

  // If the category is found, generate rich metadata for social sharing and search engines.
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


// Fetches and structures the filter data (categories, options, flavours) from Sanity.
async function getFilters(): Promise<StructuredFilter[]> {
  const query = `{
    "categories": *[_type == "filterCategory"] | order(orderRank) {_id, title, "icon": icon.asset->url},
    "options": *[_type == "filterOption"]{_id, title, "categoryId": category->_id},
    "flavours": *[_type == "flavour"] | order(orderRank) {_id, "title": name}
  }`;

  try {
    const { categories, options, flavours } = await client.fetch(query);

    // Sort options alphabetically for a consistent user experience.
    const sortedOptions = [...options].sort((a, b) => a.title.localeCompare(b.title));

    // Map the fetched data into a structured format for the filter UI.
    return categories.map((category: any) => {
      // Special handling for 'Flavours & Fillings' to use the specific flavour data.
      if (category.title === 'Flavours & Fillings') {
        return { ...category, options: flavours };
      }
      // Assign the corresponding options to each filter category.
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


// The main page component for a category page. It's a server component.
export default async function CategoryPage({ params }: { params: { slug: string } }) {
  // Fetch the category data based on the slug from the URL.
  const category = await getCategory(params.slug);

  // If no category matches the slug, render the 404 page.
  if (!category) {
    notFound();
  }

  // Pre-fetch all necessary data in parallel for performance.
  const [filters, trendingSuggestions, initialProducts] = await Promise.all([
    getFilters(),
    getTrendingSuggestions(),
    getInitialProducts(category.name), // Fetch initial products for SSR.
  ]);

  // Define JSON-LD structured data for rich search results.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": `${category.name} Chocolates`,
    "description": category.subtitle,
    "url": `https://www.chocosmiley.com/category/${params.slug}`,
    "mainEntity": {
        "@type": "ItemList",
        "itemListElement": [] // Can be populated on the client if needed for more detailed schema.
    }
  };

  return (
    <>
        {/* Inject the JSON-LD script into the page head. */}
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/*
            Instead of building a new UI, we reuse the existing powerful SearchClientPage.
            We pass the category name as the initial search query, which is an efficient
            way to maintain a consistent user experience.
        */}
        <Suspense>
            <SearchClientPage 
              initialFilters={filters} 
              trendingSuggestions={trendingSuggestions} 
              initialQuery={category.name}
              initialProducts={initialProducts} // Pass the server-fetched products to the client component.
            />
        </Suspense>
    </>
  );
}
