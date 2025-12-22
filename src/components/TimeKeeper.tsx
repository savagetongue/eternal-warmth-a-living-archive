import React, { useState, useEffect } from 'react';
import { intervalToDuration, formatDuration } from 'date-fns';
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
    <div className="flex flex-col items-center justify-center space-y-4 py-12 animate-fade-in">
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground italic">
        Bonded for eternity
      </p>
      <div className="flex flex-wrap justify-center gap-4 sm:gap-8">
        {Object.entries(duration).map(([unit, value]) => (
          value !== undefined && value > 0 && (
            <div key={unit} className="flex flex-col items-center">
              <span className="text-4xl md:text-6xl font-serif font-bold text-foreground">
                {value.toString().padStart(2, '0')}
              </span>
              <span className="text-xs uppercase tracking-widest text-muted-foreground mt-1">
                {unit}
              </span>
            </div>
          )
        ))}
      </div>
    </div>
  );
}