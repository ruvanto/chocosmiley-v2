

// @/components/mobile-image-gallery.tsx
'use client';

import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SanityProduct } from '@/types';
import { motion, useMotionValue, animate, PanInfo } from 'framer-motion';

interface MobileImageGalleryProps {
    product: SanityProduct;
    onImageExpand: (index: number) => void;
}

const SWIPE_CONFIDENCE_THRESHOLD = 10000;

const GalleryImage = ({ src, alt, priority, onClick }: { src: string, alt: string, priority: boolean, onClick: () => void }) => {
    const [isLoading, setIsLoading] = useState(true);

    return (
        <motion.div
            className="relative h-full w-full flex-shrink-0 rounded-xl overflow-hidden"
            onClick={onClick}
            style={{ width: '100%', height: '100%' }}
        >
            {isLoading && (
                <div className="absolute inset-0 bg-black/30 animate-pulse" />
            )}
            <Image
                src={src}
                alt={alt}
                fill
                sizes="100vw"
                className={cn(
                    "object-cover pointer-events-none transition-opacity duration-300",
                    isLoading ? 'opacity-0' : 'opacity-100'
                )}
                onLoad={() => setIsLoading(false)}
                onError={() => setIsLoading(false)}
                onDragStart={(e) => e.preventDefault()}
                priority={priority}
            />
        </motion.div>
    );
};


export function MobileImageGallery({ product, onImageExpand }: MobileImageGalleryProps) {
    const images = product.images || [];
    const [imageIndex, setImageIndex] = useState(0);
    const dragX = useMotionValue(0);
    const containerRef = useRef<HTMLDivElement>(null);
    

    const onDragEnd = (e: MouseEvent | TouchEvent | PointerEvent, { offset, velocity }: PanInfo) => {
        const swipe = Math.abs(offset.x) * velocity.x;

        if (swipe < -SWIPE_CONFIDENCE_THRESHOLD) {
            paginate(1);
        } else if (swipe > SWIPE_CONFIDENCE_THRESHOLD) {
            paginate(-1);
        }
    };
    
    const paginate = (newDirection: number) => {
        const newIndex = imageIndex + newDirection;
        if (newIndex >= 0 && newIndex < images.length) {
            setImageIndex(newIndex);
        }
    };

    useEffect(() => {
        const containerWidth = containerRef.current?.offsetWidth || 0;
        const newX = -imageIndex * containerWidth;
        animate(dragX, newX, {
            type: "spring",
            stiffness: 300,
            damping: 30,
            bounce: 0,
        });
    }, [imageIndex, dragX]);

    const handleExpandClick = () => {
        onImageExpand(imageIndex);
    };

    return (
        <div className="px-4 pt-4 pb-12">
            <div 
                ref={containerRef}
                className="relative w-full aspect-square group overflow-hidden bg-transparent rounded-xl"
            >
                <motion.div
                    drag="x"
                    dragConstraints={{ 
                        left: -((containerRef.current?.offsetWidth || 0) * (images.length - 1)), 
                        right: 0 
                    }}
                    style={{ x: dragX }}
                    onDragEnd={onDragEnd}
                    className="flex h-full items-center"
                >
                    {images.map((imgUrl, i) => (
                        <GalleryImage
                            key={i}
                            src={imgUrl}
                            alt={product.name}
                            priority={i === 0}
                            onClick={handleExpandClick}
                        />
                    ))}
                </motion.div>
                
                {images.length > 1 && (
                    <>
                        <button
                          onClick={(e) => { e.stopPropagation(); paginate(-1); }}
                          className="absolute z-10 top-1/2 left-2 -translate-y-1/2 text-white rounded-full p-1 disabled:opacity-30"
                          aria-label="Previous image"
                          disabled={imageIndex === 0}
                        >
                            <ChevronLeft className="h-6 w-6" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); paginate(1); }}
                          className="absolute z-10 top-1/2 right-2 -translate-y-1/2 text-white rounded-full p-1 disabled:opacity-30"
                          aria-label="Next image"
                          disabled={imageIndex === images.length - 1}
                        >
                            <ChevronRight className="h-6 w-6" />
                        </button>

                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                            {images.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setImageIndex(i);
                                    }}
                                    className={cn(
                                        "h-1.5 rounded-full transition-all duration-300",
                                        imageIndex === i ? "bg-custom-gold w-3" : "bg-white/50 w-1.5"
                                    )}
                                    aria-label={`Go to image ${i + 1}`}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export function MobileExpandedImageView({ images, activeIndex, productName, onClose }: { images: string[], activeIndex: number, productName: string, onClose: () => void }) {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 animate-fade-in" style={{animationDuration: '0.3s'}} onClick={onClose}>
            <div className="relative w-[90vw] aspect-square">
                <Image
                    src={images.length > 0 ? images[activeIndex] : '/placeholder.png'}
                    alt={productName}
                    fill
                    className="object-contain"
                    onDragStart={(e) => e.preventDefault()}
                />
                 <button 
                    onClick={onClose} 
                    className="absolute -top-2 -right-2 text-white bg-black/50 p-1 rounded-full hover:bg-black/70 transition-colors"
                    aria-label="Close expanded image"
                >
                    <X size={20} />
                </button>
            </div>
        </div>
    );
}
