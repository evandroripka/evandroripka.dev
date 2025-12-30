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
import { Color, Fog } from 'three';
import { ENV_PRESETS } from './presets';

export function applyEnvironmentPreset(scene, lights, presetName) {
  const preset = ENV_PRESETS[presetName];
  if (!preset) return;

  scene.background = new Color(preset.background);
  scene.fog = new Fog(
    preset.fog.color,
    preset.fog.near,
    preset.fog.far
  );

  lights.ambient.intensity = preset.ambientIntensity;
  lights.directional.intensity = preset.directionalIntensity;
  lights.directional.color.set(preset.directionalColor);
}
