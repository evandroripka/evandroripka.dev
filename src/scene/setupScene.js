import { Scene, Color } from 'three';
import { createCamera } from './camera';
import { setupLights } from './lights';
import { setupEnvironment } from './environment';
import { transitionEnvironmentPreset } from './environment';
import { getTimeOfDay } from '../systems/timeSystem';

export function setupScene() {
  const scene = new Scene();
  scene.background = new Color(0x0b0e14);

  const camera = createCamera();
  const lights = setupLights(scene);
  setupEnvironment(scene);

  // initial preset
  let current = getTimeOfDay();
  transitionEnvironmentPreset(scene, lights, current, { duration: 0.0 });

  // TEMP: press "T" to toggle day/night (great for testing)
  window.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() !== 't') return;
    const next = current === 'day' ? 'night' : 'day';
    current = next;
    transitionEnvironmentPreset(scene, lights, current, { duration: 1.2 });
  });

  return { scene, camera, lights };
}
