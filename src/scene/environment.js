import {
  BoxGeometry,
  MeshStandardMaterial,
  Mesh
} from 'three';

export function setupEnvironment(scene) {
  const cube = new Mesh(
    new BoxGeometry(2, 2, 2),
    new MeshStandardMaterial({
      color: 0x4444ff,
      roughness: 0.6,
      metalness: 0.2
    })
  );

  cube.position.y = 1;
  cube.name = 'placeholder-building';

  scene.add(cube);

  return {
    building: cube
  };
}
