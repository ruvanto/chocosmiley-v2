// @/app/admin/page.tsx
import { Suspense } from 'react';
import AdminClientPage from './admin-client-page';
import CustomScreenLoader from '@/components/custom-screen-loader';

export default async function AdminPage() {
    return (
        <Suspense fallback={<CustomScreenLoader text="Loading admin dashboar" />}>
            <AdminClientPage />
        </Suspense>
    );
}
