'use client';

import { useExperienceStore } from '@/lib/experience/store';
import { HandTracker } from '@/components/experience/HandTracker';
import { RomanticScene } from '@/components/experience/RomanticScene';
import { motion, AnimatePresence } from 'framer-motion';

export default function ExperiencePage() {
  const { experienceStarted, startExperience } = useExperienceStore();

  return (
    <main className="relative min-h-screen overflow-hidden bg-linier-to-br from-gray-900 to-black">
      <AnimatePresence>
        {!experienceStarted && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6 text-center">
            <motion.div initial={{ scale: 0.8, y: 20 }} animate={{ scale: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.8, ease: 'easeOut' }} className="space-y-8">
              <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-linier-to-r from-pink-500 to-purple-400">Our Universe</h1>
              <p className="max-w-md mx-auto text-gray-400 text-lg leading-relaxed">Experience a reactive 3D space controlled by your movements. Please allow webcam access for hand tracking.</p>

              <button onClick={startExperience} className="group relative px-8 py-4 bg-pink-600 text-white rounded-full text-xl font-medium overflow-hidden transition-all hover:bg-pink-500 hover:shadow-[0_0_30px_rgba(236,72,153,0.4)]">
                <span className="relative z-10">Start Experience</span>
                <motion.div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity" whileHover={{ scale: 1.5 }} />
              </button>

              <div className="flex gap-4 justify-center pt-8">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <div className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
                  Interactive 3D
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
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
