import * as THREE from 'three';
import { CHARACTER } from '../world.config.js';

// A low-poly humanoid "traveler" that glides through the world.
// Position is derived from the camera each frame, so the character
// always stays in view as the scroll progresses.
//
// Returns { root, update(time, camera, scrollProgress) }.
export function buildCharacter(scene) {
  const root = new THREE.Group();

  // ─── Materials ──────────────────────────────────────────────────
  const skin   = new THREE.MeshStandardMaterial({ color: 0xffd6b0, roughness: 0.7, flatShading: true });
  const shirt  = new THREE.MeshStandardMaterial({ color: 0xff6f5e, roughness: 0.55, flatShading: true, emissive: 0x4a1408, emissiveIntensity: 0.12 });
  const pants  = new THREE.MeshStandardMaterial({ color: 0x3f5e8a, roughness: 0.75, flatShading: true });
  const hair   = new THREE.MeshStandardMaterial({ color: 0x2a1808, roughness: 0.95, flatShading: true });
  const scarfMat = new THREE.MeshStandardMaterial({
    color: 0xffd166, roughness: 0.5, flatShading: true,
    emissive: 0x3a1d00, emissiveIntensity: 0.25, side: THREE.DoubleSide,
  });
  const shoe   = new THREE.MeshStandardMaterial({ color: 0x2d1d12, roughness: 1, flatShading: true });

  // ─── Torso ──────────────────────────────────────────────────────
  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.3, 0.55, 4, 10), shirt);
  torso.position.y = 1.2;
  root.add(torso);

  // ─── Head ───────────────────────────────────────────────────────
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.24, 16, 14), skin);
  head.position.y = 1.78;
  root.add(head);

  // Hair cap
  const hairCap = new THREE.Mesh(
    new THREE.SphereGeometry(0.245, 14, 12, 0, Math.PI * 2, 0, Math.PI * 0.55),
    hair,
  );
  hairCap.position.copy(head.position);
  hairCap.position.y += 0.005;
  root.add(hairCap);

  // Eyes
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0x161616 });
  const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.028, 8, 6), eyeMat);
  const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.028, 8, 6), eyeMat);
  eyeL.position.set(-0.08, 1.795, 0.22);
  eyeR.position.set( 0.08, 1.795, 0.22);
  root.add(eyeL);
  root.add(eyeR);

  // Scarf — torus around neck
  const scarf = new THREE.Mesh(new THREE.TorusGeometry(0.23, 0.075, 8, 18), scarfMat);
  scarf.rotation.x = Math.PI / 2;
  scarf.position.y = 1.5;
  root.add(scarf);

  // Scarf flowing tail
  const scarfTailGeo = new THREE.PlaneGeometry(0.26, 0.95, 1, 6);
  scarfTailGeo.translate(0, -0.48, 0);
  const scarfTail = new THREE.Mesh(scarfTailGeo, scarfMat);
  const scarfPivot = new THREE.Group();
  scarfPivot.position.set(0, 1.48, -0.18);
  scarfPivot.add(scarfTail);
  root.add(scarfPivot);

  // ─── Arm pivots ─────────────────────────────────────────────────
  const armGeom = new THREE.CapsuleGeometry(0.075, 0.45, 4, 8);
  armGeom.translate(0, -0.25, 0);
  const armL = new THREE.Group(); armL.position.set(-0.38, 1.55, 0);
  armL.add(new THREE.Mesh(armGeom, shirt));
  root.add(armL);
  const armR = new THREE.Group(); armR.position.set( 0.38, 1.55, 0);
  armR.add(new THREE.Mesh(armGeom, shirt));
  root.add(armR);

  // Hands
  const handGeo = new THREE.SphereGeometry(0.085, 10, 8);
  const handL = new THREE.Mesh(handGeo, skin); handL.position.y = -0.5; armL.add(handL);
  const handR = new THREE.Mesh(handGeo, skin); handR.position.y = -0.5; armR.add(handR);

  // ─── Leg pivots ─────────────────────────────────────────────────
  const legGeom = new THREE.CapsuleGeometry(0.1, 0.55, 4, 8);
  legGeom.translate(0, -0.3, 0);
  const legL = new THREE.Group(); legL.position.set(-0.15, 0.9, 0);
  legL.add(new THREE.Mesh(legGeom, pants));
  root.add(legL);
  const legR = new THREE.Group(); legR.position.set( 0.15, 0.9, 0);
  legR.add(new THREE.Mesh(legGeom, pants));
  root.add(legR);

  // Shoes
  const shoeL = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.09, 0.26), shoe);
  shoeL.position.set(0, -0.62, 0.05); legL.add(shoeL);
  const shoeR = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.09, 0.26), shoe);
  shoeR.position.set(0, -0.62, 0.05); legR.add(shoeR);

  // ─── Aura ───────────────────────────────────────────────────────
  const aura = new THREE.Mesh(
    new THREE.SphereGeometry(1.9, 18, 14),
    new THREE.MeshBasicMaterial({
      color: 0xffe9b0, transparent: true, opacity: 0.13,
      depthWrite: false, side: THREE.BackSide,
    }),
  );
  aura.position.y = 1.1;
  root.add(aura);

  // Scale character up so it reads at distance
  root.scale.setScalar(1.35);

  scene.add(root);

  // ─── Sparkle trail ──────────────────────────────────────────────
  const TRAIL = CHARACTER.trailLength;
  const tpos = new Float32Array(TRAIL * 3);
  const tcol = new Float32Array(TRAIL * 3);
  const tsize = new Float32Array(TRAIL);
  for (let i = 0; i < TRAIL; i++) {
    tpos[i * 3]     = 0;
    tpos[i * 3 + 1] = 1;
    tpos[i * 3 + 2] = 0;
    // Color fade: warm coral → gold
    const t = i / TRAIL;
    tcol[i * 3]     = 1.0 - 0.05 * t;
    tcol[i * 3 + 1] = 0.78 - 0.05 * t;
    tcol[i * 3 + 2] = 0.45 + 0.25 * t;
    tsize[i] = 0.55 * (1 - t * 0.88);
  }
  const tgeo = new THREE.BufferGeometry();
  tgeo.setAttribute('position', new THREE.BufferAttribute(tpos, 3));
  tgeo.setAttribute('color',    new THREE.BufferAttribute(tcol, 3));
  tgeo.setAttribute('size',     new THREE.BufferAttribute(tsize, 1));
  const tmat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    vertexColors: true,
    blending: THREE.AdditiveBlending,
    uniforms: { uPx: { value: Math.min(devicePixelRatio, 1.75) } },
    vertexShader: /* glsl */ `
      attribute float size;
      varying vec3 vColor;
      uniform float uPx;
      void main() {
        vColor = color;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = size * 90.0 * uPx / (-mv.z);
      }
    `,
    fragmentShader: /* glsl */ `
      varying vec3 vColor;
      void main() {
        vec2 c = gl_PointCoord - vec2(0.5);
        float d = length(c);
        float a = smoothstep(0.5, 0.0, d);
        gl_FragColor = vec4(vColor, a * 0.85);
      }
    `,
  });
  const trail = new THREE.Points(tgeo, tmat);
  scene.add(trail);

  // ─── State ──────────────────────────────────────────────────────
  const state = {
    pos:       new THREE.Vector3(0, 2, 14),
    target:    new THREE.Vector3(),
    smoothFwd: new THREE.Vector3(0, 0, -1),
    initialized: false,
  };

  const _flatFwd = new THREE.Vector3();
  const _right   = new THREE.Vector3();
  const _up      = new THREE.Vector3(0, 1, 0);
  const _fwd     = new THREE.Vector3();

  function update(time, camera, scrollProgress = 0) {
    // Compute camera forward
    camera.getWorldDirection(_fwd);
    _flatFwd.copy(_fwd); _flatFwd.y = 0;
    if (_flatFwd.lengthSq() < 1e-4) _flatFwd.set(0, 0, -1);
    _flatFwd.normalize();
    _right.crossVectors(_flatFwd, _up).normalize();

    // The character drifts further ahead as the user scrolls past the hero,
    // giving the sense that the user is "following" the traveler.
    const lead = CHARACTER.leadDistance + scrollProgress * CHARACTER.scrollNudge;

    state.target.copy(camera.position)
      .addScaledVector(_fwd, lead)
      .addScaledVector(_right, CHARACTER.sideOffset)
      .add(new THREE.Vector3(0, CHARACTER.verticalOffset, 0));

    if (!state.initialized) {
      state.pos.copy(state.target);
      state.initialized = true;
      // Pre-fill the trail at the spawn position so it doesn't streak from origin.
      const arrInit = trail.geometry.attributes.position.array;
      for (let i = 0; i < TRAIL; i++) {
        arrInit[i * 3]     = state.pos.x;
        arrInit[i * 3 + 1] = state.pos.y + 0.8;
        arrInit[i * 3 + 2] = state.pos.z;
      }
      trail.geometry.attributes.position.needsUpdate = true;
    } else {
      state.pos.lerp(state.target, CHARACTER.followLerp);
    }

    // Vertical bob
    const bob = Math.sin(time * CHARACTER.bobFreq) * CHARACTER.bobAmp;
    root.position.copy(state.pos);
    root.position.y += bob;

    // Face camera-forward direction (so the user follows the traveler's back).
    // Adds a small drifting offset so we sometimes catch the side profile.
    state.smoothFwd.lerp(_flatFwd, 0.05);
    const baseYaw = Math.atan2(state.smoothFwd.x, state.smoothFwd.z);
    root.rotation.y = baseYaw + Math.sin(time * 0.35) * 0.22;
    root.rotation.z = Math.sin(time * CHARACTER.bobFreq) * 0.06;
    root.rotation.x = Math.sin(time * CHARACTER.bobFreq * 0.5) * 0.03;

    // Walking-in-air limb swing
    const s = Math.sin(time * CHARACTER.walkFreq);
    const amp = CHARACTER.walkAmp;
    armL.rotation.x =  s * amp;
    armR.rotation.x = -s * amp;
    legL.rotation.x = -s * amp * 0.75;
    legR.rotation.x =  s * amp * 0.75;
    armL.rotation.z =  Math.sin(time * 0.7) * 0.08 + 0.06;
    armR.rotation.z = -Math.sin(time * 0.7) * 0.08 - 0.06;

    // Scarf trailing back
    scarfPivot.rotation.x = -0.7 + Math.sin(time * 2.2) * 0.18;
    scarfPivot.rotation.z = Math.sin(time * 1.4) * 0.12;

    // Trail: shift positions back by one and write current at head
    const arr = trail.geometry.attributes.position.array;
    for (let i = TRAIL - 1; i > 0; i--) {
      arr[i * 3]     = arr[(i - 1) * 3];
      arr[i * 3 + 1] = arr[(i - 1) * 3 + 1];
      arr[i * 3 + 2] = arr[(i - 1) * 3 + 2];
    }
    arr[0] = root.position.x;
    arr[1] = root.position.y + 0.8;
    arr[2] = root.position.z;
    trail.geometry.attributes.position.needsUpdate = true;
  }

  return { root, update };
}
