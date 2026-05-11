import * as THREE from 'three';

// Build all islands from spec list. Each island bobs gently in place.
// Returns array of meshes (so the animation loop can update them).
//
// ASSET SLOT: Each spec may have a `model: '/path/to/file.glb'` field.
// If present, the GLTF is loaded and its scene is added in place of the
// procedural geometry. Position, rotation, and the bob animation still
// apply. (GLTFLoader is bundled with three.js examples.)
//
//   import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
//   const loader = new GLTFLoader();
//   if (spec.model) loader.load(spec.model, g => group.add(g.scene));
//
// Uncomment the loader import + call in `makeIsland` below to enable.

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
    position = [0, 0, 0],
    radius   = 4,
    color    = '#8b6a48',
    grassColor = '#6b8e23',
    treeCount  = 3,
    rotation   = 0,
    // model,  // ASSET SLOT — uncomment GLTFLoader block above to enable
  } = spec;

  // Rock body — displaced icosahedron, tapered downward into a stalactite
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
    roughness: 0.96,
    metalness: 0,
    flatShading: true,
  });
  group.add(new THREE.Mesh(geom, rockMat));

  // Grass cap — flattened hemisphere with slight surface noise
  const grassGeom = new THREE.SphereGeometry(radius * 0.92, 12, 5, 0, Math.PI * 2, 0, Math.PI * 0.4);
  const gpos = grassGeom.attributes.position;
  for (let i = 0; i < gpos.count; i++) {
    gpos.setX(i, gpos.getX(i) + (Math.random() - 0.5) * radius * 0.06);
    gpos.setZ(i, gpos.getZ(i) + (Math.random() - 0.5) * radius * 0.06);
  }
  grassGeom.computeVertexNormals();
  const grassMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(grassColor),
    roughness: 0.92,
    metalness: 0,
    flatShading: true,
  });
  const grass = new THREE.Mesh(grassGeom, grassMat);
  grass.position.y = radius * 0.18;
  group.add(grass);

  // Trees
  for (let i = 0; i < treeCount; i++) {
    const angle = (i / treeCount) * Math.PI * 2 + Math.random() * 0.8;
    const r = radius * (0.25 + Math.random() * 0.55);
    const tree = makeTree(0.25 + Math.random() * 0.35, 1.4 + Math.random() * 1.6);
    tree.position.set(r * Math.cos(angle), radius * 0.45, r * Math.sin(angle));
    tree.rotation.y = Math.random() * Math.PI * 2;
    group.add(tree);
  }

  // Small rocks for detail
  for (let i = 0; i < 2; i++) {
    const rock = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.18 + Math.random() * 0.2, 0),
      new THREE.MeshStandardMaterial({ color: 0x4d3a2a, roughness: 1, flatShading: true })
    );
    const ang = Math.random() * Math.PI * 2;
    const r = radius * (0.4 + Math.random() * 0.4);
    rock.position.set(r * Math.cos(ang), radius * 0.42, r * Math.sin(ang));
    rock.rotation.set(Math.random() * 0.8, Math.random() * Math.PI * 2, Math.random() * 0.8);
    group.add(rock);
  }

  group.position.set(position[0], position[1], position[2]);
  group.rotation.y = rotation;
  group.userData.bobPhase = Math.random() * Math.PI * 2;
  group.userData.baseY = position[1];
  return group;
}

function makeTree(radius, height) {
  const g = new THREE.Group();
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.08, height * 0.32, 6),
    new THREE.MeshStandardMaterial({ color: 0x3e2a1a, roughness: 1, flatShading: true })
  );
  trunk.position.y = height * 0.16;
  g.add(trunk);

  const foliage = new THREE.Mesh(
    new THREE.ConeGeometry(radius, height * 0.7, 7),
    new THREE.MeshStandardMaterial({ color: 0x4d6e2e, roughness: 0.92, flatShading: true })
  );
  foliage.position.y = height * 0.6;
  g.add(foliage);

  if (Math.random() < 0.5) {
    const f2 = new THREE.Mesh(
      new THREE.ConeGeometry(radius * 0.72, height * 0.42, 7),
      new THREE.MeshStandardMaterial({ color: 0x5e7e38, roughness: 0.92, flatShading: true })
    );
    f2.position.y = height * 0.92;
    g.add(f2);
  }
  return g;
}
