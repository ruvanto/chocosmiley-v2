// @/components/skeletons/admin-order-item-card-skeleton.tsx
import { Skeleton } from "@/components/ui/skeleton";

export function AdminOrderItemCardSkeleton() {
    return (
        <div className="w-full bg-white/10 p-4 rounded-2xl border border-white/20">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                {/* Customer & Order Info */}
                <div className="md:col-span-1 space-y-1.5">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-3 w-1/3" />
                </div>

                {/* Items Summary */}
                <div className="md:col-span-2 space-y-1">
                    <Skeleton className="h-4 w-4/5" />
                    <Skeleton className="h-4 w-3/5" />
                </div>

                {/* Total & Status */}
                <div className="md:col-span-1 flex md:flex-col justify-between items-center md:items-end gap-2">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-5 w-28 rounded-full" />
                </div>
            </div>
        </div>
    )
}
