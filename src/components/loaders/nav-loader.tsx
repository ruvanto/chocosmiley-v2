'use client';

import { useAppContext } from '@/context/app-context';
import { cn } from '@/lib/utils';
import { useEffect, useState, useRef } from 'react';

// NOTE: The complex animations and keyframes are defined 
// in a standard <style> block below.

export function ProgressBarComponent() {
  const { isGlobalLoading } = useAppContext();
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const timeouts = useRef<NodeJS.Timeout[]>([]);

  // Theme colors based on the new loader: Deep Purple BG and Gold Dots
  const DOT_GOLD = '#efc140';
  const BG_PURPLE = '#5c2881';

  useEffect(() => {
    timeouts.current.forEach(clearTimeout);
    timeouts.current = [];

    if (isGlobalLoading) {
      setIsVisible(true);
      setProgress(0);

      // Simulate staggered loading progress (existing logic)
      timeouts.current.push(setTimeout(() => setProgress(10), 10));
      timeouts.current.push(setTimeout(() => setProgress(50), 100));
      timeouts.current.push(setTimeout(() => setProgress(75), 500));
      timeouts.current.push(setTimeout(() => setProgress(90), 1500));
    } else {
      setProgress(100);
    }

    return () => timeouts.current.forEach(clearTimeout);
  }, [isGlobalLoading]);

  const handleTransitionEnd = () => {
    // Only hide the container when the progress is 100% and loading has completed
    if (progress === 100 && !isGlobalLoading) {
      setIsVisible(false);
      // Reset progress after a brief delay to be ready for the next load cycle
      timeouts.current.push(setTimeout(() => setProgress(0), 400));
    }
  };

  return (
    <>
      {/* CSS for the Pulsing Dot Loader Animation */}
      <style>{`
        @keyframes scale-pulse {
            0%, 100% { 
                transform: scale(0.6);
                opacity: 0.5;
            } 
            40% { 
                transform: scale(1.1);
                opacity: 1;
            }
        }
        
        .dot {
            animation: scale-pulse 1.2s infinite ease-in-out both; 
        }
      `}</style>

      {/* Full-Screen Backdrop (Purple Theme) */}
      <div
        className={cn(
          // MODIFIED: Added h-screen and w-full to guarantee full viewport coverage.
          'fixed inset-0 z-[200] h-screen w-full flex items-center justify-center', 
          'transition-opacity duration-300 flex-col', 
          // New Deep Purple Background Color
          isVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        style={{
          transitionProperty: 'opacity',
          backgroundColor: BG_PURPLE, // use inline style for full-screen solid background
        }}
        onTransitionEnd={handleTransitionEnd}
        aria-busy={isGlobalLoading}
      >
        {/* New Pulsing Dot Loader UI */}
        <div className="flex justify-between items-center space-x-3 md:space-x-4 w-24 md:w-28 h-6 mb-6">
          <div 
            key="dot-1"
            className="dot rounded-full w-5 h-5 md:w-6 md:h-6"
            style={{ 
              backgroundColor: DOT_GOLD,
            }}
          />
          <div 
            key="dot-2"
            className="dot rounded-full w-5 h-5 md:w-6 md:h-6"
            style={{ 
              backgroundColor: DOT_GOLD,
              animationDelay: '0.4s', 
            }}
          />
          <div 
            key="dot-3"
            className="dot rounded-full w-5 h-5 md:w-6 md:h-6"
            style={{ 
              backgroundColor: DOT_GOLD,
              animationDelay: '0.8s', 
            }}
          />
        </div>
        
        {/* Loading Text */}
        <p style={{ color: DOT_GOLD }} className="text-base md:text-lg font-normal text-center px-4">
          Loading
        </p>
      </div>
    </>
  );
}
