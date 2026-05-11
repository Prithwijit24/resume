import * as THREE from 'three';
import { SKY, FOG, LIGHTING, ISLANDS, CAMERA, SCROLL } from './world.config.js';
import { buildSky }     from './scene/Sky.js';
import { buildIslands } from './scene/Island.js';
import { buildClouds }  from './scene/Clouds.js';
import { buildMotes }   from './scene/Motes.js';
import { buildBirds }   from './scene/Birds.js';
import { CameraPath }   from './scene/CameraPath.js';

export class World {
  constructor(canvas) {
    this.canvas = canvas;
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(new THREE.Color(FOG.color), FOG.near, FOG.far);

    this.camera = new THREE.PerspectiveCamera(CAMERA.fov, 1, CAMERA.near, CAMERA.far);
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this._buildLighting();
    buildSky(this.scene);
    this.islands = buildIslands(this.scene, ISLANDS);
    buildClouds(this.scene);
    this.motes = buildMotes(this.scene);
    this.birds = buildBirds(this.scene);

    this.cameraPath = new CameraPath();
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
    this.cameraPath.apply(this.camera, this.smoothProgress);

    // Mouse parallax — offset camera *after* path placement
    this.mouse.x += (this.mouseTarget.x - this.mouse.x) * CAMERA.parallaxSmoothing;
    this.mouse.y += (this.mouseTarget.y - this.mouse.y) * CAMERA.parallaxSmoothing;
    this.camera.position.x += this.mouse.x * CAMERA.parallaxXY[0];
    this.camera.position.y += this.mouse.y * CAMERA.parallaxXY[1];

    // Gentle island bob
    this.islands.forEach((isl, i) => {
      isl.position.y = isl.userData.baseY + Math.sin(time * 0.4 + isl.userData.bobPhase) * 0.12;
      isl.rotation.y += 0.0008 + i * 0.00003;
    });

    this.motes.update();
    this.birds.update(time);

    this.renderer.render(this.scene, this.camera);
  }
}
