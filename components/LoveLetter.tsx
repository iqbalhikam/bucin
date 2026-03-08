'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, X } from 'lucide-react';

interface LoveLetterProps {
  content: string;
}

export default function LoveLetter({ content }: LoveLetterProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section className="py-20 px-4 flex justify-center items-center min-h-[50vh]">
      <div className="relative">
        {!isOpen ? (
          <motion.div
            whileHover={{ scale: 1.05, rotate: 2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="cursor-pointer bg-pink-100 w-64 h-48 rounded-lg shadow-xl border-2 border-pink-200 flex items-center justify-center relative overflow-hidden">
            {/* Envelope Flap visual */}
            <div className="absolute top-0 left-0 w-full h-1/2 bg-pink-200 origin-top transform skew-y-6 z-10 border-b-2 border-pink-300"></div>
            <Heart className="text-pink-500 fill-pink-500 w-12 h-12 animate-pulse z-20" />
            <span className="absolute bottom-4 text-pink-400 font-handwriting text-lg">Click to Open</span>
          </motion.div>
        ) : (
          <AnimatePresence>
            <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} className="bg-white p-8 max-w-lg rounded-lg shadow-2xl border border-pink-100 relative">
              <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>

              <div className="prose prose-pink">
                <h3 className="text-2xl font-serif text-gray-800 mb-4">My Dearest...</h3>
                <p className="whitespace-pre-wrap text-gray-600 leading-relaxed font-serif">{content}</p>
                <div className="mt-8 flex justify-end">
                  <Heart className="text-red-500 fill-red-500 w-6 h-6" />
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </section>
  );
}
