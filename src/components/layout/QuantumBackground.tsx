"use client";

import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';

type Particle = {
  id: number;
  left: string;
  top: string;
  duration: number;
  delay: number;
};

function createSeededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

export default function QuantumBackground() {
  const [mounted, setMounted] = useState(false);
  const [lowPower, setLowPower] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateLowPower = () => {
      const cores = typeof navigator !== 'undefined' ? navigator.hardwareConcurrency || 0 : 0;
      setLowPower(mq.matches || (cores > 0 && cores <= 4));
    };
    updateLowPower();
    if (typeof mq.addEventListener === 'function') {
      mq.addEventListener('change', updateLowPower);
      return () => mq.removeEventListener('change', updateLowPower);
    }
    mq.addListener(updateLowPower);
    return () => mq.removeListener(updateLowPower);
  }, []);

  const particles = useMemo<Particle[]>(() => {
    const random = createSeededRandom(20260302);
    return Array.from({ length: 15 }, (_, i) => ({
      id: i,
      left: `${Math.floor(random() * 1000) / 10}%`,
      top: `${Math.floor(random() * 1000) / 10}%`,
      duration: 4 + random() * 4,
      delay: random() * 5,
    }));
  }, []);

  if (!mounted) return null;
  if (lowPower) {
    return (
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.1] mix-blend-overlay" />
        <div className="absolute top-0 left-1/4 w-[420px] h-[420px] bg-purple-500/5 blur-[100px] rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-[460px] h-[460px] bg-cyan-500/5 blur-[100px] rounded-full" />
        <div className="absolute inset-0 opacity-[0.03] mix-blend-soft-light pointer-events-none bg-[url('data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27360%27 height=%27360%27 viewBox=%270 0 360 360%27%3E%3Cdefs%3E%3Cpattern id=%27p%27 x=%270%27 y=%270%27 width=%2712%25%27 height=%2712%25%27 patternUnits=%27userSpaceOnUse%27%3E%3Ccircle cx=%277%27 cy=%277%27 r=%271%27 fill=%27%23ffffff%27 fill-opacity=%270.12%27/%3E%3Ccircle cx=%27360%27 cy=%27360%27 r=%271%27 fill=%27%23ffffff%27 fill-opacity=%270.08%27/%3E%3Cline x1=%270%27 y1=%27360%27 x2=%27360%27 y2=%270%27 stroke=%27%23ffffff%27 stroke-opacity=%270.08%27 stroke-width=%271%27/%3E%3C/pattern%3E%3C/defs%3E%3Crect x=%270%27 y=%270%27 width=%27360%27 height=%27360%27 fill=%27url(%23p)%27/%3E%3C/svg%3E')]" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Grid Overlay */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.15] mix-blend-overlay" />

      {/* Animated Light Beams */}
      <div className="absolute inset-0">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-px w-full bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent"
            initial={{ top: `${(i + 1) * 25}%`, left: "-100%" }}
            animate={{ left: "100%" }}
            transition={{
              duration: 10 + i * 5,
              repeat: Infinity,
              ease: "linear",
              delay: i * 2,
            }}
          />
        ))}
      </div>

      {/* Radial Voids */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-500/5 blur-[120px] rounded-full" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-cyan-500/5 blur-[120px] rounded-full" />

      {/* Quantum Particles */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute w-1 h-1 bg-white/10 rounded-full"
          style={{
            left: particle.left,
            top: particle.top,
          }}
          animate={{
            opacity: [0.1, 0.4, 0.1],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
          }}
        />
      ))}

      {/* Noise Texture */}
      <div className="absolute inset-0 opacity-[0.03] mix-blend-soft-light pointer-events-none bg-[url('data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27360%27 height=%27360%27 viewBox=%270 0 360 360%27%3E%3Cdefs%3E%3Cpattern id=%27p%27 x=%270%27 y=%270%27 width=%2712%25%27 height=%2712%25%27 patternUnits=%27userSpaceOnUse%27%3E%3Ccircle cx=%277%27 cy=%277%27 r=%271%27 fill=%27%23ffffff%27 fill-opacity=%270.12%27/%3E%3Ccircle cx=%27360%27 cy=%27360%27 r=%271%27 fill=%27%23ffffff%27 fill-opacity=%270.08%27/%3E%3Cline x1=%270%27 y1=%27360%27 x2=%27360%27 y2=%270%27 stroke=%27%23ffffff%27 stroke-opacity=%270.08%27 stroke-width=%271%27/%3E%3C/pattern%3E%3C/defs%3E%3Crect x=%270%27 y=%270%27 width=%27360%27 height=%27360%27 fill=%27url(%23p)%27/%3E%3C/svg%3E')]"></div>
    </div>
  );
}
