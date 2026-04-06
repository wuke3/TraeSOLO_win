const { ipcRenderer } = require('electron');
const path = require('path');

// 获取DOM元素
const mainWebview = document.getElementById('main-webview');
const settingsPanel = document.getElementById('settings-panel');
const settingsButton = document.getElementById('settings-button');
const domainSelect = document.getElementById('domain-select');
const darkModeToggle = document.getElementById('dark-mode-toggle');
const reserveButton = document.getElementById('reserve-button');
const minimizeButton = document.getElementById('minimize-button');
const maximizeButton = document.getElementById('maximize-button');
const closeButton = document.getElementById('close-button');

// 存储当前设置
let currentSettings = { domain: 'cn', darkMode: false };

// 窗口控制 - 简化事件处理
minimizeButton.addEventListener('click', (e) => {
  e.preventDefault();
  e.stopPropagation();
  try {
    ipcRenderer.send('minimize-window');
  } catch (error) {
    console.error('最小化失败:', error);
  }
});

maximizeButton.addEventListener('click', (e) => {
  e.preventDefault();
  e.stopPropagation();
  try {
    ipcRenderer.send('maximize-window');
  } catch (error) {
    console.error('最大化失败:', error);
  }
});

closeButton.addEventListener('click', (e) => {
  e.preventDefault();
  e.stopPropagation();
  try {
    ipcRenderer.send('close-window');
  } catch (error) {
    console.error('关闭失败:', error);
  }
});

// 标题栏拖拽 - 完整实现
const titleBar = document.getElementById('title-bar');
let isDragging = false;
let offsetX = 0;
let offsetY = 0;

titleBar.addEventListener('mousedown', async (e) => {
  // 排除按钮区域，防止点击按钮时触发拖拽
  if (e.target.closest('.title-bar-button') || 
      e.target.closest('#settings-panel')) {
    return;
  }
  
  // 只在标题栏区域（非按钮）时开始拖拽
  if (e.target === titleBar || 
      e.target === document.getElementById('app-title') || 
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

// 设置面板
settingsButton.addEventListener('click', (e) => {
  e.preventDefault();
  e.stopPropagation();
  settingsPanel.classList.toggle('open');
});

// 预约按钮 - 根据服务器打开对应的预约页面
reserveButton.addEventListener('click', (e) => {
  e.preventDefault();
  e.stopPropagation();
  
  // 根据当前服务器选择对应的预约页面
  const reserveUrl = currentSettings.domain === 'cn' 
    ? 'https://www.trae.cn/ide/download#solo-download' 
    : 'https://www.trae.ai/download#solo-download';
  
  ipcRenderer.send('open-external-window', reserveUrl);
});

// 加载设置
ipcRenderer.send('get-settings');
ipcRenderer.on('settings', (event, settings) => {
  currentSettings = settings;
  domainSelect.value = settings.domain;
  darkModeToggle.checked = settings.darkMode;
  updateTheme(settings.darkMode);
  updateDomain(settings.domain);
});

// 域名切换
domainSelect.addEventListener('change', (e) => {
  const domain = e.target.value;
  currentSettings.domain = domain;
  ipcRenderer.send('update-settings', { domain });
  updateDomain(domain);
});

// 深色模式切换
darkModeToggle.addEventListener('change', (e) => {
  const darkMode = e.target.checked;
  currentSettings.darkMode = darkMode;
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
  
  // 更新图标
  const appIcon = document.getElementById('app-icon');
  if (appIcon) {
    appIcon.src = darkMode ? 'src/dark.png' : 'src/light.png';
  }
  
  // 更新窗口图标
  ipcRenderer.send('update-window-icon', darkMode);
}

// 更新域名
function updateDomain(domain) {
  const url = domain === 'cn' ? 'https://solo.trae.cn/' : 'https://solo.trae.ai/';
  mainWebview.src = url;
}
