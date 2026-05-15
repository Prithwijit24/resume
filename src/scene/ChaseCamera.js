import * as THREE from 'three';

// ════════════════════════════════════════════════════════════════════
//  CHASE CAMERA
//  Sits behind + above the runner, looking slightly down at their
//  upper body and the path ahead. Smooth follow + small footstep shake
//  give the motion physical weight without distracting jitter.
// ════════════════════════════════════════════════════════════════════
export class ChaseCamera {
  constructor() {
    // Offset from the character's feet (root position).
    this.offset       = new THREE.Vector3(0, 4.0, 7.2);
    // LookAt is character.feet + this. Y is roughly chest height.
    this.lookOffset   = new THREE.Vector3(0, 1.1, -6.5);
    // Smoothing for position and look.
    this.followLerp   = 0.16;
    this.lookLerp     = 0.22;

    this._target     = new THREE.Vector3();
    this._lookTarget = new THREE.Vector3();
    this._smoothPos  = new THREE.Vector3();
    this._smoothLook = new THREE.Vector3();
    this._initialized = false;
  }

  apply(camera, characterPos, footstepIntensity) {
    // Camera target = character + offset; add a tiny footstep bob
    this._target.copy(characterPos).add(this.offset);
    this._target.y += footstepIntensity * 0.05;

    this._lookTarget.copy(characterPos).add(this.lookOffset);
    this._lookTarget.y += footstepIntensity * 0.025;

    if (!this._initialized) {
      this._smoothPos.copy(this._target);
      this._smoothLook.copy(this._lookTarget);
      this._initialized = true;
    } else {
      this._smoothPos.lerp(this._target, this.followLerp);
      this._smoothLook.lerp(this._lookTarget, this.lookLerp);
    }

    camera.position.copy(this._smoothPos);
    camera.lookAt(this._smoothLook);
  }
}
