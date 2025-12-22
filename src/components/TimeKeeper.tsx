import React, { useState, useEffect, useMemo } from 'react';
import { intervalToDuration } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
const GENESIS_DATE = new Date(2023, 8, 2, 0, 0, 0);
export function TimeKeeper() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  const duration = useMemo(() => {
    return intervalToDuration({
      start: GENESIS_DATE,
      end: now,
    });
  }, [now]);
  const displayUnits = [
    { label: 'Years', value: duration.years ?? 0 },
    { label: 'Months', value: duration.months ?? 0 },
    { label: 'Days', value: duration.days ?? 0 },
    { label: 'Hours', value: duration.hours ?? 0 },
    { label: 'Minutes', value: duration.minutes ?? 0 },
    { label: 'Seconds', value: duration.seconds ?? 0 },
  ];
  return (
    <div className="flex flex-col items-center justify-center space-y-12 py-12 md:py-24 lg:py-40 overflow-visible w-full">
      <div className="flex flex-col items-center gap-3">
        <motion.p
          animate={{ opacity: [0.3, 0.8, 0.3], scale: [0.99, 1, 0.99] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="text-[10px] md:text-[12px] font-black uppercase tracking-[0.8em] text-peach italic ml-[0.8em] select-none"
        >
          Bonded for eternity
        </motion.p>
        <div className="h-[2px] w-16 md:w-24 bg-gradient-to-r from-transparent via-peach/30 to-transparent" />
      </div>
      <div className="flex flex-row flex-wrap justify-center items-center gap-x-4 sm:gap-x-8 lg:gap-x-12 gap-y-8 sm:gap-y-12 max-w-7xl p-4 sm:p-8 w-full">
        {displayUnits.map((unit) => (
          <div key={unit.label} className="flex flex-col items-center flex-shrink-0 min-w-[70px] sm:min-w-[120px] lg:min-w-[160px]">
            <div className="relative overflow-visible h-16 sm:h-24 lg:h-36 flex items-center justify-center">
              <div className="relative flex items-center justify-center w-[2ch] tabular-nums">
                <AnimatePresence mode="popLayout">
                  <motion.span
                    key={unit.value}
                    initial={{ y: 20, opacity: 0, scale: 0.9 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: -20, opacity: 0, scale: 0.9 }}
                    transition={{
                      duration: 0.5,
                      ease: [0.34, 1.56, 0.64, 1],
                    }}
                    className="text-4xl sm:text-6xl lg:text-9xl font-mono font-black text-foreground tabular-nums tracking-[-0.05em] select-none whitespace-nowrap will-change-transform"
                  >
                    {(unit.value).toString().padStart(2, '0')}
                  </motion.span>
                </AnimatePresence>
              </div>
              <motion.div
                animate={{ scale: [1, 1.3, 1], opacity: [0.08, 0.2, 0.08] }}
                transition={{ duration: 6, repeat: Infinity }}
                className="absolute inset-0 bg-peach/30 blur-[40px] sm:blur-[100px] rounded-full -z-10 pointer-events-none"
              />
            </div>
            <span className="text-[8px] sm:text-xs lg:text-sm uppercase tracking-[0.3em] sm:tracking-[0.5em] text-muted-foreground/60 mt-4 sm:mt-6 lg:mt-8 font-black ml-[0.3em] sm:ml-[0.5em] select-none whitespace-nowrap">
              {unit.label}
            </span>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-5 pt-4 sm:pt-8 opacity-40">
        <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-peach animate-ping" />
        <span className="text-[8px] sm:text-[10px] font-serif italic text-foreground tracking-[0.3em] sm:tracking-[0.5em] uppercase font-bold select-none">ticking forever</span>
        <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-peach animate-ping" style={{ animationDelay: '1s' }} />
      </div>
    </div>
  );
}