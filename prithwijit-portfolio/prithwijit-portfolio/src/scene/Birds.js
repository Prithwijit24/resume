import * as THREE from 'three';
import { ATMOSPHERE } from '../world.config.js';

export function buildBirds(scene) {
  const cfg = ATMOSPHERE.birds;
  const birds = [];
  const color = new THREE.Color(cfg.color);

  for (let i = 0; i < cfg.count; i++) {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute([
      -0.3, 0, 0,
       0.3, 0, 0,
       0,   0.08, 0,
    ], 3));
    const m = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.55 });
    const b = new THREE.LineLoop(g, m);

    const y = cfg.altitudeMin + Math.random() * (cfg.altitudeMax - cfg.altitudeMin);
    b.position.set(-30 + Math.random() * 60, y, -30 - Math.random() * 60);
    b.userData = {
      speed: cfg.speedMin + Math.random() * (cfg.speedMax - cfg.speedMin),
      phase: Math.random() * Math.PI * 2,
      baseY: y,
    };
    scene.add(b);
    birds.push(b);
  }

  function update(time) {
    birds.forEach(b => {
      b.position.x += b.userData.speed;
      b.position.y = b.userData.baseY + Math.sin(time * 4 + b.userData.phase) * 0.15;
      if (b.position.x > 35) b.position.x = -35;
    });
  }

  return { birds, update };
}
