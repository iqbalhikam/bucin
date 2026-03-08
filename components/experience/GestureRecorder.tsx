'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { HandLandmarker, FilesetResolver, Landmark } from '@mediapipe/tasks-vision';
import { normalizeLandmarks } from '@/lib/gestures/utils';
import { saveGestureAction } from '@/app/actions/gestures';

export const GestureRecorder = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const landmarkerRef = useRef<HandLandmarker | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [gestureName, setGestureName] = useState('New Gesture');
  const [status, setStatus] = useState('Waiting for camera...');
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [handCount, setHandCount] = useState(0);

  // Store the latest landmarks for capture
  const currentLandmarksRef = useRef<Landmark[][]>([]);

  useEffect(() => {
    let animationFrameId: number;

    const setupTracking = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm');
        landmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numHands: 2,
        });

        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: 640, height: 480 },
          });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.onloadedmetadata = () => {
              videoRef.current?.play();
              setIsReady(true);
              setStatus('Ready to Record');
            };
          }
        }
      } catch (error) {
        console.error('Error in setupTracking:', error);
        setStatus('Camera Error');
      }
    };

    const detect = async () => {
      if (videoRef.current && landmarkerRef.current && videoRef.current.readyState === 4) {
        const startTimeMs = performance.now();
        const results = landmarkerRef.current.detectForVideo(videoRef.current, startTimeMs);

        currentLandmarksRef.current = results.landmarks || [];
        setHandCount(results.landmarks?.length || 0);

        if (canvasRef.current) {
          const ctx = canvasRef.current.getContext('2d');
          if (ctx) {
            ctx.clearRect(0, 0, 640, 480);
            if (results.landmarks) {
              results.landmarks.forEach((landmarks) => {
                ctx.fillStyle = '#00f2ff';
                for (const lm of landmarks) {
                  ctx.beginPath();
                  ctx.arc(lm.x * 640, lm.y * 480, 4, 0, Math.PI * 2);
                  ctx.fill();
                }
              });
            }
          }
        }
      }
      animationFrameId = requestAnimationFrame(detect);
    };

    const videoElement = videoRef.current;
    setupTracking().then(() => detect());

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (videoElement?.srcObject) {
        (videoElement.srcObject as MediaStream).getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const handleCapture = useCallback(async () => {
    if (currentLandmarksRef.current.length === 0) {
      alert('No hands detected!');
      return;
    }

    setStatus('Processing...');

    // Normalize each hand detected
    const normalizedGestures = currentLandmarksRef.current.map((hand) => normalizeLandmarks(hand));

    const result = await saveGestureAction(gestureName, normalizedGestures);

    if (result.success) {
      setLastSaved(gestureName);
      setStatus('Saved! Ready for next.');
      setTimeout(() => setStatus('Ready to Record'), 2000);
    } else {
      setStatus('Save Failed!');
    }
  }, [gestureName]);

  // Spacebar trigger
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && isReady) {
        e.preventDefault();
        handleCapture();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleCapture, isReady]);

  return (
    <div className="flex flex-col items-center gap-6 p-10 bg-black/90 min-h-[600px] text-white rounded-3xl border border-white/10 shadow-2xl backdrop-blur-xl">
      <div className="text-center space-y-2">
        <h2 className="text-4xl font-black italic tracking-tighter text-transparent bg-clip-text bg-linier-to-r from-[#00f2ff] to-[#ff2d55]">GESTURE RECORDER</h2>
        <p className="text-xs uppercase tracking-[0.2em] font-bold opacity-50">Hand Landmark Calibration Tool</p>
      </div>

      <div className="relative w-[640px] h-[480px] bg-black rounded-2xl overflow-hidden border-2 border-[#00f2ff]/30 shadow-[0_0_50px_rgba(0,242,255,0.1)]">
        <video ref={videoRef} className="w-full h-full object-cover scale-x-[-1]" muted playsInline />
        <canvas ref={canvasRef} width={640} height={480} className="absolute top-0 left-0 w-full h-full scale-x-[-1]" />

        <div className="absolute top-6 left-6 flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full animate-pulse ${handCount > 0 ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-red-500 shadow-[0_0_10px_#ef4444]'}`} />
          <span className="text-[10px] font-black uppercase tracking-widest bg-black/80 px-2 py-1 rounded-md border border-white/10">{handCount > 0 ? `${handCount} Hand(s) Active` : 'No Hands'}</span>
        </div>

        <div className="absolute bottom-6 left-12 right-12 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80 mb-2">Current Status</p>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-6 py-2">
            <span className="text-sm font-bold">{status}</span>
          </div>
        </div>
      </div>

      <div className="w-full max-w-[640px] grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-[10px] uppercase font-black tracking-widest opacity-50 ml-2">Gesture Label</label>
          <input
            type="text"
            value={gestureName}
            onChange={(e) => setGestureName(e.target.value)}
            className="bg-white/5 border border-white/20 rounded-xl px-5 py-4 text-white font-bold focus:outline-none focus:border-[#00f2ff] transition-all"
            placeholder="Name your gesture..."
          />
        </div>
        <div className="flex flex-col gap-2 justify-end">
          <button
            onClick={handleCapture}
            disabled={!isReady || handCount === 0}
            className="group relative bg-linier-to-br from-[#00f2ff] to-[#0066ff] hover:from-[#ff2d55] hover:to-[#ff8000] disabled:opacity-30 disabled:grayscale py-4 rounded-xl text-black font-black uppercase tracking-tighter transition-all duration-500">
            <span className="relative z-10">Capture Pose</span>
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black px-1.5 py-0.5 border border-black/30 rounded opacity-50">SPACE</span>
          </button>
        </div>
      </div>

      {lastSaved && (
        <div className="animate-in fade-in slide-in-from-bottom-2 flex items-center gap-3 bg-green-500/20 border border-green-500/30 px-4 py-2 rounded-lg">
          <span className="text-xs font-bold text-green-400">
            Successfully recorded: <strong>{lastSaved}</strong>
          </span>
        </div>
      )}

      <div className="text-[9px] uppercase tracking-widest opacity-30 text-center max-w-[400px]">Coordinates are automatically normalized relative to the wrist and scaled for distance invariance.</div>
    </div>
  );
};
