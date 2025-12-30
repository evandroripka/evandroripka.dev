import { WebGLRenderer } from 'three';
import { setupScene } from './scene/setupScene';
import './styles/style.css';


const canvas = document.querySelector('#fx');

const { scene, camera } = setupScene();

const renderer = new WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true, // lets video show behind if needed
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
