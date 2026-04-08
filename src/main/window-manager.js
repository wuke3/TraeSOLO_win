const { app, BrowserWindow, globalShortcut, screen } = require('electron');
const path = require('path');
const { createLogger } = require('../utils/logger');
const { WINDOW_CONFIG, ICON_PATHS } = require('../config/constants');
const { getSettings } = require('./settings');

const logger = createLogger('WindowManager');

let mainWindow = null;
let externalWindows = [];
let pendingExternalUrl = null;

const isDev = process.env.NODE_ENV !== 'production';

function createWindowOptions(type) {
  const config = type === 'external' ? WINDOW_CONFIG.external : WINDOW_CONFIG.main;
  const settings = getSettings();
  
  return {
    width: config.width,
    height: config.height,
    minWidth: config.minWidth,
    minHeight: config.minHeight,
    frame: false,
    icon: type === 'external' 
      ? (settings.darkMode ? ICON_PATHS.dark : ICON_PATHS.light)
      : ICON_PATHS.light,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      devTools: isDev,
      webviewTag: true
    }
  };
}

function createMainWindow() {
  logger.info('Creating main window');
  
  mainWindow = new BrowserWindow(createWindowOptions('main'));
  mainWindow.loadFile('index.html');

  mainWindow.on('close', function (event) {
    const settings = getSettings();
    if (settings.closeToTray && mainWindow && !mainWindow.isQuitting) {
      logger.info('Main window close intercepted, hiding to tray');
      event.preventDefault();
      mainWindow.hide();
    }
  });

  mainWindow.on('closed', function () {
    logger.info('Main window closed');
    mainWindow = null;
  });

  if (isDev) {
    globalShortcut.register('F12', () => {
      if (mainWindow) {
        mainWindow.webContents.toggleDevTools();
      }
    });

    globalShortcut.register('CommandOrControl+Shift+I', () => {
      if (mainWindow) {
        mainWindow.webContents.toggleDevTools();
      }
    });
  }

  return mainWindow;
}

function createExternalWindow(url) {
  logger.info('Creating external window', { url });
  
  const win = new BrowserWindow(createWindowOptions('external'));
  win.loadFile('external-window.html');

  win.webContents.once('dom-ready', () => {
    win.webContents.executeJavaScript(`
      const webview = document.getElementById('external-webview');
      if (webview) {
        webview.src = '${url}';
      }
    `).catch(err => {
      logger.error('Failed to set webview src', { error: err.message });
    });
  });

  win.webContents.on('before-input-event', (event, input) => {
    if (isDev && input.key === 'F12') {
      event.preventDefault();
      win.webContents.toggleDevTools();
    }
  });

  win.on('closed', () => {
    logger.info('External window closed');
    externalWindows = externalWindows.filter(w => w !== win);
  });

  externalWindows.push(win);
  return win;
}

function getMainWindow() {
  return mainWindow;
}

function getExternalWindows() {
  return externalWindows;
}

function setPendingExternalUrl(url) {
  pendingExternalUrl = url;
}

function getAndClearPendingExternalUrl() {
  const url = pendingExternalUrl;
  pendingExternalUrl = null;
  return url;
}

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

function unregisterAllShortcuts() {
  globalShortcut.unregisterAll();
}

function quitApp() {
  logger.info('Quitting app');
  const { destroyTray } = require('./tray-manager');
  destroyTray();
  if (mainWindow) {
    mainWindow.isQuitting = true;
    mainWindow.close();
  } else {
    app.quit();
  }
}

module.exports = {
  createMainWindow,
  createExternalWindow,
  getMainWindow,
  getExternalWindows,
  setPendingExternalUrl,
  getAndClearPendingExternalUrl,
  findWindowByWebContents,
  unregisterAllShortcuts,
  quitApp
};
