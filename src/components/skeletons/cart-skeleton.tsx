// @/components/skeletons/cart-skeleton.tsx
'use client';

import { Skeleton } from "@/components/ui/skeleton";
import { StaticSparkleBackground } from "../static-sparkle-background";

const HeaderSkeleton = () => (
    <header className="fixed top-0 z-50 w-full bg-background h-20 flex items-center justify-between px-4 border-b border-white/20">
        <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-28" />
            <Skeleton className="h-8 w-20" />
        </div>
        <Skeleton className="h-8 w-8" />
    </header>
);

const CartContentSkeleton = () => (
    <div className="p-4 flex flex-col flex-grow">
        <div className="bg-white/20 rounded-2xl flex flex-col flex-grow">
            <div className="flex justify-between items-center p-4 border-b border-black/10 flex-shrink-0">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-8 w-24 rounded-full" />
            </div>
            <div className="overflow-y-auto no-scrollbar p-4 space-y-4">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex gap-3">
                        <Skeleton className="w-1/4 h-20 rounded-lg flex-shrink-0" />
                        <div className="w-3/4 space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-2/3" />
                            <Skeleton className="h-5 w-1/3" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);


export function CartSkeleton() {
    return (
        <div className="flex flex-col h-screen bg-background">
            <div className="md:hidden">
              <StaticSparkleBackground />
              <HeaderSkeleton />
            </div>
            <main className="flex flex-col flex-grow min-h-0 pt-20">
              <div className="md:hidden">
                <CartContentSkeleton />
              </div>
              <div className="hidden md:flex items-center justify-center h-full">
                <Skeleton className="w-96 h-96" />
              </div>
            </main>
        </div>
    )
}
