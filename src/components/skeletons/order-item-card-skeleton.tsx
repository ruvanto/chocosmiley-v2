// @/components/skeletons/order-item-card-skeleton.tsx
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "../ui/separator";

export function OrderItemCardSkeleton({ }: { isMobile?: boolean }) {
    return (
        <div 
            className="bg-white/80 p-3 md:p-4 text-black w-full relative overflow-hidden rounded-xl md:rounded-2xl shadow-md text-left flex flex-col"
        >
            <div className="flex flex-col gap-2 mb-2">
                <div className="flex items-center overflow-x-auto no-scrollbar gap-2 pb-1">
                    {[...Array(3)].map((_, index) => (
                         <Skeleton key={index} className="relative flex-shrink-0 w-14 h-14 md:w-16 md:h-16 rounded-xl" />
                    ))}
                </div>

                <div className="self-start">
                   <Skeleton className="h-5 w-24 rounded-full" />
                </div>
                
                <div className="flex justify-between items-center w-full">
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="h-6 w-20" />
                </div>
            </div>
            
            <Separator className="bg-custom-purple-dark/20" />

            <div className="flex items-center justify-between mt-2">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-24" />
            </div>
        </div>
    );
}
