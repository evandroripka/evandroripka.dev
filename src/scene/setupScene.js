import { Scene, Color } from 'three';
import { createCamera } from './camera';
import { setupLights } from './lights';
import { setupEnvironment } from './environment';

export function setupScene() {
  const scene = new Scene();
  scene.background = new Color(0x0b0e14);

  const camera = createCamera();
  setupLights(scene);

  const environment = setupEnvironment(scene);

  return {
    scene,
    camera,
    environment
  };
}
