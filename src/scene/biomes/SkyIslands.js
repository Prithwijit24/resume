import * as THREE from 'three';

// ════════════════════════════════════════════════════════════════════
// Biome 0 — Sky Islands at dawn.
// Floating low-poly islands with trees, glowing crystals, a rolling
// cloud sea below, drifting petals and circling birds.
// ════════════════════════════════════════════════════════════════════
export function buildSkyIslands(scene, biome) {
  const group = new THREE.Group();

  const cz = biome.centerZ;
  const span = biome.length;

  // ── Islands ──────────────────────────────────────────────────────
  // Positioned so the camera path (x in [-4.6, 4.6], z from 10 → -50) flies
  // BETWEEN them rather than into them, with mixed heights for parallax.
  const specs = [
    { pos: [-12, -2,   cz + 22], r: 5.5, color: '#d9b386', grass: '#9bd55c', trees: 4, hue: 0.95 },
    { pos: [ 13,  4,   cz +  8], r: 3.5, color: '#e6c094', grass: '#a5dc6a', trees: 3, hue: 0.15 },
    { pos: [-16,  9,   cz - 10], r: 4.5, color: '#cfa67a', grass: '#94cc52', trees: 4, hue: 0.55 },
    { pos: [ 11, 11,   cz - 24], r: 3.8, color: '#dcb085', grass: '#a8d860', trees: 3, hue: 0.85 },
    { pos: [ -7, 13,   cz - 32], r: 3.0, color: '#d4a878', grass: '#9dd35a', trees: 2, hue: 0.05 },
  ];
  const islands = specs.map(s => {
    const isl = makeIsland(s);
    group.add(isl);
    return isl;
  });

  // ── Rolling cloud sea below ──────────────────────────────────────
  const sea = makeCloudSea(span);
  sea.position.y = -16;
  sea.position.z = cz;
  group.add(sea);

  // ── Cloud puffs (point sprites) ──────────────────────────────────
  const clouds = makeCloudPuffs(160, cz, span);
  group.add(clouds);

  // ── Petals drifting ──────────────────────────────────────────────
  const petals = makePetals(140, cz, span);
  group.add(petals);

  // ── Birds ────────────────────────────────────────────────────────
  const birds = [];
  for (let i = 0; i < 6; i++) {
    const b = makeBird();
    const y = 14 + Math.random() * 8;
    b.position.set(-25 + Math.random() * 50, y, cz - 10 + Math.random() * 40);
    b.userData = {
      speed: 0.03 + Math.random() * 0.04,
      phase: Math.random() * Math.PI * 2,
      baseY: y,
    };
    group.add(b);
    birds.push(b);
  }

  scene.add(group);

  return {
    group,
    update(time) {
      // Island bob + crystal spin
      islands.forEach((isl, i) => {
        isl.position.y = isl.userData.baseY + Math.sin(time * 0.45 + isl.userData.bobPhase) * 0.16;
        isl.rotation.y += 0.0009 + i * 0.00003;
        const cg = isl.userData.crystals;
        if (cg) {
          cg.children.forEach(c => {
            const b = c.userData.base;
            c.position.y = b.y + Math.sin(time * 1.2 + c.userData.phase) * 0.35;
            c.rotation.y += 0.014 * c.userData.spin;
            c.rotation.x += 0.008 * c.userData.spin;
          });
        }
      });
      // Cloud sea wave
      sea.material.uniforms.uTime.value = time;
      // Petals fall + sway
      const parr = petals.geometry.attributes.position.array;
      const phs = petals.userData.phase;
      for (let i = 0; i < parr.length / 3; i++) {
        parr[i * 3 + 1] -= 0.006;
        parr[i * 3] += Math.sin(time * 0.7 + phs[i]) * 0.004;
        if (parr[i * 3 + 1] < -8) {
          parr[i * 3 + 1] = 26;
          parr[i * 3]     = (Math.random() - 0.5) * 90;
        }
      }
      petals.geometry.attributes.position.needsUpdate = true;
      // Birds drift forward
      birds.forEach(b => {
        b.position.x += b.userData.speed;
        b.position.y = b.userData.baseY + Math.sin(time * 4 + b.userData.phase) * 0.18;
        if (b.position.x > 30) b.position.x = -30;
      });
    },
  };
}

// ── Helpers ─────────────────────────────────────────────────────────

function makeIsland(spec) {
  const group = new THREE.Group();
  const { pos, r, color, grass, trees, hue } = spec;

  // Body — displaced icosahedron, tapered into a stalactite
  const geom = new THREE.IcosahedronGeometry(r, 2);
  const p = geom.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    if (y < 0) {
      const t = -y / r;
      const taper = 1 - t * 0.85;
      p.setX(i, x * taper);
      p.setZ(i, z * taper);
      p.setY(i, y * 1.5 - t * r * 0.4);
    }
    const n = 0.16;
    p.setX(i, p.getX(i) + (Math.random() - 0.5) * r * n);
    p.setY(i, p.getY(i) + (Math.random() - 0.5) * r * n * 0.5);
    p.setZ(i, p.getZ(i) + (Math.random() - 0.5) * r * n);
  }
  geom.computeVertexNormals();
  group.add(new THREE.Mesh(geom, new THREE.MeshStandardMaterial({
    color: new THREE.Color(color), roughness: 0.92, flatShading: true,
  })));

  // Grass cap
  const grassGeom = new THREE.SphereGeometry(r * 0.94, 14, 6, 0, Math.PI * 2, 0, Math.PI * 0.42);
  const grassMesh = new THREE.Mesh(grassGeom, new THREE.MeshStandardMaterial({
    color: new THREE.Color(grass), roughness: 0.88, flatShading: true,
    emissive: new THREE.Color(grass).multiplyScalar(0.06),
  }));
  grassMesh.position.y = r * 0.18;
  group.add(grassMesh);

  // Flower dots
  const flowerColors = [
    new THREE.Color().setHSL(hue, 0.85, 0.7),
    new THREE.Color().setHSL((hue + 0.12) % 1, 0.8, 0.78),
    new THREE.Color().setHSL((hue + 0.55) % 1, 0.8, 0.78),
    new THREE.Color(0xffffff),
  ];
  const flowerN = Math.max(6, Math.floor(r * 3));
  for (let i = 0; i < flowerN; i++) {
    const fc = flowerColors[Math.floor(Math.random() * flowerColors.length)];
    const m = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.09 + Math.random() * 0.05, 0),
      new THREE.MeshStandardMaterial({
        color: fc, roughness: 0.55, flatShading: true,
        emissive: fc.clone().multiplyScalar(0.35),
      }),
    );
    const a = Math.random() * Math.PI * 2;
    const rr = r * (0.15 + Math.random() * 0.7);
    m.position.set(rr * Math.cos(a), r * 0.46 + Math.random() * 0.08, rr * Math.sin(a));
    m.rotation.set(Math.random(), Math.random() * Math.PI * 2, Math.random());
    group.add(m);
  }

  // Trees
  for (let i = 0; i < trees; i++) {
    const a = (i / trees) * Math.PI * 2 + Math.random() * 0.8;
    const rr = r * (0.25 + Math.random() * 0.55);
    const tree = makeTree(0.3 + Math.random() * 0.35, 1.5 + Math.random() * 1.6);
    tree.position.set(rr * Math.cos(a), r * 0.45, rr * Math.sin(a));
    tree.rotation.y = Math.random() * Math.PI * 2;
    group.add(tree);
  }

  // Crystals
  const crystals = new THREE.Group();
  for (let i = 0; i < 3; i++) {
    const c = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.2 + Math.random() * 0.12, 0),
      new THREE.MeshStandardMaterial({
        color: 0xffe8b0, emissive: 0xffaa66, emissiveIntensity: 0.9,
        roughness: 0.25, flatShading: true,
      }),
    );
    const a = (i / 3) * Math.PI * 2 + Math.random() * 0.4;
    const rr = r * (1.15 + Math.random() * 0.4);
    const h = r * (0.25 + Math.random() * 0.6);
    c.userData = {
      base: new THREE.Vector3(rr * Math.cos(a), h, rr * Math.sin(a)),
      phase: Math.random() * Math.PI * 2,
      spin:  0.6 + Math.random() * 0.6,
    };
    c.position.copy(c.userData.base);
    crystals.add(c);
  }
  group.add(crystals);

  group.position.set(pos[0], pos[1], pos[2]);
  group.userData.baseY = pos[1];
  group.userData.bobPhase = Math.random() * Math.PI * 2;
  group.userData.crystals = crystals;
  return group;
}

function makeTree(radius, height) {
  const g = new THREE.Group();
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.1, height * 0.34, 7),
    new THREE.MeshStandardMaterial({ color: 0x5a3a1f, roughness: 1, flatShading: true })
  );
  trunk.position.y = height * 0.17;
  g.add(trunk);

  const hues = [0x6ec040, 0x88d258, 0x5ab230, 0xa4d96a];
  const foliage = hues[Math.floor(Math.random() * hues.length)];

  const f1 = new THREE.Mesh(
    new THREE.ConeGeometry(radius, height * 0.75, 8),
    new THREE.MeshStandardMaterial({ color: foliage, roughness: 0.85, flatShading: true })
  );
  f1.position.y = height * 0.62;
  g.add(f1);

  const f2 = new THREE.Mesh(
    new THREE.ConeGeometry(radius * 0.74, height * 0.46, 8),
    new THREE.MeshStandardMaterial({ color: foliage, roughness: 0.85, flatShading: true })
  );
  f2.position.y = height * 0.96;
  g.add(f2);

  if (Math.random() < 0.3) {
    const f3 = new THREE.Mesh(
      new THREE.ConeGeometry(radius * 0.5, height * 0.32, 8),
      new THREE.MeshStandardMaterial({ color: foliage, roughness: 0.85, flatShading: true })
    );
    f3.position.y = height * 1.22;
    g.add(f3);
  }
  return g;
}

function makeCloudSea(span) {
  const geo = new THREE.PlaneGeometry(600, span * 4, 60, 60);
  geo.rotateX(-Math.PI / 2);
  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false,
    uniforms: {
      uTime: { value: 0 },
      uA: { value: new THREE.Color('#ffffff') },
      uB: { value: new THREE.Color('#ffd9a0') },
    },
    vertexShader: /* glsl */ `
      uniform float uTime;
      varying float vH;
      varying vec3 vWorld;
      void main() {
        vec3 p = position;
        float h = sin(p.x*0.045 + uTime*0.35)*0.65 + cos(p.z*0.04 + uTime*0.28)*0.55 + sin((p.x+p.z)*0.018 + uTime*0.18)*0.35;
        p.y += h;
        vH = h;
        vWorld = (modelMatrix * vec4(p, 1.0)).xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uA;
      uniform vec3 uB;
      varying float vH;
      varying vec3 vWorld;
      void main() {
        vec3 c = mix(uB, uA, smoothstep(-0.8, 0.9, vH));
        float dist = length(vWorld.xz);
        float fade = smoothstep(360.0, 180.0, dist);
        gl_FragColor = vec4(c, 0.5 * fade);
      }
    `,
  });
  return new THREE.Mesh(geo, mat);
}

function makeCloudPuffs(N, cz, span) {
  const pos = new Float32Array(N * 3);
  const col = new Float32Array(N * 3);
  const sz  = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    pos[i*3]   = (Math.random() - 0.5) * 200;
    pos[i*3+1] = -4 + Math.random() * 6;
    pos[i*3+2] = cz - span - 20 + Math.random() * (span * 2 + 40);
    const dim = 0.88 + Math.random() * 0.12;
    col[i*3]   = dim; col[i*3+1] = dim * 0.97; col[i*3+2] = dim * 0.92;
    sz[i] = 5 + Math.random() * 10;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color',    new THREE.BufferAttribute(col, 3));
  geo.setAttribute('size',     new THREE.BufferAttribute(sz, 1));
  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, vertexColors: true,
    uniforms: { uPx: { value: Math.min(devicePixelRatio, 1.75) } },
    vertexShader: /* glsl */ `
      attribute float size;
      varying vec3 vColor;
      uniform float uPx;
      void main() {
        vColor = color;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = size * 40.0 * uPx / (-mv.z);
      }
    `,
    fragmentShader: /* glsl */ `
      varying vec3 vColor;
      void main() {
        vec2 c = gl_PointCoord - vec2(0.5);
        float d = length(c);
        float a = smoothstep(0.5, 0.18, d) * 0.5;
        gl_FragColor = vec4(vColor, a);
      }
    `,
  });
  return new THREE.Points(geo, mat);
}

function makePetals(N, cz, span) {
  const pos = new Float32Array(N * 3);
  const phs = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    pos[i*3]   = (Math.random() - 0.5) * 90;
    pos[i*3+1] = -6 + Math.random() * 32;
    pos[i*3+2] = cz - span - 10 + Math.random() * (span * 2 + 20);
    phs[i] = Math.random() * Math.PI * 2;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const tex = makeSoftDiscTex('#ffb8c8');
  const mat = new THREE.PointsMaterial({
    color: 0xffb8c8, size: 0.28, sizeAttenuation: true,
    transparent: true, opacity: 0.85, depthWrite: false,
    map: tex, alphaTest: 0.01,
  });
  const pts = new THREE.Points(geo, mat);
  pts.userData.phase = phs;
  return pts;
}

function makeBird() {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute([
    -0.32, 0,    0,
     0.32, 0,    0,
     0,    0.09, 0,
  ], 3));
  const m = new THREE.LineBasicMaterial({ color: 0x3a2820, transparent: true, opacity: 0.7 });
  return new THREE.LineLoop(g, m);
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
  grad.addColorStop(0.4, `rgba(${rgb},0.9)`);
  grad.addColorStop(1,   `rgba(${rgb},0)`);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
