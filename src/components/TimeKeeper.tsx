import React, { useState, useEffect, useMemo } from 'react';
import { intervalToDuration } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
// Fixed Genesis Date: September 2nd, 2023. JS months are 0-indexed (8 = September).
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
  // Calibration logging for temporal verification
  useEffect(() => {
    if (duration.years !== undefined) {
      console.log(`[Temporal Archive] Bonded: ${duration.years}y ${duration.months}m ${duration.days}d`);
    }
  }, [duration.years, duration.months, duration.days]);
  const displayUnits = [
    { label: 'Years', value: duration.years ?? 0 },
    { label: 'Months', value: duration.months ?? 0 },
    { label: 'Days', value: duration.days ?? 0 },
    { label: 'Hours', value: duration.hours ?? 0 },
    { label: 'Minutes', value: duration.minutes ?? 0 },
    { label: 'Seconds', value: duration.seconds ?? 0 },
  ];
  return (
    <div className="flex flex-col items-center justify-center space-y-12 py-16 md:py-24">
      <div className="flex flex-col items-center gap-3">
        <motion.p
          animate={{ opacity: [0.3, 0.8, 0.3], scale: [0.99, 1, 0.99] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="text-[11px] font-black uppercase tracking-[0.8em] text-peach italic ml-[0.8em]"
        >
          Bonded for eternity
        </motion.p>
        <div className="h-[2px] w-16 bg-gradient-to-r from-transparent via-peach/30 to-transparent" />
      </div>
      <div className="flex flex-wrap justify-center items-center gap-x-6 sm:gap-x-10 gap-y-10 max-w-6xl px-4">
        {displayUnits.map((unit) => (
          <div key={unit.label} className="flex flex-col items-center">
            <div className="relative overflow-hidden h-20 lg:h-32 flex items-center justify-center min-w-[2.2ch] lg:min-w-[2.5ch]">
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={unit.value}
                  initial={{ y: 25, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -25, opacity: 0 }}
                  transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                  className="text-6xl md:text-7xl lg:text-9xl font-mono font-black text-foreground tabular-nums tracking-[-0.08em] select-none"
                >
                  {(unit.value).toString().padStart(2, '0')}
                </motion.span>
              </AnimatePresence>
              <motion.div
                animate={{ scale: [1, 1.15, 1], opacity: [0.05, 0.1, 0.05] }}
                transition={{ duration: 5, repeat: Infinity }}
                className="absolute inset-0 bg-peach/20 blur-[60px] rounded-full -z-10 pointer-events-none"
              />
            </div>
            <span className="text-[10px] uppercase tracking-[0.5em] text-muted-foreground/50 mt-6 font-black ml-[0.5em] select-none">
              {unit.label}
            </span>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-5 pt-8 opacity-30">
        <div className="w-1.5 h-1.5 rounded-full bg-peach animate-ping" />
        <span className="text-[9px] font-serif italic text-foreground tracking-[0.5em] uppercase font-bold">ticking forever</span>
        <div className="w-1.5 h-1.5 rounded-full bg-peach animate-ping" style={{ animationDelay: '1s' }} />
      </div>
    </div>
  );
}