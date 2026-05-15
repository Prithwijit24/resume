import * as THREE from 'three';
import { FOG, LIGHTING, CAMERA, SCROLL } from './world.config.js';
import { buildSky }       from './scene/Sky.js';
import { buildSun }       from './scene/Sun.js';
import { buildBiomes }    from './scene/Biomes.js';
import { buildCharacter } from './scene/Character.js';
import { CameraTrack }    from './scene/CameraTrack.js';

export class World {
  constructor(canvas) {
    this.canvas = canvas;
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(new THREE.Color('#f0dcbc'), FOG.near, FOG.far);

    this.camera = new THREE.PerspectiveCamera(CAMERA.fov, 1, CAMERA.near, CAMERA.far);
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;

    this._buildLighting();
    this.sky       = buildSky(this.scene);
    this.sun       = buildSun(this.scene);
    this.biomes    = buildBiomes(this.scene);
    this.character = buildCharacter(this.scene);

    this.cameraTrack = new CameraTrack();
    this.clock = new THREE.Clock();
    this.scrollProgress = 0;
    this.smoothProgress = 0;
    this.mouseTarget = { x: 0, y: 0 };
    this.mouse = { x: 0, y: 0 };

    this._bindEvents();
    this.resize();
  }

  _buildLighting() {
    const sun = new THREE.DirectionalLight(new THREE.Color(LIGHTING.sun.color), LIGHTING.sun.intensity);
    sun.position.set(...LIGHTING.sun.position);
    this.scene.add(sun);

    this.scene.add(new THREE.HemisphereLight(
      new THREE.Color(LIGHTING.hemi.skyColor),
      new THREE.Color(LIGHTING.hemi.groundColor),
      LIGHTING.hemi.intensity,
    ));

    if (LIGHTING.ambient) {
      this.scene.add(new THREE.AmbientLight(
        new THREE.Color(LIGHTING.ambient.color),
        LIGHTING.ambient.intensity,
      ));
    }
  }

  _bindEvents() {
    addEventListener('resize', () => this.resize());

    this.canvas.addEventListener('mousemove', e => {
      const r = this.canvas.getBoundingClientRect();
      this.mouseTarget.x = (e.clientX - r.left) / r.width - 0.5;
      this.mouseTarget.y = (e.clientY - r.top)  / r.height - 0.5;
    });
  }

  resize() {
    const w = innerWidth, h = innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h, false);
  }

  setScrollProgress(p) {
    this.scrollProgress = Math.max(0, Math.min(1, p));
  }

  tick() {
    const time = this.clock.getElapsedTime();

    // Smooth scroll progress for buttery camera motion
    this.smoothProgress += (this.scrollProgress - this.smoothProgress) * SCROLL.cameraSmoothing;
    this.cameraTrack.apply(this.camera, this.smoothProgress);

    // Mouse parallax — offset camera after track placement
    this.mouse.x += (this.mouseTarget.x - this.mouse.x) * CAMERA.parallaxSmoothing;
    this.mouse.y += (this.mouseTarget.y - this.mouse.y) * CAMERA.parallaxSmoothing;
    this.camera.position.x += this.mouse.x * CAMERA.parallaxXY[0];
    this.camera.position.y += this.mouse.y * CAMERA.parallaxXY[1];

    // Update biomes + receive blended palette for current scroll
    const palette = this.biomes.update(time, this.smoothProgress);

    // Apply blended palette to sky, sun, fog, character aura
    this.sky.setPalette({
      top:    palette.skyTop,
      mid:    palette.skyMid,
      bottom: palette.skyBot,
    });
    this.sun.update({
      sunColor:   palette.sun,
      sunHalo:    palette.halo,
      sunOpacity: palette.sunOpacity,
      sunPos:     palette.sunPos,
    });
    this.scene.fog.color.copy(palette.fog);
    this.character.setAuraColor(palette.aura);

    // Update character (uses the post-parallax camera position)
    this.character.update(time, this.camera, this.smoothProgress);

    this.renderer.render(this.scene, this.camera);
  }
}
