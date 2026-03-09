'use client';

import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Image as DreiImage, RoundedBox } from '@react-three/drei';
import { RigidBody, RapierRigidBody, CuboidCollider } from '@react-three/rapier';
import * as THREE from 'three';

import { useExperienceStore } from '@/lib/experience/store';

interface FloatingPhotoProps {
  id: string;
  url: string;
  initialPosition: [number, number, number];
  index: number;
}
// Put these INSIDE the component using useRef to prevent shared state issues
// and ensure these objects are NOT recreated on every frame.

export const FloatingPhoto = ({ id, url, initialPosition, index }: FloatingPhotoProps) => {
  const rbRef = useRef<RapierRigidBody>(null);
  const materialRef = useRef<THREE.MeshPhysicalMaterial>(null);
  const tempQuat = useRef(new THREE.Quaternion());
  const tempEuler = useRef(new THREE.Euler());

  // Use local refs for state that updates 60fps instead of React useState/Zustand destructuring
  const isGrabbed = useRef(false);

  // Add random offset so multiple photos don't spawn exactly inside each other
  const [randomSpawnOffset] = useState(() => ({
    x: initialPosition[0] + (Math.random() - 0.5) * 2,
    y: initialPosition[1] + (Math.random() - 0.5) * 2,
    z: initialPosition[2] + (Math.random() - 0.5) * 2,
  }));
  const currentPos = useRef(new THREE.Vector3(randomSpawnOffset.x, randomSpawnOffset.y, randomSpawnOffset.z));

  useFrame((state, delta) => {
    if (!rbRef.current) return;

    // Read fast-changing state natively without triggering React re-renders!
    const storeState = useExperienceStore.getState();
    const { loveFormed, isPinching, isShiftPressed, handLandmarks, updatePhotoPosition, photoData } = storeState;

    const t = state.clock.elapsedTime;

    // Default fallback position
    let targetX = currentPos.current.x;
    let targetY = currentPos.current.y;
    let targetZ = currentPos.current.z;

    const currentTranslation = rbRef.current.translation();

    // Grab logic using Hand Landmarks
    if (handLandmarks && handLandmarks[8] && handLandmarks[4]) {
      // Find midpoint of thumb and index to act as the "grab point"
      const indexLm = handLandmarks[8];
      const thumbLm = handLandmarks[4];

      const handWorldTargetX = (1 - (indexLm.x + thumbLm.x) / 2 - 0.5) * 20;
      const handWorldTargetY = -((indexLm.y + thumbLm.y) / 2 - 0.5) * 12;
      const handWorldTargetZ = -((indexLm.z + thumbLm.z) / 2) * 15;

      // Check if fingertips are actually intersecting or very close
      const distanceToHandX = Math.abs(currentTranslation.x - handWorldTargetX);
      const distanceToHandY = Math.abs(currentTranslation.y - handWorldTargetY);

      if (isPinching || isShiftPressed) {
        if (!isGrabbed.current && distanceToHandX < 3.5 && distanceToHandY < 3.5) {
          isGrabbed.current = true;
        }
      } else {
        if (isGrabbed.current) {
          isGrabbed.current = false;
          // Save dropped position to store
          updatePhotoPosition(id, [currentTranslation.x, currentTranslation.y, currentTranslation.z]);

          // Give a little toss
          rbRef.current.applyImpulse({ x: (Math.random() - 0.5) * 2, y: Math.random() * 2, z: (Math.random() - 0.5) * 2 }, true);
        }
      }

      if (isGrabbed.current) {
        targetX = handWorldTargetX;
        targetY = handWorldTargetY;
        targetZ = Math.min(0, handWorldTargetZ + 1); // Hover slightly in front of hand
      }
    } else {
      if (isGrabbed.current) {
        // Drop if tracking lost
        isGrabbed.current = false;
        updatePhotoPosition(id, [currentTranslation.x, currentTranslation.y, currentTranslation.z]);
      }
    }

    const targetPosition = currentPos.current.clone();

    if (isGrabbed.current) {
      // Follow hand rapidly
      targetPosition.set(targetX, targetY, targetZ);
    } else {
      // Float gently near the defined layout location or physical resting place
      const storePos = photoData.find((p) => p.id === id)?.position || [randomSpawnOffset.x, randomSpawnOffset.y, randomSpawnOffset.z];
      targetPosition.set(storePos[0], storePos[1], storePos[2]);

      // Gentle floating animation
      if (loveFormed) {
        targetPosition.y += Math.sin(t + index) * 0.3;
        targetPosition.x += Math.cos(t * 0.5 + index) * 0.2;
      }
    }

    // Apply movement kinematics
    currentPos.current.lerp(targetPosition, isGrabbed.current ? 0.3 : 0.05);
    rbRef.current.setNextKinematicTranslation(currentPos.current);

    // Apply gentle rotation unless grabbed (NO `new` KEYWORDS HERE!)
    const currentRot = rbRef.current.rotation();
    tempQuat.current.set(currentRot.x, currentRot.y, currentRot.z, currentRot.w);
    tempEuler.current.setFromQuaternion(tempQuat.current);

    if (!isGrabbed.current) {
      tempEuler.current.y = THREE.MathUtils.lerp(tempEuler.current.y, Math.sin(t * 0.5 + index) * 0.1, delta);
      tempEuler.current.x = THREE.MathUtils.lerp(tempEuler.current.x, Math.cos(t * 0.3 + index) * 0.05, delta);
    } else {
      // Look slightly towards center when grabbed
      tempEuler.current.y = THREE.MathUtils.lerp(tempEuler.current.y, 0, delta * 5);
      tempEuler.current.x = THREE.MathUtils.lerp(tempEuler.current.x, 0, delta * 5);
      tempEuler.current.z = Math.sin(t * 5) * 0.02; // tiny wiggle
    }
    tempQuat.current.setFromEuler(tempEuler.current);
    rbRef.current.setNextKinematicRotation(tempQuat.current);

    // Smoothly animate emissive glow without React re-render
    if (materialRef.current) {
      const targetIntensity = isGrabbed.current ? 1.5 : 0.5;
      materialRef.current.emissiveIntensity = THREE.MathUtils.lerp(materialRef.current.emissiveIntensity, targetIntensity, delta * 10);
    }
  });

  return (
    <RigidBody ref={rbRef} type="kinematicPosition" position={[randomSpawnOffset.x, randomSpawnOffset.y, randomSpawnOffset.z]} colliders={false} userData={{ type: 'photo', id }}>
      <CuboidCollider args={[2.3, 1.8, 0.2]} />
      {/* Frosted Glass Frame */}
      <RoundedBox args={[4.6, 3.6, 0.1]} radius={0.1} smoothness={4} position={[0, 0, -0.05]}>
        <meshPhysicalMaterial ref={materialRef} color="#ffffff" emissive="#00f2ff" emissiveIntensity={0.5} transmission={0.9} roughness={0.1} thickness={0.5} ior={1.5} />
      </RoundedBox>

      {/* The Image */}
      <DreiImage url={url} transparent opacity={1} scale={[4, 3]} position={[0, 0, 0.01]} />
    </RigidBody>
  );
};
