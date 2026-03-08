'use client';

import { useRef, useMemo, useState, useEffect } from 'react';
import { Float, Stars, Sparkles, Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { RigidBody, RapierRigidBody, BallCollider, CuboidCollider } from '@react-three/rapier';
import { useExperienceStore } from '@/lib/experience/store';
import * as THREE from 'three';

interface HeartProps {
  position: [number, number, number];
  scale?: number;
  color?: string;
}

const HEART_SHAPE = (() => {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0.3);
  shape.bezierCurveTo(0, 0.3, -0.05, 0.6, -0.4, 0.6);
  shape.bezierCurveTo(-0.8, 0.6, -0.8, 0.1, -0.8, 0.1);
  shape.bezierCurveTo(-0.8, -0.2, -0.5, -0.5, 0, -1);
  shape.bezierCurveTo(0.5, -0.5, 0.8, -0.2, 0.8, 0.1);
  shape.bezierCurveTo(0.8, 0.1, 0.8, 0.6, 0.4, 0.6);
  shape.bezierCurveTo(0.1, 0.6, 0, 0.3, 0, 0.3);
  return shape;
})();

export const Heart = ({ position, scale = 0.8, color = '#ff2d55' }: HeartProps) => {
  const mesh = useRef<THREE.Mesh>(null);

  const extrudeSettings = useMemo(
    () => ({
      depth: 0.4,
      bevelEnabled: true,
      bevelSegments: 3,
      steps: 2,
      bevelSize: 0.15,
      bevelThickness: 0.15,
    }),
    [],
  );

  const rbRef = useRef<RapierRigidBody>(null);
  const { handPos } = useExperienceStore();

  useFrame(() => {
    if (!mesh.current || !rbRef.current) return;

    const targetX = (handPos.x - 0.5) * 0.5;
    const targetY = -(handPos.y - 0.5) * 0.5;

    mesh.current.rotation.y = THREE.MathUtils.lerp(mesh.current.rotation.y, targetX, 0.05);
    mesh.current.rotation.x = THREE.MathUtils.lerp(mesh.current.rotation.x, Math.PI + targetY, 0.05);
  });

  return (
    <RigidBody ref={rbRef} position={position} colliders={false} linearDamping={0.5} angularDamping={0.5} userData={{ type: 'heart' }}>
      <BallCollider args={[scale]} />
      <Float speed={2} rotationIntensity={1} floatIntensity={1}>
        <mesh ref={mesh} scale={scale}>
          <extrudeGeometry args={[HEART_SHAPE, extrudeSettings]} />
          <meshPhysicalMaterial color={color} thickness={2} roughness={0.05} transmission={0.95} ior={1.5} attenuationColor={color} attenuationDistance={1} emissive={color} emissiveIntensity={0.4} clearcoat={1} clearcoatRoughness={0.1} />
        </mesh>
      </Float>
    </RigidBody>
  );
};

// Deterministic pseudo-random generator
const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

export const HeartFormation = () => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const [samplingPoints, setSamplingPoints] = useState<{ x: number; y: number; z?: number }[]>([]);

  const { loveFormed, isTracking, handPos, formationComplete, setFormationComplete, heartIntensity, heartColor, heartCount, formationText } = useExperienceStore();

  // Sample points in a useEffect to handle font loading and text changes
  useEffect(() => {
    const sample = async () => {
      if (typeof document === 'undefined') return;

      // Wait for fonts to be ready for accurate sampling
      if (document.fonts) await document.fonts.ready;

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      // Larger canvas for a wider, more detailed formation
      canvas.width = 1200;
      canvas.height = 450; // Increased height for two lines

      if (ctx) {
        ctx.fillStyle = 'white';
        // Massive, ultra-bold font
        ctx.font = '900 120px Outfit, Inter, Arial Black, sans-serif'; // Slightly smaller font to fit more text
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Handle multi-line text
        const lines = formationText.split('\n');
        const lineHeight = 140;
        const startY = 225 - ((lines.length - 1) * lineHeight) / 2;

        lines.forEach((line, i) => {
          ctx.fillText(line, 600, startY + i * lineHeight);
        });

        const imageData = ctx.getImageData(0, 0, 1200, 450);
        const data = imageData.data;
        const points = [];

        // Ultra-fine sampling (every 2 pixels) for 8,000 particles
        for (let y = 0; y < 450; y += 2) {
          for (let x = 0; x < 1200; x += 2) {
            const alpha = data[(y * 1200 + x) * 4 + 3];
            if (alpha > 120) {
              points.push({
                x: (x - 600) / 70, // Slightly more compressed to fit the screen
                y: (225 - y) / 70 + 0.5,
              });
            }
          }
        }
        if (points.length > 0) setSamplingPoints(points);
      }
    };
    sample();
  }, [formationText]);

  const MAX_COUNT = 30000;

  // Pre-calculate random positions and rotations for all possible particles
  const particleMeta = useMemo(() => {
    return Array.from({ length: MAX_COUNT }).map((_, i) => ({
      random: new THREE.Vector3((seededRandom(i) - 0.5) * 50, (seededRandom(i + 1) - 0.5) * 40, (seededRandom(i + 2) - 0.5) * 30),
      rotation: new THREE.Euler(seededRandom(i + 3) * Math.PI, seededRandom(i + 4) * Math.PI, seededRandom(i + 5) * Math.PI),
      speed: 0.005 + seededRandom(i + 6) * 0.02,
    }));
  }, []);

  // Targets are updated when samplingPoints or heartCount changes
  const particles = useMemo(() => {
    const temp = [];
    const hasPoints = samplingPoints.length > 0;

    for (let i = 0; i < MAX_COUNT; i++) {
      const target = new THREE.Vector3();
      if (i < heartCount && hasPoints) {
        const point = samplingPoints[i % samplingPoints.length];
        target.set(point.x, point.y, point.z ?? 0);
      } else {
        // Move unused particles out of sight
        target.set(0, 0, 1000);
      }

      const meta = particleMeta[i];
      temp.push({
        target,
        ...meta,
      });
    }
    return temp;
  }, [heartCount, samplingPoints, particleMeta]);

  const dummy = useRef<THREE.Object3D>(null!);
  const tempVec = useRef<THREE.Vector3>(null!);
  const handVec = useRef<THREE.Vector3>(null!);
  const transitionValue = useRef(0);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    if (!dummy.current) dummy.current = new THREE.Object3D();
    if (!tempVec.current) tempVec.current = new THREE.Vector3();
    if (!handVec.current) handVec.current = new THREE.Vector3();

    handVec.current.set((handPos.x - 0.5) * 20, -(handPos.y - 0.5) * 12, 0);

    const targetTransition = loveFormed ? 1 : 0;
    // Slower, more cinematic transition speed
    transitionValue.current = THREE.MathUtils.lerp(transitionValue.current, targetTransition, delta * 1.5);

    const t = state.clock.elapsedTime;
    const lerpFactor = transitionValue.current;

    // Manage global formation complete state
    if (loveFormed && lerpFactor > 0.999 && !formationComplete) {
      setFormationComplete(true);
    } else if (!loveFormed && formationComplete) {
      setFormationComplete(false);
    }

    for (let i = 0; i < MAX_COUNT; i++) {
      if (i >= heartCount) {
        // Only update if we are near the edge of the active count
        // to move them out of view efficiently
        if (i < heartCount + 500) {
          dummy.current.position.set(0, 0, 1000);
          dummy.current.updateMatrix();
          meshRef.current!.setMatrixAt(i, dummy.current.matrix);
        }
        continue;
      }

      const p = particles[i];
      const { target, random, rotation, speed } = p;

      // Base position: Lerp between random scatter and text target
      tempVec.current.lerpVectors(random, target, lerpFactor);

      // --- Interactive Hand Influence Disabled for Legibility ---
      // (Removed to prevent "void circle" effect/holes in the text)

      // Slow-motion floating / Random motion (only focus on it when formed)
      if (lerpFactor > 0.01) {
        tempVec.current.y += Math.sin(t * 0.5 + i) * 0.05 * lerpFactor;
        tempVec.current.x += Math.cos(t * 0.4 + i) * 0.04 * lerpFactor;
      }

      if (lerpFactor < 0.99) {
        const scatterIntensity = (isTracking ? 0.3 : 3.0) * (1 - lerpFactor);
        const noiseT = t * speed * 2 + i;
        tempVec.current.x += Math.sin(noiseT) * scatterIntensity;
        tempVec.current.y += Math.cos(noiseT) * scatterIntensity;
        tempVec.current.z += Math.sin(noiseT * 0.5 + i) * scatterIntensity;
      }

      dummy.current.position.copy(tempVec.current);
      // Slower rotation
      dummy.current.rotation.set(rotation.x + t * speed, rotation.y + t * speed, rotation.z);
      // Ultra-tiny hearts for high detail
      dummy.current.scale.setScalar(THREE.MathUtils.lerp(0.01, 0.022, lerpFactor));

      dummy.current.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.current.matrix);
    }
    // For particles beyond heartCount, we need to ensure they are at target (1000z)
    // but the loop above stops at heartCount.
    // If heartCount decreases, we need to update the "leftover" instances.
    for (let i = heartCount; i < MAX_COUNT; i += 100) {
      // Sparse update for efficiency
      // Usually target is already 1000z, so we just set them once or skip
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, MAX_COUNT]} count={heartCount}>
      <shapeGeometry args={[HEART_SHAPE]} />
      <meshStandardMaterial color={heartColor} emissive={heartColor} emissiveIntensity={heartIntensity} transparent={false} />
    </instancedMesh>
  );
};

export const Initials = ({ name1 = 'T', name2 = 'D' }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!groupRef.current) return;
    const { handPos } = useExperienceStore.getState();

    const targetX = (handPos.x - 0.5) * 0.4;
    const targetY = -(handPos.y - 0.5) * 0.4;

    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetX, 0.08);
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetY, 0.08);
  });

  return (
    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
      <group ref={groupRef} position={[0, 0, 0]}>
        <Text fontSize={1.6} color="#ffffff" anchorX="center" position={[-1.3, 0, 0]} font="https://fonts.gstatic.com/s/outfit/v11/QGYz6tnaIcEePaasvTc.woff">
          {name1}
          <meshPhysicalMaterial emissive="#ffffff" emissiveIntensity={0.8} transmission={0.9} thickness={1} roughness={0.1} />
        </Text>

        <Text fontSize={1.6} color="#ffffff" anchorX="center" position={[1.3, 0, 0]} font="https://fonts.gstatic.com/s/outfit/v11/QGYz6tnaIcEePaasvTc.woff">
          {name2}
          <meshPhysicalMaterial emissive="#ffffff" emissiveIntensity={0.8} transmission={0.9} thickness={1} roughness={0.1} />
        </Text>
      </group>
    </Float>
  );
};

export const HandCursor = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const rbRef = useRef<RapierRigidBody>(null);
  const [grabbedBody, setGrabbedBody] = useState<RapierRigidBody | null>(null);
  const hoveredBodies = useRef<Set<RapierRigidBody>>(new Set());
  const { handPos, isPinching } = useExperienceStore();

  useFrame((state) => {
    if (!meshRef.current || !rbRef.current) return;

    const t = state.clock.elapsedTime;
    const targetX = (handPos.x - 0.5) * 25;
    const targetY = -(handPos.y - 0.5) * 15;
    const targetZ = 0;

    const curPos = rbRef.current.translation();
    const nextX = THREE.MathUtils.lerp(curPos.x, targetX, 0.2);
    const nextY = THREE.MathUtils.lerp(curPos.y, targetY, 0.2);

    rbRef.current.setNextKinematicTranslation({ x: nextX, y: nextY, z: targetZ });
    meshRef.current.position.set(nextX, nextY, targetZ);
    if (lightRef.current) {
      lightRef.current.position.set(nextX, nextY, targetZ);
    }

    const isHovering = hoveredBodies.current.size > 0;

    if (isPinching) {
      if (grabbedBody) {
        grabbedBody.setTranslation({ x: nextX, y: nextY, z: targetZ }, true);
        grabbedBody.setLinvel({ x: 0, y: 0, z: 0 }, true);
      } else if (isHovering) {
        const [first] = Array.from(hoveredBodies.current);
        if (first) setGrabbedBody(first);
      }
    } else if (grabbedBody) {
      // applyImpulse is called in useFrame, which is technically outside the main render but inside the frame loop.
      // We'll use deterministic-ish values to keep it clean.
      grabbedBody.applyImpulse({ x: (seededRandom(t) - 0.5) * 2, y: (seededRandom(t + 1) - 0.5) * 2, z: (seededRandom(t + 2) - 0.5) * 2 }, true);
      setGrabbedBody(null);
    }

    if (lightRef.current) {
      const targetIntensity = grabbedBody ? 15 : isHovering ? 10 : 5;
      const targetColor = grabbedBody ? '#ff2d55' : isHovering ? '#ffffff' : '#ffb6c1';
      lightRef.current.intensity = THREE.MathUtils.lerp(lightRef.current.intensity, targetIntensity, 0.1);
      lightRef.current.color.lerp(new THREE.Color(targetColor), 0.1);
    }
  });

  return (
    <group>
      <RigidBody
        ref={rbRef}
        type="kinematicPosition"
        colliders={false}
        onIntersectionEnter={({ other }) => {
          if (other.rigidBody && other.rigidBodyObject?.userData?.type === 'heart') {
            hoveredBodies.current.add(other.rigidBody);
          }
        }}
        onIntersectionExit={({ other }) => {
          if (other.rigidBody) {
            hoveredBodies.current.delete(other.rigidBody);
          }
        }}>
        <CuboidCollider args={[0.8, 0.8, 15]} sensor />
        <mesh ref={meshRef}>
          <extrudeGeometry args={[HEART_SHAPE, { depth: 0.1, bevelEnabled: true, bevelSize: 0.05, bevelThickness: 0.05 }]} />
          <meshStandardMaterial emissive="#ffffff" emissiveIntensity={2} color="#ffffff" />
        </mesh>
      </RigidBody>
      <pointLight ref={lightRef} intensity={5} color="#ffb6c1" distance={15} />
    </group>
  );
};

export const GlowParticles = () => {
  return (
    <>
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <Sparkles count={200} scale={20} size={2} speed={0.4} color="#ffb6c1" />
    </>
  );
};
