// @/components/skeletons/account-skeleton.tsx
'use client';

import { Skeleton } from "@/components/ui/skeleton";
import { StaticSparkleBackground } from '../static-sparkle-background';
import { SparkleBackground } from '../sparkle-background';

const HeaderSkeleton = () => (
    <header className="fixed top-0 z-50 w-full bg-background h-20 flex items-center justify-between px-4 border-b border-white/20 md:hidden">
        <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-28" />
            <Skeleton className="h-8 w-20" />
        </div>
        <Skeleton className="h-8 w-8" />
    </header>
);

const TabSkeleton = () => (
    <div className="flex-shrink-0 border-b border-white/20 sticky top-20 bg-background z-10">
        <div className="flex justify-around">
            <div className="py-2 px-2 w-full flex justify-center"><Skeleton className="h-5 w-20" /></div>
            <div className="py-2 px-2 w-full flex justify-center"><Skeleton className="h-5 w-20" /></div>
            <div className="py-2 px-2 w-full flex justify-center"><Skeleton className="h-5 w-20" /></div>
        </div>
    </div>
);

const ProfileContentSkeleton = () => (
    <div className="p-4 space-y-4">
        {/* Avatar and Name */}
        <div className="bg-white/10 p-4 rounded-xl flex items-center gap-4">
            <Skeleton className="w-16 h-16 rounded-full" />
            <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-40" />
            </div>
        </div>
        
        {/* Profile Section Card */}
        <div className="bg-white/10 p-4 rounded-xl space-y-4">
            <div className="flex items-center gap-3 mb-3">
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-5 w-24" />
            </div>
            <div className="space-y-4">
                <div className="space-y-1">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-11 w-full rounded-lg" />
                </div>
                 <div className="space-y-1">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-11 w-full rounded-lg" />
                </div>
            </div>
        </div>

        {/* Another Profile Section Card */}
        <div className="bg-white/10 p-4 rounded-xl space-y-4">
            <div className="flex items-center gap-3 mb-3">
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-5 w-32" />
            </div>
            <div className="space-y-4">
                <div className="space-y-1">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-24 w-full rounded-lg" />
                </div>
            </div>
        </div>
    </div>
);

const DesktopSkeleton = () => (
    <div className="flex flex-col h-screen bg-background">
        <SparkleBackground />
        <Skeleton className="fixed top-0 z-50 w-full h-24" />
        <main className="flex-grow flex items-center justify-center pt-24">
            <Skeleton className="w-48 h-10" />
        </main>
    </div>
);


export function AccountSkeleton() {
    return (
        <div className="flex flex-col h-screen bg-background">
            <div className="md:hidden">
              <StaticSparkleBackground />
              <HeaderSkeleton />
            </div>
            <div className="hidden md:block">
              <DesktopSkeleton />
            </div>

            <main className="flex flex-col flex-grow min-h-0 pt-20 md:pt-0">
                 <div className="md:hidden">
                    <TabSkeleton />
                    <div className="flex-grow overflow-y-auto no-scrollbar pt-6">
                        <ProfileContentSkeleton />
                    </div>
                 </div>
            </main>
        </div>
    )
}
