
import React, { useState, useEffect, useRef } from 'react';
import { useMousePosition } from './hooks/useMousePosition';
import BackgroundGrid from './components/BackgroundGrid';
import HeroUI from './components/HeroUI';
import { MousePosition, Echo } from './types';

// Constants for interaction
const CURSOR_DELAY = 0.15; // Smoothness factor
const SPOTLIGHT_SIZE = 180; // Reduced size for a tighter spotlight effect
const PARALLAX_STRENGTH = 20;

const App: React.FC = () => {
  const mousePos = useMousePosition();
  const [delayedPos, setDelayedPos] = useState<MousePosition>({ x: 0, y: 0 });
  const [echoes, setEchoes] = useState<Echo[]>([]);
  const lastEchoTime = useRef<number>(0);
  const requestRef = useRef<number>(0);

  // Smoothly interpolate the cursor position for the delay effect
  useEffect(() => {
    const animate = () => {
      setDelayedPos(prev => ({
        x: prev.x + (mousePos.x - prev.x) * CURSOR_DELAY,
        y: prev.y + (mousePos.y - prev.y) * CURSOR_DELAY
      }));
      requestRef.current = requestAnimationFrame(animate);
    };
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current!);
  }, [mousePos]);

  // Handle cursor echoes (trails) when moving quickly
  useEffect(() => {
    const now = Date.now();
    const speed = Math.sqrt(
      Math.pow(mousePos.x - delayedPos.x, 2) + 
      Math.pow(mousePos.y - delayedPos.y, 2)
    );

    if (speed > 50 && now - lastEchoTime.current > 50) {
      const newEcho: Echo = {
        id: now,
        x: delayedPos.x,
        y: delayedPos.y,
        timestamp: now
      };
      setEchoes(prev => [...prev.slice(-8), newEcho]);
      lastEchoTime.current = now;
    }
  }, [delayedPos, mousePos]);

  // Cleanup old echoes
  useEffect(() => {
    const interval = setInterval(() => {
      setEchoes(prev => prev.filter(e => Date.now() - e.timestamp < 500));
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Parallax offsets: elements shift opposite to the mouse
  const parallaxX = (mousePos.x / window.innerWidth - 0.5) * PARALLAX_STRENGTH;
  const parallaxY = (mousePos.y / window.innerHeight - 0.5) * PARALLAX_STRENGTH;

  // Image assets
  const img1 = "https://i.ibb.co/0VmbRs8j/Whats-App-Image-2026-02-06-at-17-23-36.jpg";
  const img2 = "https://i.ibb.co/mC7Z085K/Whats-App-Image-2026-02-06-at-17-23-49.jpg";

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-white cursor-none select-none">
      {/* Interactive Background Grid */}
      <BackgroundGrid mousePosition={mousePos} />

      {/* Layer 1: Base Portrait Image */}
      <div className="absolute inset-0 z-10 overflow-hidden">
        <div 
          className="w-full h-full bg-cover bg-center"
          style={{ 
            backgroundImage: `url('${img1}')`,
            transform: `scale(1.1) translate(${-parallaxX}px, ${-parallaxY}px)`,
            transition: 'transform 0.4s cubic-bezier(0.23, 1, 0.32, 1)'
          }}
        />
        {/* Black UI elements for the base layer */}
        <HeroUI color="black" parallaxOffset={{ x: -parallaxX * 0.5, y: -parallaxY * 0.5 }} />
      </div>

      {/* Layer 2: Alternate Image (Helmet) revealed by Spotlight mask */}
      <div 
        className="absolute inset-0 z-30 overflow-hidden pointer-events-none"
        style={{
          clipPath: `circle(${SPOTLIGHT_SIZE}px at ${delayedPos.x}px ${delayedPos.y}px)`,
          transition: 'clip-path 0.05s linear'
        }}
      >
        <div 
          className="w-full h-full bg-cover bg-center"
          style={{ 
            backgroundImage: `url('${img2}')`,
            transform: `scale(1.1) translate(${-parallaxX}px, ${-parallaxY}px)`,
            transition: 'transform 0.4s cubic-bezier(0.23, 1, 0.32, 1)'
          }}
        />
        {/* White UI elements for the reveal layer - dynamic inversion effect */}
        <HeroUI color="white" parallaxOffset={{ x: -parallaxX * 0.5, y: -parallaxY * 0.5 }} />
      </div>

      {/* Echoes / Trailing Spotlight Rings */}
      {echoes.map(echo => (
        <div
          key={echo.id}
          className="fixed pointer-events-none rounded-full border border-black/10 z-20"
          style={{
            width: SPOTLIGHT_SIZE * 2,
            height: SPOTLIGHT_SIZE * 2,
            left: echo.x,
            top: echo.y,
            transform: 'translate(-50%, -50%)',
            opacity: Math.max(0, 0.5 - (Date.now() - echo.timestamp) / 500),
            transition: 'opacity 0.5s ease-out'
          }}
        />
      ))}

      {/* Custom Mouse Cursor / Ring */}
      <div 
        className="fixed z-50 pointer-events-none rounded-full border border-black/20"
        style={{
          width: 20,
          height: 20,
          left: mousePos.x,
          top: mousePos.y,
          transform: 'translate(-50%, -50%)',
        }}
      />
    </main>
  );
};

export default App;
