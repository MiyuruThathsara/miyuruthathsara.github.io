// Apply the preference before styles load, avoiding a light flash on dark pages.
(() => {
  const storageKey = 'miyuru-theme-v1';
  const system = window.matchMedia('(prefers-color-scheme: dark)');
  const validPreference = value => ['light', 'dark'].includes(value) ? value : 'system';
  let preference = 'system';
  let control;

  try { preference = validPreference(localStorage.getItem(storageKey)); } catch { /* Storage is optional. */ }

  function applyTheme() {
    const theme = preference === 'system' ? (system.matches ? 'dark' : 'light') : preference;
    document.documentElement.dataset.theme = theme;
    document.documentElement.dataset.themePreference = preference;
    document.querySelectorAll('meta[name="theme-color"]').forEach(meta => {
      meta.content = theme === 'dark' ? '#151c22' : '#fcfbf8';
    });
    if (control) {
      const nextTheme = theme === 'dark' ? 'light' : 'dark';
      control.querySelectorAll('[data-theme-icon]').forEach(icon => { icon.toggleAttribute('hidden', icon.dataset.themeIcon !== nextTheme); });
      const label = `Switch to ${nextTheme} theme`;
      control.querySelector('#theme-toggle-label').textContent = label;
      control.title = label;
    }
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
    control = document.querySelector('.theme-control');
    if (!control) return;
    applyTheme();
    control.addEventListener('click', () => {
      preference = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      applyTheme();
      try { localStorage.setItem(storageKey, preference); } catch { /* Still works for this page. */ }
    });
    control.hidden = false;
  }, { once: true });
})();
