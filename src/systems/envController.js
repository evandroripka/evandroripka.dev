// src/systems/envController.js
import { PointLight } from 'three';
import { startTimeWatcher, getTimeOfDay } from './timeSystem';
import { getUserWeather } from './weatherSystem';
import { createEnvState } from './envState';
import { transitionEnvironmentPreset } from '../scene/environment';

export function createEnvController({
  scene,
  camera,
  lights,
  rainNear,
  rainFar,
  neon,
  options = {},
}) {
  const env = createEnvState({
    timeOfDay: getTimeOfDay(),
    weather: 'clear',
  });

  const cfg = {
    devKeys: options.devKeys ?? true,
    lightning: options.lightning ?? true,
    breathingCamera: options.breathingCamera ?? true,
    presetDuration: options.presetDuration ?? 1.2,
  };

  let t = 0;
  let lightningT = 0;

  function setRain(on) {
    if (rainNear) rainNear.setEnabled(on);
    if (rainFar) rainFar.setEnabled(on);
  }

  function applyFromState(duration = cfg.presetDuration) {
    const presetKey = env.presetKey();
    transitionEnvironmentPreset(scene, lights, presetKey, {
      duration,
      ease: 'power2.out',
    });

    setRain(env.weather === 'rain');
  }

  // Initial apply (local time)
  applyFromState(0);

  // Try weather (remote) - fallback safe
  (async () => {
    try {
      const { timeOfDay, weather } = await getUserWeather();
      env.set({ timeOfDay, weather });
      applyFromState(0);
      console.log('[env] weather loaded:', { timeOfDay, weather });
    } catch (err) {
      console.warn('[env] weather fallback -> local time only', err);
    }
  })();

  // Auto day/night watcher
  const stopTime = startTimeWatcher((timeOfDay, meta) => {
    env.set({ timeOfDay });
    applyFromState(meta?.initial ? 0 : cfg.presetDuration);
  });

  // DEV keys (only in dev)
  const isDev = import.meta?.env?.DEV ?? false;

  function onKeydown(e) {
    const key = e.key.toLowerCase();

    // T = toggle day/night
    if (key === 't') {
      env.set({ timeOfDay: env.timeOfDay === 'day' ? 'night' : 'day' });
      applyFromState(1.2);
    }

    // R = toggle rain
    if (key === 'r') {
      env.set({ weather: env.weather === 'rain' ? 'clear' : 'rain' });
      applyFromState(0.8);
    }

    // Y = force day_rain
    if (key === 'y') {
      env.set({ timeOfDay: 'day', weather: 'rain' });
      applyFromState(1.2);
    }

    // U = force night_rain
    if (key === 'u') {
      env.set({ timeOfDay: 'night', weather: 'rain' });
      applyFromState(1.2);
    }

    // C = clear rain
    if (key === 'c') {
      env.set({ weather: 'clear' });
      applyFromState(1.2);
    }
  }

  if (cfg.devKeys && isDev) {
    window.addEventListener('keydown', onKeydown);
  }

  function update(delta) {
    t += delta;

    // breathing camera
    if (cfg.breathingCamera && camera) {
      camera.position.x = 4 + Math.sin(t * 0.3) * 0.15;
      camera.position.y = 3 + Math.sin(t * 0.2) * 0.10;
      camera.lookAt(0, 1, 0);
    }

    // particles
    if (rainNear) rainNear.update(delta);
    if (rainFar) rainFar.update(delta);

    // lightning flicker (only at night + rain)
    if (cfg.lightning && neon && env.weather === 'rain' && env.timeOfDay === 'night') {
      lightningT -= delta;

      if (lightningT <= 0) {
        lightningT = 3 + Math.random() * 5;

        neon.intensity = 3.5;
        setTimeout(() => (neon.intensity = 1.2), 70);
        setTimeout(() => (neon.intensity = 1.6), 140);
        setTimeout(() => (neon.intensity = 1.2), 220);
      }
    }
  }

  function destroy() {
    stopTime?.();
    if (cfg.devKeys && isDev) window.removeEventListener('keydown', onKeydown);
  }

  return { env, applyFromState, update, destroy };
}
