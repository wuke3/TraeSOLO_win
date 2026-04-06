const { ipcRenderer } = require('electron');
const path = require('path');

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

// 窗口控制 - 简化事件处理
minimizeButton.addEventListener('click', (e) => {
  e.preventDefault();
  e.stopPropagation();
  console.log('最小化按钮被点击');
  ipcRenderer.send('minimize-window');
});

maximizeButton.addEventListener('click', (e) => {
  e.preventDefault();
  e.stopPropagation();
  console.log('最大化按钮被点击');
  ipcRenderer.send('maximize-window');
});

closeButton.addEventListener('click', (e) => {
  e.preventDefault();
  e.stopPropagation();
  console.log('关闭按钮被点击');
  ipcRenderer.send('close-window');
});

// 标题栏拖拽
const titleBar = document.getElementById('title-bar');
titleBar.addEventListener('mousedown', (e) => {
  // 排除按钮区域，防止点击按钮时触发拖拽
  if (e.target.closest('.title-bar-button') || 
      e.target.closest('#settings-panel') || 
      e.target.closest('#reserve-modal')) {
    return;
  }
  
  // 只在标题栏区域（非按钮）时开始拖拽
  if (e.target === titleBar || e.target === document.getElementById('app-title')) {
    // 简单直接的方式：使用remote模块（临时解决方案）
    try {
      const { remote } = require('electron');
      remote.getCurrentWindow().startDrag();
    } catch (err) {
      console.log('拖拽功能不可用:', err);
    }
  }
});

// 设置面板
settingsButton.addEventListener('click', (e) => {
  e.preventDefault();
  e.stopPropagation();
  console.log('设置按钮被点击');
  settingsPanel.classList.toggle('open');
  console.log('设置面板状态:', settingsPanel.classList.contains('open'));
});

// 预约弹窗
reserveButton.addEventListener('click', (e) => {
  e.preventDefault();
  e.stopPropagation();
  console.log('预约按钮被点击');
  reserveModal.classList.add('open');
});

// 为预约弹窗关闭按钮添加点击事件
reserveModalClose.addEventListener('click', (e) => {
  e.preventDefault();
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
  ipcRenderer.send('create-external-window', url);
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

// 音频播放函数
function playAudio(audioType) {
  try {
    // 使用相对路径播放音频
    const audio = new Audio(`src/${audioType}.mp3`);
    audio.play().catch(error => {
      console.error(`播放${audioType}.mp3失败:`, error);
    });
  } catch (error) {
    console.error('音频播放错误:', error);
  }
}

// 监控内嵌页面的控制台输出
mainWebview.addEventListener('console-message', (e) => {
  const message = e.message;
  console.log('内嵌页面控制台输出:', message);
  
  // 检查成功消息模式
  if (message.includes('terminal event detected: done')) {
    console.log('检测到成功输出，播放success.mp3');
    playAudio('success');
  }
  
  // 检查错误消息模式
  if (message.includes('net::ERR_') || message.includes('error') || message.includes('Failed')) {
    console.log('检测到错误输出，播放error.mp3');
    playAudio('error');
  }
});

// 同样为预约窗口添加控制台监控
reserveWebview.addEventListener('console-message', (e) => {
  const message = e.message;
  console.log('预约窗口控制台输出:', message);
  
  // 检查成功消息模式
  if (message.includes('terminal event detected: done')) {
    console.log('检测到成功输出，播放success.mp3');
    playAudio('success');
  }
  
  // 检查错误消息模式
  if (message.includes('net::ERR_') || message.includes('error') || message.includes('Failed')) {
    console.log('检测到错误输出，播放error.mp3');
    playAudio('error');
  }
});