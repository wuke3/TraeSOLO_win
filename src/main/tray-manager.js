const { app, Tray, Menu, nativeImage } = require('electron');
const path = require('path');
const { createLogger } = require('../utils/logger');
const { ICON_PATHS } = require('../config/constants');
const { getSettings } = require('./settings');

const logger = createLogger('TrayManager');

let tray = null;
let onShowMainWindow = null;
let onQuitApp = null;

function createTrayIcon() {
  const settings = getSettings();
  const iconPath = settings.darkMode ? ICON_PATHS.dark : ICON_PATHS.light;
  let icon;
  
  try {
    icon = nativeImage.createFromPath(iconPath);
    if (icon.isEmpty()) {
      logger.warn('Tray icon is empty, falling back');
      return null;
    }
    return icon.resize({ width: 16, height: 16 });
  } catch (error) {
    logger.error('Failed to create tray icon', { error: error.message });
    return null;
  }
}

function createTrayMenu() {
  const template = [
    {
      label: '显示主窗口',
      click: () => {
        if (typeof onShowMainWindow === 'function') {
          onShowMainWindow();
        }
        logger.debug('Tray: Show main window clicked');
      }
    },
    {
      type: 'separator'
    },
    {
      label: '退出',
      click: () => {
        logger.info('Tray: Quit clicked');
        if (typeof onQuitApp === 'function') {
          onQuitApp();
        }
      }
    }
  ];
  
  return Menu.buildFromTemplate(template);
}

function setupTray(callbacks) {
  if (tray) {
    logger.debug('Tray already exists, skipping setup');
    return;
  }

  if (callbacks) {
    onShowMainWindow = callbacks.onShowMainWindow || null;
    onQuitApp = callbacks.onQuitApp || null;
  }

  const icon = createTrayIcon();
  if (!icon) {
    logger.error('Failed to create tray icon, aborting tray setup');
    return;
  }

  try {
    tray = new Tray(icon);
    tray.setToolTip('TRAE SOLO Win');
    
    tray.setContextMenu(createTrayMenu());
    
    tray.on('click', () => {
      logger.debug('Tray clicked');
      if (typeof onShowMainWindow === 'function') {
        onShowMainWindow('toggle');
      }
    });

    tray.on('double-click', () => {
      logger.debug('Tray double-clicked');
      if (typeof onShowMainWindow === 'function') {
        onShowMainWindow('show');
      }
    });

    logger.info('Tray setup complete');
  } catch (error) {
    logger.error('Failed to setup tray', { error: error.message });
    tray = null;
  }
}

function updateTrayIcon() {
  if (!tray) return;
  
  const icon = createTrayIcon();
  if (icon) {
    tray.setImage(icon);
    logger.debug('Tray icon updated');
  }
}

function destroyTray() {
  if (tray) {
    tray.destroy();
    tray = null;
    logger.info('Tray destroyed');
  }
}

function getTray() {
  return tray;
}

module.exports = {
  setupTray,
  updateTrayIcon,
  destroyTray,
  getTray
};
