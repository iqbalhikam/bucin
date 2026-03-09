'use client';

import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import { Environment } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { Physics } from '@react-three/rapier';
import { useExperienceStore } from '@/lib/experience/store';
import { FloatingPhoto } from './FloatingPhoto';
import { HandSkeleton } from './HandSkeleton';

export const GalleryScene = () => {
  const photoData = useExperienceStore((state) => state.photoData);

  return (
    <div className="fixed inset-0 bg-[#000000]">
      <Canvas shadows camera={{ position: [0, 0, 10], fov: 50 }}>
        <color attach="background" args={['#000000']} />

        <Suspense fallback={null}>
          <ambientLight intensity={1.425} />
          <pointLight position={[10, 10, 10]} intensity={76} color="#ffb6c1" />
          <pointLight position={[-10, -10, 10]} intensity={57} color="#8a2be2" />
          <pointLight position={[0, 15, -5]} intensity={95} color="#ffd700" />

          {/* Physics wrapper for spatial interactions */}
          <Physics gravity={[0, 0, 0]}>
            {photoData.map((photo, index) => (
              <FloatingPhoto key={photo.id} id={photo.id} url={photo.path} initialPosition={photo.initialPosition} index={index} />
            ))}
            <HandSkeleton />
          </Physics>

          <Environment preset="night" />
        </Suspense>

        <EffectComposer>
          <Bloom intensity={1.5} luminanceThreshold={0.1} mipmapBlur />
        </EffectComposer>
      </Canvas>
    </div>
  );
};
