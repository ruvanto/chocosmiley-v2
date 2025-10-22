
// @/app/page.tsx
import { client } from '@/lib/sanity';
import { Suspense } from 'react';
import HomeClient from './home-client';
import CustomScreenLoader from '@/components/custom-screen-loader';
import { getTrendingSuggestions } from './actions';

export const revalidate = 300; // Revalidate this page at most every 300 seconds

interface HomepageContent {
  exploreCategories: { _key: string; name: string; subtitle: string; imageUrl: string }[];
  exploreFlavours: { _key: string; name: string; subtitle: string; imageUrl: string }[];
}

async function getHomepageContent(): Promise<HomepageContent> {
    const query = `*[_type == "homepage"][0]{
        exploreCategories[]{
            _key,
            name,
            subtitle,
            "imageUrl": image.asset->url
        },
        exploreFlavours[]{
            _key,
            name,
            subtitle,
            "imageUrl": image.asset->url
        }
    }`;
    const content = await client.fetch(query);
    return content || { exploreCategories: [], exploreFlavours: [] };
}

export default async function Home() {
    const homepageContent = await getHomepageContent();
    const trendingSuggestions = await getTrendingSuggestions();

    return (
        <Suspense fallback={<CustomScreenLoader />}>
            <HomeClient
                exploreCategories={homepageContent.exploreCategories}
                exploreFlavours={homepageContent.exploreFlavours}
                trendingSuggestions={trendingSuggestions}
            />
        </Suspense>
    );
}
