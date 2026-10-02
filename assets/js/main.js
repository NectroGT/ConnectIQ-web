(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  /* Mobile navigation */
  const header = $('.site-header');
  const menuBtn = $('.mobile-menu');
  function setMenu(open) {
    header.classList.toggle('nav-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menuBtn.textContent = open ? '✕' : '☰';
  }
  menuBtn.addEventListener('click', () => setMenu(!header.classList.contains('nav-open')));
  $$('#primaryNav a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

  /* Hero: live event counter */
  const eventCount = $('#eventCount');
  let events = 12840;
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    setInterval(() => {
      events += Math.floor(1 + Math.random() * 4);
      eventCount.textContent = events.toLocaleString('en-SG');
    }, 1600);
  }
})();
