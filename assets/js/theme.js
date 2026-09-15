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
      control.querySelectorAll('input').forEach(input => { input.checked = input.value === preference; });
      control.querySelectorAll('[data-theme-icon]').forEach(icon => { icon.toggleAttribute('hidden', icon.dataset.themeIcon !== preference); });
      const label = `Colour theme: ${preference[0].toUpperCase() + preference.slice(1)}`;
      control.querySelector('#theme-toggle-label').textContent = label;
      control.querySelector('summary').title = label;
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
    const toggle = control.querySelector('summary');
    applyTheme();
    control.addEventListener('change', event => {
      preference = validPreference(event.target.value);
      applyTheme();
      try { localStorage.setItem(storageKey, preference); } catch { /* Still works for this page. */ }
    });
    // Leave the options open for keyboard arrow navigation; Escape or an outside
    // click dismisses them without moving focus away from another control.
    document.addEventListener('click', event => {
      if (!control.contains(event.target)) control.open = false;
    });
    control.addEventListener('keydown', event => {
      if (event.key === 'Escape' && control.open) {
        event.preventDefault();
        control.open = false;
        toggle.focus();
      }
    });
    // Safari may blur the summary with relatedTarget === null before activating
    // a tapped label/radio. Closing on that blur cancels the pending selection.
    // Only dismiss when focus actually arrives at a control outside this menu.
    document.addEventListener('focusin', event => {
      if (!control.contains(event.target)) control.open = false;
    });
    control.hidden = false;
  }, { once: true });
})();
