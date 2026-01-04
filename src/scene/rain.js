import {
  BufferGeometry,
  Float32BufferAttribute,
  Points,
  PointsMaterial,
  AdditiveBlending,
} from 'three';

export function createRain({
  count = 3000,
  area = { x: 18, y: 10, z: 18 },
  wind = { x: 1.5, z: 0.4 },
  speed = 12,
  size = 0.03,
  opacity = 0.55,
} = {}) {
  const positions = new Float32Array(count * 3);
  const velocities = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    positions[i3 + 0] = (Math.random() - 0.5) * area.x;
    positions[i3 + 1] = Math.random() * area.y;
    positions[i3 + 2] = (Math.random() - 0.5) * area.z;
    velocities[i] = speed * (0.6 + Math.random() * 0.8);
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));

  const material = new PointsMaterial({
    color: 0xcfe6ff,
    size,
    transparent: true,
    opacity,
    depthWrite: false,
    blending: AdditiveBlending,
  });

  const points = new Points(geometry, material);
  points.frustumCulled = false;
  points.visible = false;

  const state = {
    enabled: false,
    count,
    area,
    velocities,
    wind,
  };

  function setEnabled(on) {
    state.enabled = Boolean(on);
    points.visible = state.enabled;
  }

  function update(delta) {
    if (!state.enabled) return;

    const pos = geometry.attributes.position.array;
    const halfX = state.area.x / 2;
    const halfZ = state.area.z / 2;

    for (let i = 0; i < state.count; i++) {
      const i3 = i * 3;

      // fall + wind drift (EVERY FRAME)
      pos[i3 + 1] -= state.velocities[i] * delta;
      pos[i3 + 0] += state.wind.x * delta;
      pos[i3 + 2] += state.wind.z * delta;

      // wrap x/z so rain stays inside volume
      if (pos[i3 + 0] > halfX) pos[i3 + 0] = -halfX;
      if (pos[i3 + 0] < -halfX) pos[i3 + 0] = halfX;
      if (pos[i3 + 2] > halfZ) pos[i3 + 2] = -halfZ;
      if (pos[i3 + 2] < -halfZ) pos[i3 + 2] = halfZ;

      // respawn at top if below ground
      if (pos[i3 + 1] < -1) {
        pos[i3 + 0] = (Math.random() - 0.5) * state.area.x;
        pos[i3 + 1] = state.area.y;
        pos[i3 + 2] = (Math.random() - 0.5) * state.area.z;
      }
    }

    geometry.attributes.position.needsUpdate = true;
  }

  return { points, material, setEnabled, update, state };
}
