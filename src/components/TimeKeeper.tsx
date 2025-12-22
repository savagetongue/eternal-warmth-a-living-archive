import React, { useState, useEffect } from 'react';
import { intervalToDuration } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
const GENESIS_DATE = new Date('2023-09-02T00:00:00');
export function TimeKeeper() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  const duration = intervalToDuration({
    start: GENESIS_DATE,
    end: now,
  });
  return (
    <div className="flex flex-col items-center justify-center space-y-10 py-16">
      <div className="flex flex-col items-center gap-2">
        <motion.p 
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="text-xs font-medium uppercase tracking-[0.4em] text-peach italic"
        >
          Bonded for eternity
        </motion.p>
        <div className="h-px w-8 bg-peach/30" />
      </div>
      <div className="flex flex-wrap justify-center gap-6 sm:gap-12 md:gap-16">
        {Object.entries(duration).map(([unit, value]) => (
          value !== undefined && value > 0 && (
            <div key={unit} className="flex flex-col items-center min-w-[70px]">
              <div className="relative overflow-hidden h-14 md:h-20 flex items-center justify-center">
                <AnimatePresence mode="popLayout">
                  <motion.span
                    key={value}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    transition={{ duration: 0.5, ease: "circOut" }}
                    className="text-5xl md:text-7xl font-serif font-bold text-foreground drop-shadow-sm"
                  >
                    {value.toString().padStart(2, '0')}
                  </motion.span>
                </AnimatePresence>
                {/* Breathing digit highlight */}
                <motion.div 
                  animate={{ scale: [1, 1.1, 1], opacity: [0, 0.2, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute inset-0 bg-peach/10 blur-2xl rounded-full"
                />
              </div>
              <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground/60 mt-3 font-bold">
                {unit}
              </span>
            </div>
          )
        ))}
      </div>
      <div className="flex items-center gap-3 pt-4">
        <div className="w-1.5 h-1.5 rounded-full bg-peach/40 animate-pulse" />
        <span className="text-[10px] font-serif italic text-muted-foreground/50 tracking-widest">ticking forever...</span>
        <div className="w-1.5 h-1.5 rounded-full bg-peach/40 animate-pulse" style={{ animationDelay: '0.5s' }} />
      </div>
    </div>
  );
}