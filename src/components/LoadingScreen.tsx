import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LoadingScreenProps {
  onComplete: () => void;
}

const WORDS = ['Design', 'Create', 'Inspire'];
const DURATION_MS = 2700;

const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete }) => {
  const [count, setCount] = useState(0);
  const [wordIndex, setWordIndex] = useState(0);
  const startTimeRef = useRef<number>(0);
  const rafRef = useRef<number>(0);
  const doneRef = useRef(false);

  // Counter animation
  useEffect(() => {
    startTimeRef.current = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTimeRef.current;
      const progress = Math.min(elapsed / DURATION_MS, 1);
      const eased = progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;
      const newCount = Math.round(eased * 100);
      setCount(newCount);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else if (!doneRef.current) {
        doneRef.current = true;
        setTimeout(() => onComplete(), 400);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [onComplete]);

  // Word cycling every 900ms
  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex(i => (i + 1) % WORDS.length);
    }, 900);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex flex-col overflow-hidden"
      style={{ background: 'hsl(var(--bg))' }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: 'easeInOut' }}
    >
      {/* Top-left label */}
      <motion.div
        className="absolute top-8 left-8 md:top-12 md:left-12"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <span
          className="text-xs uppercase tracking-[0.3em]"
          style={{ color: 'hsl(var(--muted))' }}
        >
          Portfolio
        </span>
      </motion.div>

      {/* Center word */}
      <div className="flex-1 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.span
            key={wordIndex}
            className="text-4xl md:text-6xl lg:text-7xl"
            style={{
              fontFamily: 'Instrument Serif, serif',
              fontStyle: 'italic',
              color: 'hsl(var(--text) / 0.8)',
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            {WORDS[wordIndex]}
          </motion.span>
        </AnimatePresence>
      </div>

      {/* Bottom area */}
      <div className="relative px-8 md:px-12 pb-8 md:pb-12">
        {/* Counter — bottom right */}
        <div className="absolute bottom-8 right-8 md:bottom-12 md:right-12">
          <span
            className="text-6xl md:text-8xl lg:text-9xl tabular-nums"
            style={{
              fontFamily: 'Instrument Serif, serif',
              color: 'hsl(var(--text))',
            }}
          >
            {String(count).padStart(3, '0')}
          </span>
        </div>

        {/* Progress bar */}
        <div
          className="w-full h-[3px] rounded-full overflow-hidden"
          style={{ background: 'hsl(var(--stroke) / 0.5)' }}
        >
          <div
            className="h-full accent-gradient origin-left transition-transform"
            style={{
              transform: `scaleX(${count / 100})`,
              boxShadow: '0 0 8px rgba(137, 170, 204, 0.35)',
            }}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default LoadingScreen;
