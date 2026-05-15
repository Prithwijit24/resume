import * as THREE from 'three';

// ════════════════════════════════════════════════════════════════════
// Biome 5 — Aurora over snow plain.
// Snow plane with footprint sparkles, ice spires lining the path, an
// aurora ribbon (animated plane shader) high in the sky, and gentle
// snowfall.
// ════════════════════════════════════════════════════════════════════
export function buildAurora(scene, biome) {
  const group = new THREE.Group();
  const cz = biome.centerZ;
  const span = biome.length;

  // ── Snow plane ────────────────────────────────────────────────────
  const snow = makeSnowFloor(span);
  snow.position.set(0, -7, cz);
  group.add(snow);

  // ── Ice spires on both sides ─────────────────────────────────────
  for (let i = 0; i < 16; i++) {
    const side = i % 2 === 0 ? 1 : -1;
    const x = side * (8 + Math.random() * 12);
    const z = cz - span + (i / 16) * (span * 2) + (Math.random() - 0.5) * 4;
    const h = 6 + Math.random() * 12;
    const w = 1.0 + Math.random() * 1.4;
    const spire = makeIceSpire(w, h);
    spire.position.set(x, -7, z);
    spire.rotation.y = Math.random() * Math.PI;
    group.add(spire);
  }

  // ── Small ice chunks scattered ───────────────────────────────────
  for (let i = 0; i < 30; i++) {
    const x = (Math.random() - 0.5) * 40;
    const z = cz - span + Math.random() * (span * 2);
    const r = 0.3 + Math.random() * 0.55;
    const chunk = new THREE.Mesh(
      new THREE.IcosahedronGeometry(r, 0),
      new THREE.MeshStandardMaterial({
        color: 0xb8eaff,
        emissive: 0x224a6e,
        emissiveIntensity: 0.4,
        roughness: 0.2,
        metalness: 0.2,
        flatShading: true,
      }),
    );
    chunk.position.set(x, -7 + r * 0.6, z);
    chunk.rotation.set(Math.random(), Math.random() * Math.PI * 2, Math.random());
    group.add(chunk);
  }

  // ── Aurora ribbons (planes in the sky) ───────────────────────────
  const ribbons = [];
  for (let i = 0; i < 3; i++) {
    const r = makeAuroraRibbon(i);
    r.position.set(0, 22 + i * 4, cz - 6 + i * 8);
    group.add(r);
    ribbons.push(r);
  }

  // ── Snowfall particles ───────────────────────────────────────────
  const flakes = makeSnowfall(220, cz, span);
  group.add(flakes);

  // ── Distant mountain silhouettes ─────────────────────────────────
  for (let i = 0; i < 6; i++) {
    const x = (Math.random() - 0.5) * 100;
    const z = cz - span - 18 - Math.random() * 30;
    const mt = new THREE.Mesh(
      new THREE.ConeGeometry(8 + Math.random() * 6, 14 + Math.random() * 8, 6),
      new THREE.MeshBasicMaterial({ color: 0x0a1428, transparent: true, opacity: 0.9 }),
    );
    mt.position.set(x, 0, z);
    mt.rotation.y = Math.random() * Math.PI;
    group.add(mt);
  }

  scene.add(group);

  return {
    group,
    update(time) {
      snow.material.uniforms.uTime.value = time;
      ribbons.forEach(r => { r.material.uniforms.uTime.value = time; });
      const arr = flakes.geometry.attributes.position.array;
      for (let i = 0; i < arr.length / 3; i++) {
        arr[i*3 + 1] -= 0.04;
        arr[i*3]     += Math.sin(time * 0.7 + i * 0.13) * 0.008;
        if (arr[i*3 + 1] < -6) {
          arr[i*3 + 1] = 28;
          arr[i*3]     = (Math.random() - 0.5) * 100;
        }
      }
      flakes.geometry.attributes.position.needsUpdate = true;
    },
  };
}

// ── Helpers ─────────────────────────────────────────────────────────

function makeIceSpire(width, height) {
  const g = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({
    color: 0xc8f0ff,
    emissive: 0x224a6e,
    emissiveIntensity: 0.45,
    roughness: 0.18,
    metalness: 0.25,
    flatShading: true,
  });
  const body = new THREE.Mesh(new THREE.ConeGeometry(width, height, 4), mat);
  body.position.y = height / 2;
  body.rotation.y = Math.PI / 4;
  g.add(body);

  // Edge highlights
  const edge = new THREE.LineSegments(
    new THREE.EdgesGeometry(body.geometry),
    new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.45 }),
  );
  edge.position.copy(body.position);
  edge.rotation.copy(body.rotation);
  g.add(edge);

  // Snow cap base
  const base = new THREE.Mesh(
    new THREE.SphereGeometry(width * 1.1, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.4),
    new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9, flatShading: true }),
  );
  base.position.y = 0.05;
  g.add(base);

  return g;
}

function makeAuroraRibbon(idx) {
  const geo = new THREE.PlaneGeometry(160, 8, 60, 1);
  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: {
      uTime:   { value: 0 },
      uColorA: { value: new THREE.Color([0x6effc0, 0xa080ff, 0x6cc4ff][idx % 3]) },
      uColorB: { value: new THREE.Color([0xa060ff, 0x70ffd0, 0xff60a0][idx % 3]) },
    },
    vertexShader: /* glsl */ `
      uniform float uTime;
      varying vec2 vUv;
      void main() {
        vUv = uv;
        vec3 p = position;
        // Wave along X
        p.y += sin(p.x * 0.06 + uTime * 0.4) * 1.4 + cos(p.x * 0.025 + uTime * 0.2) * 0.8;
        p.z += sin(p.x * 0.04 + uTime * 0.3) * 1.2;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform vec3 uColorA;
      uniform vec3 uColorB;
      varying vec2 vUv;
      void main() {
        // Vertical falloff at top and bottom of the ribbon
        float v = vUv.y;
        float intensity = sin(v * 3.14159);
        // Color along x with time
        float u = vUv.x;
        vec3 c = mix(uColorA, uColorB, 0.5 + 0.5 * sin(u * 6.0 + uTime * 0.6));
        float alpha = intensity * 0.5;
        // Wavy edge taper
        alpha *= smoothstep(0.0, 0.1, vUv.y) * smoothstep(1.0, 0.9, vUv.y);
        gl_FragColor = vec4(c, alpha);
      }
    `,
  });
  return new THREE.Mesh(geo, mat);
}

function makeSnowFloor(span) {
  const geo = new THREE.PlaneGeometry(220, span * 4, 50, 50);
  geo.rotateX(-Math.PI / 2);
  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false,
    uniforms: {
      uTime: { value: 0 },
      uA: { value: new THREE.Color('#dee9f3') },
      uB: { value: new THREE.Color('#5a78a0') },
      uAurora: { value: new THREE.Color('#6effc0') },
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
      uniform vec3 uA;
      uniform vec3 uB;
      uniform vec3 uAurora;
      varying vec3 vWorld;
      void main() {
        // Sparkle dots
        float spx = fract(vWorld.x * 0.7 + 0.13);
        float spz = fract(vWorld.z * 0.7 + 0.31);
        float sparkle = smoothstep(0.97, 1.0, spx) * smoothstep(0.97, 1.0, spz);
        sparkle *= 0.5 + 0.5 * sin(uTime * 4.0 + vWorld.x + vWorld.z);
        // Path-aware tint
        float d = abs(vWorld.x);
        vec3 c = mix(uA, uB, smoothstep(0.0, 90.0, d));
        c += uAurora * sparkle * 0.6;
        // Soft aurora reflection
        c += uAurora * 0.06 * (0.5 + 0.5 * sin(vWorld.z * 0.04 + uTime * 0.3));
        float fade = smoothstep(110.0, 25.0, d);
        gl_FragColor = vec4(c, fade);
      }
    `,
  });
  return new THREE.Mesh(geo, mat);
}

function makeSnowfall(N, cz, span) {
  const pos = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    pos[i*3]   = (Math.random() - 0.5) * 100;
    pos[i*3+1] = -6 + Math.random() * 34;
    pos[i*3+2] = cz - span - 5 + Math.random() * (span * 2 + 10);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({
    color: 0xffffff, size: 0.3, sizeAttenuation: true,
    transparent: true, opacity: 0.95, depthWrite: false,
    map: makeSoftDiscTex('#ffffff'), alphaTest: 0.01,
  });
  return new THREE.Points(geo, mat);
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
