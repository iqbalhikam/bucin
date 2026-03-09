import React from 'react';
import { useExperienceStore } from '@/lib/experience/store';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, X } from 'lucide-react';

export const GestureGuide = () => {
  const { showGestureGuide, setShowGestureGuide } = useExperienceStore();

  const guides = [
    {
      icon: <span className="text-2xl">✊</span>,
      title: 'Genggam',
      desc: 'Kepalkan tanganmu untuk berinteraksi.',
    },
    {
      icon: <span className="text-2xl">☝️</span>,
      title: 'Tunjuk',
      desc: 'Angkat jari telunjukmu.',
    },
  ];

  return (
    <AnimatePresence>
      {showGestureGuide && (
        <motion.div
          initial={{ opacity: 0, x: 20, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 20, scale: 0.95 }}
          className="fixed top-24 right-6 z-50 w-72 p-6 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl pointer-events-auto">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <BookOpen size={16} className="text-white/40" />
              <h3 className="text-white/40 text-[10px] uppercase tracking-[0.2em] font-medium">Panduan</h3>
            </div>
            <button onClick={() => setShowGestureGuide(false)} className="text-white/20 hover:text-white transition-colors">
              <X size={16} />
            </button>
          </div>

          <div className="space-y-6">
            {guides.map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="space-y-2">
                <div className="flex items-center gap-2">
                  {item.icon}
                  <h4 className="text-white/90 text-sm font-medium tracking-wide">{item.title}</h4>
                </div>
                <p className="text-white/40 text-xs font-light leading-relaxed ml-7">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 pt-4 border-t border-white/5">
            <p className="text-white/20 text-[9px] leading-relaxed italic text-center">&quot;arahan untuk kamu sayang&quot;</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
