'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, RapierRigidBody, BallCollider } from '@react-three/rapier';
import { useExperienceStore } from '@/lib/experience/store';
import * as THREE from 'three';

// Standard MediaPipe hand tracking connections (21 joints, 21 lines connecting them)
const HAND_CONNECTIONS = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4], // Thumb
  [0, 5],
  [5, 6],
  [6, 7],
  [7, 8], // Index finger
  [5, 9],
  [9, 10],
  [10, 11],
  [11, 12], // Middle finger
  [9, 13],
  [13, 14],
  [14, 15],
  [15, 16], // Ring finger
  [13, 17],
  [17, 18],
  [18, 19],
  [19, 20], // Pinky
  [0, 17], // Palm base connection
];

const DUMMY_OBJ = new THREE.Object3D();
const SKELETON_LINES = new Float32Array(126);
const PINCH_COLOR = new THREE.Color('#ff1a4a');
const DEFAULT_COLOR = new THREE.Color('#00f2ff');

export const HandSkeleton = () => {
  const jointsRef = useRef<THREE.InstancedMesh>(null);
  const linesRef = useRef<THREE.LineSegments>(null);

  // Physical colliders for fingertips to push objects
  const indexTipRbRef = useRef<RapierRigidBody>(null);

  useFrame(() => {
    const handLandmarks = useExperienceStore.getState().handLandmarks;
    const isPinching = useExperienceStore.getState().isPinching;

    // Hide skeleton if no hands detected
    if (!handLandmarks || !jointsRef.current || !linesRef.current) {
      if (jointsRef.current) jointsRef.current.visible = false;
      if (linesRef.current) linesRef.current.visible = false;

      // Hide/Move physical fingertips out of the way
      if (indexTipRbRef.current) indexTipRbRef.current.setNextKinematicTranslation({ x: 0, y: 0, z: 1000 });
      return;
    }

    jointsRef.current.visible = true;
    linesRef.current.visible = true;

    // We interpolate the color based on if pinching or not to give clear tactile feedback
    const material = jointsRef.current.material as THREE.MeshStandardMaterial;
    if (material.color) {
      const targetColor = isPinching ? PINCH_COLOR : DEFAULT_COLOR;
      material.color.lerp(targetColor, 0.2);
      material.emissive.lerp(targetColor, 0.2);

      const lineMaterial = linesRef.current.material as THREE.LineBasicMaterial;
      lineMaterial.color.lerp(targetColor, 0.2);
    }

    // High performance instance updating loop: mapping MediaPipe normalized coords -> World Coords
    for (let i = 0; i < 21; i++) {
      const lm = handLandmarks[i];

      // Scaling math logic: Map 0..1 (MediaPipe output) to match our scene bounds (-10 to 10 width, -6 to 6 height)
      // Reverse X due to mirror mode
      const targetX = (1 - lm.x - 0.5) * 20;
      const targetY = -(lm.y - 0.5) * 12;

      // Z estimation: Map MediaPipe relative z to world depth. Often MediaPipe z is very small, we multiply it to enhance 3D feel.
      const targetZ = -lm.z * 15;

      DUMMY_OBJ.position.set(targetX, targetY, targetZ);

      // Make fingertips larger for visual prominence and thumb base smaller
      const isFingertip = [4, 8, 12, 16, 20].includes(i);
      const scale = isFingertip ? 0.3 : i === 0 ? 0.4 : 0.15;
      DUMMY_OBJ.scale.setScalar(scale);

      DUMMY_OBJ.updateMatrix();
      jointsRef.current.setMatrixAt(i, DUMMY_OBJ.matrix);

      // Update the kinematic colliders so the hand physically bumps into photos
      if (i === 8 && indexTipRbRef.current) {
        // Index Finger Tip
        indexTipRbRef.current.setNextKinematicTranslation({ x: targetX, y: targetY, z: targetZ });
      }
    }

    jointsRef.current.instanceMatrix.needsUpdate = true;

    // Update Bone Lines
    let pIter = 0;
    for (let i = 0; i < HAND_CONNECTIONS.length; i++) {
      const [startIdx, endIdx] = HAND_CONNECTIONS[i];
      const startLm = handLandmarks[startIdx];
      const endLm = handLandmarks[endIdx];

      SKELETON_LINES[pIter++] = (1 - startLm.x - 0.5) * 20;
      SKELETON_LINES[pIter++] = -(startLm.y - 0.5) * 12;
      SKELETON_LINES[pIter++] = -startLm.z * 15;

      SKELETON_LINES[pIter++] = (1 - endLm.x - 0.5) * 20;
      SKELETON_LINES[pIter++] = -(endLm.y - 0.5) * 12;
      SKELETON_LINES[pIter++] = -endLm.z * 15;
    }

    linesRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <group>
      {/* 21 Holographic Glowing Joints */}
      <instancedMesh ref={jointsRef} args={[undefined, undefined, 21]} frustumCulled={false}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial color="#00f2ff" emissive="#00f2ff" emissiveIntensity={2} roughness={0.2} metalness={0.8} transparent opacity={0.9} />
      </instancedMesh>

      {/* Holographic Skeletons Lines connecting the joints */}
      <lineSegments ref={linesRef} renderOrder={1}>
        <bufferGeometry>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <bufferAttribute attach="attributes-position" {...({ count: 42, array: SKELETON_LINES, itemSize: 3 } as any)} />
        </bufferGeometry>
        <lineBasicMaterial color="#00f2ff" linewidth={2} transparent opacity={0.6} />
      </lineSegments>

      {/* Physics Colliders attached to the fingertips for interaction */}
      <RigidBody ref={indexTipRbRef} type="kinematicPosition" colliders="ball" userData={{ isHand: true, finger: 'index' }}>
        <BallCollider args={[0.3]} sensor={false} />
      </RigidBody>
    </group>
  );
};
