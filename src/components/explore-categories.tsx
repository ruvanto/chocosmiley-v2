
'use client';

import Image from "next/image";
import { SectionTitle } from "./section-title";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/context/app-context";
import { Separator } from "./ui/separator";
import { ChevronRight } from "lucide-react";
import React from "react";
import { cn } from "@/lib/utils";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
    },
  },
};

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

const textContainerVariants = {
    initial: { alignItems: "center" },
    hover: { alignItems: "flex-start" },
};

const titleVariants = {
    initial: { y: 12 },
    hover: { y: -8 },
};

const subtitleVariants = {
    initial: { opacity: 0, y: 10 },
    hover: { opacity: 1, y: 0, transition: { delay: 0.1 } },
};

const chevronVariants = {
    initial: { opacity: 0, x: -5, width: 0 },
    hover: { opacity: 1, x: 0, width: "auto", transition: { delay: 0.1 } },
};

const overlayVariants = {
    initial: { opacity: 0 },
    hover: { opacity: 1, transition: { duration: 0.3 } },
}

const CategoryCard = ({ category }: { category: ExploreItem }) => {
    const router = useRouter();
    const { setIsGlobalLoading } = useAppContext();

    const handleCategoryClick = (categoryName: string) => {
        setIsGlobalLoading(true);
        router.push(`/search?q=${encodeURIComponent(categoryName)}`);
    };

    return (
        <motion.div
            key={category._key}
            className="w-full aspect-[5/6] relative cursor-pointer"
            variants={itemVariants}
            onClick={() => handleCategoryClick(category.name)}
            initial="initial"
            whileHover={"hover"}
            animate={"initial"}
        >
            <Image
                src={category.imageUrl}
                alt={category.name}
                width={600}
                height={400}
                className="w-full h-full object-cover rounded-[20px] md:rounded-[30px] lg:rounded-[40px] ring-1 ring-custom-purple-dark"
                onDragStart={(e) => e.preventDefault()}
                priority
            />
            <motion.div 
                variants={overlayVariants}
                className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent rounded-[20px] md:rounded-[30px] lg:rounded-[40px]"
            ></motion.div>
            
            <motion.div
                variants={textContainerVariants}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="absolute inset-x-0 bottom-2 md:bottom-5 flex flex-col px-4"
            >
                <motion.div
                    variants={titleVariants}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="flex items-center justify-center gap-1"
                >
                    <h3 className="text-white text-base lg:text-xl xl:text-2xl font-plex-sans font-semibold [text-shadow:0_2px_1px_rgba(0,0,0,1)] leading-tight">
                        {category.name}
                    </h3>
                    <motion.div variants={chevronVariants} style={{ overflow: 'hidden' }}>
                        <ChevronRight className="h-6 w-6 text-white hidden md:block" />
                    </motion.div>
                </motion.div>
                
                <motion.p
                    variants={subtitleVariants}
                    className="text-white/80 font-light text-xs lg:text-base [text-shadow:0_1px_1px_rgba(0,0,0,1)] -mt-2"
                >
                    {category.subtitle}
                </motion.p>
            </motion.div>
        </motion.div>
    );
};


export function ExploreCategories({ exploreCategories, exploreFlavours }: ExploreCategoriesProps) {
  const router = useRouter();
  const { setIsGlobalLoading } = useAppContext();

  const handleFlavourClick = (flavourName: string) => {
    setIsGlobalLoading(true);
    router.push(`/search?q=${encodeURIComponent(flavourName)}`);
  }
  
  return (
    <div 
      className="bg-[#5D2B79] h-full rounded-t-[25px] md:rounded-t-[30px] lg:rounded-t-[40px] mx-4 md:mx-20 lg:mx-32"
    >
        <div className="bg-white/20 h-full rounded-t-[25px] md:rounded-t-[30px] lg:rounded-t-[40px] px-4 md:px-8 lg:px-12 flex flex-col">
            <div className="flex-col overflow-y-auto no-scrollbar h-full">
                <SectionTitle className="flex justify-center md:justify-start text-lg md:text-xl lg:text-2xl pt-4 md:pt-6 md:pl-8 mb-2 md:mb-4">
                    Explore Categories
                </SectionTitle>
                <motion.div 
                    className="grid grid-cols-2 md:flex md:flex-row flex-1 justify-around items-center gap-4 md:gap-6 lg:gap-8 pt-1 pb-6 md:pb-10 px-2"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {(exploreCategories || []).map((category) => (
                        <CategoryCard key={category._key} category={category} />
                    ))}
                </motion.div>

                <SectionTitle className="flex justify-center md:justify-start text-lg md:text-xl lg:text-2xl mb-2 md:mb-4 md:pl-8">
                    Explore Flavours
                </SectionTitle>
                <motion.div 
                    className="flex flex-row md:flex-wrap overflow-x-auto no-scrollbar md:overflow-visible flex-1 md:justify-around items-center gap-4 md:gap-8 px-2 pb-6 md:pb-10 pt-1"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {(exploreFlavours || []).map((flavour, index) => (
                    <motion.div 
                        key={flavour._key} 
                        className="w-24 md:flex-1 md:max-w-xs flex-shrink-0 aspect-square md:aspect-[5/6] relative group cursor-pointer" 
                        variants={itemVariants}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => handleFlavourClick(flavour.name)}
                    >
                        <Image
                        src={flavour.imageUrl}
                        alt={flavour.name}
                        width={400}
                        height={400}
                        className="w-full h-full object-cover rounded-[20px] md:rounded-t-[30px] lg:rounded-[40px] ring-1 ring-custom-purple-dark"
                        onDragStart={(e) => e.preventDefault()}
                        priority={index < 2}
                        />
                         <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent rounded-[20px] md:rounded-t-[30px] lg:rounded-[40px]"></div>
                        <div className="absolute inset-x-0 bottom-2 md:bottom-3 flex items-end justify-center">
                            <h3 className="text-white text-xs md:text-sm lg:text-base text-center font-plex-sans font-semibold [text-shadow:0_2px_1px_rgba(0,0,0,1)]">{flavour.name}</h3>
                        </div>
                    </motion.div>
                    ))}
                </motion.div>
                <Separator className="flex justify-center bg-white/50" />
                <SectionTitle className="flex justify-center font-body font-normal text-custom-gold text-xs md:text-base lg:text-lg mt-3 mb-3">
                “Handcrafted with love, just for you”
                </SectionTitle>
            </div>
        </div>
    </div>
  );
}
