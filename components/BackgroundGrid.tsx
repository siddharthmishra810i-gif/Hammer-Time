
import React, { useMemo } from 'react';
import { MousePosition } from '../types';

interface BackgroundGridProps {
  mousePosition: MousePosition;
}

const BackgroundGrid: React.FC<BackgroundGridProps> = ({ mousePosition }) => {
  // Normalize mouse position for subtle movement
  const offsetX = (mousePosition.x / window.innerWidth - 0.5) * 20;
  const offsetY = (mousePosition.y / window.innerHeight - 0.5) * 20;

  return (
    <div 
      className="fixed inset-0 pointer-events-none z-0 opacity-[0.03]"
      style={{
        backgroundImage: `
          linear-gradient(to right, #000 1px, transparent 1px),
          linear-gradient(to bottom, #000 1px, transparent 1px)
        `,
        backgroundSize: '80px 80px',
        transform: `translate(${offsetX}px, ${offsetY}px)`,
        transition: 'transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)'
      }}
    />
  );
};

export default BackgroundGrid;
