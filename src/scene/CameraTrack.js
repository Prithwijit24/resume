import * as THREE from 'three';
import { CAMERA_TRACK } from '../world.config.js';

// Continuous forward fly through the biome corridor.
// progress ∈ [0, 1] is mapped along zStart → zEnd. Height and lateral
// offset are smooth-stepped between per-biome anchors, plus a subtle
// lateral sine sway for "Temple Run" lane feel.
//
// Returns { apply(camera, progress) }.
export class CameraTrack {
  constructor() {
    this.anchors = CAMERA_TRACK.anchors;
    this.cfg = CAMERA_TRACK;
    this._target = new THREE.Vector3();
  }

  // Sample the path at progress t.
  sample(t, out = new THREE.Vector3()) {
    const a = this.anchors;
    const N = a.length;
    const f = THREE.MathUtils.clamp(t, 0, 1) * (N - 1);
    const i = Math.max(0, Math.min(N - 2, Math.floor(f)));
    const u = f - i;
    const e = u * u * (3 - 2 * u);  // smoothstep
    const y = a[i].y * (1 - e) + a[i + 1].y * e;
    const ax = a[i].x * (1 - e) + a[i + 1].x * e;
    const sway = Math.sin(t * Math.PI * this.cfg.laneSwayCycles) * this.cfg.laneSwayAmp;
    const z = this.cfg.zStart + (this.cfg.zEnd - this.cfg.zStart) * t;
    out.set(ax + sway, y, z);
    return out;
  }

  apply(camera, progress) {
    this.sample(progress, camera.position);
    this.sample(Math.min(1, progress + this.cfg.lookAhead), this._target);
    camera.lookAt(this._target);
  }
}
