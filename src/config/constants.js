const path = require('path');

const APP_CONFIG = {
  appId: 'com.trae.solo-win',
  productName: 'TRAE SOLO Win',
  homepage: 'https://www.trae.cn'
};

const WINDOW_CONFIG = {
  main: {
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600
  },
  external: {
    width: 1000,
    height: 700,
    minWidth: 600,
    minHeight: 400
  }
};

const DOMAIN_CONFIG = {
  cn: {
    label: '国内版',
    soloUrl: 'https://solo.trae.cn/',
    reserveUrl: 'https://www.trae.cn/ide/download#solo-download',
    downloadPath: 'trae.cn/ide/download'
  },
  ai: {
    label: '国际版',
    soloUrl: 'https://solo.trae.ai/',
    reserveUrl: 'https://www.trae.ai/download#solo-download',
    downloadPath: 'trae.ai/download'
  }
};

const EXTERNAL_LINK_DOMAINS = {
  forum: 'forum.trae.cn',
  allowedSuffixes: ['trae.cn', 'trae.ai']
};

const THEME_CONFIG = {
  defaultMode: 'light',
  modes: ['light', 'dark']
};

const ICON_PATHS = {
  light: path.join(__dirname, '..', 'light.png'),
  dark: path.join(__dirname, '..', 'dark.png')
};

const SETTINGS_FILENAME = 'settings.json';

const DEFAULT_SETTINGS = {
  domain: 'cn',
  darkMode: false,
  minimizeToTray: true,
  closeToTray: true
};

module.exports = {
  APP_CONFIG,
  WINDOW_CONFIG,
  DOMAIN_CONFIG,
  EXTERNAL_LINK_DOMAINS,
  THEME_CONFIG,
  ICON_PATHS,
  SETTINGS_FILENAME,
  DEFAULT_SETTINGS
};
