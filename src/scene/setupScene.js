import { Scene, Color } from 'three';
import { createCamera } from './camera';
import { setupLights } from './lights';
import { setupEnvironment } from './environment';
import { applyEnvironmentPreset } from './environment';
import { getTimeOfDay } from '../systems/timeSystem';

export function setupScene() {
  const scene = new Scene();
  scene.background = new Color(0x0b0e14);

  const camera = createCamera();
  const lights = setupLights(scene);
  setupEnvironment(scene);

  const timeOfDay = getTimeOfDay();
  applyEnvironmentPreset(scene, lights, timeOfDay);

  return {
    scene,
    camera,
    lights
  };
}
