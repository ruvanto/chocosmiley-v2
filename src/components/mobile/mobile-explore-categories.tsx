
// @/components/mobile/mobile-explore-categories.tsx
'use client';

import Image from "next/image";
import { SectionTitle } from "../section-title";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/context/app-context";
import React from "react";
import { Separator } from "../ui/separator";

interface ExploreItem {
  _key: string;
  name: string;
  subtitle: string;
  imageUrl: string;
}

interface ExploreCategoriesProps {
  exploreCategories: ExploreItem[];
  exploreFlavours: ExploreItem[];
}

const CategoryCard = ({ category }: { category: ExploreItem }) => {
    const router = useRouter();
    const { setIsGlobalLoading } = useAppContext();

    const handleCategoryClick = (categoryName: string) => {
        setIsGlobalLoading(true);
        router.push(`/search?q=${encodeURIComponent(categoryName)}`);
    };

    return (
        <div
            key={category._key}
            className="w-full aspect-[5/6] relative cursor-pointer"
            onClick={() => handleCategoryClick(category.name)}
        >
            <Image
                src={category.imageUrl}
                alt={category.name}
                width={600}
                height={400}
                className="w-full h-full object-cover rounded-[20px] ring-1 ring-custom-purple-dark"
                onDragStart={(e) => e.preventDefault()}
                priority
            />
            <div 
                className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent rounded-[20px]"
            ></div>
            
            <div
                className="absolute inset-x-0 bottom-2 flex flex-col px-3 items-start"
            >
                <div
                    className="flex items-center justify-center gap-1"
                >
                    <h3 className="text-white text-sm font-plex-sans font-semibold [text-shadow:0_2px_1px_rgba(0,0,0,1)] leading-tight">
                        {category.name}
                    </h3>
                </div>
                
                <p
                    className="text-white/80 font-light text-[10px] [text-shadow:0_1px_1px_rgba(0,0,0,1)]"
                >
                    {category.subtitle}
                </p>
            </div>
        </div>
    );
};


export function MobileExploreCategories({ exploreCategories, exploreFlavours }: ExploreCategoriesProps) {
  const router = useRouter();
  const { setIsGlobalLoading } = useAppContext();

  const handleFlavourClick = (flavourName: string) => {
    setIsGlobalLoading(true);
    router.push(`/search?q=${encodeURIComponent(flavourName)}`);
  }
  
  return (
    <div 
      className="bg-[#5D2B79] h-full rounded-t-[25px] mx-4"
    >
        <div className="bg-white/20 h-full rounded-t-[25px] px-4 flex flex-col">
            <div className="flex-col overflow-y-auto no-scrollbar h-full">
                <SectionTitle className="flex justify-center text-lg pt-4 mb-2">
                    Explore Categories
                </SectionTitle>
                <div 
                    className="grid grid-cols-2 flex-1 justify-around items-center gap-4 pt-1 pb-6 px-2"
                >
                    {(exploreCategories || []).map((category) => (
                        <CategoryCard key={category._key} category={category} />
                    ))}
                </div>

                <SectionTitle className="flex justify-center text-lg mb-2">
                    Explore Flavours
                </SectionTitle>
                <div 
                    className="flex flex-row overflow-x-auto no-scrollbar flex-1 items-center gap-4 px-2 pb-6 pt-1"
                >
                    {(exploreFlavours || []).map((flavour, index) => (
                    <div 
                        key={flavour._key} 
                        className="w-24 flex-shrink-0 aspect-square relative group cursor-pointer" 
                        onClick={() => handleFlavourClick(flavour.name)}
                    >
                        <Image
                        src={flavour.imageUrl}
                        alt={flavour.name}
                        width={400}
                        height={400}
                        className="w-full h-full object-cover rounded-[20px] ring-1 ring-custom-purple-dark"
                        onDragStart={(e) => e.preventDefault()}
                        priority={index < 2}
                        />
                         <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent rounded-[20px]"></div>
                        <div className="absolute inset-x-0 bottom-2 flex items-end justify-center">
                            <h3 className="text-white text-xs text-center font-plex-sans font-semibold [text-shadow:0_2px_1px_rgba(0,0,0,1)]">{flavour.name}</h3>
                        </div>
                    </div>
                    ))}
                </div>
                <Separator className="flex justify-center bg-white/50" />
                <SectionTitle className="flex justify-center font-body font-normal text-custom-gold text-xs md:text-base lg:text-lg mt-3 mb-3">
                “Handcrafted with love, just for you”
                </SectionTitle>
            </div>
        </div>
    </div>
  );
}
