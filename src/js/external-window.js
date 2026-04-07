const externalWebview = document.getElementById('external-webview');
const appTitle = document.getElementById('app-title');

setupWindowControls({ isExternal: true });
const { updateTheme } = setupThemeManager();

const urlParams = new URLSearchParams(window.location.search);
const targetUrl = urlParams.get('url');

async function loadSettings() {
  try {
    const settings = await window.electronAPI.invoke('get-current-settings');
    updateTheme(settings.darkMode);
  } catch (error) {
    console.error('Failed to load settings:', error);
  }
}

function initExternalWindow() {
  if (targetUrl) {
    try {
      const urlObj = new URL(targetUrl);
      appTitle.textContent = urlObj.hostname;
    } catch (err) {
      appTitle.textContent = '加载中...';
    }
    externalWebview.src = targetUrl;
  } else {
    console.error('Error: No URL provided!');
    appTitle.textContent = '错误：无效的URL';
  }
}

externalWebview.addEventListener('did-start-loading', () => {
  appTitle.textContent = '加载中...';
});

externalWebview.addEventListener('dom-ready', () => {
  externalWebview.executeJavaScript('document.title').then(title => {
    if (title && title !== appTitle.textContent && title !== '加载中...') {
      appTitle.textContent = title;
    }
  }).catch(() => {});
});

externalWebview.addEventListener('did-finish-load', () => {
  externalWebview.executeJavaScript('document.title').then(title => {
    if (title && title !== appTitle.textContent && title !== '加载中...') {
      appTitle.textContent = title;
    }
  }).catch(() => {});
});

externalWebview.addEventListener('page-title-updated', (event, title) => {
  if (title) {
    appTitle.textContent = title;
  }
});

externalWebview.addEventListener('did-fail-load', (event, errorCode, errorDescription) => {
  console.error('Page load failed:', errorCode, errorDescription);
  appTitle.textContent = `加载失败: ${errorDescription}`;
});

loadSettings();
initExternalWindow();
