// Wire up open/close on project cards. Cards with .proj-detail expand inline.
export function initCards() {
  document.querySelectorAll('.glass.click').forEach(el => {
    if (!el.querySelector('.proj-detail')) return;
    el.addEventListener('click', e => {
      // Don't intercept inner anchor clicks (mailto/external).
      if (e.target.closest('a[href]')) return;
      el.classList.toggle('open');
      const arrow = el.querySelector('.arrow');
      if (arrow) arrow.textContent = el.classList.contains('open') ? '−' : '+';
    });
  });
}
