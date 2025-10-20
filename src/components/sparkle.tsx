'use client';
import { useState, useEffect, useRef } from 'react';
import { SparkleIcon } from './sparkle-icon';
import { cn } from '@/lib/utils';

interface SparkleProps {
  size: number;
  color: string;
  style: React.CSSProperties;
  mousePosition: { x: number | null; y: number | null };
}

const INTERACTION_DISTANCE = 80; // pixels

export const Sparkle = ({ size, color, style, mousePosition }: SparkleProps) => {
  const [scale, setScale] = useState(1);
  const [isNear, setIsNear] = useState(false);
  const sparkleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mousePosition.x || !mousePosition.y || !sparkleRef.current) {
      setScale(1);
      setIsNear(false);
      return;
    }

    const sparkleElement = sparkleRef.current;
    const rect = sparkleElement.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const distance = Math.sqrt(
      Math.pow(mousePosition.x - centerX, 2) + Math.pow(mousePosition.y - centerY, 2)
    );
    
    if (distance < INTERACTION_DISTANCE) {
        const newScale = 1 + (1 - distance / INTERACTION_DISTANCE) * 2;
        setScale(newScale);
        setIsNear(true);
    } else {
        setScale(1);
        setIsNear(false);
    }

  }, [mousePosition.x, mousePosition.y]);

  return (
    <div
      ref={sparkleRef}
      className="absolute animate-sparkle-glow"
      style={{
        transform: `scale(${scale})`,
        transition: 'transform 0.1s ease-out',
        ...style,
      }}
    >
       <SparkleIcon 
         className={cn(
          "transition-colors duration-300",
          isNear ? "text-custom-gold" : "text-sparkle"
         )}
         style={{
            width: `${size}px`,
            height: `${size}px`,
            color: isNear ? undefined : color, // Use class for gold, style for default
         }}
       />
    </div>
  );
};
