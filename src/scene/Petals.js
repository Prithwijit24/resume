import * as THREE from 'three';
import { ATMOSPHERE } from '../world.config.js';

// Pink-tinted petals drifting across the scene with gentle horizontal sway.
// Same shape as motes but uses a soft procedural disk texture so they read
// less like grit and more like floating bloom.
export function buildPetals(scene) {
  const cfg = ATMOSPHERE.petals;
  const N = cfg.count;
  const pos = new Float32Array(N * 3);
  const phs = new Float32Array(N);
  const drift = new Float32Array(N);

  for (let i = 0; i < N; i++) {
    pos[i * 3]     = (Math.random() - 0.5) * cfg.spread;
    pos[i * 3 + 1] = cfg.heightMin + Math.random() * (cfg.heightMax - cfg.heightMin);
    pos[i * 3 + 2] = cfg.depthMin + Math.random() * (cfg.depthMax - cfg.depthMin);
    phs[i] = Math.random() * Math.PI * 2;
    drift[i] = 0.6 + Math.random() * 0.8;
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
    map: makePetalTexture(),
    alphaTest: 0.01,
  });
  const mesh = new THREE.Points(geo, mat);
  scene.add(mesh);

  function update(time) {
    const arr = geo.attributes.position.array;
    for (let i = 0; i < N; i++) {
      arr[i * 3 + 1] -= cfg.fallSpeed;
      // Subtle horizontal sway (different per petal)
      arr[i * 3] += Math.sin(time * 0.7 + phs[i]) * 0.004 * drift[i];
      if (arr[i * 3 + 1] < cfg.heightMin) {
        arr[i * 3 + 1] = cfg.heightMax;
        arr[i * 3]     = (Math.random() - 0.5) * cfg.spread;
      }
    }
    geo.attributes.position.needsUpdate = true;
  }

  return { mesh, update };
}

function makePetalTexture() {
  const size = 64;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  const r = size / 2;
  const grad = ctx.createRadialGradient(r, r, 0, r, r, r);
  grad.addColorStop(0,   'rgba(255,255,255,1)');
  grad.addColorStop(0.4, 'rgba(255,200,215,0.9)');
  grad.addColorStop(1,   'rgba(255,200,215,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
