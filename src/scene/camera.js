import { PerspectiveCamera } from 'three';

export function createCamera() {
  const camera = new PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );

  camera.position.set(4, 3, 6);
  return camera;
}
