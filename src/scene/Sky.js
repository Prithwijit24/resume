import * as THREE from 'three';
import { SKY } from '../world.config.js';

// Build the sky. Returns { mesh, setPalette({top, mid, bottom}) }.
// World.js calls setPalette every frame with the blended biome colors
// so the dome smoothly tints between worlds.
export function buildSky(scene) {
  const geo = new THREE.SphereGeometry(320, 32, 24);
  const uniforms = {
    topColor:    { value: new THREE.Color(SKY.topColor) },
    midColor:    { value: new THREE.Color(SKY.midColor) },
    bottomColor: { value: new THREE.Color(SKY.bottomColor) },
    offset:      { value: SKY.offset },
    exponent:    { value: SKY.exponent },
  };
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    uniforms,
    vertexShader: /* glsl */ `
      varying vec3 vWorldPosition;
      void main() {
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vWorldPosition = wp.xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 topColor;
      uniform vec3 midColor;
      uniform vec3 bottomColor;
      uniform float offset;
      uniform float exponent;
      varying vec3 vWorldPosition;
      void main() {
        float h = normalize(vWorldPosition).y;
        float hh = max(h + offset, 0.0);
        float upper = pow(hh, exponent);
        vec3 c;
        if (h < 0.0) {
          c = mix(bottomColor, midColor, smoothstep(-0.4, 0.0, h));
        } else {
          c = mix(midColor, topColor, smoothstep(0.0, 0.8, upper));
        }
        gl_FragColor = vec4(c, 1.0);
      }
    `,
  });

  const mesh = new THREE.Mesh(geo, mat);
  scene.add(mesh);

  function setPalette({ top, mid, bottom }) {
    if (top)    uniforms.topColor.value.copy(top);
    if (mid)    uniforms.midColor.value.copy(mid);
    if (bottom) uniforms.bottomColor.value.copy(bottom);
  }

  return { mesh, setPalette };
}
