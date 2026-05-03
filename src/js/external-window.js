const externalWebview = document.getElementById('external-webview');
const appTitle = document.getElementById('app-title');

setupWindowControls({ isExternal: true });
const { updateTheme } = setupThemeManager();

let targetUrl = null;

function loadSettings() {
  window.electronAPI.invoke('get-current-settings').then((settings) => {
    updateTheme(settings.darkMode);
  }).catch((error) => {
    console.error('Failed to load settings:', error);
  });
}

function loadUrl(url) {
  targetUrl = url;
  try {
    const urlObj = new URL(url);
    appTitle.textContent = urlObj.hostname;
  } catch (err) {
    appTitle.textContent = '加载中...';
  }
  externalWebview.src = url;
}

window.electronAPI.on('load-external-url', (url) => {
  if (url) {
    loadUrl(url);
  } else {
    console.error('Error: No URL provided via IPC!');
    appTitle.textContent = '错误：无效的URL';
  }
});

externalWebview.addEventListener('did-start-loading', () => {
  appTitle.textContent = '加载中...';
});

externalWebview.addEventListener('dom-ready', () => {
  externalWebview.executeJavaScript('document.title').then(title => {
    if (title && title !== '加载中...') {
      appTitle.textContent = title;
    }
  }).catch(() => {});
});

externalWebview.addEventListener('did-finish-load', () => {
  externalWebview.executeJavaScript('document.title').then(title => {
    if (title && title !== '加载中...') {
      appTitle.textContent = title;
    }
  }).catch(() => {});
});

externalWebview.addEventListener('page-title-updated', (event) => {
  if (event.title) {
    appTitle.textContent = event.title;
  }
});

externalWebview.addEventListener('did-fail-load', (event) => {
  const errorDescription = event.errorDescription || '未知错误';
  console.error('Page load failed:', event.errorCode, errorDescription);
  appTitle.textContent = '加载失败: ' + errorDescription;
});

loadSettings();
