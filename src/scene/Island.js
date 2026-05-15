import * as THREE from 'three';
import { ATMOSPHERE } from '../world.config.js';

// Build all islands from spec list. Each island bobs gently in place.
// Returns array of meshes (so the animation loop can update them).
//
// ASSET SLOT: Each spec may have a `model: '/path/to/file.glb'` field.
// If present, the GLTF is loaded and its scene is added in place of the
// procedural geometry. Position, rotation, and the bob animation still
// apply. (GLTFLoader is bundled with three.js examples.)

export function buildIslands(scene, specs) {
  const islands = [];
  specs.forEach(spec => {
    const island = makeIsland(spec);
    scene.add(island);
    islands.push(island);
  });
  return islands;
}

export function makeIsland(spec) {
  const group = new THREE.Group();
  const {
    position    = [0, 0, 0],
    radius      = 4,
    color       = '#d9b386',
    grassColor  = '#9bd55c',
    treeCount   = 3,
    rotation    = 0,
    crystals    = 0,
    flowerHue   = 0.1,
  } = spec;

  // ── Rock body — displaced icosahedron, tapered downward into a stalactite
  const geom = new THREE.IcosahedronGeometry(radius, 2);
  const pos = geom.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
    if (y < 0) {
      const t = -y / radius;
      const taper = 1 - t * 0.85;
      pos.setX(i, x * taper);
      pos.setZ(i, z * taper);
      pos.setY(i, y * 1.5 - t * radius * 0.4);
    }
    const n = 0.18;
    pos.setX(i, pos.getX(i) + (Math.random() - 0.5) * radius * n);
    pos.setY(i, pos.getY(i) + (Math.random() - 0.5) * radius * n * 0.5);
    pos.setZ(i, pos.getZ(i) + (Math.random() - 0.5) * radius * n);
  }
  geom.computeVertexNormals();
  const rockMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(color),
    roughness: 0.92,
    metalness: 0,
    flatShading: true,
  });
  group.add(new THREE.Mesh(geom, rockMat));

  // ── Grass cap — flattened hemisphere with slight surface noise
  const grassGeom = new THREE.SphereGeometry(radius * 0.94, 14, 6, 0, Math.PI * 2, 0, Math.PI * 0.42);
  const gpos = grassGeom.attributes.position;
  for (let i = 0; i < gpos.count; i++) {
    gpos.setX(i, gpos.getX(i) + (Math.random() - 0.5) * radius * 0.06);
    gpos.setZ(i, gpos.getZ(i) + (Math.random() - 0.5) * radius * 0.06);
  }
  grassGeom.computeVertexNormals();
  const grassMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(grassColor),
    roughness: 0.88,
    metalness: 0,
    flatShading: true,
    emissive: new THREE.Color(grassColor).multiplyScalar(0.06),
  });
  const grass = new THREE.Mesh(grassGeom, grassMat);
  grass.position.y = radius * 0.18;
  group.add(grass);

  // ── Flower dots scattered on grass
  const flowerColors = [
    new THREE.Color().setHSL(flowerHue, 0.85, 0.7),
    new THREE.Color().setHSL((flowerHue + 0.12) % 1, 0.8, 0.78),
    new THREE.Color().setHSL((flowerHue + 0.55) % 1, 0.8, 0.78),
    new THREE.Color(0xffffff),
  ];
  const flowerCount = Math.max(6, Math.floor(radius * 3));
  for (let i = 0; i < flowerCount; i++) {
    const c = flowerColors[Math.floor(Math.random() * flowerColors.length)];
    const m = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.09 + Math.random() * 0.05, 0),
      new THREE.MeshStandardMaterial({
        color: c, roughness: 0.6, flatShading: true,
        emissive: c.clone().multiplyScalar(0.35),
      }),
    );
    const ang = Math.random() * Math.PI * 2;
    const r = radius * (0.15 + Math.random() * 0.7);
    m.position.set(r * Math.cos(ang), radius * 0.46 + Math.random() * 0.08, r * Math.sin(ang));
    m.rotation.set(Math.random(), Math.random() * Math.PI * 2, Math.random());
    group.add(m);
  }

  // ── Trees
  for (let i = 0; i < treeCount; i++) {
    const angle = (i / treeCount) * Math.PI * 2 + Math.random() * 0.8;
    const r = radius * (0.25 + Math.random() * 0.55);
    const tree = makeTree(0.28 + Math.random() * 0.4, 1.5 + Math.random() * 1.6);
    tree.position.set(r * Math.cos(angle), radius * 0.45, r * Math.sin(angle));
    tree.rotation.y = Math.random() * Math.PI * 2;
    group.add(tree);
  }

  // ── Small detail rocks
  for (let i = 0; i < 2; i++) {
    const rock = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.18 + Math.random() * 0.2, 0),
      new THREE.MeshStandardMaterial({ color: 0x9d7a52, roughness: 1, flatShading: true })
    );
    const ang = Math.random() * Math.PI * 2;
    const r = radius * (0.4 + Math.random() * 0.4);
    rock.position.set(r * Math.cos(ang), radius * 0.42, r * Math.sin(ang));
    rock.rotation.set(Math.random() * 0.8, Math.random() * Math.PI * 2, Math.random() * 0.8);
    group.add(rock);
  }

  // ── Floating glowing crystals around the island
  const crystalGroup = new THREE.Group();
  for (let i = 0; i < crystals; i++) {
    const c = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.18 + Math.random() * 0.12, 0),
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(ATMOSPHERE.crystal.color),
        emissive: new THREE.Color(ATMOSPHERE.crystal.emissive),
        emissiveIntensity: 0.9,
        roughness: 0.25,
        metalness: 0.1,
        flatShading: true,
      })
    );
    const ang = (i / Math.max(1, crystals)) * Math.PI * 2 + Math.random() * 0.4;
    const r = radius * (1.15 + Math.random() * 0.4);
    const h = radius * (0.25 + Math.random() * 0.6);
    c.userData = {
      base: new THREE.Vector3(r * Math.cos(ang), h, r * Math.sin(ang)),
      phase: Math.random() * Math.PI * 2,
      spin: 0.6 + Math.random() * 0.6,
    };
    c.position.copy(c.userData.base);
    crystalGroup.add(c);
  }
  group.add(crystalGroup);

  group.position.set(position[0], position[1], position[2]);
  group.rotation.y = rotation;
  group.userData.bobPhase = Math.random() * Math.PI * 2;
  group.userData.baseY = position[1];
  group.userData.crystals = crystalGroup;
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

  const foliageHues = [0x6ec040, 0x88d258, 0x5ab230, 0xa4d96a];
  const foliageColor = foliageHues[Math.floor(Math.random() * foliageHues.length)];
  const foliage = new THREE.Mesh(
    new THREE.ConeGeometry(radius, height * 0.75, 8),
    new THREE.MeshStandardMaterial({ color: foliageColor, roughness: 0.85, flatShading: true })
  );
  foliage.position.y = height * 0.62;
  g.add(foliage);

  // Stacked layer for fuller silhouette
  const f2 = new THREE.Mesh(
    new THREE.ConeGeometry(radius * 0.74, height * 0.46, 8),
    new THREE.MeshStandardMaterial({ color: foliageColor, roughness: 0.85, flatShading: true })
  );
  f2.position.y = height * 0.96;
  g.add(f2);

  // 30% chance of a third tip for variety
  if (Math.random() < 0.3) {
    const f3 = new THREE.Mesh(
      new THREE.ConeGeometry(radius * 0.5, height * 0.32, 8),
      new THREE.MeshStandardMaterial({ color: foliageColor, roughness: 0.85, flatShading: true })
    );
    f3.position.y = height * 1.22;
    g.add(f3);
  }
  return g;
}
