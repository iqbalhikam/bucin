'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MusicPlayerProps {
  url: string | null;
  title: string | null;
}

export default function MusicPlayer({ url, title }: MusicPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch((e) => console.log('Auto-play prevented:', e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  // Try to auto-play on mount if URL exists
  useEffect(() => {
    if (url && audioRef.current) {
      // Many browsers block this, but we try
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then((_) => {
            setIsPlaying(true);
          })
          .catch((error) => {
            console.log('Autoplay prevented. User interaction required.');
            setIsPlaying(false);
          });
      }
    }
  }, [url]);

  if (!url) return null;

  return (
    <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="fixed bottom-4 right-4 z-50 flex items-center gap-3 bg-white/80 backdrop-blur-md p-3 rounded-full shadow-lg border border-pink-100">
      <div className="flex flex-col">
        <span className="text-xs font-medium text-pink-600 max-w-[120px] truncate">{title || 'Background Music'}</span>
      </div>

      <audio ref={audioRef} src={url} loop muted={isMuted} />

      <button onClick={() => setIsPlaying(!isPlaying)} className="p-2 rounded-full bg-pink-500 text-white hover:bg-pink-600 transition-colors">
        {isPlaying ? <Pause size={16} /> : <Play size={16} />}
      </button>

      <button onClick={() => setIsMuted(!isMuted)} className="p-2 rounded-full bg-pink-100 text-pink-500 hover:bg-pink-200 transition-colors">
        {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
      </button>
    </motion.div>
  );
}
