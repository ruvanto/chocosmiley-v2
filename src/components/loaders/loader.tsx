// @/components/loader.tsx
'use client';

import React from 'react';
import { LoaderCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoaderProps {
  size?: number;
  className?: string;
}

export const Loader: React.FC<LoaderProps> = ({
  size = 32,
  className,
  ...rest
}) => {
  return (
    <div className={cn("text-custom-gold", className)} {...rest}>
      <LoaderCircle style={{ width: size, height: size }} className="animate-spin" />
    </div>
  );
};
