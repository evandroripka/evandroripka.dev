import {
  BoxGeometry,
  Color,
  Fog,
  Mesh,
  MeshStandardMaterial,
} from 'three';

import gsap from 'gsap';
import { ENV_PRESETS } from './presets';

/**
 * Creates placeholder geometry (cube for now).
 * Later we'll swap this cube for a GLB model without changing the rest of the system.
 */
export function setupEnvironment(scene) {
  const building = new Mesh(
    new BoxGeometry(2, 2, 2),
    new MeshStandardMaterial({
      color: 0x4444ff,
      roughness: 0.6,
      metalness: 0.2,
    })
  );

  building.position.y = 1;
  building.name = 'placeholder-building';

  scene.add(building);

  return { building };
}

function ensureFog(scene, preset) {
  if (!scene.fog) {
    scene.fog = new Fog(preset.fog.color, preset.fog.near, preset.fog.far);
  }
}

function ensureBackground(scene, preset) {
  // Ensure scene.background is a THREE.Color so we can tween RGB channels.
  if (!(scene.background instanceof Color)) {
    scene.background = new Color(preset.background);
  }
}

/**
 * Applies preset instantly (no animation).
 * Useful for initial setup.
 */
export function applyEnvironmentPreset(scene, lights, presetName) {
  const preset = ENV_PRESETS[presetName];
  if (!preset) return;

  // Background + fog
  scene.background = new Color(preset.background);
  scene.fog = new Fog(preset.fog.color, preset.fog.near, preset.fog.far);

  // Lights
  lights.ambient.intensity = preset.ambientIntensity;
  lights.directional.intensity = preset.directionalIntensity;
  lights.directional.color.set(preset.directionalColor);
}

/**
 * Transitions to preset smoothly using GSAP.
 */
export function transitionEnvironmentPreset(scene, lights, presetName, opts = {}) {
  const preset = ENV_PRESETS[presetName];
  if (!preset) return;

  const { duration = 1.2, ease = 'power2.out' } = opts;

  ensureBackground(scene, preset);
  ensureFog(scene, preset);

  const targetBg = new Color(preset.background);
  const targetFog = new Color(preset.fog.color);
  const targetDir = new Color(preset.directionalColor);

  const bg = scene.background;               // THREE.Color
  const fog = scene.fog;                     // THREE.Fog
  const fogColor = scene.fog.color;          // THREE.Color
  const dirColor = lights.directional.color; // THREE.Color

  // Prevent tween stacking
  gsap.killTweensOf(bg);
  gsap.killTweensOf(fog);
  gsap.killTweensOf(fogColor);
  gsap.killTweensOf(dirColor);
  gsap.killTweensOf(lights.ambient);
  gsap.killTweensOf(lights.directional);

  // Colors
  gsap.to(bg, {
    r: targetBg.r, g: targetBg.g, b: targetBg.b,
    duration,
    ease,
  });

  gsap.to(fogColor, {
    r: targetFog.r, g: targetFog.g, b: targetFog.b,
    duration,
    ease,
  });

  gsap.to(dirColor, {
    r: targetDir.r, g: targetDir.g, b: targetDir.b,
    duration,
    ease,
  });

  // Fog distances
  gsap.to(fog, {
    near: preset.fog.near,
    far: preset.fog.far,
    duration,
    ease,
  });

  // Light intensity
  gsap.to(lights.ambient, {
    intensity: preset.ambientIntensity,
    duration,
    ease,
  });

  gsap.to(lights.directional, {
    intensity: preset.directionalIntensity,
    duration,
    ease,
  });
}
