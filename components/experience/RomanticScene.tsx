'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { Suspense, useEffect } from 'react';
import { Environment } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import { useExperienceStore } from '@/lib/experience/store';
import { Heart, Initials, GlowParticles, HeartFormation } from './Elements';

const HEART_DATA = [
  { id: 1, position: [5, 2, -5], scale: 0.7, color: '#ff2d55' },
  { id: 2, position: [-5, -3, -2], scale: 0.9, color: '#ffb6c1' },
  { id: 3, position: [3, -5, -8], scale: 0.6, color: '#ff2d55' },
  { id: 4, position: [-8, 4, -4], scale: 1.1, color: '#ffb6c1' },
  { id: 5, position: [0, 6, -10], scale: 0.8, color: '#ff2d55' },
  { id: 6, position: [7, -2, -3], scale: 0.5, color: '#ffb6c1' },
  { id: 7, position: [-2, 8, -6], scale: 1.0, color: '#ff2d55' },
  { id: 8, position: [9, 5, -5], scale: 0.7, color: '#ffb6c1' },
  { id: 9, position: [-4, -6, -9], scale: 0.8, color: '#ff2d55' },
  { id: 10, position: [2, -8, -2], scale: 0.9, color: '#ffb6c1' },
  { id: 11, position: [-9, -1, -5], scale: 0.6, color: '#ff2d55' },
  { id: 12, position: [6, 7, -4], scale: 1.2, color: '#ffb6c1' },
  { id: 13, position: [-6, 2, -7], scale: 0.7, color: '#ff2d55' },
  { id: 14, position: [4, -4, -1], scale: 0.5, color: '#ffb6c1' },
  { id: 15, position: [1, 3, -12], scale: 0.9, color: '#ff2d55' },
] as const;

const HandControlledCamera = () => {
  const formationComplete = useExperienceStore((state) => state.formationComplete);

  useFrame((state) => {
    const { handPos } = useExperienceStore.getState();

    // Map hand coordinates (0..1) to 3D targets
    // Only move camera once formation is complete to maintain assembly clarity
    const targetX = formationComplete ? (handPos.x - 0.5) * 20 : 0;
    const targetY = formationComplete ? -(handPos.y - 0.5) * 12 : 0;

    // Smooth movement with lerp
    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, targetX, 0.08);
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, targetY, 0.08);
    state.camera.position.z = 10;

    // Always focus on the center where initials/hearts are
    state.camera.lookAt(0, 0, 0);
  });

  return null;
};

import { SettingsOverlay } from './SettingsOverlay';
import { GestureGuide } from './GestureGuide';

export const RomanticScene = () => {
  const experienceStarted = useExperienceStore((state) => state.experienceStarted);
  const loveFormed = useExperienceStore((state) => state.loveFormed);
  const formationComplete = useExperienceStore((state) => state.formationComplete);
  const isTracking = useExperienceStore((state) => state.isTracking);
  // Actions
  const setHandPos = useExperienceStore((state) => state.setHandPos);
  const setTracking = useExperienceStore((state) => state.setTracking);
  const setIsPinching = useExperienceStore((state) => state.setIsPinching);
  const setLoveFormed = useExperienceStore((state) => state.setLoveFormed);

  useEffect(() => {
    console.log('RomanticScene mounted, experienceStarted:', experienceStarted);
  }, [experienceStarted]);

  useEffect(() => {
    if (loveFormed) console.log('Scene Transition: LOVE FORMED triggered');
  }, [loveFormed]);

  // The original useEffect for resetting state is kept, but its dependencies are adjusted
  // to reflect that setHandPos, setTracking, setIsPinching, setLoveFormed are no longer
  // destructured directly in this component, but rather accessed via the store's actions.
  useEffect(() => {
    console.log('EFFECT: experienceStarted changed:', experienceStarted);
    if (!experienceStarted) {
      // Reset state when experience ends or hasn't started
      setHandPos({ x: 0.5, y: 0.5 });
      setTracking(false);
      setIsPinching(false);
      setLoveFormed(false);
    }
  }, [experienceStarted, setHandPos, setTracking, setIsPinching, setLoveFormed]);

  useEffect(() => {
    if (loveFormed) {
      console.log('TRANSITION: loveFormed is true, rendering 3D scene');
    }
  }, [loveFormed]);

  if (!experienceStarted) return null;

  return (
    <div className="fixed inset-0 bg-[#000000]">
      <Canvas shadows camera={{ position: [0, 0, 10], fov: 50 }}>
        <color attach="background" args={['#000000']} />

        <HeartFormation />

        {/* Suspense must wrap everything that needs fonts/textures including the photos */}
        <Suspense fallback={null}>
          <HandControlledCamera />

          {/* Strong lighting always active */}
          <ambientLight intensity={1.425} />
          <pointLight position={[10, 10, 10]} intensity={76} color="#ffb6c1" />
          <pointLight position={[-10, -10, 10]} intensity={57} color="#8a2be2" />
          <pointLight position={[0, 15, -5]} intensity={95} color="#ffd700" />

          {/* Only show these text/love interactions when love is fully formed */}
          {loveFormed && formationComplete && (
            <>
              <GlowParticles />
              {HEART_DATA.map((heart) => (
                <Heart key={heart.id} position={heart.position as [number, number, number]} scale={heart.scale} color={heart.color} />
              ))}
              <Initials name1="T" name2="D" />
            </>
          )}

          <Environment preset="night" />
        </Suspense>

        {!loveFormed && <gridHelper args={[20, 20, 0x333333, 0x111111]} position={[0, -2, 0]} />}

        <EffectComposer>
          <Bloom intensity={2.375} luminanceThreshold={0.1} mipmapBlur />
        </EffectComposer>
      </Canvas>

      {!loveFormed && <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"></div>}

      <AnimatePresence>
        {experienceStarted && !isTracking && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-24 left-1/2 -translate-x-1/2 z-40 bg-black/40 backdrop-blur-md px-6 py-3 rounded-full border border-white/5 shadow-2xl pointer-events-none">
            <p className="text-white/40 text-[10px] uppercase tracking-[0.2em] font-medium flex items-center gap-3 text-center">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500/80 animate-pulse" />
              {loveFormed ? 'Silakan arahkan tanganmu ke kamera' : 'Arahkan tangan pada kamera untuk memulai'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {loveFormed && (
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 pointer-events-none text-center">
          <p className="text-white/20 text-[10px] font-light tracking-[0.4em] uppercase animate-fade-in">Cinta Terbentuk</p>
        </div>
      )}

      <SettingsOverlay />
      <GestureGuide />
    </div>
  );
};
