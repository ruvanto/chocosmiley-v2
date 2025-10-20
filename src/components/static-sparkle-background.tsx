// @/components/static-sparkle-background.tsx
'use client';

import { useState, useEffect } from 'react';
import { StaticSparkle } from './static-sparkle';

const random = (min: number, max: number) => Math.random() * (max - min) + min;

const generateSparkle = (containerWidth: number, containerHeight: number) => {
  return {
    id: String(random(1, 10000)),
    createdAt: Date.now(),
    color: 'hsl(0 0% 100% / 50%)',
    size: random(1, 3),
    style: {
      top: `${random(0, containerHeight)}px`,
      left: `${random(0, containerWidth)}px`,
      zIndex: -1,
    },
  };
};

export const StaticSparkleBackground = () => {
  const [sparkles, setSparkles] = useState<any[]>([]);

  useEffect(() => {
    // This effect should only run on the client to avoid hydration mismatch
    const { innerWidth, innerHeight } = window;
    const initialSparkles = Array.from({ length: 100 }).map(() =>
      generateSparkle(innerWidth, innerHeight)
    );
    setSparkles(initialSparkles);
  }, []);

  return (
    <div className="fixed inset-0 -z-10">
      {sparkles.map((sparkle) => (
        <StaticSparkle
          key={sparkle.id}
          size={sparkle.size}
          color={sparkle.color}
          style={sparkle.style}
        />
      ))}
    </div>
  );
};
