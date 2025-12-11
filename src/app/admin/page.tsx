// @/app/admin/page.tsx
import { Suspense } from 'react';
import AdminClientPage from './admin-client-page';
import CustomScreenLoader from '@/components/loaders/custom-screen-loader';

export default async function AdminPage() {
    return (
        <Suspense fallback={<CustomScreenLoader text="Loading admin dashboard" />}>
            <AdminClientPage />
        </Suspense>
    );
}
