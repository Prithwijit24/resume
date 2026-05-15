import * as THREE from 'three';
import { CAMERA_TRACK } from '../world.config.js';

// Straight ground path the character runs along.
// `sample(progress)` returns the world position at scroll progress 0..1.
// Y is the ground level (character's feet); X is centerline (zero).
export class Path {
  constructor() {
    this.zStart = CAMERA_TRACK.zStart;
    this.zEnd   = CAMERA_TRACK.zEnd;
    this.groundY = -7;
  }

  sample(progress, out = new THREE.Vector3()) {
    const t = THREE.MathUtils.clamp(progress, 0, 1);
    const z = this.zStart + (this.zEnd - this.zStart) * t;
    out.set(0, this.groundY, z);
    return out;
  }
}

// Builds a long runway strip (with two glowing edge lines) that sits on
// the ground through a biome. `length` is the runway length in world
// units along Z, `color` is the strip color, `accent` is the edge color.
export function makePathLane(length, color, accent) {
  const g = new THREE.Group();

  // Main strip
  const stripGeo = new THREE.PlaneGeometry(6, length, 1, 1);
  stripGeo.rotateX(-Math.PI / 2);
  const strip = new THREE.Mesh(
    stripGeo,
    new THREE.MeshStandardMaterial({
      color: new THREE.Color(color),
      roughness: 0.78,
      metalness: 0.05,
    }),
  );
  strip.position.y = 0.01;
  g.add(strip);

  // Two glowing edge lines
  for (const side of [-1, 1]) {
    const edgeGeo = new THREE.PlaneGeometry(0.18, length, 1, 1);
    edgeGeo.rotateX(-Math.PI / 2);
    const edge = new THREE.Mesh(
      edgeGeo,
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(accent),
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    edge.position.set(side * 2.95, 0.04, 0);
    g.add(edge);
  }

  // Subtle center dashed line — short emissive rectangles every ~6 units
  const dashMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color(accent),
    transparent: true,
    opacity: 0.45,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const dashCount = Math.floor(length / 6);
  for (let i = 0; i < dashCount; i++) {
    const dashGeo = new THREE.PlaneGeometry(0.12, 1.6, 1, 1);
    dashGeo.rotateX(-Math.PI / 2);
    const dash = new THREE.Mesh(dashGeo, dashMat);
    dash.position.set(0, 0.03, -length / 2 + i * 6 + 3);
    g.add(dash);
  }

  return g;
}
