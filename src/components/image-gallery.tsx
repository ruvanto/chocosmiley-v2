

// @/components/image-gallery.tsx
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Expand, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SanityProduct } from '@/types';

interface ImageGalleryProps {
    product: SanityProduct;
    onImageExpandChange: (isExpanded: boolean) => void;
    activeIndex: number;
    setActiveIndex: (index: number) => void;
}

export function ImageGallery({ product, onImageExpandChange, activeIndex, setActiveIndex }: ImageGalleryProps) {
    const images = product.images || [];
    const [isImageLoading, setIsImageLoading] = useState(true);


    useEffect(() => {
        setIsImageLoading(true);
    }, [activeIndex]);

    const handleExpandClick = () => {
        onImageExpandChange(true);
    };

    return (
        <div className="grid grid-cols-5 gap-6 h-full">
            {/* Main Image */}
            <div className="col-span-4 animate-slide-in-from-left group relative rounded-xl overflow-hidden" style={{ animationDuration: '0.5s' }}>
                <div className="relative h-full w-full aspect-square">
                     {isImageLoading && <div className="absolute inset-0 bg-black/30 animate-pulse" />}
                    <Image
                        src={images.length > 0 ? images[activeIndex] : '/placeholder.png'}
                        alt={product.name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className={cn(
                            "object-cover transition-opacity duration-300",
                            isImageLoading ? 'opacity-0' : 'opacity-100'
                        )}
                        onLoad={() => setIsImageLoading(false)}
                        onError={() => setIsImageLoading(false)}
                        onDragStart={(e) => e.preventDefault()}
                        priority={true}
                    />
                </div>
                 <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/30">
                    <button 
                        onClick={handleExpandClick} 
                        className="text-white p-2 rounded-full hover:bg-black/30 transition-colors"
                        aria-label="Expand image"
                    >
                        <Expand size={32} />
                    </button>
                </div>
            </div>

            {/* Thumbnails */}
            <div className="col-span-1 flex flex-col justify-center">
                <div className="flex flex-col gap-3">
                    {images.map((image, index) => (
                        <button
                            key={image} 
                            onClick={() => setActiveIndex(index)}
                            className={cn(
                                "relative w-full aspect-square animate-fade-in transition-all duration-200 rounded-md overflow-hidden ring-2 ring-offset-2 ring-offset-[#9A7DAB]",
                                activeIndex === index ? 'ring-custom-gold' : 'ring-transparent hover:ring-white/50'
                            )}
                            style={{ animationDelay: `${0.3 + index * 0.1}s`, animationFillMode: 'both' }}
                        >
                            <Image
                                src={image}
                                alt={`${product.name} thumbnail ${index + 1}`}
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                className="rounded-md object-cover"
                                onDragStart={(e) => e.preventDefault()}
                            />
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

interface ExpandedImageViewProps {
    images: string[];
    activeIndex: number;
    productName: string;
    onClose: () => void;
}

export function ExpandedImageView({ images, activeIndex, productName, onClose }: ExpandedImageViewProps) {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 animate-fade-in" style={{animationDuration: '0.3s'}}>
            <div className="relative max-w-4xl max-h-[90vh]">
                <Image
                    src={images.length > 0 ? images[activeIndex] : '/placeholder.png'}
                    alt={productName}
                    width={1200}
                    height={1200}
                    className="object-contain max-h-[90vh] w-auto"
                    onDragStart={(e) => e.preventDefault()}
                />
                 <button 
                    onClick={onClose} 
                    className="absolute -top-4 -right-4 text-white bg-black/50 p-1.5 rounded-full hover:bg-black/70 transition-colors"
                    aria-label="Close expanded image"
                >
                    <X size={24} />
                </button>
            </div>
        </div>
    );
}
