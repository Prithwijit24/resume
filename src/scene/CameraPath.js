import * as THREE from 'three';
import { CAMERA_PATH } from '../world.config.js';

// Interpolates camera position and lookAt along the keyframe list.
// scrollProgress in [0, 1] maps across all keyframes.
export class CameraPath {
  constructor() {
    this.keyframes = CAMERA_PATH.map(k => ({
      pos:  new THREE.Vector3().fromArray(k.pos),
      look: new THREE.Vector3().fromArray(k.look),
    }));
    this._look = new THREE.Vector3();
  }

  // Apply at progress p in [0, 1].
  apply(camera, p) {
    const N = this.keyframes.length;
    if (N < 2) {
      camera.position.copy(this.keyframes[0].pos);
      camera.lookAt(this.keyframes[0].look);
      return;
    }
    const f = Math.max(0, Math.min(1, p)) * (N - 1);
    const i = Math.min(Math.floor(f), N - 2);
    const t = f - i;
    const e = t * t * (3 - 2 * t);   // smoothstep

    const k1 = this.keyframes[i];
    const k2 = this.keyframes[i + 1];
    camera.position.lerpVectors(k1.pos, k2.pos, e);
    this._look.lerpVectors(k1.look, k2.look, e);
    camera.lookAt(this._look);
  }
}
