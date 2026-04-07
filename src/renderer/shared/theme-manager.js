function setupThemeManager(options = {}) {
  const {
    appIconId = 'app-icon'
  } = options;

  function updateTheme(darkMode) {
    if (darkMode) {
      document.body.classList.remove('light');
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
      document.body.classList.add('light');
    }

    const appIcon = document.getElementById(appIconId);
    if (appIcon) {
      appIcon.src = darkMode ? 'src/dark.png' : 'src/light.png';
    }

    window.electronAPI.send('update-window-icon', darkMode);
  }

  return { updateTheme };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { setupThemeManager };
}
