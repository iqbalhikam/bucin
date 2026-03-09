'use client';

import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useExperienceStore } from '@/lib/experience/store';

export const VisualHandCursor = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Shift' && !e.repeat) {
        useExperienceStore.getState().setIsShiftPressed(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        useExperienceStore.getState().setIsShiftPressed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      useExperienceStore.getState().setIsShiftPressed(false); // Clean up state
    };
  }, []);

  useFrame(() => {
    if (!meshRef.current || !lightRef.current) return;

    const { handPos, isShiftPressed } = useExperienceStore.getState();

    // Convert normalized hand position (0-1) to world coordinates
    const targetX = (handPos.x - 0.5) * 20;
    const targetY = -(handPos.y - 0.5) * 12;
    const targetZ = 0; // Keep it on the primary plane

    // Smooth movement
    meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, targetX, 0.2);
    meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, targetY, 0.2);
    meshRef.current.position.z = THREE.MathUtils.lerp(meshRef.current.position.z, targetZ, 0.2);

    lightRef.current.position.copy(meshRef.current.position);

    // Handle visual feedback for "Interaction Mode" (Shift pressed)
    const targetScale = isShiftPressed ? 0.8 : 0.4;
    meshRef.current.scale.setScalar(THREE.MathUtils.lerp(meshRef.current.scale.x, targetScale, 0.2));

    const material = meshRef.current.material as THREE.MeshStandardMaterial;
    const targetColor = isShiftPressed ? new THREE.Color('#00f2ff') : new THREE.Color('#ffffff');
    const targetEmissiveIntensity = isShiftPressed ? 4 : 1;

    material.color.lerp(targetColor, 0.1);
    material.emissive.lerp(targetColor, 0.1);
    material.emissiveIntensity = THREE.MathUtils.lerp(material.emissiveIntensity, targetEmissiveIntensity, 0.1);

    lightRef.current.color.lerp(targetColor, 0.1);
    lightRef.current.intensity = THREE.MathUtils.lerp(lightRef.current.intensity, targetEmissiveIntensity * 10, 0.1);
  });

  return (
    <group>
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={1} roughness={0.1} metalness={0.8} transparent opacity={0.8} />
      </mesh>
      <pointLight ref={lightRef} intensity={10} distance={10} color="#ffffff" />
    </group>
  );
};
