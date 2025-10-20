// @/components/skeletons/home-skeleton.tsx

import { Skeleton } from "@/components/ui/skeleton";

const HeaderSkeleton = () => (
    <header className="fixed top-0 z-50 w-full pt-4 md:pt-6 pb-4 md:pb-4 bg-background">
        <div className="container relative flex h-12 md:h-16 max-w-screen-2xl items-center justify-between px-4 sm:px-6 lg:px-8 xl:px-24">
            {/* Left side */}
            <div className="flex justify-start items-center gap-2 md:gap-4 lg:gap-8">
                <Skeleton className="h-8 w-28 sm:w-32 md:w-36 lg:w-44" />
                <Skeleton className="h-8 w-20 md:w-24 lg:w-32" />
            </div>

            {/* Center Nav (Desktop) */}
            <div className="hidden md:flex flex-1 justify-center items-center gap-4 lg:gap-8 px-4">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-16" />
            </div>

            {/* Right side */}
            <div className="flex justify-end items-center">
                {/* Desktop User Actions */}
                <div className="hidden md:flex items-center gap-1">
                    <Skeleton className="h-9 w-28 rounded-full" />
                    <div className="h-6 w-px bg-foreground/50 mx-1 lg:mx-2" />
                    <div className="flex items-center gap-1 lg:gap-2">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-8 w-8 rounded-full" />
                    </div>
                    <Skeleton className="h-9 w-9 rounded-full ml-1 lg:ml-2" />
                </div>
                 {/* Mobile User Actions */}
                <div className="md:hidden">
                    <Skeleton className="h-8 w-8" />
                </div>
            </div>
        </div>
    </header>
);

const SearchBarSkeleton = () => (
     <div className="container max-w-screen-2xl px-8 md:px-12 mt-6 md:mt-16">
        <Skeleton className="h-9 md:h-11 rounded-full mx-auto max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl" />
    </div>
);

const CategoriesSkeleton = () => (
    <div className="bg-[#5D2B79] h-full rounded-t-[25px] md:rounded-t-[40px] mx-4 md:mx-32">
        <div className="bg-white/20 h-full rounded-t-[25px] md:rounded-t-[40px] px-4 md:px-12 py-4 md:py-6 flex flex-col">
            {/* Explore Categories */}
            <Skeleton className="h-6 w-48 mb-4 md:mb-6 self-center md:self-start" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                <Skeleton className="w-full aspect-[5/6] rounded-[20px] md:rounded-[40px]" />
                <Skeleton className="w-full aspect-[5/6] rounded-[20px] md:rounded-[40px]" />
                <Skeleton className="w-full aspect-[5/6] rounded-[20px] md:rounded-[40px] hidden md:block" />
                <Skeleton className="w-full aspect-[5/6] rounded-[20px] md:rounded-[40px] hidden md:block" />
            </div>

             {/* Explore Flavours */}
            <Skeleton className="h-6 w-48 mt-6 mb-4 md:mb-6 self-center md:self-start" />
            <div className="flex flex-row gap-4 overflow-hidden">
                <Skeleton className="w-24 h-24 md:w-32 md:h-32 flex-shrink-0 aspect-square rounded-[20px] md:rounded-[40px]" />
                <Skeleton className="w-24 h-24 md:w-32 md:h-32 flex-shrink-0 aspect-square rounded-[20px] md:rounded-[40px]" />
                <Skeleton className="w-24 h-24 md:w-32 md:h-32 flex-shrink-0 aspect-square rounded-[20px] md:rounded-[40px]" />
                <Skeleton className="w-24 h-24 md:w-32 md:h-32 flex-shrink-0 aspect-square rounded-[20px] md:rounded-[40px] hidden sm:block" />
            </div>
        </div>
    </div>
);


export function HomeSkeleton() {
    return (
        <div className="flex flex-col h-screen bg-background">
            <HeaderSkeleton />
            <main className="flex flex-col items-center justify-start flex-grow min-h-0 pb-16 md:pb-0 pt-20 md:pt-30">
                 <div className='w-full'>
                    <SearchBarSkeleton />
                 </div>
                 <div className="mt-8 md:mt-20 w-full flex-grow min-h-0">
                    <CategoriesSkeleton />
                 </div>
            </main>
        </div>
    )
}
