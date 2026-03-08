'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface TimerProps {
  startDate: Date;
}

export default function Timer({ startDate }: TimerProps) {
  const [timeElapsed, setTimeElapsed] = useState({
    years: 0,
    months: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const start = new Date(startDate).getTime();

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const difference = now - start;

      const years = Math.floor(difference / (1000 * 60 * 60 * 24 * 365));
      const months = Math.floor((difference % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30));
      const days = Math.floor((difference % (1000 * 60 * 60 * 24 * 30)) / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeElapsed({ years, months, days, hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(timer);
  }, [startDate]);

  const TimeBox = ({ value, label }: { value: number; label: string }) => (
    <motion.div whileHover={{ scale: 1.05 }} className="flex flex-col items-center bg-white/50 backdrop-blur-md p-4 rounded-xl shadow-sm border border-pink-100 min-w-[80px]">
      <span className="text-3xl font-bold text-pink-600">{value}</span>
      <span className="text-xs text-gray-500 uppercase tracking-wider">{label}</span>
    </motion.div>
  );

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-transparent to-pink-50/50">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-10">We've been together for</h2>
        <div className="flex flex-wrap justify-center gap-4">
          <TimeBox value={timeElapsed.years} label="Years" />
          <TimeBox value={timeElapsed.months} label="Months" />
          <TimeBox value={timeElapsed.days} label="Days" />
          <TimeBox value={timeElapsed.hours} label="Hours" />
          <TimeBox value={timeElapsed.minutes} label="Mins" />
          <TimeBox value={timeElapsed.seconds} label="Secs" />
        </div>
      </div>
    </section>
  );
}
