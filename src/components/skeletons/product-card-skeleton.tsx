// @/components/skeletons/product-card-skeleton.tsx
import { Skeleton } from "@/components/ui/skeleton";

export function ProductCardSkeleton() {
  return (
    <div className="relative w-full h-full bg-white/90 rounded-2xl overflow-hidden flex flex-col shadow-lg">
      {/* Image Section */}
      <div className="relative w-full pt-[80%] overflow-hidden">
        <div className="absolute inset-0">
          <Skeleton className="w-full h-full" />
        </div>
      </div>
      
      {/* Details Section */}
      <div className="flex flex-col p-2 md:p-3 flex-grow">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2 mt-1" />
        
        <div className="flex-grow"></div>

        {/* Price & Buttons */}
        <div className="mt-2">
            {/* Mobile Layout Skeleton */}
            <div className="md:hidden">
              <div className="flex flex-col items-start gap-2">
                <div className="flex flex-col w-1/2 gap-1">
                   <Skeleton className="h-3 w-1/2" />
                   <Skeleton className="h-4 w-3/4" />
                </div>
                <Skeleton className="w-full h-7 rounded-xl" />
              </div>
            </div>

            {/* Desktop Layout Skeleton */}
            <div className="hidden md:flex justify-between items-center">
              <div className="flex flex-col gap-1 w-1/2">
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-5 w-3/4" />
              </div>
              <Skeleton className="h-9 w-9 rounded-full" />
            </div>
        </div>
      </div>
    </div>
  );
}
