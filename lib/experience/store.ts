import { create } from 'zustand';
import type { Landmark } from '@mediapipe/tasks-vision';

interface ExperienceState {
  handPos: { x: number; y: number };
  isTracking: boolean;
  isPinching: boolean;
  experienceStarted: boolean;
  loveFormed: boolean;
  formationComplete: boolean;
  calibrationData: {
    thumbDist: number;
    indexDist: number;
    wristDist: number;
    verticalSpan: number;
  } | null;
  heartIntensity: number;
  heartColor: string;
  heartCount: number;
  showSettings: boolean;
  showGestureGuide: boolean;
  formationText: string;
  spawnedShapes: { id: string; type: 'heart' | 'box' | 'sphere' | 'torus'; position: [number, number, number] }[];
  isGrabbing: boolean;
  isShiftPressed: boolean;
  photoData: { id: string; path: string; initialPosition: [number, number, number]; position: [number, number, number] }[];
  handLandmarks: Landmark[] | null;
  setHandLandmarks: (landmarks: Landmark[] | null) => void;
  setHandPos: (pos: { x: number; y: number }) => void;
  setTracking: (tracking: boolean) => void;
  setIsPinching: (isPinching: boolean) => void;
  setLoveFormed: (loveFormed: boolean) => void;
  setFormationComplete: (complete: boolean) => void;
  setCalibrationData: (data: ExperienceState['calibrationData']) => void;
  setHeartIntensity: (intensity: number) => void;
  setHeartColor: (color: string) => void;
  setHeartCount: (count: number) => void;
  setShowSettings: (show: boolean) => void;
  setShowGestureGuide: (show: boolean) => void;
  setFormationText: (text: string) => void;
  addSpawnedShape: (type: 'heart' | 'box' | 'sphere' | 'torus', position: [number, number, number]) => void;
  setIsGrabbing: (grabbing: boolean) => void;
  setIsShiftPressed: (pressed: boolean) => void;
  updatePhotoPosition: (id: string, position: [number, number, number]) => void;
  startExperience: () => void;
}

export const useExperienceStore = create<ExperienceState>((set) => ({
  handPos: { x: 0.5, y: 0.5 },
  handLandmarks: null,
  isTracking: false,
  isPinching: false,
  experienceStarted: false,
  loveFormed: false,
  formationComplete: false,
  calibrationData: null,
  heartIntensity: 20,
  heartColor: '#ff1a4a',
  heartCount: 20000,
  showSettings: false,
  showGestureGuide: false,
  formationText: 'I LOVE YOU',
  spawnedShapes: [],
  isGrabbing: false,
  isShiftPressed: false,
  photoData: [
    { id: '1', path: '/image/delva.jpeg', initialPosition: [-4.5, 2.5, 1], position: [-4.5, 2.5, 1] },
    { id: '2', path: '/image/delva1.jpeg', initialPosition: [-1, -3, 1], position: [-1, -3, 1] },
    { id: '3', path: '/image/delva2.jpeg', initialPosition: [4.5, 1.5, 1], position: [4.5, 1.5, 1] },
  ],
  setHandPos: (pos) => set({ handPos: pos }),
  setTracking: (tracking) => set({ isTracking: tracking }),
  setIsPinching: (isPinching) => set({ isPinching: isPinching }),
  setLoveFormed: (loveFormed) => set({ loveFormed }),
  setFormationComplete: (complete) => set({ formationComplete: complete }),
  setCalibrationData: (data) => set({ calibrationData: data }),
  setHeartIntensity: (intensity) => set({ heartIntensity: intensity }),
  setHeartColor: (color) => set({ heartColor: color }),
  setHeartCount: (count) => set({ heartCount: count }),
  setShowSettings: (show) => set({ showSettings: show }),
  setShowGestureGuide: (show) => set({ showGestureGuide: show }),
  setFormationText: (text) => set({ formationText: text }),
  addSpawnedShape: (type, position) =>
    set((state) => ({
      spawnedShapes: [...state.spawnedShapes, { id: Math.random().toString(36).substring(7), type, position }],
    })),
  setIsGrabbing: (grabbing) => set({ isGrabbing: grabbing }),
  setIsShiftPressed: (pressed) => set({ isShiftPressed: pressed }),
  updatePhotoPosition: (id, position) =>
    set((state) => ({
      photoData: state.photoData.map((photo) => (photo.id === id ? { ...photo, position } : photo)),
    })),
  setHandLandmarks: (landmarks) => set({ handLandmarks: landmarks }),
  startExperience: () => set({ experienceStarted: true }),
}));
