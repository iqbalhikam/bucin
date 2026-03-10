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

const HAND_CONNECTIONS = [
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
];

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

  useFrame(() => {
    const { handPos } = useExperienceStore.getState();
    if (!mesh.current) return;

    const targetX = (handPos.x - 0.5) * 0.5;
    const targetY = -(handPos.y - 0.5) * 0.5;

    mesh.current.rotation.y = THREE.MathUtils.lerp(mesh.current.rotation.y, targetX, 0.05);
    mesh.current.rotation.x = THREE.MathUtils.lerp(mesh.current.rotation.x, targetY, 0.05);
  });

  return (
    <group position={position}>
      <Float speed={2} rotationIntensity={1} floatIntensity={1}>
        <mesh ref={mesh} scale={scale}>
          <extrudeGeometry args={[HEART_SHAPE, extrudeSettings]} />
          <meshPhysicalMaterial color={color} thickness={2} roughness={0.05} transmission={0.95} ior={1.5} attenuationColor={color} attenuationDistance={1} emissive={color} emissiveIntensity={0.4} clearcoat={1} clearcoatRoughness={0.1} />
        </mesh>
      </Float>
    </group>
  );
};

const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

export const DynamicShape = ({ type, position, color = '#ff2d55', scale = 1 }: { type: 'heart' | 'box' | 'sphere' | 'torus'; position: [number, number, number]; color?: string; scale?: number }) => {
  const rbRef = useRef<RapierRigidBody>(null);
  const isCustomCollider = type === 'heart' || type === 'torus';
  const autoCollider = isCustomCollider ? false : type === 'box' ? 'cuboid' : 'ball';

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

  const renderGeometry = () => {
    switch (type) {
      case 'heart':
        return <extrudeGeometry args={[HEART_SHAPE, extrudeSettings]} />;
      case 'box':
        return <boxGeometry args={[1, 1, 1]} />;
      case 'sphere':
        return <sphereGeometry args={[0.6, 32, 32]} />;
      case 'torus':
        return <torusGeometry args={[0.5, 0.2, 16, 32]} />;
      default:
        return <boxGeometry args={[1, 1, 1]} />;
    }
  };

  return (
    <RigidBody
      ref={rbRef}
      position={position}
      type="dynamic"
      colliders={autoCollider}
      linearDamping={0.5}
      angularDamping={0.5}
      restitution={0.5}
      friction={0.5}
      gravityScale={1.5}
      mass={1}
      canSleep={false}
      ccd={true}
      userData={{ type: 'dynamicShape' }}>
      {isCustomCollider && <BallCollider args={[scale]} />}
      <mesh scale={[scale, scale, scale]}>
        {renderGeometry()}
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} roughness={0.1} metalness={0.1} />
      </mesh>
    </RigidBody>
  );
};

export const HeartFormation = () => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const [samplingPoints, setSamplingPoints] = useState<{ x: number; y: number }[]>([]);

  const formationComplete = useExperienceStore((state) => state.formationComplete);
  const setFormationComplete = useExperienceStore((state) => state.setFormationComplete);
  const heartIntensity = useExperienceStore((state) => state.heartIntensity);
  const heartColor = useExperienceStore((state) => state.heartColor);
  const heartCount = useExperienceStore((state) => state.heartCount);
  const formationText = useExperienceStore((state) => state.formationText);

  useEffect(() => {
    const sample = async () => {
      if (typeof document === 'undefined') return;
      if (document.fonts) await document.fonts.ready;

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = 1200;
      canvas.height = 450;

      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.font = '900 120px Outfit, Inter, Arial Black, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const lines = formationText.split('\n');
        const lineHeight = 140;
        const startY = 225 - ((lines.length - 1) * lineHeight) / 2;

        lines.forEach((line, i) => {
          ctx.fillText(line, 600, startY + i * lineHeight);
        });

        const imageData = ctx.getImageData(0, 0, 1200, 450);
        const data = imageData.data;
        const points = [];

        for (let y = 0; y < 450; y += 2) {
          for (let x = 0; x < 1200; x += 2) {
            const alpha = data[(y * 1200 + x) * 4 + 3];
            if (alpha > 120) {
              points.push({
                x: (x - 600) / 70,
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

  const MAX_COUNT = 20000;

  const particleMeta = useMemo(() => {
    return Array.from({ length: MAX_COUNT }).map((_, i) => ({
      random: new THREE.Vector3((seededRandom(i) - 0.5) * 50, (seededRandom(i + 1) - 0.5) * 40, (seededRandom(i + 2) - 0.5) * 30),
      rotation: new THREE.Euler(seededRandom(i + 3) * Math.PI, seededRandom(i + 4) * Math.PI, seededRandom(i + 5) * Math.PI),
      speed: 0.005 + seededRandom(i + 6) * 0.02,
      boneIndex: i % HAND_CONNECTIONS.length,
      boneT: seededRandom(i + 7),
    }));
  }, []);

  const particles = useMemo(() => {
    const temp = [];
    const hasPoints = samplingPoints.length > 0;

    for (let i = 0; i < MAX_COUNT; i++) {
      const target = new THREE.Vector3();
      if (i < heartCount && hasPoints) {
        const point = samplingPoints[i % samplingPoints.length];
        target.set(point.x, point.y, 0);
      } else {
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

  const dummy = useRef(new THREE.Object3D());
  const tempVec = useRef(new THREE.Vector3());
  const landmarkA = useRef(new THREE.Vector3());
  const landmarkB = useRef(new THREE.Vector3());
  const finalTarget = useRef(new THREE.Vector3());
  const transitionValue = useRef(0);
  const rendererFade = useRef(0);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    const { handLandmarks, isTracking, loveFormed } = useExperienceStore.getState();

    const targetTransition = loveFormed ? 1 : 0;
    transitionValue.current = THREE.MathUtils.lerp(transitionValue.current, targetTransition, delta * 1.5);

    const t = state.clock.elapsedTime;
    const lerpFactor = transitionValue.current;

    if (loveFormed && lerpFactor > 0.9 && !formationComplete) {
      setFormationComplete(true);
    } else if (!loveFormed && formationComplete) {
      setFormationComplete(false);
    }

    const displayFactor = isTracking ? 1 : 0;
    rendererFade.current = THREE.MathUtils.lerp(rendererFade.current, displayFactor, delta * 2.0);

    for (let i = 0; i < MAX_COUNT; i++) {
      if (i >= heartCount) {
        if (i < heartCount + 500) {
          dummy.current.position.set(0, 0, 1000);
          dummy.current.updateMatrix();
          meshRef.current.setMatrixAt(i, dummy.current.matrix);
        }
        continue;
      }

      const p = particles[i];
      const { target, random, rotation, speed, boneIndex, boneT } = p;

      // Start with the base position (interpolated between scatter and text)
      tempVec.current.lerpVectors(random, target, lerpFactor);

      // --- Hand Swarm Logic ---
      if (isTracking && !loveFormed && handLandmarks && handLandmarks.length > 20) {
        const connection = HAND_CONNECTIONS[boneIndex];
        const lmA = handLandmarks[connection[0]];
        const lmB = handLandmarks[connection[1]];

        // Map MediaPipe landmarks to world coordinates: x: (1 - x - 0.5) * 25, y: -(y - 0.5) * 15, z: -z * 20
        landmarkA.current.set((1 - lmA.x - 0.5) * 25, -(lmA.y - 0.5) * 15, -lmA.z * 20);
        landmarkB.current.set((1 - lmB.x - 0.5) * 25, -(lmB.y - 0.5) * 15, -lmB.z * 20);

        // Interpolate between bone start and end
        finalTarget.current.lerpVectors(landmarkA.current, landmarkB.current, boneT);

        // Add subtle movement to particles along the bone
        finalTarget.current.x += Math.sin(t * 2 + i) * 0.1;
        finalTarget.current.y += Math.cos(t * 2 + i) * 0.1;

        // Transition from the current base (scatter/random) to the swarm target
        tempVec.current.lerp(finalTarget.current, 0.15);
      }

      // Slow-motion floating / Random motion
      if (lerpFactor > 0.01) {
        tempVec.current.y += Math.sin(t * 0.5 + i) * 0.05 * lerpFactor;
        tempVec.current.x += Math.cos(t * 0.4 + i) * 0.04 * lerpFactor;
      }

      if (lerpFactor < 0.99 && (!isTracking || loveFormed)) {
        const scatterIntensity = (isTracking ? 0.3 : 3.0) * (1 - lerpFactor);
        const noiseT = t * speed * 2 + i;
        tempVec.current.x += Math.sin(noiseT) * scatterIntensity;
        tempVec.current.y += Math.cos(noiseT) * scatterIntensity;
        tempVec.current.z += Math.sin(noiseT * 0.5 + i) * scatterIntensity;
      }

      dummy.current.position.copy(tempVec.current);
      dummy.current.rotation.set(rotation.x + t * speed, rotation.y + t * speed, rotation.z);
      const baseScale = THREE.MathUtils.lerp(0.01, 0.022, lerpFactor);
      dummy.current.scale.setScalar(baseScale * rendererFade.current);

      dummy.current.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.current.matrix);
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
        <Text fontSize={1.6} color="#ffffff" anchorX="center" position={[-1.3, 0, 0]}>
          {name1}
          <meshPhysicalMaterial emissive="#ffffff" emissiveIntensity={0.8} transmission={0.9} thickness={1} roughness={0.1} />
        </Text>

        <Text fontSize={1.6} color="#ffffff" anchorX="center" position={[1.3, 0, 0]}>
          {name2}
          <meshPhysicalMaterial emissive="#ffffff" emissiveIntensity={0.8} transmission={0.9} thickness={1} roughness={0.1} />
        </Text>
      </group>
    </Float>
  );
};

const handCursorHovered = new Set<RapierRigidBody>();
let handCursorGrabbed: RapierRigidBody | null = null;

export const HandCursor = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const rbRef = useRef<RapierRigidBody>(null);

  useFrame((state) => {
    if (!meshRef.current || !rbRef.current) return;

    const { handPos, isPinching } = useExperienceStore.getState();
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

    const isHovering = handCursorHovered.size > 0;

    if (isPinching) {
      if (handCursorGrabbed) {
        handCursorGrabbed.setTranslation({ x: nextX, y: nextY, z: targetZ }, true);
        handCursorGrabbed.setLinvel({ x: 0, y: 0, z: 0 }, true);
      } else if (isHovering) {
        const [first] = Array.from(handCursorHovered);
        if (first) handCursorGrabbed = first;
      }
    } else if (handCursorGrabbed) {
      handCursorGrabbed.applyImpulse({ x: (seededRandom(t) - 0.5) * 2, y: (seededRandom(t + 1) - 0.5) * 2, z: (seededRandom(t + 2) - 0.5) * 2 }, true);
      handCursorGrabbed = null;
    }

    if (lightRef.current) {
      const targetIntensity = handCursorGrabbed ? 15 : isHovering ? 10 : 5;
      const targetColor = handCursorGrabbed ? '#ff2d55' : isHovering ? '#ffffff' : '#ffb6c1';
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
            handCursorHovered.add(other.rigidBody);
          }
        }}
        onIntersectionExit={({ other }) => {
          if (other.rigidBody) {
            handCursorHovered.delete(other.rigidBody);
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
