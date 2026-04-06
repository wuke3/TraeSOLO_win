const { remote, ipcRenderer } = require('electron');
const { BrowserWindow } = remote;
const urlParams = new URLSearchParams(window.location.search);
const targetUrl = urlParams.get('url');

// 获取DOM元素
const externalWebview = document.getElementById('external-webview');
const minimizeButton = document.getElementById('minimize-button');
const maximizeButton = document.getElementById('maximize-button');
const closeButton = document.getElementById('close-button');
const appTitle = document.getElementById('app-title');

// 设置WebView源
externalWebview.src = targetUrl;

// 更新标题
externalWebview.addEventListener('did-start-loading', () => {
  appTitle.textContent = '加载中...';
});

externalWebview.addEventListener('did-finish-load', () => {
  externalWebview.executeJavaScript(`
    document.title
  `).then(title => {
    appTitle.textContent = title || '外部链接';
  });
});

// 窗口控制
minimizeButton.addEventListener('click', () => {
  remote.getCurrentWindow().minimize();
});

maximizeButton.addEventListener('click', () => {
  const win = remote.getCurrentWindow();
  if (win.isMaximized()) {
    win.unmaximize();
  } else {
    win.maximize();
  }
});

closeButton.addEventListener('click', () => {
  remote.getCurrentWindow().close();
});

// 标题栏拖拽
const titleBar = document.getElementById('title-bar');
titleBar.addEventListener('mousedown', (e) => {
  if (e.target === titleBar || e.target === appTitle) {
    remote.getCurrentWindow().startDrag();
  }
});

// 处理下载请求
externalWebview.addEventListener('will-download', (e) => {
  const url = e.url;
  ipcRenderer.send('download-request', url);
  
  ipcRenderer.once('download-path', (event, filePath) => {
    if (filePath) {
      e.savePath = filePath;
    } else {
      e.cancel();
    }
  });
});

// 处理外部链接
externalWebview.addEventListener('new-window', (e) => {
  const url = e.url;
  const currentUrl = externalWebview.src;
  const currentDomain = new URL(currentUrl).hostname;
  const targetDomain = new URL(url).hostname;

  if (targetDomain !== currentDomain) {
    e.preventDefault();
    createExternalWindow(url);
  }
});

// 创建外部链接窗口
function createExternalWindow(url) {
  const win = new BrowserWindow({
    width: 1000,
    height: 700,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  win.loadFile('external-window.html', {
    query: { url }
  });
}