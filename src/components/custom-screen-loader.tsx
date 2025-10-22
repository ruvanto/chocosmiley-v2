// @/components/custom-screen-loader.tsx
import React from 'react';

/**
 * Gold and Purple Pulsing Dotted Loader Component
 * Recreates the three-dot loader with sequential scaling/pulsing animation.
 */
const CustomScreenLoader: React.FC = () => {
  // Base colors from the app's theme
  const BG_PURPLE = '#5D2B79';
  const DOT_GOLD = '#FFD139';

  // Define the custom keyframes and dot class styles.
  const animationStyles = `
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
  `;

  return (
    <div
      style={{ backgroundColor: BG_PURPLE }}
      className="flex flex-col items-center justify-center min-h-screen w-full"
    >
      <style dangerouslySetInnerHTML={{ __html: animationStyles }} />

      <div className="flex justify-between items-center space-x-4 w-28 h-6 mb-6">
        <div 
          key="dot-1"
          className="dot rounded-full"
          style={{ 
            backgroundColor: DOT_GOLD,
            width: '1.5rem',
            height: '1.5rem',
          }}
        />
        <div 
          key="dot-2"
          className="dot rounded-full"
          style={{ 
            backgroundColor: DOT_GOLD,
            width: '1.5rem',
            height: '1.5rem',
            animationDelay: '0.4s', 
          }}
        />
        <div 
          key="dot-3"
          className="dot rounded-full"
          style={{ 
            backgroundColor: DOT_GOLD,
            width: '1.5rem',
            height: '1.5rem',
            animationDelay: '0.8s', 
          }}
        />
      </div>
      <p style={{ color: DOT_GOLD }} className="text-lg font-semibold animate-pulse">
        Hold on while we prepare your treats
      </p>
    </div>
  );
};

export default CustomScreenLoader;
