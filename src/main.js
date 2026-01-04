import './styles/style.css';

import { WebGLRenderer } from 'three';
import { setupScene } from './scene/setupScene';

const canvas = document.querySelector('#fx');

const { scene, camera, update } = setupScene();

const renderer = new WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true,
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

let last = performance.now();

function animate(now) {
  requestAnimationFrame(animate);

  const delta = Math.min((now - last) / 1000, 0.033);
  last = now;

  // Update systems (rain, later: wind, postfx, etc.)
  if (update) update(delta);

  renderer.render(scene, camera);
}

requestAnimationFrame(animate);

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
window.addEventListener('unhandledrejection', (e) => {
  console.warn('[unhandledrejection]', e.reason);
});
