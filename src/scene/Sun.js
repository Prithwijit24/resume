import * as THREE from 'three';
import { ATMOSPHERE } from '../world.config.js';

// A glowing sun built from two stacked sprites (core + soft halo).
// Drawn additively so it brightens the sky behind it without occluding fog.
export function buildSun(scene) {
  const cfg = ATMOSPHERE.sun;

  const coreTex = makeSunTexture(cfg.color, false);
  const haloTex = makeSunTexture(cfg.haloColor, true);

  const core = new THREE.Sprite(new THREE.SpriteMaterial({
    map: coreTex, transparent: true, depthWrite: false,
    depthTest: false, blending: THREE.AdditiveBlending,
  }));
  core.position.fromArray(cfg.position);
  core.scale.set(cfg.size, cfg.size, 1);
  core.renderOrder = -1;
  scene.add(core);

  const halo = new THREE.Sprite(new THREE.SpriteMaterial({
    map: haloTex, transparent: true, depthWrite: false,
    depthTest: false, blending: THREE.AdditiveBlending, opacity: 0.55,
  }));
  halo.position.fromArray(cfg.position);
  halo.scale.set(cfg.haloSize, cfg.haloSize, 1);
  halo.renderOrder = -2;
  scene.add(halo);

  return { core, halo };
}

function makeSunTexture(color, soft) {
  const size = 256;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  const r = size / 2;
  const grad = ctx.createRadialGradient(r, r, 0, r, r, r);
  const col = new THREE.Color(color);
  const rgb = `${Math.round(col.r * 255)},${Math.round(col.g * 255)},${Math.round(col.b * 255)}`;
  if (soft) {
    grad.addColorStop(0,    `rgba(${rgb},0.55)`);
    grad.addColorStop(0.35, `rgba(${rgb},0.18)`);
    grad.addColorStop(1,    `rgba(${rgb},0)`);
  } else {
    grad.addColorStop(0,    `rgba(255,255,245,1)`);
    grad.addColorStop(0.18, `rgba(${rgb},0.95)`);
    grad.addColorStop(0.55, `rgba(${rgb},0.35)`);
    grad.addColorStop(1,    `rgba(${rgb},0)`);
  }
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
