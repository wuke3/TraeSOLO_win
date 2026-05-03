const { app } = require('electron');
const path = require('path');
const fs = require('fs');
const { createLogger } = require('../utils/logger');
const { SETTINGS_FILENAME, DEFAULT_SETTINGS, SETTINGS_WHITELIST } = require('../config/constants');

const logger = createLogger('Settings');

const settingsPath = path.join(app.getPath('userData'), SETTINGS_FILENAME);
let currentSettings = null;

function readSettings() {
  try {
    if (fs.existsSync(settingsPath)) {
      const data = fs.readFileSync(settingsPath, 'utf8');
      const parsed = JSON.parse(data);
      const filtered = {};
      for (const key of SETTINGS_WHITELIST) {
        if (parsed[key] !== undefined) {
          filtered[key] = parsed[key];
        }
      }
      currentSettings = { ...DEFAULT_SETTINGS, ...filtered };
      logger.debug('Settings loaded', currentSettings);
      return currentSettings;
    }
  } catch (error) {
    logger.error('Failed to read settings', { error: error.message });
  }
  
  currentSettings = { ...DEFAULT_SETTINGS };
  logger.debug('Using default settings', currentSettings);
  return currentSettings;
}

function saveSettings(settings) {
  try {
    const filtered = {};
    for (const key of Object.keys(settings)) {
      if (SETTINGS_WHITELIST.includes(key)) {
        filtered[key] = settings[key];
      } else {
        logger.warn('Rejected non-whitelisted setting key', { key });
      }
    }
    currentSettings = { ...currentSettings, ...filtered };
    fs.writeFileSync(settingsPath, JSON.stringify(currentSettings, null, 2));
    logger.debug('Settings saved', currentSettings);
    return currentSettings;
  } catch (error) {
    logger.error('Failed to save settings', { error: error.message });
    throw error;
  }
}

function getSettings() {
  if (!currentSettings) {
    readSettings();
  }
  return currentSettings;
}

module.exports = {
  readSettings,
  saveSettings,
  getSettings
};
