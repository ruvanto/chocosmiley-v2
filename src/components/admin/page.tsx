
// @/app/admin/page.tsx
import { Suspense } from 'react';
import AdminClientPage from './admin-client-page';
import { AdminSkeleton } from '@/components/skeletons/admin-skeleton';

export default async function AdminPage() {
    return (
        <Suspense fallback={<AdminSkeleton />}>
            <AdminClientPage />
        </Suspense>
    );
}
