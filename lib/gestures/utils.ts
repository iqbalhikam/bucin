import { Landmark } from '@mediapipe/tasks-vision';

/**
 * Normalizes an array of landmarks.
 * 1. Subtracts the wrist (Landmark 0) from all other landmarks.
 * 2. Scales the landmarks based on the bounding box size so the gesture is distance-invariant.
 */
export const normalizeLandmarks = (landmarks: Landmark[]): Landmark[] => {
  if (landmarks.length === 0) return [];

  // 1. Center around the wrist
  const wrist = landmarks[0];
  const centered = landmarks.map((lm) => ({
    ...lm,
    x: lm.x - wrist.x,
    y: lm.y - wrist.y,
    z: lm.z - wrist.z,
  }));

  // 2. Find bounding box to normalize scale
  let minX = Infinity,
    minY = Infinity,
    minZ = Infinity;
  let maxX = -Infinity,
    maxY = -Infinity,
    maxZ = -Infinity;

  centered.forEach((lm) => {
    minX = Math.min(minX, lm.x);
    minY = Math.min(minY, lm.y);
    minZ = Math.min(minZ, lm.z);
    maxX = Math.max(maxX, lm.x);
    maxY = Math.max(maxY, lm.y);
    maxZ = Math.max(maxZ, lm.z);
  });

  const rangeX = maxX - minX;
  const rangeY = maxY - minY;
  const rangeZ = maxZ - minZ;

  // Use the largest range for uniform scaling
  const scale = Math.max(rangeX, rangeY, rangeZ) || 1;

  return centered.map((lm) => ({
    ...lm,
    x: lm.x / scale,
    y: lm.y / scale,
    z: lm.z / scale,
  }));
};

/**
 * Calculates the average Euclidean distance between two sets of normalized landmarks.
 */
export const calculateGestureDistance = (normalizedLive: Landmark[], normalizedTemplate: Landmark[]): number => {
  if (normalizedLive.length !== normalizedTemplate.length) return Infinity;

  let totalDistance = 0;
  for (let i = 0; i < normalizedLive.length; i++) {
    const l1 = normalizedLive[i];
    const l2 = normalizedTemplate[i];
    const dist = Math.sqrt(Math.pow(l1.x - l2.x, 2) + Math.pow(l1.y - l2.y, 2) + Math.pow(l1.z - l2.z, 2));
    totalDistance += dist;
  }

  return totalDistance / normalizedLive.length;
};

/**
 * Detects if a live gesture matches a saved template.
 * Threshold is usually around 0.05-0.15 depending on strictness.
 */
export const detectCustomGesture = (liveLandmarks: Landmark[], savedTemplate: Landmark[], threshold: number = 0.1): { matched: boolean; distance: number } => {
  const normalizedLive = normalizeLandmarks(liveLandmarks);
  const distance = calculateGestureDistance(normalizedLive, savedTemplate);

  return {
    matched: distance < threshold,
    distance,
  };
};
