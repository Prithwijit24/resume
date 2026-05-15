import * as THREE from 'three';
import { BIOMES }       from '../world.config.js';
import { buildSkyIslands } from './biomes/SkyIslands.js';
import { buildNeonCity }   from './biomes/NeonCity.js';
import { buildForest }     from './biomes/Forest.js';
import { buildCrystal }    from './biomes/Crystal.js';
import { buildTemple }     from './biomes/Temple.js';
import { buildAurora }     from './biomes/Aurora.js';

// Build all biomes and return a single update function that:
//   1. Ticks each biome's own animations
//   2. Computes the blended palette for current scroll progress and
//      returns it so World.js can drive Sky/Sun/fog/character aura.
export function buildBiomes(scene) {
  const built = [
    buildSkyIslands(scene, BIOMES[0]),
    buildNeonCity  (scene, BIOMES[1]),
    buildForest    (scene, BIOMES[2]),
    buildCrystal   (scene, BIOMES[3]),
    buildTemple    (scene, BIOMES[4]),
    buildAurora    (scene, BIOMES[5]),
  ];

  // Pre-build THREE.Color instances for each biome palette so we can
  // lerp into a single blended set without allocations.
  const colorCache = BIOMES.map(b => ({
    skyTop: new THREE.Color(b.palette.skyTop),
    skyMid: new THREE.Color(b.palette.skyMid),
    skyBot: new THREE.Color(b.palette.skyBot),
    fog:    new THREE.Color(b.palette.fog),
    sun:    new THREE.Color(b.palette.sunColor),
    halo:   new THREE.Color(b.palette.sunHalo),
    aura:   new THREE.Color(b.palette.auraColor),
    sunPos: new THREE.Vector3().fromArray(b.palette.sunPos),
    sunOpacity: b.palette.sunOpacity,
  }));

  // Working palette (mutated per frame)
  const blend = {
    skyTop: new THREE.Color(),
    skyMid: new THREE.Color(),
    skyBot: new THREE.Color(),
    fog:    new THREE.Color(),
    sun:    new THREE.Color(),
    halo:   new THREE.Color(),
    aura:   new THREE.Color(),
    sunPos: new THREE.Vector3(),
    sunOpacity: 1.0,
  };

  function update(time, progress) {
    // Update each biome's internal animations
    built.forEach(b => b.update(time));

    // Determine the two biome palettes we sit between
    const N = colorCache.length;
    const f = Math.max(0, Math.min(1, progress)) * (N - 1);
    const i = Math.max(0, Math.min(N - 2, Math.floor(f)));
    const t = f - i;
    const e = t * t * (3 - 2 * t);  // smoothstep
    const a = colorCache[i];
    const b = colorCache[i + 1];

    blend.skyTop.copy(a.skyTop).lerp(b.skyTop, e);
    blend.skyMid.copy(a.skyMid).lerp(b.skyMid, e);
    blend.skyBot.copy(a.skyBot).lerp(b.skyBot, e);
    blend.fog   .copy(a.fog)   .lerp(b.fog,    e);
    blend.sun   .copy(a.sun)   .lerp(b.sun,    e);
    blend.halo  .copy(a.halo)  .lerp(b.halo,   e);
    blend.aura  .copy(a.aura)  .lerp(b.aura,   e);
    blend.sunPos.copy(a.sunPos).lerp(b.sunPos, e);
    blend.sunOpacity = a.sunOpacity * (1 - e) + b.sunOpacity * e;

    return blend;
  }

  return { built, update };
}
