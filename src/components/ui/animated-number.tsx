
// @/components/ui/animated-number.tsx
'use client';

import { useEffect, useRef } from 'react';
import { animate } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AnimatedNumberProps {
  value: number;
  prefix?: string;
  postfix?: string;
  className?: string;
  decimals?: number;
}

export function AnimatedNumber({ value, prefix = '', postfix = '', className, decimals = 2 }: AnimatedNumberProps) {
  const nodeRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = nodeRef.current;
    if (!node) return;

    const from = parseFloat(node.textContent?.replace(/[^0-9.-]+/g, "") || '0');
    
    const controls = animate(from, value, {
      duration: 0.5,
      ease: "easeOut",
      onUpdate(latest) {
        node.textContent = `${prefix}${Math.abs(latest).toFixed(decimals)}${postfix}`;
      },
    });

    return () => controls.stop();
  }, [value, prefix, postfix, decimals]);

  return <span ref={nodeRef} className={cn(className)}>{`${prefix}${Math.abs(0).toFixed(decimals)}${postfix}`}</span>;
}
