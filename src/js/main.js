const mainWebview = document.getElementById('main-webview');
const settingsPanel = document.getElementById('settings-panel');
const settingsButton = document.getElementById('settings-button');
const domainSelect = document.getElementById('domain-select');
const darkModeToggle = document.getElementById('dark-mode-toggle');
const reserveButton = document.getElementById('reserve-button');

let currentSettings = { domain: 'cn', darkMode: false };

setupWindowControls({ isExternal: false });
const { updateTheme } = setupThemeManager();

settingsButton.addEventListener('click', (e) => {
  e.preventDefault();
  e.stopPropagation();
  settingsPanel.classList.toggle('open');
});

reserveButton.addEventListener('click', (e) => {
  e.preventDefault();
  e.stopPropagation();
  
  const reserveUrl = currentSettings.domain === 'cn' 
    ? 'https://www.trae.cn/ide/download#solo-download' 
    : 'https://www.trae.ai/download#solo-download';
  
  window.electronAPI.send('open-external-window', reserveUrl);
});

window.electronAPI.send('get-settings');
window.electronAPI.on('settings', (settings) => {
  currentSettings = settings;
  domainSelect.value = settings.domain;
  darkModeToggle.checked = settings.darkMode;
  updateTheme(settings.darkMode);
  updateDomain(settings.domain);
});

domainSelect.addEventListener('change', (e) => {
  const domain = e.target.value;
  currentSettings.domain = domain;
  window.electronAPI.send('update-settings', { domain });
  updateDomain(domain);
});

darkModeToggle.addEventListener('change', (e) => {
  const darkMode = e.target.checked;
  currentSettings.darkMode = darkMode;
  window.electronAPI.send('update-settings', { darkMode });
  updateTheme(darkMode);
});

function updateDomain(domain) {
  const url = domain === 'cn' ? 'https://solo.trae.cn/' : 'https://solo.trae.ai/';
  mainWebview.src = url;
}
