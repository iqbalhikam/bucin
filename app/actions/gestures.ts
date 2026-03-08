'use server';

import { Landmark } from '@mediapipe/tasks-vision';
import fs from 'fs';
import path from 'path';

/**
 * Saves a new custom gesture to the project's data file.
 * The landmarks should be normalized before being sent here.
 */
export async function saveGestureAction(gestureName: string, landmarks: Landmark[][]) {
  console.log(`\n🚀 [GESTURE_RECORDED]: ${gestureName.toUpperCase()}`);
  console.log(JSON.stringify({ name: gestureName, landmarks }, null, 2));

  try {
    const dataDir = path.join(process.cwd(), 'src/data');
    const filePath = path.join(dataDir, 'customGestures.json');

    // Ensure the directory exists
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    let existingData: any[] = [];
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      existingData = JSON.parse(fileContent);
    }

    // Add new gesture and save
    existingData.push({
      name: gestureName,
      landmarks, // Store all hands' normalized landmarks
      timestamp: new Date().toISOString(),
    });

    fs.writeFileSync(filePath, JSON.stringify(existingData, null, 2), 'utf8');

    return { success: true, message: `Gesture '${gestureName}' saved successfully!` };
  } catch (error) {
    console.error('❌ Failed to save gesture:', error);
    return { success: false, message: 'Failed to save gesture' };
  }
}
