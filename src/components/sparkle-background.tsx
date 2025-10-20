'use client';

import { useState, useEffect } from 'react';
import { useMousePosition } from '@/hooks/use-mouse-position';
import { Sparkle } from './sparkle';

const random = (min: number, max: number) => Math.random() * (max - min) + min;

const generateSparkle = (containerWidth: number, containerHeight: number) => {
  return {
    id: String(random(1, 10000)),
    createdAt: Date.now(),
    color: 'hsl(0 0% 100% / 50%)',
    size: random(2, 5),
    style: {
      top: `${random(0, containerHeight)}px`,
      left: `${random(0, containerWidth)}px`,
      zIndex: -1,
    },
  };
};

export const SparkleBackground = () => {
  const [sparkles, setSparkles] = useState<any[]>([]);
  const mousePosition = useMousePosition();

  useEffect(() => {
    // This effect should only run on the client
    const { innerWidth, innerHeight } = window;
    const initialSparkles = Array.from({ length: 150 }).map(() =>
      generateSparkle(innerWidth, innerHeight)
    );
    setSparkles(initialSparkles);
  }, []);

  return (
    <div className="fixed inset-0 -z-10">
      {sparkles.map((sparkle) => (
        <Sparkle
          key={sparkle.id}
          size={sparkle.size}
          color={sparkle.color}
          style={sparkle.style}
          mousePosition={mousePosition}
        />
      ))}
    </div>
  );
};
