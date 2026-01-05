import {
  Scene,
  Color,
  PlaneGeometry,
  MeshStandardMaterial,
  Mesh,
  PointLight,
} from 'three';

import { createCamera } from './camera';
import { setupLights } from './lights';
import { setupEnvironment, transitionEnvironmentPreset } from './environment';
import { createRain } from './rain';

import { startTimeWatcher, getTimeOfDay } from '../systems/timeSystem';
import { getUserWeather } from '../systems/weatherSystem';
import { createEnvState } from '../systems/envState';

export function setupScene() {
  const scene = new Scene();
  scene.background = new Color(0x0b0e14);

  const camera = createCamera();
  const lights = setupLights(scene);
  //rsetupEnvironment(scene);
  setupEnvironment(scene); // fire-and-forget ok


  // -------------------------
  // State (single source of truth)
  // -------------------------
  const env = createEnvState({
    timeOfDay: getTimeOfDay(),
    weather: 'clear',
  });

  function collectEmissiveMaterials(root) {
    const mats = new Set();

    root.traverse((obj) => {
      const m = obj.material;
      if (!m) return;

      // handle multi-material meshes
      const arr = Array.isArray(m) ? m : [m];

      for (const mat of arr) {
        // only materials that support emissive (MeshStandardMaterial / MeshPhysicalMaterial)
        if (mat && 'emissive' in mat) {
          // store baseline once
          if (!mat.userData.__baseEmissiveIntensity) {
            mat.userData.__baseEmissiveIntensity = mat.emissiveIntensity ?? 1;
          }
          mats.add(mat);
        }
      }
    });

    return [...mats];
  }

  let emissiveMats = [];
  let emissiveReady = false;

  function syncBuildingMaterials(scene) {
    const building = scene.userData.building;
    if (!building || emissiveReady) return;

    emissiveMats = collectEmissiveMaterials(building);
    emissiveReady = true;

    console.log('[building] emissive materials found:', emissiveMats.length);
    // Mark emissive meshes to bloom
    building.traverse((obj) => {
      if (!obj.isMesh) return;
      const m = obj.material;
      const arr = Array.isArray(m) ? m : [m];

      const hasEmissive = arr.some((mat) => mat && 'emissive' in mat);
      if (hasEmissive) obj.layers.enable(BLOOM_LAYER);
    });

  }

  function setEmissiveStrength(strength) {
    // strength: 0..1-ish (we can push higher)
    for (const mat of emissiveMats) {
      const base = mat.userData.__baseEmissiveIntensity ?? 1;
      mat.emissiveIntensity = base * strength;
    }
  }

  // -------------------------
  // Neon accent (cyberpunk vibe)
  // -------------------------
  const neon = new PointLight(0xff2bd6, 1.2, 12, 2);
  neon.position.set(2, 1.5, 1);
  scene.add(neon);
  // Bloom layer (only these objects will glow)
 
  // -------------------------
  // Ground (wet base)
  // -------------------------
  const ground = new Mesh(
    new PlaneGeometry(40, 40),
    new MeshStandardMaterial({
      color: 0x05070c,
      roughness: 0.15,
      metalness: 0.35,
    })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = 0;
  ground.name = 'ground';
  scene.add(ground);

  // -------------------------
  // Rain layers (near + far)
  // -------------------------
  const rainNear = createRain({
    count: 1600,
    speed: 18,
    size: 0.05,
    opacity: 0.7,
    wind: { x: 2.0, z: 0.6 },
  });

  const rainFar = createRain({
    count: 2800,
    speed: 12,
    size: 0.02,
    opacity: 0.35,
    wind: { x: 1.2, z: 0.3 },
  });

  rainNear.points.position.set(0, 2, 0);
  rainFar.points.position.set(0, 2, 0);

  scene.add(rainNear.points);
  scene.add(rainFar.points);

  function setRainEnabled(on) {
    rainNear.setEnabled(on);
    rainFar.setEnabled(on);

    // wet ground feel
    ground.material.roughness = on ? 0.05 : 0.15;
    ground.material.metalness = on ? 0.6 : 0.35;

    // mood tint for particles
    const nightTint = 0x8bd0ff;  // bluish
    const dayTint = 0xdde7f2;    // neutral

    const tint = env.timeOfDay === 'night' ? nightTint : dayTint;

    rainNear.material.color.setHex(tint);
    rainFar.material.color.setHex(tint);

    // a bit more intense at night
    rainNear.material.opacity = env.timeOfDay === 'night' ? 0.75 : 0.65;
    rainFar.material.opacity = env.timeOfDay === 'night' ? 0.40 : 0.30;

  }

  // -------------------------
  // Apply from state (single output path)
  // -------------------------
  let appliedPresetKey = null;

  function applyFromState(opts = {}) {
    const presetKey = env.presetKey();

    // prevent reapplying same preset every time
    if (presetKey !== appliedPresetKey || opts.force) {
      transitionEnvironmentPreset(scene, lights, presetKey, {
        duration: opts.duration ?? 1.2,
        ease: opts.ease ?? 'power2.out',
      });
      appliedPresetKey = presetKey;
    }

    // rain on/off based on weather
    const raining = env.weather === 'rain';
    setRainEnabled(raining);
  }

  // Initial apply (instant)
  applyFromState({ duration: 0, force: true });

  // -------------------------
  // Bootstrap: weather first (IP), fallback keeps local time
  // -------------------------
  (async () => {
    try {
      const { timeOfDay, weather } = await getUserWeather();
      env.set({ timeOfDay, weather }); // weather can be 'rain', 'cloudy', etc.
      applyFromState({ duration: 0, force: true });
    } catch (err) {
      console.warn('[weather] fallback to local time', err);
      // Keep local time, clear weather
      env.set({ timeOfDay: getTimeOfDay(), weather: 'clear' });
      applyFromState({ duration: 0, force: true });
    }
  })();

  // -------------------------
  // Auto day/night watcher (updates state)
  // -------------------------
  const stopTime = startTimeWatcher((timeOfDay, meta) => {
    env.set({ timeOfDay });
    applyFromState({ duration: meta.initial ? 0 : 1.2 });
  });

  // -------------------------
  // TEST MODE (keyboard) - modifies state
  // -------------------------
  window.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();

    // T = toggle day/night
    if (key === 't') {
      env.set({ timeOfDay: env.timeOfDay === 'day' ? 'night' : 'day' });
      applyFromState({ duration: 1.2, force: true });
      return;
    }

    // R = toggle rain on/off (keep current timeOfDay)
    if (key === 'r') {
      env.set({ weather: env.weather === 'rain' ? 'clear' : 'rain' });
      applyFromState({ duration: 0.8, force: true });
      return;
    }

    // Y = force day_rain
    if (key === 'y') {
      env.set({ timeOfDay: 'day', weather: 'rain' });
      applyFromState({ duration: 1.2, force: true });
      return;
    }

    // U = force night_rain
    if (key === 'u') {
      env.set({ timeOfDay: 'night', weather: 'rain' });
      applyFromState({ duration: 1.2, force: true });
      return;
    }

    // C = clear (no rain), keep timeOfDay
    if (key === 'c') {
      env.set({ weather: 'clear' });
      applyFromState({ duration: 1.2, force: true });
      return;
    }
  });

  let t = 0;
  let lightningT = 0;
  let lightningTimeouts = [];

  function clearLightningTimeouts() {
    lightningTimeouts.forEach(clearTimeout);
    lightningTimeouts = [];
  }

  function update(delta) {
    t += delta;

    // cinematic breathing camera motion
    camera.position.x = 4 + Math.sin(t * 0.3) * 0.15;
    camera.position.y = 3 + Math.sin(t * 0.2) * 0.10;
    camera.lookAt(0, 1, 0);

    // rain updates
    rainNear.update(delta);
    rainFar.update(delta);

    // ✅ if the GLB finished loading, grab emissive materials once
    syncBuildingMaterials(scene);

    // -------------------------
    // Emissive “alive” feeling
    // -------------------------
    const isNight = env.timeOfDay === 'night';
    const isRain = env.weather === 'rain';

    if (isNight) {
      // base glow
      let baseGlow = isRain ? 2.2 : 1.6;

      // subtle flicker (very small)
      const flicker = 1 + Math.sin(t * 2.2) * 0.05 + Math.sin(t * 7.0) * 0.02;
      setEmissiveStrength(baseGlow * flicker);
    } else {
      // daytime: basically off
      setEmissiveStrength(0.15);
    }

    // -------------------------
    // Lightning pulses (night + rain)
    // -------------------------
    if (isRain && isNight) {
      lightningT -= delta;

      if (lightningT <= 0) {
        lightningT = 3 + Math.random() * 5;

        clearLightningTimeouts();
        neon.intensity = 3.5;

        lightningTimeouts.push(setTimeout(() => (neon.intensity = 1.2), 70));
        lightningTimeouts.push(setTimeout(() => (neon.intensity = 1.6), 140));
        lightningTimeouts.push(setTimeout(() => (neon.intensity = 1.2), 220));
      }
    } else {
      clearLightningTimeouts();
      neon.intensity = 1.2;
      lightningT = 0;
    }
    if (isNight) setEmissiveStrength(6.0);

  }


  return { scene, camera, lights, stopTime, update };
}
