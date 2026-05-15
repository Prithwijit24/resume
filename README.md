# Prithwijit Ghosh — Portfolio

A cinematic 3D portfolio. Floating islands, atmospheric haze, golden-hour sky. The camera flies through the world as you scroll. Glass-card overlays hold the content.

Vite + Three.js. Vanilla JS, no framework. Deployable anywhere static.

---

## Run it

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`. Edits hot-reload.

```bash
npm run build     # → dist/
npm run preview   # serve the build
```

---

## Two files. That's the whole game.

### 1. `src/world.config.js` — every visual knob

Open this and you can retheme the entire 3D world without touching scene code:

- **`SKY`** — three hex colors (zenith, horizon, below-horizon) for the gradient sky. Want cold dawn? `#5a7090 / #b8a8c8 / #a090a8`. Noon? `#4a7eb8 / #9ec8e8 / #c8d8e0`. Optionally set `hdr` to a real HDRI path under `/public`.
- **`FOG`** — color + near/far distance. Match the color to your horizon for seamless blend.
- **`LIGHTING`** — sun direction + warm tint, plus hemisphere sky/ground bounce colors.
- **`ISLANDS`** — an array. Each entry is one island: `position`, `radius`, `color` (rock), `grassColor`, `treeCount`, `rotation`. Add, remove, edit freely.
- **`CAMERA_PATH`** — keyframes for camera position + lookAt. One per content section. Tweak to change the flight path.
- **`ATMOSPHERE`** — clouds (count, altitude, spread), motes (drift particles), birds.

Save the file — Vite hot-reloads. Refresh and you see the change.

### 2. `src/content.js` — all the words

Every visible piece of copy lives here:

- `PROFILE` — name, email, GitHub URL, LinkedIn URL, resume URL.
- `SECTIONS` — eyebrow, headline (use `<em>...</em>` for the accent color), lede for each section.
- `EXPERIENCE` — Accenture projects.
- `PROJECTS` — self-projects.
- `SKILLS` — categories and items.
- `EDUCATION` — institutions with badges.
- `NAV_LINKS` — top-nav order.

Edit, save, Vite hot-reloads.

---

## Replace the resume PDF

Drop your file at `public/resume.pdf` (overwriting the stub). The button picks it up automatically. Vite copies anything in `/public` to the root of the build.

---

## ASSET SLOTS (the Path C unlock)

The procedural geometry can be swapped for real assets when you have them. Each slot is marked in code with an `ASSET SLOT` comment.

### Sky → HDRI

Get an HDRI (Poly Haven has free ones — try `kloofendal_38d_partly_cloudy_puresky_4k.hdr`). Drop it in `/public/sky.hdr`. Then in `world.config.js`:

```js
export const SKY = {
  hdr: '/sky.hdr',
  // ...
};
```

Open `src/scene/Sky.js` and uncomment the `RGBELoader` block. Two lines change.

### Islands → GLTF models

If you have GLTF island models (Sketchfab, Quaixel, hand-modeled in Blender):

1. Drop the `.glb` files in `/public/models/`.
2. In `world.config.js`, add `model:` to each island spec you want to replace:
   ```js
   { position: [-2, -3, 0], radius: 5.5, model: '/models/cliff.glb', treeCount: 0, rotation: 0.2 },
   ```
3. In `src/scene/Island.js`, uncomment the `GLTFLoader` block at the top.

The bob animation and placement still work — only the visual mesh swaps.

### Camera path → smoother spline

Currently keyframes are interpolated linearly with smoothstep easing. To use a Catmull-Rom curve through the keyframes, edit `src/scene/CameraPath.js` to build a `THREE.CatmullRomCurve3` from the positions and sample it.

---

## File map

```
prithwijit-portfolio/
├── index.html
├── package.json
├── vite.config.js
├── public/
│   └── resume.pdf              ← replace with your PDF
└── src/
    ├── main.js                 ← entry point (rarely touched)
    ├── style.css               ← design system
    ├── world.config.js         ← EDIT for visuals
    ├── content.js              ← EDIT for copy
    ├── World.js                ← Three.js orchestration
    ├── scene/
    │   ├── Sky.js              ← gradient or HDRI
    │   ├── Island.js           ← procedural or GLTF
    │   ├── Clouds.js
    │   ├── Motes.js
    │   ├── Birds.js
    │   └── CameraPath.js
    └── ui/
        ├── editorial.js        ← renders sections from content.js
        ├── nav.js              ← sticky nav, scroll tracking
        ├── cards.js            ← project card open/close
        └── loader.js
```

---

## Deploy

**Vercel:**
```bash
npm i -g vercel && vercel
```
Auto-detects Vite.

**Netlify:**
- Build: `npm run build`
- Publish: `dist`

**GitHub Pages:** `vite.config.js` uses `base: './'` so relative paths work from any subdirectory. After build, push `dist/` to the `gh-pages` branch.

---

## Performance notes

- Single Three.js scene, ~12 island groups, ~620 atmospheric particles, 5 birds. Locked 60fps on modern hardware.
- No raycasting per frame (no interactive 3D objects — interactions are HTML clicks over the canvas).
- `devicePixelRatio` capped at 1.75 for retina sanity.
- Mouse parallax smoothing is configurable in `world.config.js → CAMERA.parallaxSmoothing`.

---

If something looks off, the most likely culprit is a typo in a hex color in `world.config.js` — they all need the `#` prefix and quotes.
