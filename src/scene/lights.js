import { AmbientLight, DirectionalLight } from 'three';

export function setupLights(scene) {
  const ambient = new AmbientLight(0xffffff, 0.6);
  scene.add(ambient);

  const directional = new DirectionalLight(0xffffff, 1);
  directional.position.set(5, 10, 5);
  scene.add(directional);

  return {
    ambient,
    directional
  };
}
