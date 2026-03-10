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
  isShiftPressed: boolean;
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
  setIsShiftPressed: (pressed: boolean) => void;
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
  isShiftPressed: false,
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
  setIsShiftPressed: (pressed) => set({ isShiftPressed: pressed }),
  setHandLandmarks: (landmarks) => set({ handLandmarks: landmarks }),
  startExperience: () => set({ experienceStarted: true }),
}));
