const { ipcRenderer, remote } = require('electron');
const { BrowserWindow } = remote;

// 获取DOM元素
const mainWebview = document.getElementById('main-webview');
const settingsPanel = document.getElementById('settings-panel');
const settingsButton = document.getElementById('settings-button');
const domainSelect = document.getElementById('domain-select');
const darkModeToggle = document.getElementById('dark-mode-toggle');
const reserveButton = document.getElementById('reserve-button');
const reserveModal = document.getElementById('reserve-modal');
const reserveModalClose = document.getElementById('reserve-modal-close');
const reserveWebview = document.getElementById('reserve-webview');
const minimizeButton = document.getElementById('minimize-button');
const maximizeButton = document.getElementById('maximize-button');
const closeButton = document.getElementById('close-button');

// 窗口控制
// 为按钮和其中的SVG图标添加点击事件监听器
function addButtonClickListener(button, callback) {
  button.addEventListener('click', (e) => {
    callback(e);
  });
  // 为按钮内的所有SVG图标添加点击事件监听器
  const svgs = button.querySelectorAll('svg');
  svgs.forEach(svg => {
    svg.addEventListener('click', (e) => {
      e.stopPropagation();
      callback(e);
    });
  });
}

addButtonClickListener(minimizeButton, () => {
  remote.getCurrentWindow().minimize();
});

addButtonClickListener(maximizeButton, () => {
  const win = remote.getCurrentWindow();
  if (win.isMaximized()) {
    win.unmaximize();
  } else {
    win.maximize();
  }
});

addButtonClickListener(closeButton, () => {
  remote.getCurrentWindow().close();
});

// 标题栏拖拽
const titleBar = document.getElementById('title-bar');
titleBar.addEventListener('mousedown', (e) => {
  // 排除按钮区域，防止点击按钮时触发拖拽
  const targetElement = e.target;
  if (targetElement.closest('.title-bar-button') || 
      targetElement.closest('#settings-panel') || 
      targetElement.closest('#reserve-modal')) {
    return;
  }
  
  if (e.target === titleBar || e.target === document.getElementById('app-title')) {
    remote.getCurrentWindow().startDrag();
  }
});

// 设置面板
addButtonClickListener(settingsButton, (e) => {
  e.stopPropagation();
  console.log('设置按钮被点击');
  settingsPanel.classList.toggle('open');
  console.log('设置面板状态:', settingsPanel.classList.contains('open'));
});

// 预约弹窗
addButtonClickListener(reserveButton, (e) => {
  e.stopPropagation();
  console.log('预约按钮被点击');
  reserveModal.classList.add('open');
});

reserveModalClose.addEventListener('click', (e) => {
  e.stopPropagation();
  console.log('关闭预约弹窗按钮被点击');
  reserveModal.classList.remove('open');
});

// 点击弹窗外部关闭
reserveModal.addEventListener('click', (e) => {
  if (e.target === reserveModal) {
    console.log('点击弹窗外部关闭');
    reserveModal.classList.remove('open');
  }
});

// 加载设置
ipcRenderer.send('get-settings');
ipcRenderer.on('settings', (event, settings) => {
  domainSelect.value = settings.domain;
  darkModeToggle.checked = settings.darkMode;
  updateTheme(settings.darkMode);
  updateDomain(settings.domain);
});

// 域名切换
domainSelect.addEventListener('change', (e) => {
  const domain = e.target.value;
  ipcRenderer.send('update-settings', { domain });
  updateDomain(domain);
});

// 深色模式切换
darkModeToggle.addEventListener('change', (e) => {
  const darkMode = e.target.checked;
  ipcRenderer.send('update-settings', { darkMode });
  updateTheme(darkMode);
});

// 更新主题
function updateTheme(darkMode) {
  if (darkMode) {
    document.body.classList.remove('light');
    document.body.classList.add('dark');
  } else {
    document.body.classList.remove('dark');
    document.body.classList.add('light');
  }
}

// 更新域名
function updateDomain(domain) {
  const url = domain === 'cn' ? 'https://solo.trae.cn/' : 'https://solo.trae.ai/';
  mainWebview.src = url;
}

// 处理下载请求
mainWebview.addEventListener('will-download', (e) => {
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
mainWebview.addEventListener('new-window', (e) => {
  const url = e.url;
  console.log('外部链接请求:', url);
  
  // 阻止默认行为并创建新窗口
  e.preventDefault();
  createExternalWindow(url);
});

// 处理导航事件，确保外部链接也能被捕获
mainWebview.addEventListener('will-navigate', (e) => {
  const url = e.url;
  const currentUrl = mainWebview.src;
  
  // 避免循环导航
  if (url === currentUrl) return;
  
  console.log('导航请求:', url);
  
  // 检查是否为外部链接
  try {
    const currentDomain = new URL(currentUrl).hostname;
    const targetDomain = new URL(url).hostname;
    
    if (targetDomain !== currentDomain) {
      e.preventDefault();
      createExternalWindow(url);
    }
  } catch (error) {
    console.error('URL解析错误:', error);
  }
});

// 自动检测网页模式并调整应用程序主题
mainWebview.addEventListener('dom-ready', () => {
  mainWebview.executeJavaScript(`
    // 检测网页是否为深色模式
    function detectDarkMode() {
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ||
             document.documentElement.classList.contains('dark') ||
             document.body.classList.contains('dark') ||
             getComputedStyle(document.body).backgroundColor === 'rgb(26, 26, 26)';
    }
    detectDarkMode();
  `, (result) => {
    console.log('网页深色模式检测结果:', result);
    updateTheme(result);
    darkModeToggle.checked = result;
    ipcRenderer.send('update-settings', { darkMode: result });
  });
});

// 监听网页主题变化
mainWebview.addEventListener('did-start-loading', () => {
  console.log('网页开始加载，准备检测主题');
});

mainWebview.addEventListener('did-stop-loading', () => {
  console.log('网页加载完成，检测主题');
  mainWebview.executeJavaScript(`
    function detectDarkMode() {
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ||
             document.documentElement.classList.contains('dark') ||
             document.body.classList.contains('dark') ||
             getComputedStyle(document.body).backgroundColor === 'rgb(26, 26, 26)';
    }
    detectDarkMode();
  `, (result) => {
    console.log('网页深色模式检测结果:', result);
    updateTheme(result);
    darkModeToggle.checked = result;
    ipcRenderer.send('update-settings', { darkMode: result });
  });
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

// 预约窗口的下载处理
reserveWebview.addEventListener('will-download', (e) => {
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