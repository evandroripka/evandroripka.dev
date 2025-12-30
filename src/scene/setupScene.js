import { Scene, Color } from 'three';
import { createCamera } from './camera';
import { setupLights } from './lights';
import { setupEnvironment, transitionEnvironmentPreset } from './environment';

import { createRain } from './rain';
import { startTimeWatcher, getTimeOfDay } from '../systems/timeSystem';
import { getUserWeather } from '../systems/weatherSystem';


export function setupScene() {
  const scene = new Scene();
  scene.background = new Color(0x0b0e14);

  const camera = createCamera();
  const lights = setupLights(scene);
  setupEnvironment(scene);

  // -------------------------
  // Rain system
  // -------------------------
  const rain = createRain({
    count: 3200,
    area: { x: 18, y: 10, z: 18 },
    speed: 14,
    size: 0.03,
    opacity: 0.55,
  });

  // Place rain volume above the scene
  rain.points.position.set(0, 2, 0);
  scene.add(rain.points);

  function setRain(on) {
    rain.setEnabled(on);
  }

  // -------------------------
  // Preset control helpers
  // -------------------------
  let currentTimeOfDay = getTimeOfDay(); // 'day'|'night'
  let isRaining = false;

  function resolvePresetKey(timeOfDay, raining) {
    return raining ? `${timeOfDay}_rain` : timeOfDay;
  }

  function applyPreset(timeOfDay, raining, opts = {}) {
    const presetKey = resolvePresetKey(timeOfDay, raining);
    transitionEnvironmentPreset(scene, lights, presetKey, {
      duration: opts.duration ?? 1.2,
      ease: opts.ease ?? 'power2.out',
    });

    isRaining = raining;
    setRain(isRaining);
  }

  // -------------------------
  // Initial mood: weather first, fallback to local time
  // -------------------------
  (async () => {
    try {
      const { timeOfDay, weather } = await getUserWeather();
      currentTimeOfDay = timeOfDay;

      const raining = weather === 'rain';
      applyPreset(currentTimeOfDay, raining, { duration: 0 });
    } catch (err) {
      console.warn('[weather] fallback to local time', err);
      applyPreset(currentTimeOfDay, false, { duration: 0 });
    }
  })();

  // -------------------------
  // Auto day/night watcher
  // -------------------------
  const stopTime = startTimeWatcher((timeOfDay, meta) => {
    currentTimeOfDay = timeOfDay;

    // Keep current rain state, only change day/night
    applyPreset(currentTimeOfDay, isRaining, {
      duration: meta.initial ? 0 : 1.2,
    });
  });

  // -------------------------
  // TEST MODE (keyboard)
  // -------------------------
  window.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
console.log('[keys]', e.key);

    // T = toggle day/night
    if (key === 't') {
      currentTimeOfDay = currentTimeOfDay === 'day' ? 'night' : 'day';
      applyPreset(currentTimeOfDay, isRaining, { duration: 1.2 });
      return;
    }

    // R = toggle rain on/off (keep current day/night)
    if (key === 'r') {
      isRaining = !isRaining;
      applyPreset(currentTimeOfDay, isRaining, { duration: 0.8 });
      return;
    }

    // Y = force day_rain
    if (key === 'y') {
      currentTimeOfDay = 'day';
      isRaining = true;
      applyPreset('day', true, { duration: 1.2 });
      return;
    }

    // U = force night_rain
    if (key === 'u') {
      currentTimeOfDay = 'night';
      isRaining = true;
      applyPreset('night', true, { duration: 1.2 });
      return;
    }

    // C = clear (no rain), keep current timeOfDay
    if (key === 'c') {
      isRaining = false;
      applyPreset(currentTimeOfDay, false, { duration: 1.2 });
      return;
    }
  });

  // -------------------------
  // Update loop hook (called from main.js)
  // -------------------------
  function update(delta) {
    rain.update(delta);
  }

  return { scene, camera, lights, stopTime, update };
}
