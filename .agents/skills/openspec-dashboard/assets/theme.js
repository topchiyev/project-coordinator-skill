(() => {
  const storageKey = 'openspec-dashboard-theme';
  const browserTheme = window.matchMedia?.('(prefers-color-scheme: dark)');
  let mode = 'auto';

  try {
    const savedMode = localStorage.getItem(storageKey);
    if (savedMode === 'light' || savedMode === 'dark') mode = savedMode;
  } catch {
    // Browser settings can block storage for standalone files.
  }

  function applyTheme() {
    const preferredTheme = browserTheme?.matches ? 'dark' : 'light';
    document.documentElement.dataset.theme = mode === 'auto' ? preferredTheme : mode;
  }

  applyTheme();
  browserTheme?.addEventListener?.('change', applyTheme);

  document.addEventListener('DOMContentLoaded', () => {
    const themeSwitch = document.getElementById('theme-switch');
    themeSwitch.querySelector(`[value="${mode}"]`).checked = true;
    themeSwitch.addEventListener('change', event => {
      mode = event.target.value;
      applyTheme();
      try {
        localStorage.setItem(storageKey, mode);
      } catch {
        // The selected mode still applies for the current page.
      }
    });
  });
})();
