'use client';

import { useExperienceStore } from '@/lib/experience/store';
import { HandTracker } from '@/components/experience/HandTracker';
import { GalleryScene } from '@/components/experience/GalleryScene';
import Link from 'next/link';

export default function GalleryPage() {
  const experienceStarted = useExperienceStore((state) => state.experienceStarted);
  const startExperience = useExperienceStore((state) => state.startExperience);

  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">
      {!experienceStarted ? (
        <div className="flex flex-col items-center justify-center min-h-screen z-10 relative">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-linear-to-r from-pink-400 to-purple-400 mb-8">Memori Kita</h1>
          <button onClick={startExperience} className="px-8 py-4 bg-linear-to-r from-pink-600 to-rose-500 rounded-full text-lg font-medium hover:scale-105 transition-all">
            Start Spatial Tracking
          </button>
        </div>
      ) : (
        <>
          <HandTracker />
          <GalleryScene />

          <div className="absolute top-8 left-8 z-50">
            <Link href="/" className="px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white font-medium hover:bg-white/20 transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)]">
              Kembali
            </Link>
          </div>
        </>
      )}
    </main>
  );
}
