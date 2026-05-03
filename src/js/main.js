const mainWebview = document.getElementById('main-webview');
const settingsPanel = document.getElementById('settings-panel');
const settingsButton = document.getElementById('settings-button');
const domainSelect = document.getElementById('domain-select');
const darkModeToggle = document.getElementById('dark-mode-toggle');
const closeToTrayToggle = document.getElementById('close-to-tray-toggle');
const autoStartToggle = document.getElementById('auto-start-toggle');
const reserveButton = document.getElementById('reserve-button');
const loadingIndicator = document.getElementById('loading-indicator');

let currentSettings = { domain: 'cn', darkMode: false };

setupWindowControls({ isExternal: false });
const { updateTheme } = setupThemeManager();

window.electronAPI.send('get-settings');

settingsButton.addEventListener('click', (e) => {
  e.preventDefault();
  e.stopPropagation();
  settingsPanel.classList.toggle('open');
});

document.addEventListener('click', (e) => {
  if (settingsPanel.classList.contains('open') &&
      !settingsPanel.contains(e.target) &&
      e.target !== settingsButton &&
      !settingsButton.contains(e.target)) {
    settingsPanel.classList.remove('open');
  }
});

reserveButton.addEventListener('click', (e) => {
  e.preventDefault();
  e.stopPropagation();
  
  const reserveUrl = currentSettings.domain === 'cn' 
    ? 'https://www.trae.cn/ide/download#solo-download' 
    : 'https://www.trae.ai/download#solo-download';
  
  window.electronAPI.send('open-external-window', reserveUrl);
});

let settingsSubscription = null;

function cleanupListener() {
  if (settingsSubscription) {
    window.electronAPI.removeListener('settings', settingsSubscription);
    settingsSubscription = null;
  }
}

settingsSubscription = window.electronAPI.on('settings', (settings) => {
  currentSettings = settings;
  domainSelect.value = settings.domain;
  darkModeToggle.checked = settings.darkMode;
  if (closeToTrayToggle) closeToTrayToggle.checked = settings.closeToTray !== false;
  if (autoStartToggle) autoStartToggle.checked = settings.autoStart === true;
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

if (closeToTrayToggle) {
  closeToTrayToggle.addEventListener('change', (e) => {
    const closeToTray = e.target.checked;
    currentSettings.closeToTray = closeToTray;
    window.electronAPI.send('update-settings', { closeToTray });
  });
}

if (autoStartToggle) {
  autoStartToggle.addEventListener('change', (e) => {
    const autoStart = e.target.checked;
    currentSettings.autoStart = autoStart;
    window.electronAPI.send('update-settings', { autoStart });
  });
}

function updateDomain(domain) {
  const url = domain === 'cn' ? 'https://solo.trae.cn/' : 'https://solo.trae.ai/';
  try {
    const currentUrl = mainWebview.src;
    if (currentUrl !== url) {
      mainWebview.src = url;
    }
  } catch (err) {
    mainWebview.src = url;
  }
}

let loadingCount = 0;

function showLoadingIndicator() {
  loadingCount++;
  if (loadingIndicator && loadingIndicator.classList.contains('hidden')) {
    loadingIndicator.classList.remove('hidden');
  }
}

function hideLoadingIndicator() {
  loadingCount = Math.max(0, loadingCount - 1);
  if (loadingCount === 0 && loadingIndicator && !loadingIndicator.classList.contains('hidden')) {
    loadingIndicator.classList.add('hidden');
  }
}

if (mainWebview && loadingIndicator) {
  mainWebview.addEventListener('did-start-loading', () => {
    showLoadingIndicator();
  });
  mainWebview.addEventListener('did-stop-loading', () => {
    hideLoadingIndicator();
  });
  mainWebview.addEventListener('did-fail-load', () => {
    hideLoadingIndicator();
  });
  setTimeout(() => {
    loadingCount = 0;
    if (loadingIndicator && !loadingIndicator.classList.contains('hidden')) {
      loadingIndicator.classList.add('hidden');
    }
  }, 8000);
}

window.addEventListener('beforeunload', () => {
  cleanupListener();
});
