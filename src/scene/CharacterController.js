import * as THREE from 'three';

// ════════════════════════════════════════════════════════════════════
//  CHARACTER CONTROLLER
//  Athletic runner with two-segment legs, opposing arm swing,
//  knee bend on recovery, vertical bob synced to stride.
//  Position is driven by Path.sample(progress); animation is driven
//  by elapsed time (so the character keeps running even when the
//  user pauses scrolling — Temple Run feel).
// ════════════════════════════════════════════════════════════════════

const RUN_CADENCE   = 7.6;   // rad/s (≈ 1.21 Hz per leg → 2.42 steps/s)
const ARM_AMP       = 1.05;  // rad — arm swing
const LEG_AMP       = 0.85;  // rad — hip swing
const KNEE_AMP      = 1.45;  // rad — knee bend (on recovery)
const FORWARD_LEAN  = 0.16;  // rad — constant forward body tilt
const BOB_AMP       = 0.085; // world units — vertical body bob

export function buildCharacterController(scene) {
  const runner = makeRunner();
  scene.add(runner.root);

  const state = {
    pos:       new THREE.Vector3(),
    smoothPos: new THREE.Vector3(),
    initialized: false,
  };

  function update(time, scrollProgress, path) {
    // World position from path
    path.sample(scrollProgress, state.pos);

    if (!state.initialized) {
      state.smoothPos.copy(state.pos);
      state.initialized = true;
    } else {
      state.smoothPos.lerp(state.pos, 0.18);
    }

    // Run cycle phase
    const cyc = time * RUN_CADENCE;
    const sinCyc = Math.sin(cyc);

    // Body bob: rises in mid-stride, dips at each footfall (2× per stride)
    const bob = (1 - Math.abs(Math.cos(cyc))) * BOB_AMP;

    runner.root.position.copy(state.smoothPos);
    runner.root.position.y += bob;

    // Forward lean
    runner.root.rotation.x = FORWARD_LEAN;
    runner.root.rotation.y = 0;
    runner.root.rotation.z = 0;

    // Arm swing (opposite to legs)
    runner.armL.rotation.x = -sinCyc * ARM_AMP;
    runner.armR.rotation.x =  sinCyc * ARM_AMP;
    runner.armL.rotation.z =  0.10;
    runner.armR.rotation.z = -0.10;
    // Slight elbow flex from the shoulder pivot
    runner.foreL.rotation.x = -0.55 + Math.max(0, -sinCyc) * 0.45;
    runner.foreR.rotation.x = -0.55 + Math.max(0,  sinCyc) * 0.45;

    // Leg swing
    runner.legL.rotation.x =  sinCyc * LEG_AMP;
    runner.legR.rotation.x = -sinCyc * LEG_AMP;
    // Knee bend on recovery (when hip is back, foot kicks up)
    runner.kneeL.rotation.x = Math.max(0, -sinCyc) * KNEE_AMP;
    runner.kneeR.rotation.x = Math.max(0,  sinCyc) * KNEE_AMP;

    // Footstep telemetry for camera shake
    const footstepIntensity = Math.abs(sinCyc);

    return {
      position: runner.root.position,
      footstepIntensity,
      bob,
    };
  }

  function setAuraColor(c) {
    if (c) runner.auraMat.color.copy(c);
  }

  return { root: runner.root, update, setAuraColor };
}

// ── Mesh ─────────────────────────────────────────────────────────────

function makeRunner() {
  const root = new THREE.Group();

  // ── Materials ────────────────────────────────────────────────────
  const skin   = new THREE.MeshStandardMaterial({ color: 0xf2cb9a, roughness: 0.7,  flatShading: true });
  const vest   = new THREE.MeshStandardMaterial({ color: 0xe04a2f, roughness: 0.55, flatShading: true, emissive: 0x501408, emissiveIntensity: 0.15 });
  const shorts = new THREE.MeshStandardMaterial({ color: 0x1c2a48, roughness: 0.7,  flatShading: true });
  const hair   = new THREE.MeshStandardMaterial({ color: 0x251812, roughness: 0.95, flatShading: true });
  const band   = new THREE.MeshStandardMaterial({ color: 0xffb24a, roughness: 0.5,  flatShading: true, emissive: 0x402008, emissiveIntensity: 0.4 });
  const shoe   = new THREE.MeshStandardMaterial({ color: 0xf6f4ee, roughness: 0.6,  flatShading: true });
  const shoeAc = new THREE.MeshStandardMaterial({ color: 0xe04a2f, roughness: 0.55, flatShading: true });
  const accent = new THREE.MeshStandardMaterial({ color: 0xffd86c, roughness: 0.45, flatShading: true, emissive: 0x4a2810, emissiveIntensity: 0.35 });
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0x161616 });

  // ── Torso (athletic vest) ────────────────────────────────────────
  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.23, 0.55, 4, 10), vest);
  torso.position.y = 1.25;
  root.add(torso);

  // Vest emblem
  const emblem = new THREE.Mesh(new THREE.CircleGeometry(0.085, 14), accent);
  emblem.position.set(0, 1.32, 0.235);
  root.add(emblem);

  // ── Head ─────────────────────────────────────────────────────────
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.205, 16, 14), skin);
  head.position.y = 1.78;
  root.add(head);

  // Hair (back cap, leaving forehead exposed)
  const hairCap = new THREE.Mesh(
    new THREE.SphereGeometry(0.21, 14, 12, 0, Math.PI * 2, 0, Math.PI * 0.5),
    hair,
  );
  hairCap.position.copy(head.position);
  hairCap.position.y += 0.005;
  root.add(hairCap);

  // Headband — bright torus over forehead
  const headband = new THREE.Mesh(new THREE.TorusGeometry(0.215, 0.04, 8, 22), band);
  headband.rotation.x = Math.PI / 2;
  headband.position.set(0, 1.83, 0);
  root.add(headband);

  // Eyes
  const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.026, 8, 6), eyeMat);
  const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.026, 8, 6), eyeMat);
  eyeL.position.set(-0.075, 1.78, 0.195);
  eyeR.position.set( 0.075, 1.78, 0.195);
  root.add(eyeL);
  root.add(eyeR);

  // ── Arms: shoulder pivot → upper arm → elbow pivot → forearm ────
  const upperArmGeom = new THREE.CapsuleGeometry(0.065, 0.32, 4, 8);
  upperArmGeom.translate(0, -0.19, 0);
  const foreArmGeom  = new THREE.CapsuleGeometry(0.055, 0.30, 4, 8);
  foreArmGeom.translate(0, -0.18, 0);

  function makeArm(side) {
    const shoulder = new THREE.Group();
    shoulder.position.set(side * 0.31, 1.55, 0);
    const upper = new THREE.Mesh(upperArmGeom, skin);
    shoulder.add(upper);

    const elbow = new THREE.Group();
    elbow.position.set(0, -0.36, 0);
    shoulder.add(elbow);
    const fore = new THREE.Mesh(foreArmGeom, skin);
    elbow.add(fore);

    // Fist
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.08, 10, 8), skin);
    hand.position.y = -0.36;
    elbow.add(hand);

    // Wristband (only on left arm for asymmetric detail)
    if (side === -1) {
      const wb = new THREE.Mesh(new THREE.TorusGeometry(0.082, 0.026, 6, 14), band);
      wb.position.y = -0.32;
      wb.rotation.x = Math.PI / 2;
      elbow.add(wb);
    }

    return { shoulder, elbow };
  }

  const left = makeArm(-1);
  const right = makeArm( 1);
  root.add(left.shoulder);
  root.add(right.shoulder);

  // ── Legs: hip pivot → upper leg → knee pivot → lower leg + shoe ──
  const upperLegGeom = new THREE.CapsuleGeometry(0.095, 0.36, 4, 8);
  upperLegGeom.translate(0, -0.2, 0);
  const lowerLegGeom = new THREE.CapsuleGeometry(0.082, 0.34, 4, 8);
  lowerLegGeom.translate(0, -0.2, 0);

  function makeLeg(side) {
    const hip = new THREE.Group();
    hip.position.set(side * 0.13, 0.92, 0);
    const upper = new THREE.Mesh(upperLegGeom, shorts);
    hip.add(upper);

    const knee = new THREE.Group();
    knee.position.set(0, -0.4, 0);
    hip.add(knee);
    const lower = new THREE.Mesh(lowerLegGeom, skin);
    knee.add(lower);

    // Shoe — slightly wedge-shaped box
    const shoeMesh = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.085, 0.30), shoe);
    shoeMesh.position.set(0, -0.46, 0.04);
    knee.add(shoeMesh);

    // Shoe stripe — accent down the side
    const stripeMesh = new THREE.Mesh(new THREE.BoxGeometry(0.176, 0.028, 0.20), shoeAc);
    stripeMesh.position.set(0, -0.46, 0);
    knee.add(stripeMesh);

    // Ankle sock cuff (small disc)
    const sock = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.06, 12), shoe);
    sock.position.y = -0.41;
    knee.add(sock);

    return { hip, knee };
  }

  const lL = makeLeg(-1);
  const lR = makeLeg( 1);
  root.add(lL.hip);
  root.add(lR.hip);

  // ── Aura (subtle, biome-tinted) ──────────────────────────────────
  const auraMat = new THREE.MeshBasicMaterial({
    color: 0xffe9b0,
    transparent: true,
    opacity: 0.10,
    depthWrite: false,
    side: THREE.BackSide,
  });
  const aura = new THREE.Mesh(new THREE.SphereGeometry(1.8, 18, 14), auraMat);
  aura.position.y = 1.0;
  root.add(aura);

  return {
    root,
    armL: left.shoulder,
    armR: right.shoulder,
    foreL: left.elbow,
    foreR: right.elbow,
    legL: lL.hip,
    legR: lR.hip,
    kneeL: lL.knee,
    kneeR: lR.knee,
    auraMat,
  };
}
