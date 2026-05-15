import { PROFILE, SECTIONS, EXPERIENCE, PROJECTS, SKILLS, EDUCATION, NAV_LINKS } from '../content.js';

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));

// Headlines allow <em>...</em> for accent emphasis — preserve those tags after escape.
const headline = s => esc(s).replace(/&lt;em&gt;/g, '<em>').replace(/&lt;\/em&gt;/g, '</em>');

function projCardHTML(p) {
  const m = p.metrics.map(x => `<div class="metric"><span class="v">${esc(x.v)}</span><span class="l">${esc(x.l)}</span></div>`).join('');
  const d = p.details.map(x => `<li>${esc(x)}</li>`).join('');
  const s = p.stack.map(x => `<span class="chip">${esc(x)}</span>`).join('');
  return `
    <div class="glass click">
      <div class="proj-tag">${esc(p.tag)}</div>
      <h3 class="proj-name">${esc(p.name)}</h3>
      ${p.client ? `<div class="proj-client">${esc(p.client)}</div>` : ''}
      ${p.dates  ? `<div class="proj-client">${esc(p.dates)}</div>` : ''}
      <div class="proj-metrics">${m}</div>
      <div class="arrow">+</div>
      <div class="proj-detail">
        <ul class="proj-detail-list">${d}</ul>
        <div class="proj-stack">${s}</div>
      </div>
    </div>`;
}

function eduCardHTML(e) {
  const badges = e.badges.map(b => `
    <div>
      <span class="metric"><span class="v" style="font-size:30px;">${esc(b.v)}</span><span class="l">${esc(b.l)}</span></span>
    </div>`).join('');
  return `
    <div class="glass">
      <div class="edu-mark">${esc(e.short.toUpperCase())}</div>
      <h3 class="edu-inst">${esc(e.short)}</h3>
      <div class="edu-deg">${esc(e.degree)}</div>
      <div class="edu-date">${esc(e.dates)}</div>
      <div class="edu-badges">${badges}</div>
    </div>`;
}

export function renderEditorial() {
  // Nav links
  document.getElementById('nav-links').innerHTML = NAV_LINKS
    .map(l => `<a data-jump="${esc(l.jump)}">${esc(l.label)}</a>`)
    .join('');

  // Hero
  const hero = SECTIONS.hero;
  const ctas = hero.ctas.map(c =>
    `<a class="btn ${c.solid ? 'solid' : 'ghost'}" data-jump="${esc(c.jump)}">${esc(c.label)}</a>`
  ).join('');
  const stats = hero.stats.map(s =>
    `<div class="hero-stat"><span class="v">${esc(s.v)}</span><span class="l">${esc(s.l)}</span></div>`
  ).join('');

  // Experience
  const expCards = EXPERIENCE.map(projCardHTML).join('');
  // Self-projects
  const projCards = PROJECTS.map(projCardHTML).join('');

  // Skills
  const skillRows = Object.entries(SKILLS).map(([cat, items]) =>
    `<div class="skill-cat">${esc(cat)}</div><div class="skill-items">${items.map(i => `<span>${esc(i)}</span>`).join('')}</div>`
  ).join('');

  // Education
  const eduCards = EDUCATION.map(eduCardHTML).join('');

  // Contact channels
  const c = SECTIONS.contact;
  const channels = `
    <a class="glass click" href="mailto:${esc(PROFILE.email)}">
      <div class="channel-l">Email</div>
      <div class="channel-v">${esc(PROFILE.email)} →</div>
    </a>
    <a class="glass click" href="${esc(PROFILE.github)}" target="_blank" rel="noopener">
      <div class="channel-l">GitHub</div>
      <div class="channel-v">Code &amp; experiments →</div>
    </a>
    <a class="glass click" href="${esc(PROFILE.linkedin)}" target="_blank" rel="noopener">
      <div class="channel-l">LinkedIn</div>
      <div class="channel-v">Network &amp; work →</div>
    </a>`;

  document.getElementById('main').innerHTML = `
    <section id="sec-hero" data-biome="hero">
      <div class="eyebrow"><span class="dot"></span>${esc(hero.eyebrow)}</div>
      <h1 class="display h-hero">${headline(hero.title)}</h1>
      <p class="lede">${esc(hero.lede)}</p>
      <div class="ctas">${ctas}<a class="btn ghost" id="resume-btn">Resume ↓</a></div>
      <div class="hero-stats">${stats}</div>
    </section>

    <section id="sec-exp" data-biome="exp">
      <div class="eyebrow">${esc(SECTIONS.exp.num)} · ${esc(SECTIONS.exp.eyebrow)}</div>
      <h2 class="display h-section">${headline(SECTIONS.exp.title)}</h2>
      <p class="lede">${esc(SECTIONS.exp.lede)}</p>
      <div class="grid-2">${expCards}</div>
    </section>

    <section id="sec-proj" data-biome="proj">
      <div class="eyebrow">${esc(SECTIONS.proj.num)} · ${esc(SECTIONS.proj.eyebrow)}</div>
      <h2 class="display h-section">${headline(SECTIONS.proj.title)}</h2>
      <p class="lede">${esc(SECTIONS.proj.lede)}</p>
      <div class="grid-2">${projCards}</div>
    </section>

    <section id="sec-skill" data-biome="skill">
      <div class="eyebrow">${esc(SECTIONS.skill.num)} · ${esc(SECTIONS.skill.eyebrow)}</div>
      <h2 class="display h-section">${headline(SECTIONS.skill.title)}</h2>
      <p class="lede">${esc(SECTIONS.skill.lede)}</p>
      <div class="glass" style="margin-top:48px;"><div class="skills">${skillRows}</div></div>
    </section>

    <section id="sec-edu" data-biome="edu">
      <div class="eyebrow">${esc(SECTIONS.edu.num)} · ${esc(SECTIONS.edu.eyebrow)}</div>
      <h2 class="display h-section">${headline(SECTIONS.edu.title)}</h2>
      ${SECTIONS.edu.lede ? `<p class="lede">${esc(SECTIONS.edu.lede)}</p>` : ''}
      <div class="grid-2">${eduCards}</div>
    </section>

    <section id="sec-contact" data-biome="contact">
      <div class="eyebrow">${esc(c.num)} · ${esc(c.eyebrow)}</div>
      <h2 class="display h-section" style="font-size:60px;">${headline(c.title)}</h2>
      <p class="lede">${esc(c.lede)}</p>
      <div class="channels">${channels}</div>
    </section>

    <footer>BUILT WITH THREE.JS · SIX WORLDS YOU FLY THROUGH</footer>
  `;
}
