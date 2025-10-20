
// @/app/my-orders/page.tsx
'use client';

import { MyOrdersTab } from "@/components/my-orders-tab";
import { useIsMobile } from "@/hooks/use-mobile";

export default function MyOrdersPage() {
    const isMobile = useIsMobile();
    return (
        <MyOrdersTab isMobile={isMobile} />
    );
}
