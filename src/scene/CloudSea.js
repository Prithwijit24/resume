import * as THREE from 'three';
import { ATMOSPHERE } from '../world.config.js';

// A wide, low-altitude rolling cloud plane to give the "above the clouds" feel.
// Shader animates a soft height field; color blends from a base white into a
// warm horizon tint based on local altitude.
export function buildCloudSea(scene) {
  const cfg = ATMOSPHERE.cloudSea;

  const geo = new THREE.PlaneGeometry(cfg.size, cfg.size, 80, 80);
  geo.rotateX(-Math.PI / 2);

  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {
      uTime:    { value: 0 },
      uColorA:  { value: new THREE.Color(cfg.color) },
      uColorB:  { value: new THREE.Color(cfg.tintColor) },
      uOpacity: { value: cfg.opacity },
    },
    vertexShader: /* glsl */ `
      uniform float uTime;
      varying float vH;
      varying vec3  vWorld;
      void main() {
        vec3 p = position;
        float h =
          sin(p.x * 0.045 + uTime * 0.35) * 0.65 +
          cos(p.z * 0.040 + uTime * 0.28) * 0.55 +
          sin((p.x + p.z) * 0.018 + uTime * 0.18) * 0.35;
        p.y += h;
        vH = h;
        vWorld = (modelMatrix * vec4(p, 1.0)).xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3  uColorA;
      uniform vec3  uColorB;
      uniform float uOpacity;
      varying float vH;
      varying vec3  vWorld;
      void main() {
        // Color across crests vs. troughs
        vec3 c = mix(uColorB, uColorA, smoothstep(-0.8, 0.9, vH));
        // Fade out at horizon for soft blend with sky
        float dist = length(vWorld.xz);
        float fade = smoothstep(420.0, 220.0, dist);
        gl_FragColor = vec4(c, uOpacity * fade);
      }
    `,
  });

  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.y = cfg.altitude;
  scene.add(mesh);

  return {
    mesh,
    update: (t) => { mat.uniforms.uTime.value = t; },
  };
}
