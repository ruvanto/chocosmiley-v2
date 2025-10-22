// @/components/skeletons/faq-skeleton.tsx
'use client';

import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";
import { StaticSparkleBackground } from "../static-sparkle-background";
import { SparkleBackground } from "../sparkle-background";

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
            </div>
            <div className="flex justify-end items-center">
                <div className="hidden md:flex items-center gap-1">
                    <Skeleton className="h-9 w-9 rounded-full" />
                    <div className="h-6 w-px bg-foreground/50 mx-1 lg:mx-2" />
                    <Skeleton className="h-9 w-28 rounded-full" />
                    <div className="h-6 w-px bg-foreground/50 mx-1 lg:mx-2" />
                    <div className="flex items-center gap-1 lg:gap-2">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-8 w-8 rounded-full" />
                    </div>
                    <Skeleton className="h-9 w-9 rounded-full ml-1 lg:ml-2" />
                </div>
                <div className="md:hidden">
                    <Skeleton className="h-8 w-8" />
                </div>
            </div>
        </div>
    </header>
);

const FaqContentSkeleton = () => (
    <div className="bg-[#5D2B79] rounded-[20px] md:rounded-[40px] mt-8 mb-8 mx-4 md:mx-32 flex flex-col flex-grow">
      <div className="bg-white/10 rounded-[20px] md:rounded-[40px] py-8 px-4 md:py-10 md:px-24 flex-grow">
        <Skeleton className="h-8 md:h-10 w-3/4 md:w-1/2 mx-auto mb-8 md:mb-12" />
        
        <div className="max-w-4xl mx-auto space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
);

export function FaqSkeleton() {
    const isMobile = useIsMobile();
    
    return (
        <div className="flex flex-col h-screen bg-background">
            {isMobile ? <StaticSparkleBackground /> : <SparkleBackground />}
            <HeaderSkeleton />
            <main className="flex flex-col flex-grow min-h-0 pt-24 md:pt-32">
                 <div className="flex-grow overflow-y-auto no-scrollbar">
                    <FaqContentSkeleton />
                 </div>
            </main>
        </div>
    )
}
