import * as THREE from 'three';
import { ATMOSPHERE } from '../world.config.js';

// Drifting atmospheric motes — small dust particles falling slowly.
// Returns { mesh, update(time) } so the animation loop can advance them.
export function buildMotes(scene) {
  const cfg = ATMOSPHERE.motes;
  const N = cfg.count;
  const pos = new Float32Array(N * 3);
  const vx  = new Array(N);

  for (let i = 0; i < N; i++) {
    pos[i * 3]     = (Math.random() - 0.5) * cfg.spread;
    pos[i * 3 + 1] = cfg.heightMin + Math.random() * (cfg.heightMax - cfg.heightMin);
    pos[i * 3 + 2] = cfg.depthMin + Math.random() * (cfg.depthMax - cfg.depthMin);
    vx[i] = (Math.random() - 0.5) * 0.002;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({
    color: new THREE.Color(cfg.color),
    size: cfg.size,
    sizeAttenuation: true,
    transparent: true,
    opacity: cfg.opacity,
    depthWrite: false,
  });
  const mesh = new THREE.Points(geo, mat);
  scene.add(mesh);

  function update() {
    const arr = geo.attributes.position.array;
    for (let i = 0; i < N; i++) {
      arr[i * 3 + 1] -= cfg.fallSpeed;
      arr[i * 3]     += vx[i];
      if (arr[i * 3 + 1] < cfg.heightMin) {
        arr[i * 3 + 1] = cfg.heightMax;
        arr[i * 3]     = (Math.random() - 0.5) * cfg.spread;
      }
    }
    geo.attributes.position.needsUpdate = true;
  }

  return { mesh, update };
}
