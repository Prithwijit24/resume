import * as THREE from 'three';

// ════════════════════════════════════════════════════════════════════
// Biome 4 — Lake Temple at twilight.
// Stone pillars line the path beside a reflective water plane. Floating
// golden lanterns drift overhead, tiny lotus mounds dot the water.
// ════════════════════════════════════════════════════════════════════
export function buildTemple(scene, biome) {
  const group = new THREE.Group();
  const cz = biome.centerZ;
  const span = biome.length;

  // ── Water plane ──────────────────────────────────────────────────
  const water = makeWater(span);
  water.position.set(0, -7, cz);
  group.add(water);

  // ── Pillars on both sides ────────────────────────────────────────
  const pillars = [];
  for (let i = 0; i < 10; i++) {
    const side = i % 2 === 0 ? 1 : -1;
    const x = side * (7 + Math.random() * 3);
    const z = cz - span + (i / 10) * (span * 2);
    const h = 9 + Math.random() * 3;
    const p = makePillar(h);
    p.position.set(x, -7, z);
    group.add(p);
    pillars.push(p);
  }

  // ── Stone path stones above water ────────────────────────────────
  for (let i = 0; i < 14; i++) {
    const z = cz - span + (i / 14) * (span * 2) + (Math.random() - 0.5) * 1.5;
    const stone = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.8 + Math.random() * 0.3, 0),
      new THREE.MeshStandardMaterial({
        color: 0x6a6a78, roughness: 0.9, flatShading: true,
      }),
    );
    stone.position.set((Math.random() - 0.5) * 1.2, -6.4, z);
    stone.rotation.set(Math.random() * 0.6, Math.random() * Math.PI, Math.random() * 0.6);
    stone.scale.y = 0.4 + Math.random() * 0.2;
    group.add(stone);
  }

  // ── Lotus on water ───────────────────────────────────────────────
  for (let i = 0; i < 8; i++) {
    const x = (Math.random() - 0.5) * 28;
    const z = cz - span + Math.random() * (span * 2);
    const lotus = makeLotus();
    lotus.position.set(x, -6.5, z);
    group.add(lotus);
  }

  // ── Floating lanterns ────────────────────────────────────────────
  const lanterns = [];
  for (let i = 0; i < 14; i++) {
    const l = makeLantern();
    const x = (Math.random() - 0.5) * 22;
    const y = 2 + Math.random() * 6;
    const z = cz - span + Math.random() * (span * 2);
    l.position.set(x, y, z);
    l.userData = {
      basePos: new THREE.Vector3(x, y, z),
      phase: Math.random() * Math.PI * 2,
      drift: 0.6 + Math.random() * 0.6,
    };
    group.add(l);
    lanterns.push(l);
  }

  // ── Pavilion at the far end ──────────────────────────────────────
  const pavilion = makePavilion();
  pavilion.position.set(0, -7, cz - span - 5);
  group.add(pavilion);

  scene.add(group);

  return {
    group,
    update(time) {
      water.material.uniforms.uTime.value = time;
      lanterns.forEach(l => {
        l.position.y = l.userData.basePos.y + Math.sin(time * 0.5 * l.userData.drift + l.userData.phase) * 0.45;
        l.position.x = l.userData.basePos.x + Math.cos(time * 0.4 * l.userData.drift + l.userData.phase * 1.3) * 0.3;
        l.rotation.y += 0.003 * l.userData.drift;
      });
    },
  };
}

// ── Helpers ─────────────────────────────────────────────────────────

function makePillar(height) {
  const g = new THREE.Group();

  // Base
  const base = new THREE.Mesh(
    new THREE.BoxGeometry(1.6, 0.4, 1.6),
    new THREE.MeshStandardMaterial({ color: 0x5a5a64, roughness: 0.95, flatShading: true }),
  );
  base.position.y = 0.2;
  g.add(base);

  // Shaft — fluted via segmented cylinder
  const shaft = new THREE.Mesh(
    new THREE.CylinderGeometry(0.55, 0.65, height - 1, 16),
    new THREE.MeshStandardMaterial({ color: 0xb09870, roughness: 0.7, flatShading: false }),
  );
  shaft.position.y = (height - 1) / 2 + 0.4;
  g.add(shaft);

  // Capital
  const cap = new THREE.Mesh(
    new THREE.BoxGeometry(1.5, 0.35, 1.5),
    new THREE.MeshStandardMaterial({ color: 0x9c8460, roughness: 0.8, flatShading: true }),
  );
  cap.position.y = height - 0.5;
  g.add(cap);

  // Top ornament
  const top = new THREE.Mesh(
    new THREE.ConeGeometry(0.45, 0.6, 8),
    new THREE.MeshStandardMaterial({
      color: 0xffd86c, emissive: 0xc9943a, emissiveIntensity: 0.6,
      roughness: 0.4, metalness: 0.4, flatShading: true,
    }),
  );
  top.position.y = height + 0.05;
  g.add(top);

  // Gold band near top
  const band = new THREE.Mesh(
    new THREE.TorusGeometry(0.7, 0.06, 6, 14),
    new THREE.MeshStandardMaterial({
      color: 0xffd86c, emissive: 0xc9943a, emissiveIntensity: 0.5,
      roughness: 0.3, metalness: 0.7,
    }),
  );
  band.position.y = height - 0.9;
  band.rotation.x = Math.PI / 2;
  g.add(band);

  return g;
}

function makeLotus() {
  const g = new THREE.Group();
  const petalMat = new THREE.MeshStandardMaterial({
    color: 0xffc7d8, roughness: 0.7, flatShading: true,
    emissive: 0xff8aa6, emissiveIntensity: 0.18,
  });
  for (let i = 0; i < 8; i++) {
    const petal = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.4, 4), petalMat);
    const a = (i / 8) * Math.PI * 2;
    petal.position.set(0.22 * Math.cos(a), 0.16, 0.22 * Math.sin(a));
    petal.rotation.set(Math.PI / 2.5, 0, -a);
    g.add(petal);
  }
  const center = new THREE.Mesh(
    new THREE.SphereGeometry(0.14, 8, 6),
    new THREE.MeshStandardMaterial({
      color: 0xffd86c, emissive: 0xffd86c, emissiveIntensity: 0.6,
      roughness: 0.5, flatShading: true,
    }),
  );
  center.position.y = 0.22;
  g.add(center);
  return g;
}

function makeLantern() {
  const g = new THREE.Group();

  // Body — small box with bright window
  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0x6a4824, roughness: 0.8, flatShading: true,
  });
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.5, 0.4), bodyMat);
  g.add(body);

  // Glow window
  const glowMat = new THREE.MeshBasicMaterial({
    color: 0xffd86c, transparent: true, opacity: 0.9,
    blending: THREE.AdditiveBlending, depthWrite: false,
  });
  for (let i = 0; i < 4; i++) {
    const w = new THREE.Mesh(new THREE.PlaneGeometry(0.28, 0.34), glowMat);
    if (i === 0) { w.position.set(0, 0,  0.205); }
    if (i === 1) { w.position.set(0, 0, -0.205); w.rotation.y = Math.PI; }
    if (i === 2) { w.position.set( 0.205, 0, 0); w.rotation.y =  Math.PI / 2; }
    if (i === 3) { w.position.set(-0.205, 0, 0); w.rotation.y = -Math.PI / 2; }
    g.add(w);
  }

  // Top roof
  const roof = new THREE.Mesh(
    new THREE.ConeGeometry(0.32, 0.18, 4),
    new THREE.MeshStandardMaterial({ color: 0x4a3018, roughness: 0.9, flatShading: true }),
  );
  roof.position.y = 0.34;
  roof.rotation.y = Math.PI / 4;
  g.add(roof);

  // String above
  const string = new THREE.Mesh(
    new THREE.CylinderGeometry(0.008, 0.008, 0.5, 4),
    new THREE.MeshBasicMaterial({ color: 0x2a1f12 }),
  );
  string.position.y = 0.68;
  g.add(string);

  // Soft halo sprite
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({
    map: makeSoftDiscTex('#ffd86c'),
    color: 0xffd86c, transparent: true, opacity: 0.7,
    blending: THREE.AdditiveBlending, depthWrite: false,
  }));
  halo.scale.set(2.2, 2.2, 1);
  halo.position.y = 0.02;
  g.add(halo);

  return g;
}

function makePavilion() {
  const g = new THREE.Group();

  // Base platform
  const platform = new THREE.Mesh(
    new THREE.BoxGeometry(8, 0.5, 8),
    new THREE.MeshStandardMaterial({ color: 0xb09870, roughness: 0.8 }),
  );
  platform.position.y = 0.25;
  g.add(platform);

  // 4 pillars at corners
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    const pil = new THREE.Mesh(
      new THREE.CylinderGeometry(0.35, 0.4, 4, 12),
      new THREE.MeshStandardMaterial({ color: 0xb09870, roughness: 0.7 }),
    );
    pil.position.set(3 * Math.cos(a), 2.5, 3 * Math.sin(a));
    g.add(pil);
  }

  // Roof — wide cone
  const roof = new THREE.Mesh(
    new THREE.ConeGeometry(5.8, 2.4, 6),
    new THREE.MeshStandardMaterial({
      color: 0x6a3828, roughness: 0.8, flatShading: true,
      emissive: 0x4c1f10, emissiveIntensity: 0.15,
    }),
  );
  roof.position.y = 5.7;
  g.add(roof);

  // Golden finial
  const finial = new THREE.Mesh(
    new THREE.SphereGeometry(0.32, 12, 8),
    new THREE.MeshStandardMaterial({
      color: 0xffd86c, emissive: 0xffd86c, emissiveIntensity: 0.7,
      roughness: 0.3, metalness: 0.6,
    }),
  );
  finial.position.y = 7.1;
  g.add(finial);

  return g;
}

function makeWater(span) {
  const geo = new THREE.PlaneGeometry(200, span * 4, 60, 60);
  geo.rotateX(-Math.PI / 2);
  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false,
    uniforms: {
      uTime: { value: 0 },
      uA: { value: new THREE.Color('#1c2848') },
      uB: { value: new THREE.Color('#3a5a8a') },
      uGold: { value: new THREE.Color('#ffd86c') },
    },
    vertexShader: /* glsl */ `
      uniform float uTime;
      varying vec3 vWorld;
      varying float vH;
      void main() {
        vec3 p = position;
        float h = sin(p.x * 0.12 + uTime * 0.6) * 0.08 + cos(p.z * 0.10 + uTime * 0.5) * 0.08;
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
      uniform vec3 uGold;
      varying vec3 vWorld;
      varying float vH;
      void main() {
        float shine = 0.5 + 0.5 * sin(vWorld.x * 0.25 + vWorld.z * 0.3 + uTime * 0.8);
        vec3 c = mix(uA, uB, smoothstep(-0.1, 0.1, vH));
        c = mix(c, uGold, pow(shine, 6.0) * 0.5);
        float fade = smoothstep(95.0, 20.0, abs(vWorld.x));
        gl_FragColor = vec4(c, fade);
      }
    `,
  });
  return new THREE.Mesh(geo, mat);
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
