const { app, BrowserWindow, ipcMain, dialog, globalShortcut, shell, screen } = require('electron');
const path = require('path');
const fs = require('fs');

// 读取和保存设置
const settingsPath = path.join(app.getPath('userData'), 'settings.json');

function readSettings() {
  try {
    if (fs.existsSync(settingsPath)) {
      const data = fs.readFileSync(settingsPath, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('读取设置失败:', error);
  }
  return {
    domain: 'cn', // 默认使用国内版
    darkMode: false
  };
}

function saveSettings(settings) {
  try {
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
  } catch (error) {
    console.error('保存设置失败:', error);
  }
}

// 全局变量
let mainWindow;
let externalWindows = [];
let settings = readSettings();
let pendingExternalUrl = null;

// 创建主窗口
function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    frame: false,
    icon: path.join(__dirname, 'src', 'light.png'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      devTools: true,
      webviewTag: true
    }
  });

  // 加载HTML文件
  mainWindow.loadFile('index.html');

  // 窗口关闭时触发
  mainWindow.on('closed', function () {
    mainWindow = null;
  });

  // 注册F12快捷键打开开发者工具（可选，保留用于调试）
  globalShortcut.register('F12', () => {
    if (mainWindow) {
      mainWindow.webContents.toggleDevTools();
    }
  });

  // 注册Ctrl+Shift+I快捷键也可以打开开发者工具
  globalShortcut.register('CommandOrControl+Shift+I', () => {
    if (mainWindow) {
      mainWindow.webContents.toggleDevTools();
    }
  });
}

// 应用就绪时创建窗口
app.on('ready', createMainWindow);

// 所有窗口关闭时退出应用
app.on('window-all-closed', function () {
  globalShortcut.unregisterAll();
  if (process.platform !== 'darwin') app.quit();
});

// 应用退出时注销快捷键
app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

// 创建外部链接窗口
function createExternalWindow(url) {
  const win = new BrowserWindow({
    width: 1000,
    height: 700,
    frame: false,
    icon: path.join(__dirname, 'src', settings.darkMode ? 'dark.png' : 'light.png'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      devTools: true,
      webviewTag: true
    }
  });

  // 先加载 external-window.html
  win.loadFile('external-window.html');

  // 等待页面加载完成，然后设置 webview 的 src
  win.webContents.once('dom-ready', () => {
    win.webContents.executeJavaScript(`
      const webview = document.getElementById('external-webview');
      if (webview) {
        webview.src = '${url}';
      }
    `).catch(err => {
      console.error('设置 webview src 失败:', err);
    });
  });

  externalWindows.push(win);
  
  // 也为外部窗口添加F12快捷键支持
  win.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'F12') {
      event.preventDefault();
      win.webContents.toggleDevTools();
    }
  });
  
  win.on('closed', () => {
    externalWindows = externalWindows.filter(w => w !== win);
  });
}

// 辅助函数：根据 webContents 找到对应的窗口
function findWindowByWebContents(webContents) {
  if (mainWindow && mainWindow.webContents === webContents) {
    return mainWindow;
  }
  for (const win of externalWindows) {
    if (win.webContents === webContents) {
      return win;
    }
  }
  return null;
}

// macOS 上点击 Dock 图标时重新创建窗口
app.on('activate', function () {
  if (mainWindow === null) createMainWindow();
});

// 处理设置相关的IPC通信
ipcMain.on('get-settings', (event) => {
  event.reply('settings', settings);
});

// 获取当前设置（异步）
ipcMain.handle('get-current-settings', () => {
  return settings;
});

// 外部窗口请求获取 URL
ipcMain.handle('get-pending-external-url', () => {
  const url = pendingExternalUrl;
  pendingExternalUrl = null;
  return url;
});

ipcMain.on('update-settings', (event, newSettings) => {
  settings = { ...settings, ...newSettings };
  saveSettings(settings);
  event.reply('settings-updated', settings);
});

// 处理窗口控制IPC通信
ipcMain.on('minimize-window', (event) => {
  if (mainWindow) {
    mainWindow.minimize();
  }
});

ipcMain.on('maximize-window', (event) => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.on('close-window', (event) => {
  if (mainWindow) {
    mainWindow.close();
  }
});

// 获取鼠标位置
ipcMain.handle('get-cursor-position', () => {
  const point = screen.getCursorScreenPoint();
  return { x: point.x, y: point.y };
});

// 获取窗口位置
ipcMain.handle('get-window-position', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win) {
    const pos = win.getPosition();
    return [pos[0], pos[1]];
  }
  return [0, 0];
});

// 设置窗口位置
ipcMain.on('set-window-position', (event, x, y) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win) {
    win.setPosition(x, y);
  }
});

// 更新窗口图标
ipcMain.on('update-window-icon', (event, isDark) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win) {
    const iconPath = isDark 
      ? path.join(__dirname, 'src', 'dark.png') 
      : path.join(__dirname, 'src', 'light.png');
    win.setIcon(iconPath);
  }
});

// 处理外部窗口控制
ipcMain.on('minimize-external-window', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win) {
    win.minimize();
  }
});

ipcMain.on('maximize-external-window', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win) {
    if (win.isMaximized()) {
      win.unmaximize();
    } else {
      win.maximize();
    }
  }
});

ipcMain.on('close-external-window', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win) {
    win.close();
  }
});

// 打开外部窗口（从渲染进程调用）
ipcMain.on('open-external-window', (event, url) => {
  createExternalWindow(url);
});

// 处理 webview 内按钮点击事件
ipcMain.on('webview-button-click', (event, url) => {
  createExternalWindow(url);
});

// 监听所有 webview 的事件
app.on('web-contents-created', (event, contents) => {
  // 检查是否是 webview（不是窗口的主 webContents）
  const isWebview = contents.getType() === 'webview';
  
  if (isWebview) {
    // 注入隐藏滚动条的 CSS 函数
    function injectHideScrollbarCSS() {
      contents.executeJavaScript(`
        (function() {
          if (document.getElementById('hide-scrollbar-style')) {
            return;
          }
          const style = document.createElement('style');
          style.id = 'hide-scrollbar-style';
          style.textContent = \`
            ::-webkit-scrollbar {
              display: none !important;
            }
            html, body {
              scrollbar-width: none !important;
              -ms-overflow-style: none !important;
            }
            * {
              scrollbar-width: none !important;
              -ms-overflow-style: none !important;
            }
          \`;
          document.head.appendChild(style);
        })();
      `).catch(err => {
        console.error('注入滚动条隐藏 CSS 失败:', err);
      });
    }
    
    // 在页面开始加载时就注入
    contents.on('did-start-loading', () => {
      injectHideScrollbarCSS();
    });
    
    // 在 DOM 准备就绪时也注入
    contents.on('dom-ready', () => {
      injectHideScrollbarCSS();
      
      // 注入代码，监听页面内的所有点击事件
      contents.executeJavaScript(`
        (function() {
          // 监听整个 document 的点击
          document.addEventListener('click', function(e) {
            // 查找最近的按钮或链接元素
            let target = e.target;
            let buttonText = '';
            let linkUrl = '';
            
            // 向上查找，看看是不是需要处理的按钮或链接
            while (target && target !== document) {
              // 检查标签是否是按钮或链接
              if (target.tagName === 'BUTTON' || 
                  target.tagName === 'A' ||
                  target.classList.contains('button-utcdjo') ||
                  target.classList.contains('label-mfBJsy')) {
                
                // 获取按钮文本
                if (target.textContent) {
                  buttonText = target.textContent.trim();
                }
                
                // 检查是否是需要在新窗口打开的按钮样式
                if (target.classList.contains('button-utcdjo')) {
                  // 查找附近的 a 标签
                  const parentA = target.closest('a');
                  if (parentA && parentA.href) {
                    linkUrl = parentA.href;
                    
                    // 阻止默认行为，发送 IPC 消息给主进程
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // 发送消息给主进程
                    if (window.ipcRenderer) {
                      window.ipcRenderer.send('webview-button-click', linkUrl);
                    } else {
                      // 尝试通过 postMessage
                      window.parent.postMessage({ type: 'webview-button-click', url: linkUrl }, '*');
                    }
                    return;
                  }
                }
                
                break;
              }
              target = target.parentElement;
            }
          }, true);
        })();
      `).catch(err => {
        console.error('注入点击监听代码失败:', err);
      });
    });
    
    // 处理下载事件 - 直接在主进程处理
    contents.on('will-download', async (event, item, webContents) => {
      event.preventDefault();
      
      try {
        // 找到拥有这个 webview 的窗口
        const hostWebContents = webContents.hostWebContents;
        const win = hostWebContents ? BrowserWindow.fromWebContents(hostWebContents) : mainWindow;
        
        // 显示保存对话框
        const { filePath, canceled } = await dialog.showSaveDialog(win || mainWindow, {
          title: '保存文件',
          defaultPath: item.getFilename()
        });
        
        if (canceled) {
          return;
        }
        
        // 设置保存路径
        item.setSavePath(filePath);
        
        // 监听下载完成
        item.on('done', (event, state) => {
          if (state !== 'completed') {
            console.error('下载失败或取消:', state);
          }
        });
        
      } catch (error) {
        console.error('下载处理错误:', error);
      }
    });
    
    // 处理新窗口事件 - 使用外部窗口打开
    contents.on('new-window', (event, navigationUrl) => {
      event.preventDefault();
      createExternalWindow(navigationUrl);
    });
    
    // 处理导航事件 - 也捕获那些没有触发 new-window 的链接
    function checkAndOpenExternalLink(navigationUrl) {
      const currentUrl = contents.getURL();
      
      if (!currentUrl || navigationUrl === currentUrl) {
        return false;
      }
      
      try {
        const currentDomain = new URL(currentUrl).hostname;
        const targetDomain = new URL(navigationUrl).hostname;
        
        // 检查当前页面是否是预约页面
        const isReservePage = 
          currentUrl.includes('trae.cn/ide/download') || 
          currentUrl.includes('trae.ai/download');
        
        // 需要在新窗口打开的链接：
        // 1. forum.trae.cn 的链接
        // 2. 非 trae.cn/trae.ai 的外部链接
        // 3. 在预约页面上的所有跳转
        const isExternalLink = 
          isReservePage ||
          targetDomain === 'forum.trae.cn' ||
          (!targetDomain.endsWith('trae.cn') && 
           !targetDomain.endsWith('trae.ai') &&
           targetDomain !== currentDomain &&
           !targetDomain.endsWith('.' + currentDomain));
        
        return isExternalLink;
      } catch (error) {
        console.error('URL解析错误:', error);
        return false;
      }
    }
    
    // will-navigate 事件
    contents.on('will-navigate', (event, navigationUrl) => {
      if (checkAndOpenExternalLink(navigationUrl)) {
        event.preventDefault();
        createExternalWindow(navigationUrl);
      }
    });
  }
});
