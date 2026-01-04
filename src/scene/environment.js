import {
  BoxGeometry,
  Color,
  Fog,
  Mesh,
  MeshStandardMaterial,
} from 'three';

import gsap from 'gsap';
import { ENV_PRESETS } from './presets';
import { loadGLB } from './loadModel';

export async function setupEnvironment(scene) {
  // fallback cube (instant)
  const fallback = new Mesh(
    new BoxGeometry(2, 2, 2),
    new MeshStandardMaterial({
      color: 0x4444ff,
      roughness: 0.6,
      metalness: 0.2,
    })
  );
  fallback.position.y = 1;
  fallback.name = 'placeholder-building';
  scene.add(fallback);

  // try load real model
  try {
    const model = await loadGLB('/models/building.glb');

    // remove fallback and add model
    scene.remove(fallback);

    model.name = 'building';
    model.position.set(0, 0, 0);

    // scale tip: adjust as needed depending on model size
    model.scale.setScalar(1);

    scene.add(model);
    scene.userData.building = model;

    return { building: model };
  } catch (err) {
    console.warn('[model] failed to load building.glb, using fallback cube', err);
    return { building: fallback };
  }
}

function ensureFog(scene, preset) {
  if (!scene.fog) {
    scene.fog = new Fog(preset.fog.color, preset.fog.near, preset.fog.far);
  }
}

function ensureBackground(scene, preset) {
  if (!(scene.background instanceof Color)) {
    scene.background = new Color(preset.background);
  }
}

export function applyEnvironmentPreset(scene, lights, presetName) {
  const preset = ENV_PRESETS[presetName];
  if (!preset) return;

  scene.background = new Color(preset.background);
  scene.fog = new Fog(preset.fog.color, preset.fog.near, preset.fog.far);

  lights.ambient.intensity = preset.ambientIntensity;
  lights.directional.intensity = preset.directionalIntensity;
  lights.directional.color.set(preset.directionalColor);
}

export function transitionEnvironmentPreset(scene, lights, presetName, opts = {}) {
  const preset = ENV_PRESETS[presetName];
  if (!preset) return;

  const { duration = 1.2, ease = 'power2.out' } = opts;

  ensureBackground(scene, preset);
  ensureFog(scene, preset);

  const targetBg = new Color(preset.background);
  const targetFog = new Color(preset.fog.color);
  const targetDir = new Color(preset.directionalColor);

  const bg = scene.background;
  const fog = scene.fog;
  const fogColor = scene.fog.color;
  const dirColor = lights.directional.color;

  gsap.killTweensOf(bg);
  gsap.killTweensOf(fog);
  gsap.killTweensOf(fogColor);
  gsap.killTweensOf(dirColor);
  gsap.killTweensOf(lights.ambient);
  gsap.killTweensOf(lights.directional);

  gsap.to(bg, { r: targetBg.r, g: targetBg.g, b: targetBg.b, duration, ease });
  gsap.to(fogColor, { r: targetFog.r, g: targetFog.g, b: targetFog.b, duration, ease });
  gsap.to(dirColor, { r: targetDir.r, g: targetDir.g, b: targetDir.b, duration, ease });

  gsap.to(fog, { near: preset.fog.near, far: preset.fog.far, duration, ease });

  gsap.to(lights.ambient, { intensity: preset.ambientIntensity, duration, ease });
  gsap.to(lights.directional, { intensity: preset.directionalIntensity, duration, ease });
}
