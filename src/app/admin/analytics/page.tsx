
// @/app/admin/analytics/page.tsx
import AnalyticsClientPage from './analytics-client-page';
import { client } from '@/lib/sanity';
import type { SanityProduct } from '@/types';

export default async function AnalyticsPage() {
    return (
        <AnalyticsClientPage />
    );
}
