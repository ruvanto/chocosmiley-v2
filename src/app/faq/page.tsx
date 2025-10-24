
// @/app/faq/page.tsx
import { Suspense } from 'react';
import { client } from '@/lib/sanity';
import { LoadingFallback } from '@/components/loading-fallback';
import FaqPageClient from './faq-client-page';
import type { FaqItem } from '@/app/faq/faq-content';

// Fetch the data from Sanity - This remains a server-side function
async function getFaqData(): Promise<FaqItem[]> {
  const query = `*[_type == "faq"] | order(_createdAt asc)`;
  try {
    const data = await client.fetch(query);
    return data;
  } catch (error) {
    console.error("Failed to fetch FAQ data:", error);
    return []; // Return an empty array on error
  }
}

export default async function FaqPage() {
    const faqData = await getFaqData();

    return (
        <Suspense fallback={<LoadingFallback text="Loading FAQ..." />}>
            <FaqPageClient faqData={faqData} />
        </Suspense>
    );
}
