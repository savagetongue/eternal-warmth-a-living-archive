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
    <div className="flex flex-col items-center justify-center space-y-6 py-6 md:py-10 overflow-visible w-full selection:bg-peach/30">
      <div className="flex flex-col items-center gap-3">
        <motion.p
          animate={{ opacity: [0.4, 0.9, 0.4], y: [0, -1, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.8em] text-peach italic ml-[0.8em] select-none text-center"
        >
          Our Bonded Eternity
        </motion.p>
        <div className="h-[1px] w-12 md:w-20 bg-gradient-to-r from-transparent via-peach/30 to-transparent" />
      </div>
      <div className="flex flex-row flex-wrap justify-center items-center gap-x-4 sm:gap-x-10 lg:gap-x-14 gap-y-4 max-w-7xl p-2 w-full">
        {displayUnits.map((unit, idx) => (
          <div key={unit.label} className="flex flex-col items-center flex-shrink-0 group w-[30%] sm:w-auto">
            <div className="relative overflow-visible h-12 sm:h-16 lg:h-20 flex items-center justify-center min-w-[2ch] tabular-nums">
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
                className={`absolute inset-0 blur-[20px] sm:blur-[40px] lg:blur-[60px] rounded-full -z-10 pointer-events-none ${
                  idx % 2 === 0 ? 'bg-peach/30' : 'bg-mist/30'
                }`}
              />
              <div className="relative flex items-center justify-center tabular-nums overflow-visible">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={unit.value}
                    initial={{ y: 15, opacity: 0, scale: 0.95 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: -15, opacity: 0, scale: 0.95 }}
                    transition={{
                      duration: 0.4,
                      ease: [0.33, 1, 0.68, 1],
                    }}
                    className="text-3xl sm:text-5xl lg:text-6xl xl:text-7xl font-display font-black text-foreground tabular-nums tracking-tighter select-none whitespace-nowrap will-change-transform flex justify-center items-center leading-none min-w-[1.1em]"
                  >
                    {(unit.value).toString().padStart(2, '0')}
                  </motion.span>
                </AnimatePresence>
              </div>
            </div>
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              className="text-[9px] sm:text-[10px] lg:text-xs uppercase tracking-widest text-muted-foreground mt-1 sm:mt-2 font-bold select-none whitespace-nowrap group-hover:text-peach group-hover:opacity-100 transition-all duration-500"
            >
              {unit.label}
            </motion.span>
          </div>
        ))}
      </div>
    </div>
  );
}