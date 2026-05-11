import { NAV_LINKS } from '../content.js';

export class Nav {
  constructor(scrollEl, onProgress) {
    this.scrollEl = scrollEl;
    this.onProgress = onProgress || (() => {});
    this.links = [...document.querySelectorAll('#nav a[data-jump]')];
    this._bindJumps();
    this._bindScroll();
  }

  _bindJumps() {
    document.querySelectorAll('[data-jump]').forEach(a => {
      a.addEventListener('click', e => {
        e.preventDefault();
        const id = 'sec-' + a.dataset.jump;
        const t = document.getElementById(id);
        if (t) this.scrollEl.scrollTo({ top: t.offsetTop - 60, behavior: 'smooth' });
      });
    });
  }

  _bindScroll() {
    const ids = NAV_LINKS.map(l => l.jump).concat(['contact']);
    this.scrollEl.addEventListener('scroll', () => {
      const max = this.scrollEl.scrollHeight - this.scrollEl.clientHeight;
      const p = max > 0 ? this.scrollEl.scrollTop / max : 0;
      this.onProgress(p);

      // Determine active section based on which one is centered
      const center = this.scrollEl.scrollTop + this.scrollEl.clientHeight * 0.4;
      let activeIdx = 0;
      for (let i = 0; i < ids.length; i++) {
        const el = document.getElementById('sec-' + ids[i]);
        if (el && el.offsetTop <= center) activeIdx = i;
      }
      this.links.forEach((l, i) => l.classList.toggle('active', i === activeIdx));
    });
  }
}
