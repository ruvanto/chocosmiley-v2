// @/components/static-sparkle.tsx
'use client';

import { SparkleIcon } from './sparkle-icon';
import { cn } from '@/lib/utils';

interface StaticSparkleProps {
  size: number;
  color: string;
  style: React.CSSProperties;
}

export const StaticSparkle = ({ size, color, style }: StaticSparkleProps) => {
  return (
    <div
      className="absolute"
      style={style}
    >
       <SparkleIcon 
         className={cn("text-sparkle")}
         style={{
            width: `${size}px`,
            height: `${size}px`,
            color: color,
         }}
       />
    </div>
  );
};
