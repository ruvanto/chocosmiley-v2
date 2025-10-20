// @/components/progress-bar.tsx
'use client';

import { useAppContext } from '@/context/app-context';
import { cn } from '@/lib/utils';
import { useEffect, useState, useRef } from 'react';

export function ProgressBarComponent() {
  const { isGlobalLoading } = useAppContext();
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const timeouts = useRef<NodeJS.Timeout[]>([]);

  useEffect(() => {
    // Clear any running animations when loading state changes
    timeouts.current.forEach(clearTimeout);
    timeouts.current = [];

    if (isGlobalLoading) {
      setIsVisible(true);
      setProgress(0); // Reset progress

      // --- New Multi-Stage Animation ---
      // 1. Instant jump to 10%
      timeouts.current.push(setTimeout(() => setProgress(10), 10));
      // 2. Quick move to 50%
      timeouts.current.push(setTimeout(() => setProgress(50), 100)); // after 100ms
      // 3. Slower move to 75%
      timeouts.current.push(setTimeout(() => setProgress(75), 500)); // after 500ms
      // 4. Final move to 90%
      timeouts.current.push(setTimeout(() => setProgress(90), 1500)); // after 1.5s
      
    } else {
      // When loading is finished, complete the animation.
      setProgress(100);
    }
    
    // Cleanup timeouts on component unmount
    return () => {
        timeouts.current.forEach(clearTimeout);
    }

  }, [isGlobalLoading]);

  const getTransitionDuration = (p: number) => {
    if (p < 50) return '0.2s';  // Quick
    if (p < 75) return '0.4s';  // Slower
    if (p < 95) return '1s';    // Slowest
    return '0.3s'; // Final completion
  };

  const handleTransitionEnd = () => {
    if (progress === 100 && !isGlobalLoading) {
      setIsVisible(false);
      // Reset progress after fade out animation is complete
      timeouts.current.push(setTimeout(() => setProgress(0), 400));
    }
  };

  return (
    <div
      className={cn(
        'fixed top-0 left-0 h-1 z-[200] bg-custom-gold',
        'transition-all',
        isVisible ? 'opacity-100' : 'opacity-0',
        'shadow-gold-glow-bottom'
      )}
      style={{
        width: `${progress}%`,
        transitionDuration: getTransitionDuration(progress),
        transitionProperty: 'width, opacity',
        transitionTimingFunction: progress < 100 ? 'ease-out' : 'ease-in',
      }}
      onTransitionEnd={handleTransitionEnd}
      role="progressbar"
      aria-busy={isGlobalLoading}
    />
  );
}
