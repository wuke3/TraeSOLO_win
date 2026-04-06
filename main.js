const { app, BrowserWindow, ipcMain, dialog } = require('electron');
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
let settings = readSettings();

// 创建主窗口
function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    frame: false, // 无边框
    transparent: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webviewTag: true,
      enableRemoteModule: true
    }
  });

  // 加载HTML文件
  mainWindow.loadFile('index.html');

  // 窗口关闭时触发
  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

// 应用就绪时创建窗口
app.on('ready', createMainWindow);

// 所有窗口关闭时退出应用
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// macOS 上点击 Dock 图标时重新创建窗口
app.on('activate', function () {
  if (mainWindow === null) createMainWindow();
});

// 处理设置相关的IPC通信
ipcMain.on('get-settings', (event) => {
  event.reply('settings', settings);
});

ipcMain.on('update-settings', (event, newSettings) => {
  settings = { ...settings, ...newSettings };
  saveSettings(settings);
  event.reply('settings-updated', settings);
});

// 处理下载请求
ipcMain.on('download-request', async (event, url) => {
  try {
    const { filePath } = await dialog.showSaveDialog(mainWindow, {
      title: '保存文件',
      defaultPath: path.basename(url)
    });
    if (filePath) {
      event.reply('download-path', filePath);
    }
  } catch (error) {
    console.error('下载对话框错误:', error);
  }
});