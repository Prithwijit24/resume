import * as THREE from 'three';
import { ATMOSPHERE } from '../world.config.js';

export function buildClouds(scene) {
  const cfg = ATMOSPHERE.clouds;
  const N = cfg.count;
  const pos = new Float32Array(N * 3);
  const col = new Float32Array(N * 3);
  const sz  = new Float32Array(N);

  const base = new THREE.Color(cfg.color);
  for (let i = 0; i < N; i++) {
    pos[i * 3]     = (Math.random() - 0.5) * cfg.spread;
    pos[i * 3 + 1] = cfg.altitude + Math.random() * cfg.height;
    pos[i * 3 + 2] = cfg.depthMin + Math.random() * (cfg.depthMax - cfg.depthMin);
    const dim = 0.88 + Math.random() * 0.12;
    col[i * 3]     = base.r * dim;
    col[i * 3 + 1] = base.g * dim * 0.97;
    col[i * 3 + 2] = base.b * dim * 0.92;
    sz[i] = cfg.sizeMin + Math.random() * (cfg.sizeMax - cfg.sizeMin);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  geo.setAttribute('size', new THREE.BufferAttribute(sz, 1));

  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    vertexColors: true,
    uniforms: {
      uPx:      { value: Math.min(devicePixelRatio, 1.75) },
      uOpacity: { value: cfg.opacity },
    },
    vertexShader: /* glsl */ `
      attribute float size;
      varying vec3 vColor;
      uniform float uPx;
      void main() {
        vColor = color;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = size * 40.0 * uPx / (-mv.z);
      }
    `,
    fragmentShader: /* glsl */ `
      varying vec3 vColor;
      uniform float uOpacity;
      void main() {
        vec2 c = gl_PointCoord - vec2(0.5);
        float d = length(c);
        float a = smoothstep(0.5, 0.18, d) * uOpacity;
        gl_FragColor = vec4(vColor, a);
      }
    `,
  });

  const mesh = new THREE.Points(geo, mat);
  scene.add(mesh);
  return mesh;
}
