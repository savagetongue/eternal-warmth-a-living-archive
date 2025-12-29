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
    <div className="flex flex-col items-center justify-center space-y-10 py-16 md:py-24 lg:py-32 overflow-visible w-full selection:bg-peach/30">
      <div className="flex flex-col items-center gap-4">
        <motion.p
          animate={{ opacity: [0.4, 0.9, 0.4], y: [0, -2, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="text-[10px] md:text-[12px] font-black uppercase tracking-[0.8em] text-peach italic ml-[0.8em] select-none text-center"
        >
          Our Bonded Eternity
        </motion.p>
        <div className="h-[1px] w-16 md:w-24 bg-gradient-to-r from-transparent via-peach/30 to-transparent" />
      </div>
      <div className="flex flex-row flex-wrap justify-center items-center gap-x-4 sm:gap-x-12 lg:gap-x-16 gap-y-10 max-w-7xl p-4 w-full">
        {displayUnits.map((unit, idx) => (
          <div key={unit.label} className="flex flex-col items-center flex-shrink-0 group w-[45%] sm:w-auto">
            <div className="relative overflow-visible h-16 sm:h-24 lg:h-28 xl:h-32 flex items-center justify-center min-w-[2ch] tabular-nums">
              <motion.div
                animate={{
                  scale: [1, 1.15, 1],
                  opacity: [0.1, 0.2, 0.1],
                }}
                transition={{
                  duration: 8 + idx,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className={`absolute inset-0 blur-[30px] sm:blur-[60px] lg:blur-[80px] rounded-full -z-10 pointer-events-none ${
                  idx % 2 === 0 ? 'bg-peach/30' : 'bg-mist/30'
                }`}
              />
              <div className="relative flex items-center justify-center tabular-nums overflow-visible">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={unit.value}
                    initial={{ y: 20, opacity: 0, scale: 0.9 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: -20, opacity: 0, scale: 0.9 }}
                    transition={{
                      duration: 0.5,
                      ease: [0.33, 1, 0.68, 1],
                    }}
                    className="text-4xl sm:text-6xl lg:text-7xl xl:text-8xl font-display font-black text-foreground tabular-nums tracking-tighter select-none whitespace-nowrap will-change-transform flex justify-center items-center leading-none min-w-[1.2em]"
                  >
                    {(unit.value).toString().padStart(2, '0')}
                  </motion.span>
                </AnimatePresence>
              </div>
            </div>
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              className="text-xs sm:text-sm lg:text-base uppercase tracking-widest text-muted-foreground mt-2 sm:mt-4 font-bold select-none whitespace-nowrap group-hover:text-peach group-hover:opacity-100 transition-all duration-500"
            >
              {unit.label}
            </motion.span>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-4 pt-8 opacity-30 select-none">
        <div className="w-1.5 h-1.5 rounded-full bg-peach animate-ping" />
        <span className="text-[9px] md:text-[10px] font-serif italic text-foreground tracking-[0.3em] uppercase font-bold">Resonating Forever</span>
        <div className="w-1.5 h-1.5 rounded-full bg-peach animate-ping" style={{ animationDelay: '2s' }} />
      </div>
    </div>
  );
}