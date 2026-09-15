// Apply the preference before styles load, avoiding a light flash on dark pages.
(() => {
  const storageKey = 'miyuru-theme-v1';
  const system = window.matchMedia('(prefers-color-scheme: dark)');
  const validPreference = value => ['light', 'dark'].includes(value) ? value : 'system';
  let preference = 'system';
  let selector;

  try { preference = validPreference(localStorage.getItem(storageKey)); } catch { /* Storage is optional. */ }

  function applyTheme() {
    const theme = preference === 'system' ? (system.matches ? 'dark' : 'light') : preference;
    document.documentElement.dataset.theme = theme;
    document.querySelectorAll('meta[name="theme-color"]').forEach(meta => {
      meta.content = theme === 'dark' ? '#151c22' : '#fcfbf8';
    });
    if (selector) selector.value = preference;
  }

  applyTheme();
  system.addEventListener('change', () => { if (preference === 'system') applyTheme(); });
  window.addEventListener('storage', event => {
    if (event.key === storageKey || event.key === null) {
      preference = validPreference(event.newValue);
      applyTheme();
    }
  });
  document.addEventListener('DOMContentLoaded', () => {
    selector = document.querySelector('#theme-preference');
    if (!selector) return;
    selector.value = preference;
    selector.addEventListener('change', () => {
      preference = validPreference(selector.value);
      applyTheme();
      try { localStorage.setItem(storageKey, preference); } catch { /* Still works for this page. */ }
    });
    selector.closest('.theme-control').hidden = false;
  }, { once: true });
})();
