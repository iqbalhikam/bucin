'use client';

import { motion } from 'framer-motion';
import { Heart, ChevronDown } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';

export default function Hero({ partnerName = 'My Love' }: { partnerName?: string }) {
  const [text, setText] = useState('');

  const messages = useMemo(() => [`Hi, ${partnerName}...`, 'You make my world brighter.', 'I love you more every day.', "Let's make more memories."], [partnerName]);

  const [index, setIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [reverse, setReverse] = useState(false);

  // Typewriter effect logic
  useEffect(() => {
    if (index >= messages.length) {
      setIndex(0);
      return;
    }

    if (subIndex === messages[index].length + 1 && !reverse) {
      setTimeout(() => setReverse(true), 1000);
      return;
    }

    if (subIndex === 0 && reverse) {
      setReverse(false);
      setIndex((prev) => (prev + 1) % messages.length);
      return;
    }

    const timeout = setTimeout(
      () => {
        setSubIndex((prev) => prev + (reverse ? -1 : 1));
      },
      Math.max(reverse ? 75 : subIndex === messages[index].length ? 1000 : 150, 0),
    );

    return () => clearTimeout(timeout);
  }, [subIndex, index, reverse, messages]);

  useEffect(() => {
    setText(messages[index].substring(0, subIndex));
  }, [subIndex, index, messages]);

  return (
    <section className="relative h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-rose-50 dark:bg-slate-950 transition-colors duration-500">
      {/* Background Blobs */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            x: [0, 30, -20, 0],
            y: [0, -50, 20, 0],
            scale: [1, 1.1, 0.9, 1],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute top-0 -left-4 w-72 h-72 bg-rose-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob dark:bg-rose-900/30 dark:mix-blend-screen"
        />
        <motion.div
          animate={{
            x: [0, -30, 20, 0],
            y: [0, 50, -20, 0],
            scale: [1, 1.2, 0.8, 1],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 2,
          }}
          className="absolute top-0 -right-4 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob dark:bg-indigo-900/30 dark:mix-blend-screen"
        />
        <motion.div
          animate={{
            x: [0, 20, -20, 0],
            y: [0, -20, 20, 0],
            scale: [1, 0.9, 1.1, 1],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 4,
          }}
          className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob dark:bg-pink-900/30 dark:mix-blend-screen"
        />
      </div>

      {/* Centerpiece */}
      <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, ease: 'easeOut' }} className="z-10 flex flex-col items-center text-center space-y-6 max-w-2xl px-4">
        <div className="relative">
          <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }} className="absolute inset-0 bg-rose-400 rounded-full blur-lg opacity-50 dark:opacity-70" />
          <Heart className="w-24 h-24 text-rose-500 fill-rose-500 relative z-10 drop-shadow-lg" />
        </div>

        <h1 className="text-4xl md:text-6xl font-bold font-outfit text-slate-800 dark:text-rose-50 tracking-tight">
          <span className="min-h-[1.5em] block">{text}</span>
          <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ duration: 0.8, repeat: Infinity }} className="inline-block w-1 h-8 md:h-12 bg-rose-500 ml-1 align-middle" />
        </h1>

        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 font-dancing italic">Every moment with you is a treasure.</p>
      </motion.div>

      {/* Scroll Down Indicator */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-10 z-10 cursor-pointer"
        onClick={() => {
          window.scrollTo({
            top: window.innerHeight,
            behavior: 'smooth',
          });
        }}>
        <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 2, repeat: Infinity }}>
          <ChevronDown className="w-10 h-10 text-slate-400 dark:text-rose-400 hover:text-rose-500 transition-colors" />
        </motion.div>
      </motion.div>
    </section>
  );
}
