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
    <div className="flex flex-col items-center justify-center space-y-16 py-32 md:py-48 lg:py-64 overflow-visible w-full selection:bg-peach/30">
      <div className="flex flex-col items-center gap-6">
        <motion.p
          animate={{ opacity: [0.4, 0.9, 0.4], y: [0, -2, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="text-[10px] sm:text-[12px] md:text-[14px] lg:text-[16px] font-black uppercase tracking-[1em] text-peach italic ml-[1em] select-none text-center"
        >
          Our Bonded Eternity
        </motion.p>
        <div className="h-[2px] w-24 sm:w-32 md:w-48 bg-gradient-to-r from-transparent via-peach/40 to-transparent" />
      </div>
      <div className="flex flex-row flex-wrap justify-center items-center gap-x-8 sm:gap-x-16 lg:gap-x-24 gap-y-16 md:gap-y-32 max-w-[100rem] p-4 sm:p-12 w-full">
        {displayUnits.map((unit, idx) => (
          <div key={unit.label} className="flex flex-col items-center flex-shrink-0 group w-[33%] sm:w-auto">
            <div className="relative overflow-visible h-[5rem] sm:h-[12rem] lg:h-[16rem] xl:h-[20rem] flex items-center justify-center min-w-[2ch] tabular-nums">
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.1, 0.25, 0.1],
                  rotate: [0, 5, 0]
                }}
                transition={{
                  duration: 10 + idx,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className={`absolute inset-0 blur-[40px] sm:blur-[100px] lg:blur-[140px] rounded-full -z-10 pointer-events-none ${
                  idx % 2 === 0 ? 'bg-peach/40' : 'bg-mist/40'
                }`}
              />
              <div className="relative flex items-center justify-center tabular-nums overflow-visible">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={unit.value}
                    initial={{ y: 20, opacity: 0, scale: 0.95, filter: "blur(5px)" }}
                    animate={{ y: 0, opacity: 1, scale: 1, filter: "blur(0px)" }}
                    exit={{ y: -20, opacity: 0, scale: 0.95, filter: "blur(5px)" }}
                    transition={{
                      duration: 0.5,
                      ease: [0.23, 1, 0.32, 1],
                    }}
                    className="text-4xl sm:text-[8rem] md:text-[10rem] lg:text-[14rem] xl:text-[18rem] font-display font-black text-foreground tabular-nums tracking-[-0.05em] select-none whitespace-nowrap will-change-transform flex justify-center items-center leading-none"
                  >
                    {(unit.value).toString().padStart(2, '0')}
                  </motion.span>
                </AnimatePresence>
              </div>
            </div>
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              className="text-[8px] sm:text-lg lg:text-2xl xl:text-3xl uppercase tracking-[0.2em] sm:tracking-[0.6em] text-muted-foreground mt-4 sm:mt-12 lg:mt-16 font-black sm:ml-[0.6em] select-none whitespace-nowrap group-hover:text-peach group-hover:opacity-100 transition-all duration-700"
            >
              {unit.label}
            </motion.span>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-8 pt-12 md:pt-20 opacity-40 select-none">
        <div className="w-2 h-2 rounded-full bg-peach animate-ping" />
        <span className="text-[9px] md:text-[12px] font-serif italic text-foreground tracking-[0.4em] sm:tracking-[0.6em] uppercase font-bold">Resonating Forever</span>
        <div className="w-2 h-2 rounded-full bg-peach animate-ping" style={{ animationDelay: '2s' }} />
      </div>
    </div>
  );
}