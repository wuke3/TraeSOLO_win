const { app } = require('electron');
const { createLogger } = require('../utils/logger');
const { readSettings } = require('./settings');
const {
  createMainWindow,
  unregisterAllShortcuts
} = require('./window-manager');
const { setupIpcHandlers } = require('./ipc-handlers');
const { setupWebviewEvents } = require('./webview-manager');

const logger = createLogger('Main');

const isDev = process.env.NODE_ENV !== 'production';

function setupSingleInstanceLock() {
  const gotTheLock = app.requestSingleInstanceLock();
  
  if (!gotTheLock) {
    logger.info('Another instance is running, quitting');
    app.quit();
    return false;
  }
  
  app.on('second-instance', () => {
    logger.info('Second instance detected, focusing main window');
    const { getMainWindow } = require('./window-manager');
    const mainWindow = getMainWindow();
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
  
  return true;
}

function setupAppEvents() {
  app.on('ready', () => {
    logger.info('App ready');
    readSettings();
    setupIpcHandlers();
    setupWebviewEvents();
    createMainWindow();
  });

  app.on('window-all-closed', () => {
    logger.info('All windows closed');
    unregisterAllShortcuts();
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('will-quit', () => {
    logger.info('App will quit');
    unregisterAllShortcuts();
  });

  app.on('activate', () => {
    const { getMainWindow, createMainWindow } = require('./window-manager');
    if (getMainWindow() === null) {
      createMainWindow();
    }
  });
}

function init() {
  logger.info('Initializing app', { isDev });
  
  if (!setupSingleInstanceLock()) {
    return;
  }
  
  setupAppEvents();
}

init();
