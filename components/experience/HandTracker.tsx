'use client';

import React, { useEffect, useRef } from 'react';
import { HandLandmarker, FilesetResolver, Landmark } from '@mediapipe/tasks-vision';
import { useExperienceStore } from '@/lib/experience/store';
import { detectCustomGesture } from '@/lib/gestures/utils';
import customGestures from '@/src/data/customGestures.json';

export const HandTracker = React.memo(() => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const experienceStarted = useExperienceStore((state) => state.experienceStarted);
  const calibrationData = useExperienceStore((state) => state.calibrationData);
  const statusOverlayRef = useRef<HTMLDivElement>(null);
  const landmarkerRef = useRef<HandLandmarker | null>(null);
  const lastPos = useRef({ x: 0.5, y: 0.5 });
  const isCalibratingRef = useRef(false);
  const metricsRef = useRef<{ thumbDist: number; indexDist: number; wristDist: number; verticalSpan: number } | null>(null);
  const heartGestureStartTime = useRef<number | null>(null);
  const calibrationDataRef = useRef(calibrationData);
  const trackingStartTime = useRef<number | null>(null);

  useEffect(() => {
    calibrationDataRef.current = calibrationData;
  }, [calibrationData]);

  useEffect(() => {
    if (!experienceStarted) return;

    let animationFrameId: number;

    const drawHands = (ctx: CanvasRenderingContext2D, multiHandLandmarks: Landmark[][]) => {
      ctx.clearRect(0, 0, 640, 480);

      const connections = [
        [0, 1],
        [1, 2],
        [2, 3],
        [3, 4],
        [0, 5],
        [5, 6],
        [6, 7],
        [7, 8],
        [0, 9],
        [9, 10],
        [10, 11],
        [11, 12],
        [0, 13],
        [13, 14],
        [14, 15],
        [15, 16],
        [0, 17],
        [17, 18],
        [18, 19],
        [19, 20],
        [5, 9],
        [9, 13],
        [13, 17],
        [5, 17],
      ];

      multiHandLandmarks.forEach((landmarks, index) => {
        ctx.strokeStyle = index === 0 ? '#ff2d55' : '#00f2ff';
        ctx.lineWidth = 2;
        ctx.fillStyle = '#ffffff';

        for (const [start, end] of connections) {
          if (landmarks[start] && landmarks[end]) {
            ctx.beginPath();
            ctx.moveTo(landmarks[start].x * 640, landmarks[start].y * 480);
            ctx.lineTo(landmarks[end].x * 640, landmarks[end].y * 480);
            ctx.stroke();
          }
        }

        for (const landmark of landmarks) {
          ctx.beginPath();
          ctx.arc(landmark.x * 640, landmark.y * 480, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      });
    };

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
            };
          }
        }
      } catch (error) {
        console.error('Error in setupTracking:', error);
      }
    };

    const detect = async () => {
      if (videoRef.current && landmarkerRef.current && videoRef.current.readyState === 4) {
        const startTimeMs = performance.now();
        const results = landmarkerRef.current.detectForVideo(videoRef.current, startTimeMs);
        const store = useExperienceStore.getState();

        if (results.landmarks && results.landmarks.length > 0) {
          if (store.isTracking !== true) store.setTracking(true);

          if (canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            if (ctx) drawHands(ctx, results.landmarks);
          }

          const primaryHand = results.landmarks[0];
          const thumbTip = primaryHand[4];
          const indexTip = primaryHand[8];

          const pinchDist = Math.sqrt(Math.pow(thumbTip.x - indexTip.x, 2) + Math.pow(thumbTip.y - indexTip.y, 2));
          const pinching = pinchDist < 0.05;
          if (store.isPinching !== pinching) store.setIsPinching(pinching);

          const targetX = 1 - (thumbTip.x + indexTip.x) / 2;
          const targetY = (thumbTip.y + indexTip.y) / 2;

          const smoothing = 0.2;
          const newX = lastPos.current.x + (targetX - lastPos.current.x) * smoothing;
          const newY = lastPos.current.y + (targetY - lastPos.current.y) * smoothing;
          lastPos.current = { x: newX, y: newY };

          useExperienceStore.setState({
            handLandmarks: primaryHand,
            handPos: { x: newX, y: newY },
          });

          let customMatched = false;
          let matchedName = '';

          for (const hand of results.landmarks) {
            for (const template of customGestures) {
              const { matched } = detectCustomGesture(hand, template.landmarks[0] as Landmark[], 0.18);
              if (matched) {
                customMatched = true;
                matchedName = template.name;
                break;
              }
            }
            if (customMatched) break;
          }

          if (customMatched) {
            const { setFormationText, formationText } = useExperienceStore.getState();
            let targetText = 'I LOVE YOU';
            if (matchedName.startsWith('ILOVEYOUDELVAGRISHELA')) {
              targetText = 'I LOVE YOU\nDELVA GRISHELA';
            } else if (matchedName === 'OPEN_GALLERY') {
              targetText = 'MEMORI KITA';
            }
            if (formationText !== targetText) {
              setFormationText(targetText);
            }
          }

          let heartMatched = false;
          if (results.landmarks.length === 2) {
            const hand1 = results.landmarks[0];
            const hand2 = results.landmarks[1];

            const thumbDist = Math.sqrt(Math.pow(hand1[4].x - hand2[4].x, 2) + Math.pow(hand1[4].y - hand2[4].y, 2));
            const indexDist = Math.sqrt(Math.pow(hand1[8].x - hand2[8].x, 2) + Math.pow(hand1[8].y - hand2[8].y, 2));
            const wristDist = Math.sqrt(Math.pow(hand1[0].x - hand2[0].x, 2) + Math.pow(hand1[0].y - hand2[0].y, 2));

            const avgIndexY = (hand1[8].y + hand2[8].y) / 2;
            const avgThumbY = (hand1[4].y + hand2[4].y) / 2;
            const isVerticallyCorrect = avgIndexY < avgThumbY - 0.08;
            const isSymmetrical = Math.abs(hand1[0].y - hand2[0].y) < 0.15;
            const isHorizontallyAligned = Math.abs(hand1[0].x - hand2[0].x) < 0.3;
            const verticalSpan = Math.abs(avgIndexY - avgThumbY);
            const isNotFlat = verticalSpan > 0.08;

            const currentCalibration = calibrationDataRef.current;
            if (currentCalibration) {
              heartMatched =
                Math.abs(thumbDist - currentCalibration.thumbDist) < 0.08 &&
                Math.abs(indexDist - currentCalibration.indexDist) < 0.08 &&
                Math.abs(wristDist - currentCalibration.wristDist) < 0.15 &&
                Math.abs(verticalSpan - currentCalibration.verticalSpan) < 0.1 &&
                isVerticallyCorrect &&
                isSymmetrical &&
                isHorizontallyAligned;
            } else {
              heartMatched = thumbDist < 0.1 && indexDist < 0.1 && wristDist < 0.35 && isVerticallyCorrect && isSymmetrical && isHorizontallyAligned && isNotFlat;
            }

            if (!heartMatched && !isCalibratingRef.current) {
              if (canvasRef.current) {
                const ctx = canvasRef.current.getContext('2d');
                if (ctx) {
                  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
                  ctx.font = 'bold 20px Outfit, sans-serif';
                  if (thumbDist > 0.1 || indexDist > 0.1) {
                    ctx.fillText('SAMBUNGKAN UJUNG JARI', 180, 440);
                  } else if (!isVerticallyCorrect) {
                    ctx.fillText('MIRINGKAN TANGAN (BENTUK HATI)', 120, 440);
                  }
                }
              }
            }
            if (isCalibratingRef.current) {
              if (canvasRef.current) {
                const ctx = canvasRef.current.getContext('2d');
                if (ctx) {
                  ctx.fillStyle = '#00f2ff';
                  ctx.font = 'bold 24px Outfit, sans-serif';
                  ctx.fillText('MENYALURKAN KALIBRASI...', 160, 40);
                  metricsRef.current = { thumbDist, indexDist, wristDist, verticalSpan };
                }
              }
              heartMatched = false;
            }
          }

          const isAnyLoveActive = customMatched || heartMatched;

          if (isAnyLoveActive) {
            if (!heartGestureStartTime.current) {
              heartGestureStartTime.current = performance.now();
            }
            const elapsed = performance.now() - heartGestureStartTime.current;

            if (canvasRef.current) {
              const ctx = canvasRef.current.getContext('2d');
              if (ctx) {
                const percent = Math.min(100, Math.round((elapsed / 1000) * 100));
                ctx.save();
                ctx.scale(-1, 1);
                ctx.fillStyle = customMatched ? '#00f2ff' : '#ff2d55';
                ctx.font = 'bold 32px Outfit, sans-serif';
                ctx.fillText(customMatched ? 'SIMBOL CINTA TERDETEKSI!' : 'MEMBENTUK CINTA...', -500, 80);
                ctx.restore();
                ctx.fillRect(180, 100, 200 * (percent / 100), 10);
              }
            }

            if (elapsed > 100 && !store.loveFormed) {
              store.setLoveFormed(true);
            }
          } else {
            heartGestureStartTime.current = null;
            if (store.loveFormed) {
              store.setLoveFormed(false);
            }
          }

          if (!trackingStartTime.current) trackingStartTime.current = performance.now();

          if (statusOverlayRef.current) {
            const overlay = statusOverlayRef.current;
            if (isAnyLoveActive) {
              overlay.innerText = 'Membentuk Cinta...';
              overlay.style.backgroundColor = 'rgba(239, 68, 68, 0.8)';
              overlay.style.transform = 'scale(1)';
            } else if (pinching) {
              overlay.innerText = 'Genggam';
              overlay.style.backgroundColor = 'rgba(236, 72, 153, 0.9)';
              overlay.style.transform = 'scale(1.1)';
            } else {
              overlay.innerText = 'Terdeteksi';
              overlay.style.backgroundColor = 'rgba(34, 197, 94, 0.8)';
              overlay.style.transform = 'scale(1)';
            }
          }
        } else {
          if (store.isTracking !== false) store.setTracking(false);
          if (store.isPinching !== false) store.setIsPinching(false);
          heartGestureStartTime.current = null;
          if (canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            ctx?.clearRect(0, 0, 640, 480);
          }
          if (statusOverlayRef.current) {
            const overlay = statusOverlayRef.current;
            overlay.innerText = 'Mencari...';
            overlay.style.backgroundColor = 'rgba(239, 68, 68, 0.8)';
            overlay.style.transform = 'scale(1)';
          }
        }
      }
      animationFrameId = requestAnimationFrame(detect);
    };

    setupTracking().then(() => {
      detect();
    });

    const videoElement = videoRef.current;
    return () => {
      cancelAnimationFrame(animationFrameId);
      if (videoElement?.srcObject) {
        (videoElement.srcObject as MediaStream).getTracks().forEach((track) => track.stop());
      }
    };
  }, [experienceStarted]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'c') {
        isCalibratingRef.current = !isCalibratingRef.current;
        if (!isCalibratingRef.current && metricsRef.current) {
          useExperienceStore.getState().setCalibrationData(metricsRef.current);
        }
      }
      if (e.key === 'Shift') {
        if (e.repeat) return;
        useExperienceStore.setState({ isShiftPressed: true });
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        useExperienceStore.setState({ isShiftPressed: false });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      useExperienceStore.setState({ isShiftPressed: false });
    };
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        width: '240px',
        height: '180px',
        zIndex: 50,
        opacity: experienceStarted ? 1 : 0,
        pointerEvents: 'none',
      }}>
      <video
        ref={videoRef}
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '12px',
          objectFit: 'cover',
          transform: 'scaleX(-1)',
          border: '2px solid rgba(255, 255, 255, 0.2)',
        }}
        muted
        playsInline
      />
      <canvas
        ref={canvasRef}
        width={640}
        height={480}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          transform: 'scaleX(-1)',
          pointerEvents: 'none',
        }}
      />
      <div ref={statusOverlayRef} className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold tracking-tighter uppercase transition-all duration-200" style={{ backgroundColor: 'rgba(239, 68, 68, 0.8)', color: 'white' }}>
        Mencari...
      </div>
    </div>
  );
});

HandTracker.displayName = 'HandTracker';
