
// src/app/search/page.tsx
import { client } from '@/lib/sanity';
import SearchClientPage from '@/app/search/search-client-page';
import type { StructuredFilter } from '@/types';
import { getTrendingSuggestions } from '../actions';
import { Suspense } from 'react';

export const revalidate = 300; // Revalidate this page at most every 300 seconds

// Fetch filters from Sanity
async function getFilters(): Promise<StructuredFilter[]> {
  const query = `{
    "categories": *[_type == "filterCategory"] | order(orderRank) {_id, title, "icon": icon.asset->url},
    "options": *[_type == "filterOption"]{_id, title, "categoryId": category->_id},
    "flavours": *[_type == "flavour"] | order(orderRank) {_id, "title": name}
  }`;

  try {
    const { categories, options, flavours } = await client.fetch(query);

    // Sort regular options alphabetically, but keep flavours in their manual order
    const sortedOptions = [...options].sort((a, b) => a.title.localeCompare(b.title));

    return categories.map((category: any) => {
      if (category.title === 'Flavours & Fillings') {
        // Use the manually sorted flavours from the query
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

export default async function SearchPage({ searchParams }: { searchParams?: { [key: string]: string | string[] | undefined } }) {
  const filters = await getFilters();
  const trendingSuggestions = await getTrendingSuggestions();
  const initialQuery = searchParams?.q as string || '';

  return (
    <Suspense>
        <SearchClientPage 
          initialFilters={filters} 
          trendingSuggestions={trendingSuggestions}
          initialQuery={initialQuery}
        />
    </Suspense>
  );
}
