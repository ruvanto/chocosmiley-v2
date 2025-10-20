// @/components/skeletons/admin-skeleton.tsx
'use client';

import { Skeleton } from "@/components/ui/skeleton";
import { AdminOrderItemCardSkeleton } from "./admin-order-item-card-skeleton";
import { StaticSparkleBackground } from "../static-sparkle-background";

const HeaderSkeleton = () => (
    <header className="fixed top-0 z-50 w-full pt-4 md:pt-6 pb-4 md:pb-4 bg-background border-b border-white/20">
        <div className="container relative flex h-12 md:h-16 max-w-screen-2xl items-center justify-between px-4 sm:px-6 lg:px-8 xl:px-24">
            <div className="flex justify-start items-center gap-2 md:gap-4 lg:gap-8">
                <Skeleton className="h-8 w-28 sm:w-32 md:w-36 lg:w-44" />
                <Skeleton className="h-8 w-20 md:w-24 lg:w-32" />
            </div>
            <div className="hidden md:flex flex-1 justify-center items-center gap-4 lg:gap-8 px-4">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-16" />
            </div>
            <div className="flex justify-end items-center">
                <div className="hidden md:flex items-center gap-1">
                    <Skeleton className="h-9 w-28 rounded-full" />
                    <div className="h-6 w-px bg-foreground/50 mx-1 lg:mx-2" />
                    <div className="flex items-center gap-1 lg:gap-2">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-8 w-8 rounded-full" />
                    </div>
                     <div className="h-6 w-px bg-foreground/50 mx-1 lg:mx-2" />
                    <Skeleton className="h-9 w-9 rounded-full ml-1 lg:ml-2" />
                </div>
                <div className="md:hidden">
                    <Skeleton className="h-8 w-8" />
                </div>
            </div>
        </div>
    </header>
);

const AdminContentSkeleton = () => (
    <div className="px-4 md:px-16 lg:px-32 flex-grow flex flex-col min-h-0">
        <Skeleton className="w-full h-12 rounded-full mb-4" />
        <div className="flex-grow overflow-y-auto no-scrollbar pb-4 space-y-4">
            <AdminOrderItemCardSkeleton />
            <AdminOrderItemCardSkeleton />
            <AdminOrderItemCardSkeleton />
            <AdminOrderItemCardSkeleton />
        </div>
    </div>
);

export function AdminSkeleton() {
    return (
        <div className="flex flex-col h-screen bg-background">
            <StaticSparkleBackground />
            <HeaderSkeleton />
            <main className="flex flex-col flex-grow min-h-0 pt-24 md:pt-32">
                <AdminContentSkeleton />
            </main>
        </div>
    )
}
