const { app, globalShortcut } = require('electron');
const { createLogger } = require('../utils/logger');
const { readSettings, saveSettings, getSettings } = require('./settings');
const {
  createMainWindow,
  getMainWindow,
  unregisterAllShortcuts,
  quitApp
} = require('./window-manager');
const { setupIpcHandlers } = require('./ipc-handlers');
const { setupWebviewEvents } = require('./webview-manager');
const { setupTray, updateTrayIcon, destroyTray } = require('./tray-manager');
const { IS_DEV } = require('../config/constants');

const logger = createLogger('Main');

const GLOBAL_SHORTCUT_ACCELERATOR = 'CommandOrControl+Shift+S';

function setupSingleInstanceLock() {
  const gotTheLock = app.requestSingleInstanceLock();
  
  if (!gotTheLock) {
    logger.info('Another instance is running, quitting');
    app.quit();
    return false;
  }
  
  app.on('second-instance', () => {
    logger.info('Second instance detected, focusing main window');
    const mainWindow = getMainWindow();
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      if (!mainWindow.isVisible()) mainWindow.show();
      mainWindow.focus();
    }
  });
  
  return true;
}

function registerGlobalShortcut() {
  try {
    const ret = globalShortcut.register(GLOBAL_SHORTCUT_ACCELERATOR, () => {
      logger.debug('Global shortcut triggered');
      const mainWindow = getMainWindow();
      if (mainWindow) {
        if (mainWindow.isMinimized()) mainWindow.restore();
        if (mainWindow.isVisible()) {
          mainWindow.hide();
        } else {
          mainWindow.show();
          mainWindow.focus();
        }
      }
    });
    if (ret) {
      logger.info('Global shortcut registered', { accelerator: GLOBAL_SHORTCUT_ACCELERATOR });
    } else {
      logger.warn('Global shortcut registration failed', { accelerator: GLOBAL_SHORTCUT_ACCELERATOR });
    }
  } catch (error) {
    logger.error('Global shortcut error', { error: error.message });
  }
}

function saveWindowBounds() {
  const mainWindow = getMainWindow();
  if (mainWindow) {
    try {
      const bounds = mainWindow.getBounds();
      saveSettings({ windowBounds: bounds });
    } catch (error) {
      logger.error('Failed to save window bounds', { error: error.message });
    }
  }
}

function setupAppEvents() {
  app.on('ready', () => {
    logger.info('App ready');
    readSettings();
    setupIpcHandlers();
    setupWebviewEvents();
    createMainWindow();
    setupTray({
      onShowMainWindow: (mode) => {
        const mainWindow = getMainWindow();
        if (mainWindow) {
          if (mainWindow.isMinimized()) mainWindow.restore();
          if (mode === 'show') {
            mainWindow.show();
            mainWindow.focus();
          } else {
            if (mainWindow.isVisible()) {
              mainWindow.hide();
            } else {
              mainWindow.show();
              mainWindow.focus();
            }
          }
        }
      },
      onQuitApp: () => {
        quitApp();
      }
    });
    registerGlobalShortcut();

    const settings = getSettings();
    if (settings.autoStart) {
      app.setLoginItemSettings({
        openAtLogin: true,
        path: app.getPath('exe')
      });
    }
  });

  app.on('window-all-closed', () => {
    logger.info('All windows closed');
    saveWindowBounds();
    unregisterAllShortcuts();
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('before-quit', () => {
    logger.info('App before-quit');
    saveWindowBounds();
    destroyTray();
  });

  app.on('will-quit', () => {
    logger.info('App will quit');
    unregisterAllShortcuts();
    globalShortcut.unregisterAll();
  });

  app.on('activate', () => {
    if (getMainWindow() === null) {
      createMainWindow();
    }
  });
}

function init() {
  logger.info('Initializing app', { isDev: IS_DEV });
  
  if (!setupSingleInstanceLock()) {
    return;
  }
  
  setupAppEvents();
}

init();
