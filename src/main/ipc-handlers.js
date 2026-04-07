const { ipcMain, BrowserWindow, screen, shell } = require('electron');
const path = require('path');
const { createLogger } = require('../utils/logger');
const { validators, isValidDomain, isValidBoolean, isValidUrl } = require('../utils/validators');
const { ICON_PATHS } = require('../config/constants');
const { getSettings, saveSettings } = require('./settings');
const {
  createExternalWindow,
  findWindowByWebContents,
  getAndClearPendingExternalUrl
} = require('./window-manager');

const logger = createLogger('IpcHandlers');

function setupIpcHandlers() {
  logger.debug('Setting up IPC handlers');

  ipcMain.on('get-settings', (event) => {
    const settings = getSettings();
    event.reply('settings', settings);
  });

  ipcMain.handle('get-current-settings', () => {
    return getSettings();
  });

  ipcMain.handle('get-pending-external-url', () => {
    return getAndClearPendingExternalUrl();
  });

  ipcMain.on('update-settings', (event, newSettings) => {
    try {
      const validated = {};
      
      if (newSettings.domain !== undefined && isValidDomain(newSettings.domain)) {
        validated.domain = newSettings.domain;
      }
      
      if (newSettings.darkMode !== undefined && isValidBoolean(newSettings.darkMode)) {
        validated.darkMode = newSettings.darkMode;
      }
      
      const updated = saveSettings(validated);
      event.reply('settings-updated', updated);
    } catch (error) {
      logger.error('Failed to update settings', { error: error.message });
    }
  });

  ipcMain.on('minimize-window', (event) => {
    const win = findWindowByWebContents(event.sender);
    if (win) {
      win.minimize();
    }
  });

  ipcMain.on('maximize-window', (event) => {
    const win = findWindowByWebContents(event.sender);
    if (win) {
      win.isMaximized() ? win.unmaximize() : win.maximize();
    }
  });

  ipcMain.on('close-window', (event) => {
    const win = findWindowByWebContents(event.sender);
    if (win) {
      win.close();
    }
  });

  ipcMain.handle('get-cursor-position', () => {
    const point = screen.getCursorScreenPoint();
    return { x: point.x, y: point.y };
  });

  ipcMain.handle('get-window-position', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) {
      const pos = win.getPosition();
      return [pos[0], pos[1]];
    }
    return [0, 0];
  });

  ipcMain.on('set-window-position', (event, x, y) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win && typeof x === 'number' && typeof y === 'number') {
      win.setPosition(x, y);
    }
  });

  ipcMain.on('update-window-icon', (event, isDark) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win && typeof isDark === 'boolean') {
      const iconPath = isDark ? ICON_PATHS.dark : ICON_PATHS.light;
      win.setIcon(iconPath);
    }
  });

  ipcMain.on('minimize-external-window', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) {
      win.minimize();
    }
  });

  ipcMain.on('maximize-external-window', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) {
      win.isMaximized() ? win.unmaximize() : win.maximize();
    }
  });

  ipcMain.on('close-external-window', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) {
      win.close();
    }
  });

  ipcMain.on('open-external-window', (event, url) => {
    if (isValidUrl(url)) {
      createExternalWindow(url);
    } else {
      logger.warn('Invalid URL for external window', { url });
    }
  });

  ipcMain.on('webview-button-click', (event, url) => {
    if (isValidUrl(url)) {
      createExternalWindow(url);
    } else {
      logger.warn('Invalid URL from webview button', { url });
    }
  });
}

module.exports = {
  setupIpcHandlers
};
