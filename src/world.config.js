// ════════════════════════════════════════════════════════════════════
//  WORLD CONFIG  ·  every visual knob for the 3D scene
//  ────────────────────────────────────────────────────────────────────
//  Edit values here, save, and Vite hot-reloads instantly.
//  Each section has an ASSET SLOT comment showing how to swap procedural
//  geometry for real GLTF / HDRI assets when you have them.
// ════════════════════════════════════════════════════════════════════

// ─── SKY ────────────────────────────────────────────────────────────
// Three-stop vertical gradient on a shader sphere.
// Bright "above the clouds at dawn" palette.
export const SKY = {
  hdr:         null,
  topColor:    '#9ed4ee',   // zenith — pastel sky blue
  midColor:    '#ffd6b0',   // horizon — soft peach
  bottomColor: '#fff0d8',   // below horizon — cream haze
  offset:      0.08,
  exponent:    0.65,
};

// ─── FOG ────────────────────────────────────────────────────────────
// Linear depth fog. Match `color` to your horizon for seamless blending.
export const FOG = {
  color: '#f0dcbc',
  near:  40,
  far:   260,
};

// ─── LIGHTING ───────────────────────────────────────────────────────
// One directional "sun" + one hemisphere (sky bounce / ground reflect).
export const LIGHTING = {
  sun: {
    color:     '#fff4dc',
    intensity: 2.1,
    position:  [60, 70, 40],
  },
  hemi: {
    skyColor:    '#bfe5f7',
    groundColor: '#f3d8a8',
    intensity:   0.95,
  },
  ambient: {
    color:     '#fff4e0',
    intensity: 0.35,
  },
};

// ─── ISLANDS ────────────────────────────────────────────────────────
// Each entry → one floating island.
//   position    [x, y, z]
//   radius      overall size
//   color       rock body hex
//   grassColor  grass cap hex
//   treeCount   number of trees on top
//   rotation    Y rotation in radians
//   crystals    optional, # of floating orbs around the island
//   flowerHue   optional, base hue for flower dots (HSL hue 0..1)
export const ISLANDS = [
  { position: [-2, -3, 0],    radius: 5.5, color: '#d9b386', grassColor: '#9bd55c', treeCount: 4, rotation: 0.2,  crystals: 3, flowerHue: 0.95 },
  { position: [14, 1, -12],   radius: 3.5, color: '#e6c094', grassColor: '#a5dc6a', treeCount: 3, rotation: -0.5, crystals: 2, flowerHue: 0.15 },
  { position: [-18, 5, -22],  radius: 4.5, color: '#cfa67a', grassColor: '#94cc52', treeCount: 4, rotation: 0.8,  crystals: 3, flowerHue: 0.55 },
  { position: [8, 8, -35],    radius: 3.8, color: '#dcb085', grassColor: '#a8d860', treeCount: 3, rotation: 1.2,  crystals: 2, flowerHue: 0.85 },
  { position: [-12, 11, -48], radius: 3.0, color: '#d4a878', grassColor: '#9dd35a', treeCount: 2, rotation: -0.3, crystals: 2, flowerHue: 0.05 },
  { position: [6, 14, -62],   radius: 4.5, color: '#e2bb8e', grassColor: '#aadc66', treeCount: 4, rotation: 0.5,  crystals: 3, flowerHue: 0.7  },
  { position: [-22, 18, -78], radius: 2.6, color: '#cfa67a', grassColor: '#9bd55c', treeCount: 2, rotation: 0,    crystals: 1, flowerHue: 0.45 },
  { position: [0, 20, -95],   radius: 5.0, color: '#dcb085', grassColor: '#a5dc6a', treeCount: 5, rotation: 0.9,  crystals: 4, flowerHue: 0.12 },
  { position: [20, 22, -110], radius: 2.0, color: '#d4a878', grassColor: '#9dd35a', treeCount: 2, rotation: 0,    crystals: 1, flowerHue: 0.6  },
  { position: [-15, 24, -125],radius: 1.8, color: '#e6c094', grassColor: '#aadc66', treeCount: 2, rotation: 0,    crystals: 1, flowerHue: 0.92 },
];

// ─── CAMERA PATH ────────────────────────────────────────────────────
// One keyframe per content section (must match SECTIONS in content.js).
// The camera interpolates linearly with smoothstep easing as you scroll.
//   pos   [x, y, z] camera position
//   look  [x, y, z] point camera is aimed at
export const CAMERA_PATH = [
  { pos: [0, 4, 22],    look: [0, 4, 0] },
  { pos: [10, 5, 8],    look: [-2, 4, -10] },
  { pos: [-6, 7, -8],   look: [-12, 6, -28] },
  { pos: [-2, 10, -22], look: [6, 9, -42] },
  { pos: [6, 14, -42],  look: [-8, 13, -62] },
  { pos: [-8, 18, -68], look: [2, 18, -95] },
];

// ─── CHARACTER ──────────────────────────────────────────────────────
// The traveler that glides through the world as you scroll.
//   leadDistance   distance ahead of the camera (world units)
//   sideOffset     horizontal offset, positive = to camera's right
//   verticalOffset vertical offset, negative = below the eye line
//   followLerp     0..1 — smoothing toward target each frame
//   bobAmp         vertical bob amplitude
//   bobFreq        vertical bob frequency
//   walkFreq       limb-swing frequency
//   walkAmp        limb-swing amplitude (radians)
//   trailLength    number of trail particles
export const CHARACTER = {
  leadDistance:   17,
  sideOffset:     2.2,
  verticalOffset: -3.4,
  followLerp:     0.06,
  bobAmp:         0.22,
  bobFreq:        1.7,
  walkFreq:       3.2,
  walkAmp:        0.75,
  trailLength:    72,
  scrollNudge:    1.2,
};

// ─── ATMOSPHERE ─────────────────────────────────────────────────────
export const ATMOSPHERE = {
  clouds: {
    count:    520,
    altitude: -6,
    height:   5,
    spread:   220,
    depthMin: 12,
    depthMax: -150,
    color:    '#ffffff',
    sizeMin:  5,
    sizeMax:  16,
    opacity:  0.55,
  },
  motes: {
    count:     320,
    color:     '#fff6da',
    size:      0.22,
    opacity:   0.85,
    fallSpeed: 0.004,
    spread:    90,
    heightMin: -8,
    heightMax: 28,
    depthMin:  12,
    depthMax:  -140,
  },
  petals: {
    count:     180,
    color:     '#ffb8c8',
    size:      0.28,
    opacity:   0.85,
    fallSpeed: 0.006,
    spread:    90,
    heightMin: -6,
    heightMax: 26,
    depthMin:  12,
    depthMax:  -140,
  },
  birds: {
    count:       8,
    color:       '#3a2a20',
    altitudeMin: 14,
    altitudeMax: 22,
    speedMin:    0.025,
    speedMax:    0.05,
  },
  sun: {
    color:    '#ffeec4',
    haloColor:'#ffcfa0',
    position: [140, 70, -260],
    size:     90,
    haloSize: 240,
  },
  cloudSea: {
    color:    '#ffffff',
    tintColor:'#ffe2c2',
    altitude: -16,
    size:     900,
    opacity:  0.45,
  },
  crystal: {
    color: '#ffe8b0',
    emissive: '#ffaa66',
  },
};

// ─── CAMERA ─────────────────────────────────────────────────────────
export const CAMERA = {
  fov:        50,
  near:       0.1,
  far:        650,
  parallaxXY: [0.8, -0.5],
  parallaxSmoothing: 0.04,
};

// ─── SCROLL ─────────────────────────────────────────────────────────
export const SCROLL = {
  cameraSmoothing: 0.08,
};
