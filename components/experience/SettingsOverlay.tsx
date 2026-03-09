import React from 'react';
import { useExperienceStore } from '@/lib/experience/store';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, X, BookOpen } from 'lucide-react';

export const SettingsOverlay = () => {
  const showSettings = useExperienceStore((state) => state.showSettings);
  const setShowSettings = useExperienceStore((state) => state.setShowSettings);
  const showGestureGuide = useExperienceStore((state) => state.showGestureGuide);
  const setShowGestureGuide = useExperienceStore((state) => state.setShowGestureGuide);
  const heartIntensity = useExperienceStore((state) => state.heartIntensity);
  const setHeartIntensity = useExperienceStore((state) => state.setHeartIntensity);
  const heartColor = useExperienceStore((state) => state.heartColor);
  const setHeartColor = useExperienceStore((state) => state.setHeartColor);

  const colors = [
    '#ff1a4a', // Neon Red
    '#ff2d55', // Classic Pink
    '#00f2ff', // Cyber Blue
    '#bc13fe', // Purple Glow
    '#39ff14', // Neon Green
    '#ffffff', // Pure White
  ];

  return (
    <div className="fixed top-6 right-6 z-50 flex flex-col items-end gap-3 pointer-events-none">
      <div className="flex gap-3 pointer-events-auto">
        {/* Guide Toggle Button */}
        <button
          onClick={() => {
            setShowGestureGuide(!showGestureGuide);
            if (showSettings) setShowSettings(false);
          }}
          className={`p-3 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl transition-all active:scale-95 ${showGestureGuide ? 'text-blue-400 border-blue-400/30' : 'text-white/70 hover:text-white hover:scale-110'}`}>
          <BookOpen size={20} />
        </button>

        {/* Settings Toggle Button */}
        <button
          onClick={() => {
            setShowSettings(!showSettings);
            if (showGestureGuide) setShowGestureGuide(false);
          }}
          className={`p-3 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl transition-all active:scale-95 ${showSettings ? 'text-pink-500 border-pink-500/30' : 'text-white/70 hover:text-white hover:scale-110'}`}>
          {showSettings ? <X size={20} /> : <Settings size={20} />}
        </button>
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            className="pointer-events-auto w-72 p-6 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl">
            <div className="space-y-6">
              <div>
                <h3 className="text-white/40 text-[10px] uppercase tracking-[0.2em] font-medium mb-4">Tampilan</h3>
                <div className="space-y-4">
                  {/* Intensity Slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-white/80 text-xs font-light">Intensitas</label>
                      <span className="text-white/40 text-[10px] font-mono">{heartIntensity}</span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="50"
                      step="0.1"
                      value={heartIntensity}
                      onChange={(e) => setHeartIntensity(parseFloat(e.target.value))}
                      className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white hover:accent-pink-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-white/40 text-[10px] uppercase tracking-[0.2em] font-medium mb-3">Palet Warna</h3>
                <div className="flex flex-wrap gap-2">
                  {colors.map((c) => (
                    <button
                      key={c}
                      onClick={() => setHeartColor(c)}
                      className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${heartColor === c ? 'border-white scale-110 shadow-[0_0_15px_rgba(255,255,255,0.3)]' : 'border-transparent opacity-60 hover:opacity-100'}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                  <div className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-white/10 opacity-60 hover:opacity-100 transition-all">
                    <input type="color" value={heartColor} onChange={(e) => setHeartColor(e.target.value)} className="absolute inset-[-50%] w-[200%] h-[200%] cursor-pointer" />
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-white/5">
                <p className="text-white/20 text-[9px] leading-relaxed italic">Atur keajaiban sesuai keinginanmu. Perubahan langsung diterapkan.</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
