import React, { useState, useEffect, useMemo } from 'react';
import { intervalToDuration } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
const GENESIS_DATE = new Date('2023-09-02T00:00:00');
export function TimeKeeper() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  const duration = useMemo(() => {
    if (!now) return null;
    return intervalToDuration({
      start: GENESIS_DATE,
      end: now,
    });
  }, [now]);
  if (!now || !duration) return <div className="h-48 md:h-64" />;
  const displayUnits = [
    { label: 'Years', value: duration.years },
    { label: 'Months', value: duration.months },
    { label: 'Days', value: duration.days },
    { label: 'Hours', value: duration.hours },
    { label: 'Minutes', value: duration.minutes },
    { label: 'Seconds', value: duration.seconds },
  ].filter(u => u.value !== undefined);
  return (
    <div className="flex flex-col items-center justify-center space-y-12 py-16">
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
      <div className="flex flex-wrap justify-center gap-x-12 gap-y-10 max-w-5xl px-4">
        {displayUnits.map((unit) => (
          <div key={unit.label} className="flex flex-col items-center min-w-[80px]">
            <div className="relative overflow-hidden h-16 md:h-24 flex items-center justify-center w-[2.2ch]">
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={unit.value}
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -30, opacity: 0 }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="text-6xl md:text-8xl font-serif font-black text-foreground tabular-nums tracking-tighter"
                >
                  {(unit.value ?? 0).toString().padStart(2, '0')}
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