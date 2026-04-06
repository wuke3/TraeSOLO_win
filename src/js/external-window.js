const { remote, ipcRenderer } = require('electron');
const { BrowserWindow } = remote;
const urlParams = new URLSearchParams(window.location.search);
const targetUrl = urlParams.get('url');

console.log('外部链接窗口URL:', targetUrl);

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
  console.log('开始加载:', targetUrl);
});

externalWebview.addEventListener('did-finish-load', () => {
  console.log('加载完成');
  externalWebview.executeJavaScript(`
    document.title
  `).then(title => {
    appTitle.textContent = title || '外部链接';
  }).catch(err => {
    console.error('获取标题失败:', err);
    appTitle.textContent = '外部链接';
  });
});

externalWebview.addEventListener('dom-ready', () => {
  console.log('DOM ready');
});

// 辅助函数：为按钮添加点击事件监听器
function addButtonClickListener(button, callback) {
  if (button) {
    // 为按钮本身添加点击事件
    button.addEventListener('click', callback);
    
    // 为按钮内的SVG添加点击事件
    const svg = button.querySelector('svg');
    if (svg) {
      svg.addEventListener('click', callback);
    }
  }
}

// 窗口控制 - 添加 stopPropagation
addButtonClickListener(minimizeButton, (e) => {
  e.stopPropagation();
  remote.getCurrentWindow().minimize();
});

addButtonClickListener(maximizeButton, (e) => {
  e.stopPropagation();
  const win = remote.getCurrentWindow();
  if (win.isMaximized()) {
    win.unmaximize();
  } else {
    win.maximize();
  }
});

addButtonClickListener(closeButton, (e) => {
  e.stopPropagation();
  remote.getCurrentWindow().close();
});

// 标题栏拖拽 - 改进逻辑，排除按钮区域
const titleBar = document.getElementById('title-bar');
titleBar.addEventListener('mousedown', (e) => {
  const targetElement = e.target;
  if (targetElement.closest('.title-bar-button')) {
    return;
  }
  
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
      contextIsolation: false,
      enableRemoteModule: true
    }
  });

  win.loadFile('external-window.html', {
    query: { url }
  });
}