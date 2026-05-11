// ════════════════════════════════════════════════════════════════════
//  WORLD CONFIG  ·  every visual knob for the 3D scene
//  ────────────────────────────────────────────────────────────────────
//  Edit values here, save, and Vite hot-reloads instantly.
//  Each section has an ASSET SLOT comment showing how to swap procedural
//  geometry for real GLTF / HDRI assets when you have them.
// ════════════════════════════════════════════════════════════════════

// ─── SKY ────────────────────────────────────────────────────────────
// Three-stop vertical gradient on a shader sphere.
// ASSET SLOT: to use a real HDRI, drop your .hdr file in /public and
//   set `hdr: '/your-file.hdr'`. The Sky module will use RGBELoader
//   instead of the gradient shader. Leave `hdr: null` for the gradient.
export const SKY = {
  hdr:         null,
  topColor:    '#7a99b8',   // zenith — color directly overhead
  midColor:    '#e8b97a',   // horizon — warm peach sunset
  bottomColor: '#c89065',   // below horizon — warm ground haze
  offset:      0.05,
  exponent:    0.7,
};

// ─── FOG ────────────────────────────────────────────────────────────
// Linear depth fog. Match `color` to your horizon for seamless blending.
export const FOG = {
  color: '#d4a070',
  near:  30,    // distance where fog starts
  far:   220,   // distance where everything is full fog
};

// ─── LIGHTING ───────────────────────────────────────────────────────
// One directional "sun" + one hemisphere (sky bounce / ground reflect).
export const LIGHTING = {
  sun: {
    color:     '#ffd9a8',
    intensity: 1.4,
    position:  [40, 50, 30],
  },
  hemi: {
    skyColor:    '#9bbed8',   // upper-light color (sky bounce)
    groundColor: '#c89065',   // lower-light color (ground reflect)
    intensity:   0.55,
  },
};

// ─── ISLANDS ────────────────────────────────────────────────────────
// Each entry → one floating island. Add, remove, edit.
//   position    [x, y, z]
//   radius      overall size
//   color       rock body hex
//   grassColor  grass cap hex
//   treeCount   number of trees on top
//   rotation    Y rotation in radians
//
// ASSET SLOT: set `model: '/models/your-island.glb'` to load a GLTF
//   instead of procedural geometry. Position, rotation, and the bob
//   animation will still apply. See Island.js for the loader hook.
export const ISLANDS = [
  { position: [-2, -3, 0],    radius: 5.5, color: '#8b6a48', grassColor: '#6b8e23', treeCount: 4, rotation: 0.2 },
  { position: [14, 1, -12],   radius: 3.5, color: '#9c7a55', grassColor: '#7ea03c', treeCount: 3, rotation: -0.5 },
  { position: [-18, 5, -22],  radius: 4.5, color: '#7e5e40', grassColor: '#66832c', treeCount: 4, rotation: 0.8 },
  { position: [8, 8, -35],    radius: 3.8, color: '#95704e', grassColor: '#6b8e23', treeCount: 3, rotation: 1.2 },
  { position: [-12, 11, -48], radius: 3.0, color: '#8b6a48', grassColor: '#7ea03c', treeCount: 2, rotation: -0.3 },
  { position: [6, 14, -62],   radius: 4.5, color: '#a07e58', grassColor: '#6b8e23', treeCount: 4, rotation: 0.5 },
  { position: [-22, 18, -78], radius: 2.6, color: '#8b6a48', grassColor: '#7ea03c', treeCount: 2, rotation: 0 },
  { position: [0, 20, -95],   radius: 5.0, color: '#957050', grassColor: '#66832c', treeCount: 5, rotation: 0.9 },
  { position: [20, 22, -110], radius: 2.0, color: '#8b6a48', grassColor: '#6b8e23', treeCount: 2, rotation: 0 },
  { position: [-15, 24, -125],radius: 1.5, color: '#9c7a55', grassColor: '#7ea03c', treeCount: 1, rotation: 0 },
];

// ─── CAMERA PATH ────────────────────────────────────────────────────
// One keyframe per content section (must match SECTIONS in content.js).
// The camera interpolates linearly with smoothstep easing as you scroll.
//   pos   [x, y, z] camera position
//   look  [x, y, z] point camera is aimed at
export const CAMERA_PATH = [
  { pos: [0, 4, 22],    look: [0, 4, 0] },     // 0: Hero
  { pos: [10, 5, 8],    look: [-2, 4, -10] },  // 1: Experience
  { pos: [-6, 7, -8],   look: [-12, 6, -28] }, // 2: Projects
  { pos: [-2, 10, -22], look: [6, 9, -42] },   // 3: Skills
  { pos: [6, 14, -42],  look: [-8, 13, -62] }, // 4: Education
  { pos: [-8, 18, -68], look: [2, 18, -95] },  // 5: Contact
];

// ─── ATMOSPHERE ─────────────────────────────────────────────────────
export const ATMOSPHERE = {
  clouds: {
    count:    400,
    altitude: -6,    // base Y position
    height:   4,     // vertical spread above base
    spread:   200,   // horizontal spread on X
    depthMin: 10,    // nearest Z
    depthMax: -140,  // farthest Z
    color:    '#fafafa',
    sizeMin:  4,
    sizeMax:  12,
    opacity:  0.45,
  },
  motes: {
    count:     220,
    color:     '#fff0d8',
    size:      0.18,
    opacity:   0.6,
    fallSpeed: 0.005,
    spread:    80,
    heightMin: -8,
    heightMax: 25,
    depthMin:  10,
    depthMax:  -130,
  },
  birds: {
    count:       5,
    color:       '#2a1f15',
    altitudeMin: 12,
    altitudeMax: 20,
    speedMin:    0.02,
    speedMax:    0.04,
  },
};

// ─── CAMERA ─────────────────────────────────────────────────────────
export const CAMERA = {
  fov:        50,
  near:       0.1,
  far:        600,
  parallaxXY: [0.8, -0.5],   // mouse parallax multipliers (x, y)
  parallaxSmoothing: 0.04,   // 0..1, lower = smoother
};

// ─── SCROLL ─────────────────────────────────────────────────────────
export const SCROLL = {
  cameraSmoothing: 0.08,   // 0..1, lower = smoother but more lag
};
