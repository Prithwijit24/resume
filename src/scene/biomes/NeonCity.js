import * as THREE from 'three';

// ════════════════════════════════════════════════════════════════════
// Biome 1 — Neon Data City.
// Edge-lit towers form a corridor. A grid floor pulses with cyan light,
// holographic rings rotate around select towers, data motes drift past.
// ════════════════════════════════════════════════════════════════════
export function buildNeonCity(scene, biome) {
  const group = new THREE.Group();
  const cz = biome.centerZ;
  const span = biome.length;

  // ── Grid floor ───────────────────────────────────────────────────
  const floor = makeGridFloor(span);
  floor.position.set(0, -8, cz);
  group.add(floor);

  // ── Towers in left/right lanes ───────────────────────────────────
  const towers = [];
  const towerColors = [
    { body: '#0e0a2a', edge: '#22e0ff' },
    { body: '#1a0a35', edge: '#ff3ca0' },
    { body: '#0a1535', edge: '#a060ff' },
    { body: '#150830', edge: '#22ffd0' },
  ];
  for (let i = 0; i < 16; i++) {
    const side = i % 2 === 0 ? 1 : -1;
    const x = side * (10 + Math.random() * 12);
    const z = cz - span + (i / 16) * (span * 2) + (Math.random() - 0.5) * 4;
    const h = 8 + Math.random() * 22;
    const w = 2 + Math.random() * 3;
    const col = towerColors[Math.floor(Math.random() * towerColors.length)];
    const t = makeTower(w, h, w, col);
    t.position.set(x, -8 + h / 2, z);
    t.userData.pulsePhase = Math.random() * Math.PI * 2;
    t.userData.pulseAmp   = 0.5 + Math.random() * 0.5;
    group.add(t);
    towers.push(t);
  }

  // ── Holographic rings around random tall towers ──────────────────
  const rings = [];
  towers.filter(t => t.userData.height > 16).slice(0, 6).forEach(t => {
    const r = new THREE.Mesh(
      new THREE.TorusGeometry(3.2, 0.06, 8, 60),
      new THREE.MeshBasicMaterial({
        color: 0x22e0ff, transparent: true, opacity: 0.85,
        blending: THREE.AdditiveBlending, depthWrite: false,
      }),
    );
    r.position.set(t.position.x, t.position.y + (Math.random() - 0.5) * t.userData.height * 0.4, t.position.z);
    r.rotation.x = Math.PI / 2;
    r.userData.spin = 0.005 + Math.random() * 0.01;
    r.userData.baseY = r.position.y;
    group.add(r);
    rings.push(r);
  });

  // ── Data motes (cyan particles) ──────────────────────────────────
  const motes = makeDataMotes(280, cz, span);
  group.add(motes);

  // ── Distant horizon spires (silhouettes) ─────────────────────────
  for (let i = 0; i < 14; i++) {
    const side = i % 2 === 0 ? 1 : -1;
    const x = side * (28 + Math.random() * 18);
    const z = cz - span + (i / 14) * (span * 2);
    const h = 18 + Math.random() * 28;
    const w = 1.4 + Math.random() * 2;
    const s = makeSilhouetteTower(w, h, w);
    s.position.set(x, -8 + h / 2, z);
    group.add(s);
  }

  scene.add(group);

  return {
    group,
    update(time) {
      // Tower edge pulse
      towers.forEach(t => {
        const k = (Math.sin(time * 1.5 + t.userData.pulsePhase) * 0.5 + 0.5);
        if (t.userData.edgeMat) {
          t.userData.edgeMat.opacity = 0.55 + k * 0.45 * t.userData.pulseAmp;
        }
      });
      // Rings rotate + bob
      rings.forEach((r, i) => {
        r.rotation.z += r.userData.spin;
        r.rotation.x = Math.PI / 2 + Math.sin(time * 0.6 + i) * 0.15;
        r.position.y = r.userData.baseY + Math.sin(time * 0.9 + i) * 0.6;
      });
      // Grid floor uniform tick
      floor.material.uniforms.uTime.value = time;
      // Motes drift forward (toward camera)
      const arr = motes.geometry.attributes.position.array;
      for (let i = 0; i < arr.length / 3; i++) {
        arr[i * 3 + 1] += Math.sin(time + i * 0.13) * 0.003;
        arr[i * 3 + 2] += 0.04;
        if (arr[i * 3 + 2] > cz + span) arr[i * 3 + 2] = cz - span;
      }
      motes.geometry.attributes.position.needsUpdate = true;
    },
  };
}

// ── Tower with body + emissive edge lines ───────────────────────────
function makeTower(w, h, d, col) {
  const g = new THREE.Group();

  const body = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, d, 1, 1, 1),
    new THREE.MeshStandardMaterial({
      color: new THREE.Color(col.body), roughness: 0.4, metalness: 0.7,
      emissive: new THREE.Color(col.body).multiplyScalar(0.4),
    }),
  );
  g.add(body);

  // Edges
  const edgeGeom = new THREE.EdgesGeometry(body.geometry);
  const edgeMat  = new THREE.LineBasicMaterial({
    color: new THREE.Color(col.edge), transparent: true, opacity: 0.85,
  });
  g.add(new THREE.LineSegments(edgeGeom, edgeMat));

  // Stripe windows — emissive plane on each side
  const stripeMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color(col.edge), transparent: true, opacity: 0.55,
    blending: THREE.AdditiveBlending, depthWrite: false,
  });
  for (let side = 0; side < 4; side++) {
    const s = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.18, h * 0.85), stripeMat);
    if (side === 0) { s.position.set(0, 0,  d / 2 + 0.01); }
    if (side === 1) { s.position.set(0, 0, -d / 2 - 0.01); s.rotation.y = Math.PI; }
    if (side === 2) { s.position.set( w / 2 + 0.01, 0, 0); s.rotation.y =  Math.PI / 2; }
    if (side === 3) { s.position.set(-w / 2 - 0.01, 0, 0); s.rotation.y = -Math.PI / 2; }
    g.add(s);
  }

  // Cap (sharp point)
  const cap = new THREE.Mesh(
    new THREE.ConeGeometry(w * 0.55, w * 1.6, 4),
    new THREE.MeshStandardMaterial({
      color: new THREE.Color(col.edge), emissive: new THREE.Color(col.edge),
      emissiveIntensity: 0.6, roughness: 0.35, metalness: 0.6,
    }),
  );
  cap.position.y = h / 2 + w * 0.8;
  cap.rotation.y = Math.PI / 4;
  g.add(cap);

  g.userData.height  = h;
  g.userData.edgeMat = edgeMat;
  return g;
}

function makeSilhouetteTower(w, h, d) {
  const m = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, d),
    new THREE.MeshBasicMaterial({ color: 0x0a0820, transparent: true, opacity: 0.85 }),
  );
  return m;
}

function makeGridFloor(span) {
  const geo = new THREE.PlaneGeometry(220, span * 4, 1, 1);
  geo.rotateX(-Math.PI / 2);
  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false,
    uniforms: {
      uTime:    { value: 0 },
      uColor:   { value: new THREE.Color('#22e0ff') },
      uBgColor: { value: new THREE.Color('#0a0820') },
    },
    vertexShader: /* glsl */ `
      varying vec3 vWorld;
      void main() {
        vWorld = (modelMatrix * vec4(position, 1.0)).xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform vec3 uColor;
      uniform vec3 uBgColor;
      varying vec3 vWorld;
      void main() {
        // Distance from nearest grid line
        vec2 g = abs(fract(vWorld.xz * 0.15 + vec2(0.0, uTime * 0.06)) - 0.5);
        float line = min(g.x, g.y);
        float intensity = smoothstep(0.5, 0.46, 0.5 - line);
        // Vignette/fade with distance from path
        float distFromAxis = abs(vWorld.x);
        float fade = smoothstep(110.0, 30.0, distFromAxis);
        // Forward pulse along z
        float pulse = 0.5 + 0.5 * sin(vWorld.z * 0.06 + uTime * 1.2);
        vec3 c = mix(uBgColor, uColor, intensity * (0.6 + 0.4 * pulse));
        gl_FragColor = vec4(c, fade * (0.55 + intensity * 0.45));
      }
    `,
  });
  return new THREE.Mesh(geo, mat);
}

function makeDataMotes(N, cz, span) {
  const pos = new Float32Array(N * 3);
  const col = new Float32Array(N * 3);
  const sz  = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    pos[i * 3]     = (Math.random() - 0.5) * 60;
    pos[i * 3 + 1] = -4 + Math.random() * 24;
    pos[i * 3 + 2] = cz - span + Math.random() * (span * 2);
    // alternate cyan / magenta / violet
    const r = Math.random();
    if (r < 0.5)       { col[i*3] = 0.13; col[i*3+1] = 0.88; col[i*3+2] = 1.0; }
    else if (r < 0.8)  { col[i*3] = 1.0;  col[i*3+1] = 0.24; col[i*3+2] = 0.63; }
    else               { col[i*3] = 0.63; col[i*3+1] = 0.38; col[i*3+2] = 1.0; }
    sz[i] = 0.45 + Math.random() * 0.5;
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
        gl_PointSize = size * 70.0 * uPx / (-mv.z);
      }
    `,
    fragmentShader: /* glsl */ `
      varying vec3 vColor;
      void main() {
        vec2 c = gl_PointCoord - vec2(0.5);
        float d = length(c);
        float a = smoothstep(0.5, 0.0, d);
        gl_FragColor = vec4(vColor, a * 0.95);
      }
    `,
  });
  return new THREE.Points(geo, mat);
}
