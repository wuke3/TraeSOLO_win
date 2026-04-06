const { ipcRenderer } = require('electron');

// 获取DOM元素
const externalWebview = document.getElementById('external-webview');
const minimizeButton = document.getElementById('minimize-button');
const maximizeButton = document.getElementById('maximize-button');
const closeButton = document.getElementById('close-button');
const appTitle = document.getElementById('app-title');

// 存储当前设置
let currentSettings = { domain: 'cn', darkMode: false };
let titlePollInterval = null;

// 从 URL 参数获取目标 URL
const urlParams = new URLSearchParams(window.location.search);
const targetUrl = urlParams.get('url');

// 标题栏拖拽 - 完整实现
const titleBar = document.getElementById('title-bar');
let isDragging = false;
let offsetX = 0;
let offsetY = 0;

titleBar.addEventListener('mousedown', async (e) => {
  // 排除按钮区域，防止点击按钮时触发拖拽
  if (e.target.closest('.title-bar-button')) {
    return;
  }
  
  // 只在标题栏区域（非按钮）时开始拖拽
  if (e.target === titleBar || 
      e.target === appTitle || 
      e.target.id === 'app-icon') {
    
    isDragging = true;
    
    try {
      // 获取鼠标和窗口位置
      const cursorPos = await ipcRenderer.invoke('get-cursor-position');
      const winPos = await ipcRenderer.invoke('get-window-position');
      
      offsetX = cursorPos.x - winPos[0];
      offsetY = cursorPos.y - winPos[1];
    } catch (err) {
      console.error('获取位置失败:', err);
      isDragging = false;
    }
  }
});

document.addEventListener('mousemove', async (e) => {
  if (!isDragging) return;
  
  try {
    const cursorPos = await ipcRenderer.invoke('get-cursor-position');
    ipcRenderer.send('set-window-position', cursorPos.x - offsetX, cursorPos.y - offsetY);
  } catch (err) {
    console.error('移动窗口失败:', err);
  }
});

document.addEventListener('mouseup', () => {
  isDragging = false;
});

// 加载设置
async function loadSettings() {
  try {
    currentSettings = await ipcRenderer.invoke('get-current-settings');
    updateTheme(currentSettings.darkMode);
  } catch (error) {
    console.error('加载设置失败:', error);
  }
}

// 更新主题
function updateTheme(darkMode) {
  if (darkMode) {
    document.body.classList.remove('light');
    document.body.classList.add('dark');
  } else {
    document.body.classList.remove('dark');
    document.body.classList.add('light');
  }
  
  // 更新标题栏图标
  const appIcon = document.getElementById('app-icon');
  if (appIcon) {
    appIcon.src = darkMode ? 'src/dark.png' : 'src/light.png';
  }
  
  // 更新窗口图标
  ipcRenderer.send('update-window-icon', darkMode);
}

// 尝试更新标题的函数
function tryUpdateTitle() {
  try {
    externalWebview.executeJavaScript(`
      document.title
    `).then(title => {
      if (title && title !== appTitle.textContent && title !== '加载中...') {
        appTitle.textContent = title;
      }
    }).catch(err => {
      // 静默失败，继续尝试
    });
  } catch (err) {
    // 静默失败
  }
}

// 开始轮询更新标题
function startTitlePolling() {
  // 先清理之前的
  if (titlePollInterval) {
    clearInterval(titlePollInterval);
    titlePollInterval = null;
  }
  
  // 快速轮询（每50ms检查一次）
  titlePollInterval = setInterval(() => {
    tryUpdateTitle();
  }, 50);
  
  // 5秒后降低轮询频率
  setTimeout(() => {
    if (titlePollInterval) {
      clearInterval(titlePollInterval);
      titlePollInterval = setInterval(() => {
        tryUpdateTitle();
      }, 500);
    }
  }, 5000);
}

// 初始化外部窗口
function initExternalWindow() {
  if (targetUrl) {
    // 初始就用URL当标题，不显示死板的"外部链接"
    try {
      const urlObj = new URL(targetUrl);
      appTitle.textContent = urlObj.hostname;
    } catch (err) {
      appTitle.textContent = '加载中...';
    }
    
    externalWebview.src = targetUrl;
  } else {
    console.error('错误：没有获取到 URL！');
    appTitle.textContent = '错误：无效的URL';
  }
}

// 开始加载时
externalWebview.addEventListener('did-start-loading', () => {
  appTitle.textContent = '加载中...';
  startTitlePolling();
});

// DOM 准备就绪时就尝试获取
externalWebview.addEventListener('dom-ready', () => {
  tryUpdateTitle();
});

// 加载完成时再次尝试
externalWebview.addEventListener('did-finish-load', () => {
  tryUpdateTitle();
});

// 页面标题变化时监听
externalWebview.addEventListener('page-title-updated', (event, title) => {
  if (title) {
    appTitle.textContent = title;
  }
});

// 处理加载失败
externalWebview.addEventListener('did-fail-load', (event, errorCode, errorDescription) => {
  console.error('页面加载失败:', errorCode, errorDescription);
  appTitle.textContent = `加载失败: ${errorDescription}`;
  if (titlePollInterval) {
    clearInterval(titlePollInterval);
    titlePollInterval = null;
  }
});

// 窗口控制
minimizeButton.addEventListener('click', (e) => {
  e.preventDefault();
  e.stopPropagation();
  try {
    ipcRenderer.send('minimize-external-window');
  } catch (error) {
    console.error('最小化失败:', error);
  }
});

maximizeButton.addEventListener('click', (e) => {
  e.preventDefault();
  e.stopPropagation();
  try {
    ipcRenderer.send('maximize-external-window');
  } catch (error) {
    console.error('最大化失败:', error);
  }
});

closeButton.addEventListener('click', (e) => {
  e.preventDefault();
  e.stopPropagation();
  try {
    ipcRenderer.send('close-external-window');
  } catch (error) {
    console.error('关闭失败:', error);
  }
});

// 初始化
loadSettings();
initExternalWindow();
