'use client';

import { GestureRecorder } from '@/components/experience/GestureRecorder';

export default function RecordingPage() {
  return (
    <main className="min-h-screen bg-[#050505] flex items-center justify-center p-8">
      <div className="w-full max-w-4xl">
        <GestureRecorder />

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm">
            <h3 className="text-[#00f2ff] font-bold mb-2 text-sm uppercase tracking-wider">1. Position</h3>
            <p className="text-xs text-white/50 leading-relaxed">Place your hand(s) in the frame. The points will turn cyan when tracking is active.</p>
          </div>
          <div className="p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm">
            <h3 className="text-[#ff2d55] font-bold mb-2 text-sm uppercase tracking-wider">2. Capture</h3>
            <p className="text-xs text-white/50 leading-relaxed">
              Name your gesture and press <strong>SPACE</strong> or click <strong>CAPTURE</strong> to save the 3D landmarks.
            </p>
          </div>
          <div className="p-10 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm">
            <h3 className="text-white font-bold mb-2 text-sm uppercase tracking-wider">3. Results</h3>
            <p className="text-xs text-white/50 leading-relaxed">
              The data is saved to <code>src/data/customGestures.json</code> and printed to your terminal.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
