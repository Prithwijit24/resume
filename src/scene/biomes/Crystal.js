import * as THREE from 'three';
import { makePathLane } from '../Path.js';

// ════════════════════════════════════════════════════════════════════
// Biome 3 — Crystal Canyon.
// Tall faceted crystal spires along both sides at sunset. Warm sand
// floor, rotating floating shards, and tiny embers in the air.
// ════════════════════════════════════════════════════════════════════
export function buildCrystal(scene, biome) {
  const group = new THREE.Group();
  const cz = biome.centerZ;
  const span = biome.length;

  // ── Sand floor ────────────────────────────────────────────────────
  const floor = makeSandFloor(span);
  floor.position.set(0, -7, cz);
  group.add(floor);

  // ── Path lane (warm sandstone road) ──────────────────────────────
  const lane = makePathLane(span * 2 + 8, '#7a3858', '#ffb84c');
  lane.position.set(0, -7, cz);
  group.add(lane);

  // ── Tall crystal spires ───────────────────────────────────────────
  const spires = [];
  const palette = [
    { base: 0x6a2880, glow: 0xcc6dd6 },
    { base: 0x803850, glow: 0xff7e9a },
    { base: 0x884c2c, glow: 0xffae64 },
    { base: 0x402870, glow: 0x9a6cff },
    { base: 0xa05030, glow: 0xffa86c },
  ];
  for (let i = 0; i < 14; i++) {
    const side = i % 2 === 0 ? 1 : -1;
    const x = side * (8 + Math.random() * 8);
    const z = cz - span + (i / 14) * (span * 2) + (Math.random() - 0.5) * 4;
    const h = 8 + Math.random() * 18;
    const w = 1.2 + Math.random() * 1.6;
    const c = palette[Math.floor(Math.random() * palette.length)];
    const sp = makeSpire(w, h, c);
    sp.position.set(x, -7, z);
    sp.rotation.y = Math.random() * Math.PI;
    group.add(sp);
    spires.push(sp);
  }

  // ── Smaller crystal clusters near floor (off the path) ──────────
  for (let i = 0; i < 28; i++) {
    const side = i % 2 === 0 ? 1 : -1;
    const x = side * (4.5 + Math.random() * 14);
    const z = cz - span + Math.random() * (span * 2);
    const c = palette[Math.floor(Math.random() * palette.length)];
    const small = makeSpire(0.5 + Math.random() * 0.6, 1.4 + Math.random() * 1.8, c);
    small.position.set(x, -7, z);
    small.rotation.set(Math.random() * 0.4, Math.random() * Math.PI * 2, Math.random() * 0.4);
    group.add(small);
  }

  // ── Floating shards rotating above path ──────────────────────────
  const shards = [];
  for (let i = 0; i < 12; i++) {
    const c = palette[Math.floor(Math.random() * palette.length)];
    const s = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.55 + Math.random() * 0.35, 0),
      new THREE.MeshStandardMaterial({
        color: c.glow, emissive: c.glow, emissiveIntensity: 1.0,
        roughness: 0.2, metalness: 0.4, flatShading: true,
      }),
    );
    // Keep shards off the runway (|x| > 4.5)
    const side = i % 2 === 0 ? 1 : -1;
    const x = side * (5 + Math.random() * 10);
    const y = -3 + Math.random() * 14;
    const z = cz - span + Math.random() * (span * 2);
    s.position.set(x, y, z);
    s.userData = {
      basePos: new THREE.Vector3(x, y, z),
      phase: Math.random() * Math.PI * 2,
      spin: 0.5 + Math.random() * 0.8,
    };
    group.add(s);
    shards.push(s);
  }

  // ── Warm embers drifting upward ──────────────────────────────────
  const embers = makeEmbers(160, cz, span);
  group.add(embers);

  scene.add(group);

  return {
    group,
    update(time) {
      // Spires gentle hum: emissive pulse
      spires.forEach((s, i) => {
        const k = 0.5 + 0.5 * Math.sin(time * 0.7 + i * 0.4);
        if (s.userData.mat) s.userData.mat.emissiveIntensity = 0.7 + k * 0.6;
      });
      // Shards rotate + bob
      shards.forEach(s => {
        s.rotation.x += 0.012 * s.userData.spin;
        s.rotation.y += 0.018 * s.userData.spin;
        s.position.y = s.userData.basePos.y + Math.sin(time * 0.8 + s.userData.phase) * 0.5;
      });
      // Floor tick
      floor.material.uniforms.uTime.value = time;
      // Embers rise
      const arr = embers.geometry.attributes.position.array;
      for (let i = 0; i < arr.length / 3; i++) {
        arr[i*3 + 1] += 0.02;
        arr[i*3]     += Math.sin(time * 0.5 + i * 0.07) * 0.005;
        if (arr[i*3 + 1] > 20) {
          arr[i*3 + 1] = -6;
          arr[i*3]     = (Math.random() - 0.5) * 60;
        }
      }
      embers.geometry.attributes.position.needsUpdate = true;
    },
  };
}

// ── Helpers ─────────────────────────────────────────────────────────

function makeSpire(width, height, colors) {
  const g = new THREE.Group();

  // Body: stretched octahedron (4-sided diamond when viewed from above)
  const bodyMat = new THREE.MeshStandardMaterial({
    color: colors.glow,
    emissive: colors.glow,
    emissiveIntensity: 1.0,
    roughness: 0.22,
    metalness: 0.35,
    flatShading: true,
  });
  const body = new THREE.Mesh(new THREE.OctahedronGeometry(width, 0), bodyMat);
  body.scale.set(1, height / (width * 2), 1);
  body.position.y = height / 2;
  g.add(body);

  // Dark base wrap for grounding
  const base = new THREE.Mesh(
    new THREE.IcosahedronGeometry(width * 0.9, 0),
    new THREE.MeshStandardMaterial({
      color: colors.base, roughness: 0.85, flatShading: true,
    }),
  );
  base.position.y = width * 0.4;
  base.scale.y = 0.5;
  g.add(base);

  // Edge highlight lines
  const edgeGeom = new THREE.EdgesGeometry(body.geometry);
  const edges = new THREE.LineSegments(edgeGeom, new THREE.LineBasicMaterial({
    color: 0xffffff, transparent: true, opacity: 0.35,
  }));
  edges.position.copy(body.position);
  edges.scale.copy(body.scale);
  g.add(edges);

  g.userData.mat = bodyMat;
  return g;
}

function makeSandFloor(span) {
  const geo = new THREE.PlaneGeometry(200, span * 4, 50, 50);
  geo.rotateX(-Math.PI / 2);
  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false,
    uniforms: {
      uTime: { value: 0 },
      uA: { value: new THREE.Color('#cd8a4e') },
      uB: { value: new THREE.Color('#7e3858') },
    },
    vertexShader: /* glsl */ `
      uniform float uTime;
      varying vec3 vWorld;
      void main() {
        vec3 p = position;
        p.y += sin(p.x * 0.06 + uTime * 0.1) * 0.18 + cos(p.z * 0.07 + uTime * 0.08) * 0.18;
        vWorld = (modelMatrix * vec4(p, 1.0)).xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform vec3 uA;
      uniform vec3 uB;
      varying vec3 vWorld;
      void main() {
        float ripple = 0.5 + 0.5 * sin(vWorld.x * 0.12 + vWorld.z * 0.14 + uTime * 0.4);
        vec3 c = mix(uA, uB, smoothstep(0.0, 80.0, abs(vWorld.x) + abs(vWorld.z) * 0.2));
        c = mix(c, uA * 1.18, ripple * 0.3);
        float fade = smoothstep(95.0, 25.0, abs(vWorld.x));
        gl_FragColor = vec4(c, fade);
      }
    `,
  });
  return new THREE.Mesh(geo, mat);
}

function makeEmbers(N, cz, span) {
  const pos = new Float32Array(N * 3);
  const col = new Float32Array(N * 3);
  const sz  = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    pos[i*3]   = (Math.random() - 0.5) * 60;
    pos[i*3+1] = -6 + Math.random() * 20;
    pos[i*3+2] = cz - span + Math.random() * (span * 2);
    const t = Math.random();
    col[i*3]   = 1.0;
    col[i*3+1] = 0.5 + t * 0.4;
    col[i*3+2] = 0.2 + t * 0.3;
    sz[i] = 0.25 + Math.random() * 0.45;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color',    new THREE.BufferAttribute(col, 3));
  geo.setAttribute('size',     new THREE.BufferAttribute(sz, 1));
  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, vertexColors: true,
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
        gl_PointSize = size * 80.0 * uPx / (-mv.z);
      }
    `,
    fragmentShader: /* glsl */ `
      varying vec3 vColor;
      void main() {
        vec2 c = gl_PointCoord - vec2(0.5);
        float d = length(c);
        float a = smoothstep(0.5, 0.0, d);
        gl_FragColor = vec4(vColor, a);
      }
    `,
  });
  return new THREE.Points(geo, mat);
}
