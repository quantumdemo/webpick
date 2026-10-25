/* Light and dark mode (2026-10-24). Loaded in <head> without defer so the page never
   flashes the wrong theme. The visitor's choice is kept in this browser; otherwise the
   site opens in dark mode (owner, 2026-10-24), whatever the device setting. Pages not moved to the new look yet carry data-theme-lock="dark".
   Any [data-theme-toggle] button switches it. */
(() => {
  const root = document.documentElement, KEY = 'sitepeel-theme';
  const lock = root.getAttribute('data-theme-lock');
  let theme = lock, parentRoot = null;
  // An embedded Sitepeel page (the account card) follows the page around it.
  try { if (window.parent !== window && window.parent.document.documentElement.dataset.theme) parentRoot = window.parent.document.documentElement; } catch { /* another site */ }
  if (!theme && parentRoot) theme = parentRoot.dataset.theme;
  if (!theme) {
    try { theme = localStorage.getItem(KEY); } catch { /* storage blocked */ }
    if (theme !== 'light' && theme !== 'dark') theme = 'dark';
  }
  // The browser's own bar follows the page, not the device setting.
  const bar = value => document.querySelectorAll('meta[name="theme-color"]').forEach(m => { m.removeAttribute('media'); m.content = value === 'dark' ? '#0B0B0D' : '#FBFBFB'; });
  const apply = value => { root.dataset.theme = value; root.style.colorScheme = value; bar(value); };
  document.addEventListener('DOMContentLoaded', () => bar(root.dataset.theme), { once: true });
  apply(theme);
  if (parentRoot && !lock) new MutationObserver(() => apply(parentRoot.dataset.theme)).observe(parentRoot, { attributes: true, attributeFilter: ['data-theme'] });
  document.addEventListener('click', event => {
    const button = event.target instanceof Element && event.target.closest('[data-theme-toggle]');
    if (!button || lock) return;
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    apply(next);
    try { localStorage.setItem(KEY, next); } catch { /* storage blocked */ }
    button.setAttribute('aria-label', next === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
  });
})();
