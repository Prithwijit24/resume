import * as THREE from 'three';
import { makePathLane } from '../Path.js';

// ════════════════════════════════════════════════════════════════════
// Biome 2 — Bioluminescent Forest.
// Stylized curved trees with glowing canopies, ground mushrooms, and
// fireflies. A mossy floor with subtle waving grass.
// ════════════════════════════════════════════════════════════════════
export function buildForest(scene, biome) {
  const group = new THREE.Group();
  const cz = biome.centerZ;
  const span = biome.length;

  // ── Mossy floor (animated) ───────────────────────────────────────
  const floor = makeMossyFloor(span);
  floor.position.set(0, -7, cz);
  group.add(floor);

  // ── Path lane (mossy stone road) ─────────────────────────────────
  const lane = makePathLane(span * 2 + 8, '#1a3024', '#7effa6');
  lane.position.set(0, -7, cz);
  group.add(lane);

  // ── Trees lining the path ────────────────────────────────────────
  const trees = [];
  for (let i = 0; i < 18; i++) {
    const side = i % 2 === 0 ? 1 : -1;
    const x = side * (8 + Math.random() * 10);
    const z = cz - span + (i / 18) * (span * 2) + (Math.random() - 0.5) * 3;
    const h = 7 + Math.random() * 7;
    const t = makeGlowTree(h);
    t.position.set(x, -7, z);
    t.rotation.y = Math.random() * Math.PI * 2;
    t.userData.swayPhase = Math.random() * Math.PI * 2;
    group.add(t);
    trees.push(t);
  }

  // ── Mushrooms scattered on ground ────────────────────────────────
  const mushrooms = [];
  for (let i = 0; i < 24; i++) {
    const side = (Math.random() < 0.5 ? 1 : -1);
    const x = side * (3 + Math.random() * 16);
    const z = cz - span + Math.random() * (span * 2);
    const m = makeMushroom();
    m.position.set(x, -7, z);
    m.userData.glowPhase = Math.random() * Math.PI * 2;
    group.add(m);
    mushrooms.push(m);
  }

  // ── Fireflies ────────────────────────────────────────────────────
  const fireflies = makeFireflies(140, cz, span);
  group.add(fireflies);

  // ── Vine arches over the path ────────────────────────────────────
  for (let i = 0; i < 4; i++) {
    const z = cz - span + (i + 0.5) * (span * 2 / 4);
    const arch = makeVineArch();
    arch.position.set(0, -7, z);
    group.add(arch);
  }

  scene.add(group);

  return {
    group,
    update(time) {
      // Tree sway
      trees.forEach(t => {
        t.rotation.z = Math.sin(time * 0.6 + t.userData.swayPhase) * 0.025;
      });
      // Mushroom glow pulse
      mushrooms.forEach(m => {
        const k = 0.5 + 0.5 * Math.sin(time * 1.4 + m.userData.glowPhase);
        if (m.userData.capMat) {
          m.userData.capMat.emissiveIntensity = 0.7 + k * 0.8;
        }
      });
      // Floor tick
      floor.material.uniforms.uTime.value = time;
      // Fireflies wander
      const arr = fireflies.geometry.attributes.position.array;
      const ph  = fireflies.userData.phase;
      for (let i = 0; i < arr.length / 3; i++) {
        arr[i*3]     += Math.sin(time * 0.8 + ph[i])       * 0.014;
        arr[i*3 + 1] += Math.cos(time * 0.6 + ph[i] * 1.3) * 0.010;
        arr[i*3 + 2] += Math.sin(time * 0.5 + ph[i] * 0.7) * 0.012;
      }
      fireflies.geometry.attributes.position.needsUpdate = true;
    },
  };
}

// ── Helpers ─────────────────────────────────────────────────────────

function makeGlowTree(height) {
  const g = new THREE.Group();

  // Trunk — slight taper, curved using two stacked cylinders + tilt
  const trunkLow = new THREE.Mesh(
    new THREE.CylinderGeometry(0.32, 0.45, height * 0.55, 8),
    new THREE.MeshStandardMaterial({ color: 0x2a3a2a, roughness: 1, flatShading: true }),
  );
  trunkLow.position.y = height * 0.275;
  g.add(trunkLow);
  const trunkUp = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22, 0.32, height * 0.5, 8),
    new THREE.MeshStandardMaterial({ color: 0x344532, roughness: 1, flatShading: true }),
  );
  trunkUp.position.y = height * 0.55 + height * 0.25;
  trunkUp.rotation.z = (Math.random() - 0.5) * 0.25;
  g.add(trunkUp);

  // Canopy — stacked icosahedrons, emissive
  const canopyColors = [0x7effa6, 0xa4e9ff, 0xc488ff, 0xffa6e9];
  const cc = canopyColors[Math.floor(Math.random() * canopyColors.length)];
  for (let i = 0; i < 3; i++) {
    const r = 1.1 + Math.random() * 0.5;
    const blob = new THREE.Mesh(
      new THREE.IcosahedronGeometry(r, 0),
      new THREE.MeshStandardMaterial({
        color: cc, emissive: cc, emissiveIntensity: 0.6,
        roughness: 0.5, flatShading: true,
      }),
    );
    blob.position.set(
      (Math.random() - 0.5) * 0.9,
      height * 0.95 + i * 0.6,
      (Math.random() - 0.5) * 0.9,
    );
    g.add(blob);
  }

  // Glowing dot points on the canopy
  const dotN = 14;
  const dpos = new Float32Array(dotN * 3);
  for (let i = 0; i < dotN; i++) {
    dpos[i*3]   = (Math.random() - 0.5) * 2.4;
    dpos[i*3+1] = height * (0.85 + Math.random() * 0.35);
    dpos[i*3+2] = (Math.random() - 0.5) * 2.4;
  }
  const dgeo = new THREE.BufferGeometry();
  dgeo.setAttribute('position', new THREE.BufferAttribute(dpos, 3));
  const dmat = new THREE.PointsMaterial({
    color: cc, size: 0.32, transparent: true, opacity: 0.95,
    map: makeSoftDiscTex('#ffffff'), depthWrite: false,
    blending: THREE.AdditiveBlending, sizeAttenuation: true,
  });
  g.add(new THREE.Points(dgeo, dmat));

  return g;
}

function makeMushroom() {
  const g = new THREE.Group();

  // Stem
  const stem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.16, 0.22, 0.7, 8),
    new THREE.MeshStandardMaterial({ color: 0xe8dcc0, roughness: 0.9, flatShading: true }),
  );
  stem.position.y = 0.35;
  g.add(stem);

  // Cap — bright + emissive
  const capColors = [0x7effa6, 0xff7ec8, 0xa4e9ff, 0xffd86c, 0xc488ff];
  const cc = capColors[Math.floor(Math.random() * capColors.length)];
  const capMat = new THREE.MeshStandardMaterial({
    color: cc, emissive: cc, emissiveIntensity: 0.9,
    roughness: 0.4, flatShading: true,
  });
  const cap = new THREE.Mesh(
    new THREE.SphereGeometry(0.42, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.55),
    capMat,
  );
  cap.position.y = 0.68;
  g.add(cap);

  // White dots on cap
  for (let i = 0; i < 4; i++) {
    const dot = new THREE.Mesh(
      new THREE.SphereGeometry(0.05, 6, 5),
      new THREE.MeshBasicMaterial({ color: 0xffffff }),
    );
    const a = (i / 4) * Math.PI * 2;
    dot.position.set(0.22 * Math.cos(a), 0.78, 0.22 * Math.sin(a));
    g.add(dot);
  }

  g.userData.capMat = capMat;
  g.scale.setScalar(0.7 + Math.random() * 0.6);
  return g;
}

function makeVineArch() {
  const g = new THREE.Group();

  // Two side posts
  const postMat = new THREE.MeshStandardMaterial({ color: 0x2a3a2a, roughness: 1, flatShading: true });
  const postL = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 6, 7), postMat);
  postL.position.set(-6, 3, 0);
  g.add(postL);
  const postR = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 6, 7), postMat);
  postR.position.set(6, 3, 0);
  g.add(postR);

  // Curved beam — TorusGeometry half-arc on its side
  const beam = new THREE.Mesh(
    new THREE.TorusGeometry(6, 0.22, 8, 28, Math.PI),
    new THREE.MeshStandardMaterial({ color: 0x344532, roughness: 1, flatShading: true }),
  );
  beam.position.set(0, 6, 0);
  beam.rotation.z = Math.PI;
  g.add(beam);

  // Hanging glow dots
  const dotN = 18;
  const dpos = new Float32Array(dotN * 3);
  for (let i = 0; i < dotN; i++) {
    const a = (i / (dotN - 1)) * Math.PI;
    dpos[i*3]   = -6 * Math.cos(a);
    dpos[i*3+1] = 6 + 6 * Math.sin(a) - (Math.random() * 1.2);
    dpos[i*3+2] = (Math.random() - 0.5) * 0.4;
  }
  const dgeo = new THREE.BufferGeometry();
  dgeo.setAttribute('position', new THREE.BufferAttribute(dpos, 3));
  const dmat = new THREE.PointsMaterial({
    color: 0xa4ffd8, size: 0.4, transparent: true, opacity: 1,
    map: makeSoftDiscTex('#a4ffd8'), depthWrite: false,
    blending: THREE.AdditiveBlending, sizeAttenuation: true,
  });
  g.add(new THREE.Points(dgeo, dmat));

  return g;
}

function makeMossyFloor(span) {
  const geo = new THREE.PlaneGeometry(200, span * 4, 50, 50);
  geo.rotateX(-Math.PI / 2);
  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false,
    uniforms: {
      uTime: { value: 0 },
      uA: { value: new THREE.Color('#0e2818') },
      uB: { value: new THREE.Color('#2a5a3e') },
    },
    vertexShader: /* glsl */ `
      uniform float uTime;
      varying vec3 vWorld;
      varying float vH;
      void main() {
        vec3 p = position;
        float h = sin(p.x * 0.18 + uTime * 0.4) * 0.06 + cos(p.z * 0.16 + uTime * 0.35) * 0.06;
        p.y += h;
        vH = h;
        vWorld = (modelMatrix * vec4(p, 1.0)).xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform vec3 uA;
      uniform vec3 uB;
      varying vec3 vWorld;
      varying float vH;
      void main() {
        // Patches of moss
        float n = 0.5 + 0.5 * sin(vWorld.x * 0.22 + uTime * 0.2) * cos(vWorld.z * 0.20 + uTime * 0.15);
        vec3 c = mix(uA, uB, n);
        c += vec3(0.05, 0.12, 0.06) * (vH + 0.5);
        float fade = smoothstep(95.0, 20.0, abs(vWorld.x));
        gl_FragColor = vec4(c, fade * 0.95);
      }
    `,
  });
  return new THREE.Mesh(geo, mat);
}

function makeFireflies(N, cz, span) {
  const pos = new Float32Array(N * 3);
  const phs = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    pos[i*3]   = (Math.random() - 0.5) * 60;
    pos[i*3+1] = -4 + Math.random() * 16;
    pos[i*3+2] = cz - span + Math.random() * (span * 2);
    phs[i] = Math.random() * Math.PI * 2;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({
    color: 0xc8ffa6, size: 0.45, sizeAttenuation: true,
    transparent: true, opacity: 0.95,
    map: makeSoftDiscTex('#c8ffa6'), depthWrite: false,
    blending: THREE.AdditiveBlending, alphaTest: 0.01,
  });
  const pts = new THREE.Points(geo, mat);
  pts.userData.phase = phs;
  return pts;
}

function makeSoftDiscTex(hex) {
  const size = 64;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  const r = size / 2;
  const col = new THREE.Color(hex);
  const rgb = `${Math.round(col.r*255)},${Math.round(col.g*255)},${Math.round(col.b*255)}`;
  const grad = ctx.createRadialGradient(r, r, 0, r, r, r);
  grad.addColorStop(0,   'rgba(255,255,255,1)');
  grad.addColorStop(0.35,`rgba(${rgb},0.9)`);
  grad.addColorStop(1,   `rgba(${rgb},0)`);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
