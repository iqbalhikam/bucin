'use client';

import { useExperienceStore } from '@/lib/experience/store';
import { HandTracker } from '@/components/experience/HandTracker';
import { RomanticScene } from '@/components/experience/RomanticScene';
import { motion, AnimatePresence } from 'framer-motion';

export default function ExperiencePage() {
  const { experienceStarted, startExperience } = useExperienceStore();

  return (
    <main className="relative min-h-screen overflow-hidden bg-linear-to-br from-gray-950 via-black to-black">
      <AnimatePresence>
        {!experienceStarted && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6 text-center">
            <motion.div initial={{ scale: 0.8, y: 20 }} animate={{ scale: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.8, ease: 'easeOut' }} className="space-y-10 relative">
              {/* Subtle background glow for elegance */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] bg-pink-500/5 blur-[100px] rounded-full pointer-events-none" />

              <h1 className="text-6xl md:text-8xl font-bold bg-clip-text text-transparent bg-linear-to-r from-pink-400 via-rose-300 to-purple-400 font-dancing drop-shadow-sm tracking-wide">Our Universe</h1>

              <div className="max-w-md mx-auto space-y-3">
                <p className="text-gray-200 text-lg md:text-xl leading-relaxed font-light">A little universe created just for us.</p>
                <p className="text-gray-400 text-sm md:text-base leading-relaxed font-light">
                  From Iqbal to Delva.
                  <br />
                  <span className="text-[10px] md:text-xs text-rose-300/40 mt-6 block tracking-widest uppercase">(Please allow camera access for hand tracking)</span>
                </p>
              </div>

              <button
                onClick={startExperience}
                className="group relative px-8 py-4 bg-linear-to-r from-pink-600 to-rose-500 text-white rounded-full text-lg font-medium overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(236,72,153,0.4)] active:scale-95 border border-pink-400/20">
                <span className="relative z-10 flex items-center justify-center gap-3 tracking-wide">
                  Enter Our World
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </span>
                <motion.div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
              </button>

              <div className="flex gap-6 justify-center pt-8">
                <div className="flex items-center gap-2 text-[10px] md:text-xs text-gray-500 font-light tracking-[0.2em] uppercase">
                  <div className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-pulse shadow-[0_0_8px_rgba(244,114,182,0.8)]" />
                  Interactive 3D
                </div>
                <div className="flex items-center gap-2 text-[10px] md:text-xs text-gray-500 font-light tracking-[0.2em] uppercase">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse shadow-[0_0_8px_rgba(129,140,248,0.8)]" />
                  Hand Tracking
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <HandTracker />
      <RomanticScene />

      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(236,72,153,0.1),transparent_70%)]" />
      </div>
    </main>
  );
}
