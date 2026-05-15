// ════════════════════════════════════════════════════════════════════
//  WORLD CONFIG  ·  every visual knob for the 3D scene
//  ────────────────────────────────────────────────────────────────────
//  The world is a corridor of six biomes the camera flies through.
//  Each biome owns geometry, particles, palette and an accent color
//  that the overlay UI picks up via data-biome attributes.
// ════════════════════════════════════════════════════════════════════

// ─── FOG ────────────────────────────────────────────────────────────
// Linear depth fog — only `near`/`far` are constants. Color is blended
// from the active biome palette each frame.
export const FOG = { near: 30, far: 220 };

// ─── LIGHTING ───────────────────────────────────────────────────────
// One directional "sun" + a wide hemisphere fill + low ambient.
// Colors here are neutral; the visible "sun" sprite tints to biome.
export const LIGHTING = {
  sun: {
    color:     '#ffffff',
    intensity: 1.6,
    position:  [60, 80, 30],
  },
  hemi: {
    skyColor:    '#ffffff',
    groundColor: '#a89070',
    intensity:   0.7,
  },
  ambient: {
    color:     '#ffe0b8',
    intensity: 0.32,
  },
};

// ─── BIOMES ─────────────────────────────────────────────────────────
// Six biomes ordered along the camera corridor. Each occupies a 70-unit
// slice of Z. `palette` drives sky/fog/sun + overlay accent color.
//   key         must match the `data-jump` keys in content.js
//   centerZ     world Z of the biome's heart
//   length      half-length on each side of centerZ
//   palette     sky/fog/sun + accent for that world
export const BIOMES = [
  {
    key:        'hero',
    centerZ:    -15,
    length:     35,
    palette: {
      skyTop:    '#9ed4ee',
      skyMid:    '#ffd6b0',
      skyBot:    '#fff0d8',
      fog:       '#f0dcbc',
      sunColor:  '#ffeec4',
      sunHalo:   '#ffc890',
      sunOpacity:1.0,
      sunPos:    [80, 70, -120],
      accent:    '#e85d3c',
      accent2:   '#f0a23a',
      auraColor: '#ffe9b0',
      theme:     'light',
    },
  },
  {
    key:        'exp',
    centerZ:    -85,
    length:     35,
    palette: {
      skyTop:    '#0a0a25',
      skyMid:    '#2a1568',
      skyBot:    '#6b1f8a',
      fog:       '#1a0d3e',
      sunColor:  '#ff3ca0',
      sunHalo:   '#6048d0',
      sunOpacity:0.85,
      sunPos:    [-60, 80, -180],
      accent:    '#22e0ff',
      accent2:   '#ff3ca0',
      auraColor: '#5af0ff',
      theme:     'dark',
    },
  },
  {
    key:        'proj',
    centerZ:    -155,
    length:     35,
    palette: {
      skyTop:    '#0d1828',
      skyMid:    '#1a3a44',
      skyBot:    '#1f5a48',
      fog:       '#0e2a24',
      sunColor:  '#8effc0',
      sunHalo:   '#6cffd6',
      sunOpacity:0.5,
      sunPos:    [60, 100, -240],
      accent:    '#7effa6',
      accent2:   '#ff7ec8',
      auraColor: '#a0ffce',
      theme:     'dark',
    },
  },
  {
    key:        'skill',
    centerZ:    -225,
    length:     35,
    palette: {
      skyTop:    '#3a1850',
      skyMid:    '#c44a78',
      skyBot:    '#ffa860',
      fog:       '#7a3060',
      sunColor:  '#ffd180',
      sunHalo:   '#ff8a70',
      sunOpacity:1.0,
      sunPos:    [-40, 60, -310],
      accent:    '#ffb84c',
      accent2:   '#ff6f8a',
      auraColor: '#ffd9a0',
      theme:     'light',
    },
  },
  {
    key:        'edu',
    centerZ:    -295,
    length:     35,
    palette: {
      skyTop:    '#1a2848',
      skyMid:    '#2a4878',
      skyBot:    '#d4a458',
      fog:       '#243854',
      sunColor:  '#ffd86c',
      sunHalo:   '#c89058',
      sunOpacity:0.9,
      sunPos:    [40, 55, -380],
      accent:    '#ffd86c',
      accent2:   '#6db4d4',
      auraColor: '#ffe6a0',
      theme:     'dark',
    },
  },
  {
    key:        'contact',
    centerZ:    -365,
    length:     35,
    palette: {
      skyTop:    '#020615',
      skyMid:    '#0d1830',
      skyBot:    '#1a2a4a',
      fog:       '#0a1428',
      sunColor:  '#6effc0',
      sunHalo:   '#a060ff',
      sunOpacity:0.45,
      sunPos:    [60, 90, -440],
      accent:    '#6effc0',
      accent2:   '#a880ff',
      auraColor: '#a4ffe0',
      theme:     'dark',
    },
  },
];

// ─── SKY DEFAULTS ───────────────────────────────────────────────────
// Initial uniforms — these get overwritten by the biome blend every frame.
export const SKY = {
  topColor:    BIOMES[0].palette.skyTop,
  midColor:    BIOMES[0].palette.skyMid,
  bottomColor: BIOMES[0].palette.skyBot,
  offset:      0.08,
  exponent:    0.65,
};

// ─── CAMERA CORRIDOR ────────────────────────────────────────────────
// Camera flies a continuous forward path. Six anchors map to the six
// biomes — position and height are smooth-stepped between anchors.
// Lateral X is a gentle sine swing so the path feels alive.
export const CAMERA_TRACK = {
  // Per-anchor camera height + lateral offset
  anchors: [
    { y: 7.0, x:  0   },   // sky islands — high in clouds
    { y: 5.2, x:  3.5 },   // neon city — banking right
    { y: 5.6, x: -3.5 },   // forest — banking left
    { y: 7.2, x:  3.0 },   // crystal canyon — rising
    { y: 4.6, x: -2.5 },   // temple — low over water
    { y: 5.6, x:  2.0 },   // aurora — gliding over snow
  ],
  zStart:    10,
  zEnd:     -340,
  // The lookAt point is this many world units ahead in path-space.
  lookAhead: 0.045,
  // Lateral micro-wave (Temple-Run feel) layered over the anchors.
  laneSwayAmp:    1.1,
  laneSwayCycles: 5.5,
};

// ─── CHARACTER ──────────────────────────────────────────────────────
// The traveler that glides ahead of the camera through every biome.
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
  scrollNudge:    1.4,
};

// ─── CAMERA ─────────────────────────────────────────────────────────
export const CAMERA = {
  fov:        52,
  near:       0.1,
  far:        700,
  parallaxXY: [0.6, -0.4],
  parallaxSmoothing: 0.04,
};

// ─── SCROLL ─────────────────────────────────────────────────────────
export const SCROLL = {
  cameraSmoothing: 0.07,
};
