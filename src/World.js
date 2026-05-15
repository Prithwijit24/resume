import * as THREE from 'three';
import { FOG, LIGHTING, CAMERA, SCROLL } from './world.config.js';
import { buildSky }                from './scene/Sky.js';
import { buildSun }                from './scene/Sun.js';
import { buildBiomes }             from './scene/Biomes.js';
import { buildCharacterController } from './scene/CharacterController.js';
import { ChaseCamera }             from './scene/ChaseCamera.js';
import { Path }                    from './scene/Path.js';

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
    this.character = buildCharacterController(this.scene);

    this.path        = new Path();
    this.chaseCamera = new ChaseCamera();

    this.clock = new THREE.Clock();
    this.scrollProgress = 0;
    this.smoothProgress = 0;

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

    // Smooth scroll progress for buttery motion through the corridor
    this.smoothProgress += (this.scrollProgress - this.smoothProgress) * SCROLL.cameraSmoothing;

    // Drive the runner — animation by time, position by progress
    const runnerInfo = this.character.update(time, this.smoothProgress, this.path);

    // Chase camera follows the runner with smooth lag + footstep shake
    this.chaseCamera.apply(this.camera, runnerInfo.position, runnerInfo.footstepIntensity);

    // Keep the sky dome wrapped around the camera as the corridor extends
    // far past its sphere radius.
    this.sky.mesh.position.copy(this.camera.position);

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

    this.renderer.render(this.scene, this.camera);
  }
}
