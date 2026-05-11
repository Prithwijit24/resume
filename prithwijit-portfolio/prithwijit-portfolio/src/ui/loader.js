export class Loader {
  constructor() {
    this.el = document.getElementById('loader');
    this.fill = document.getElementById('loader-fill');
    this.meta = document.getElementById('loader-meta');
    this.value = 0;
    this._timer = null;
  }

  // Start auto-incrementing toward 100%. Stops on .complete().
  start() {
    this._timer = setInterval(() => {
      this.set(Math.min(this.value + 0.06, 0.92));
    }, 80);
  }

  set(p) {
    this.value = Math.max(this.value, p);
    const pct = Math.round(this.value * 100);
    this.fill.style.width = pct + '%';
    this.meta.textContent = pct + '% · BUILDING THE WORLD';
  }

  complete() {
    if (this._timer) { clearInterval(this._timer); this._timer = null; }
    this.set(1);
    setTimeout(() => this.el.classList.add('gone'), 400);
  }
}
