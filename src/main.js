import './styles/style.css';

import {
  WebGLRenderer,
  Vector2,
  SRGBColorSpace,
  ACESFilmicToneMapping,
  Layers,
} from 'three';

import { BLOOM_LAYER, setupScene } from './scene/setupScene';

// Postprocessing
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';

// Simple additive combine shader
const CombineShader = {
  uniforms: {
    baseTexture: { value: null },
    bloomTexture: { value: null },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D baseTexture;
    uniform sampler2D bloomTexture;
    varying vec2 vUv;
    void main() {
      vec4 base = texture2D(baseTexture, vUv);
      vec4 bloom = texture2D(bloomTexture, vUv);
      gl_FragColor = base + bloom; // additive combine
    }
  `,
};

const canvas = document.querySelector('#fx');
const { scene, camera, update } = setupScene();

// --------------------
// Renderer
// --------------------
const renderer = new WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = SRGBColorSpace;
renderer.toneMapping = ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.9; // ✅ start lower to avoid blown-out day

// --------------------
// Bloom layer
// --------------------
const bloomLayer = new Layers();
bloomLayer.set(BLOOM_LAYER);
// --------------------
// Bloom composer (renders ONLY bloom layer)
// --------------------
const bloomComposer = new EffectComposer(renderer);
bloomComposer.renderToScreen = false;
bloomComposer.addPass(new RenderPass(scene, camera));

const bloomPass = new UnrealBloomPass(
  new Vector2(window.innerWidth, window.innerHeight),
  1.0,  // strength
  0.4,  // radius
  0.25  // threshold (raise to reduce glow on big surfaces)
);
bloomComposer.addPass(bloomPass);

// --------------------
// Base composer (renders full scene + combines bloom texture)
// --------------------
const baseComposer = new EffectComposer(renderer);
baseComposer.addPass(new RenderPass(scene, camera));

const finalPass = new ShaderPass(CombineShader, 'baseTexture');
finalPass.uniforms.bloomTexture.value = bloomComposer.renderTarget2.texture;
baseComposer.addPass(finalPass);

// --------------------
// Render loop
// --------------------
let last = performance.now();

function renderBloom() {
  const oldMask = camera.layers.mask;
  camera.layers.set(BLOOM_LAYER);
  bloomComposer.render();
  camera.layers.mask = oldMask;
}

function renderFinal() {
  const oldMask = camera.layers.mask;
  camera.layers.enableAll(); // render everything for base
  baseComposer.render();
  camera.layers.mask = oldMask;
}

function animate(now) {
  requestAnimationFrame(animate);

  const delta = Math.min((now - last) / 1000, 0.033);
  last = now;

  if (update) update(delta, { renderer, bloomPass });

  renderBloom();
  renderFinal();
}

requestAnimationFrame(animate);

// --------------------
// Resize
// --------------------
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
  bloomComposer.setSize(window.innerWidth, window.innerHeight);
  baseComposer.setSize(window.innerWidth, window.innerHeight);

  bloomPass.setSize(window.innerWidth, window.innerHeight);
});

window.addEventListener('unhandledrejection', (e) => {
  console.warn('[unhandledrejection]', e.reason);
});
