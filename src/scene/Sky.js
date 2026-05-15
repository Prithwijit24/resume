import * as THREE from 'three';
import { SKY } from '../world.config.js';

// Build the sky. Returns the mesh — caller adds it to the scene.
//
// ASSET SLOT: To use a real HDRI, set SKY.hdr to a path under /public.
// The RGBELoader path below uses the HDRI as a scene environment + background.
export function buildSky(scene) {
  if (SKY.hdr) {
    // To enable HDRI loading, uncomment this block (and install nothing extra —
    // RGBELoader is bundled with three.js examples). Keep SKY.hdr = null to use
    // the gradient shader instead.
    //
    // import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
    // new RGBELoader().load(SKY.hdr, tex => {
    //   tex.mapping = THREE.EquirectangularReflectionMapping;
    //   scene.background = tex;
    //   scene.environment = tex;
    // });
    console.warn('[Sky] SKY.hdr is set, but HDRI loading is opt-in. See Sky.js comments.');
  }

  const geo = new THREE.SphereGeometry(300, 32, 24);
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: {
      topColor:    { value: new THREE.Color(SKY.topColor) },
      midColor:    { value: new THREE.Color(SKY.midColor) },
      bottomColor: { value: new THREE.Color(SKY.bottomColor) },
      offset:      { value: SKY.offset },
      exponent:    { value: SKY.exponent },
    },
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
  return mesh;
}
