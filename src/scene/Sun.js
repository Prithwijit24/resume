import * as THREE from 'three';
import { BIOMES } from '../world.config.js';

// Glowing sun built from a core sprite + soft halo sprite.
// World.js updates its position, color and opacity per frame so it
// smoothly migrates between biome palettes (sometimes a warm sun,
// sometimes a moon, sometimes an aurora glow).
export function buildSun(scene) {
  const initial = BIOMES[0].palette;
  const coreTex = makeSunTexture('#ffffff', false);
  const haloTex = makeSunTexture('#ffffff', true);

  const coreMat = new THREE.SpriteMaterial({
    map: coreTex,
    color: new THREE.Color(initial.sunColor),
    transparent: true,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending,
    opacity: initial.sunOpacity,
  });
  const haloMat = new THREE.SpriteMaterial({
    map: haloTex,
    color: new THREE.Color(initial.sunHalo),
    transparent: true,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending,
    opacity: initial.sunOpacity * 0.6,
  });

  const core = new THREE.Sprite(coreMat);
  core.position.fromArray(initial.sunPos);
  core.scale.set(100, 100, 1);
  core.renderOrder = -1;
  scene.add(core);

  const halo = new THREE.Sprite(haloMat);
  halo.position.fromArray(initial.sunPos);
  halo.scale.set(280, 280, 1);
  halo.renderOrder = -2;
  scene.add(halo);

  const _pos = new THREE.Vector3();

  function update({ sunColor, sunHalo, sunOpacity, sunPos }) {
    if (sunColor)  coreMat.color.copy(sunColor);
    if (sunHalo)   haloMat.color.copy(sunHalo);
    if (typeof sunOpacity === 'number') {
      coreMat.opacity = sunOpacity;
      haloMat.opacity = sunOpacity * 0.6;
    }
    if (sunPos) {
      _pos.copy(sunPos);
      core.position.copy(_pos);
      halo.position.copy(_pos);
    }
  }

  return { core, halo, update };
}

function makeSunTexture(color, soft) {
  const size = 256;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  const r = size / 2;
  const grad = ctx.createRadialGradient(r, r, 0, r, r, r);
  if (soft) {
    grad.addColorStop(0,    'rgba(255,255,255,0.55)');
    grad.addColorStop(0.35, 'rgba(255,255,255,0.18)');
    grad.addColorStop(1,    'rgba(255,255,255,0)');
  } else {
    grad.addColorStop(0,    'rgba(255,255,255,1)');
    grad.addColorStop(0.18, 'rgba(255,255,255,0.95)');
    grad.addColorStop(0.55, 'rgba(255,255,255,0.35)');
    grad.addColorStop(1,    'rgba(255,255,255,0)');
  }
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
