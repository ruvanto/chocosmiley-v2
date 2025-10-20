
// @/app/order-confirmed/page.tsx
import { Suspense } from 'react';
import OrderConfirmedClientPage from './order-confirmed-client-page';

export default function OrderConfirmedPage() {
    return (
        <Suspense>
            <OrderConfirmedClientPage />
        </Suspense>
    );
}
