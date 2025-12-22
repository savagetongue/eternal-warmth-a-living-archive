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
      console.log(`[Temporal Archive] Current duration: ${duration.years}y ${duration.months}m ${duration.days}d ${duration.hours}h`);
    }
  }, [duration]);
  const displayUnits = [
    { label: 'Years', value: duration.years ?? 0 },
    { label: 'Months', value: duration.months ?? 0 },
    { label: 'Days', value: duration.days ?? 0 },
    { label: 'Hours', value: duration.hours ?? 0 },
    { label: 'Minutes', value: duration.minutes ?? 0 },
    { label: 'Seconds', value: duration.seconds ?? 0 },
  ];
  return (
    <div className="flex flex-col items-center justify-center space-y-12 py-20 md:py-32">
      <div className="flex flex-col items-center gap-3">
        <motion.p
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.98, 1, 0.98] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="text-[10px] font-bold uppercase tracking-[0.6em] text-peach italic ml-[0.6em]"
        >
          Bonded for eternity
        </motion.p>
        <div className="h-px w-12 bg-gradient-to-r from-transparent via-peach/40 to-transparent" />
      </div>
      <div className="flex flex-wrap justify-center items-center gap-x-4 sm:gap-x-8 gap-y-6 md:gap-y-10 max-w-6xl px-4">
        {displayUnits.map((unit) => (
          <div key={unit.label} className="flex flex-col items-center min-w-[100px] sm:min-w-[120px]">
            <div className="relative overflow-hidden h-20 lg:h-28 flex items-center justify-center w-[4ch] lg:w-[4.5ch]">
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={unit.value}
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -30, opacity: 0 }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="text-5xl md:text-7xl lg:text-8xl font-mono font-black text-foreground tabular-nums tracking-[-0.05em]"
                >
                  {(unit.value).toString().padStart(3, '0')}
                </motion.span>
              </AnimatePresence>
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0, 0.15, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute inset-0 bg-peach/15 blur-3xl rounded-full -z-10"
              />
            </div>
            <span className="text-[9px] uppercase tracking-[0.4em] text-muted-foreground/60 mt-4 font-black ml-[0.4em]">
              {unit.label}
            </span>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-4 pt-6 opacity-40">
        <div className="w-1.5 h-1.5 rounded-full bg-peach animate-pulse" />
        <span className="text-[9px] font-serif italic text-foreground tracking-[0.4em] uppercase">ticking forever...</span>
        <div className="w-1.5 h-1.5 rounded-full bg-peach animate-pulse" style={{ animationDelay: '0.5s' }} />
      </div>
    </div>
  );
}