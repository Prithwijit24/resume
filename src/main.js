import { World }          from './World.js';
import { Loader }         from './ui/loader.js';
import { Nav }            from './ui/nav.js';
import { initCards }      from './ui/cards.js';
import { renderEditorial } from './ui/editorial.js';
import { PROFILE }        from './content.js';

// ── 1. Loader on screen
const loader = new Loader();
loader.start();

// ── 2. Render editorial content into <main>
renderEditorial();
initCards();

// ── 3. Resume download button
document.getElementById('resume-btn')?.addEventListener('click', e => {
  e.preventDefault();
  fetch(PROFILE.resumeUrl, { method: 'HEAD' })
    .then(r => {
      if (r.ok) {
        const a = document.createElement('a');
        a.href = PROFILE.resumeUrl;
        a.download = 'Prithwijit_Ghosh_Resume.pdf';
        document.body.appendChild(a);
        a.click();
        a.remove();
      } else {
        alert('Resume PDF not yet placed. Drop your file at public/resume.pdf and rebuild.');
      }
    })
    .catch(() => window.open(PROFILE.resumeUrl, '_blank'));
});

// ── 4. Wait for fonts so any first-paint text is crisp
const fontsReady = (document.fonts && document.fonts.ready) || Promise.resolve();

fontsReady.then(() => {
  // ── 5. Build the 3D world
  const canvas = document.getElementById('canvas');
  const world = new World(canvas);

  // ── 6. Wire scroll → camera progress
  const scrollEl = document.getElementById('scroll');
  new Nav(scrollEl, p => world.setScrollProgress(p));

  // ── 7. Animation loop
  function tick() {
    world.tick();
    requestAnimationFrame(tick);
  }

  // Let one frame render before hiding the loader so the world is on screen
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      loader.complete();
      tick();
    });
  });
});
