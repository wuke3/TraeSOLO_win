const { app } = require('electron');
const path = require('path');
const fs = require('fs');
const { createLogger } = require('../utils/logger');
const { SETTINGS_FILENAME, DEFAULT_SETTINGS } = require('../config/constants');

const logger = createLogger('Settings');

const settingsPath = path.join(app.getPath('userData'), SETTINGS_FILENAME);
let currentSettings = null;

function readSettings() {
  try {
    if (fs.existsSync(settingsPath)) {
      const data = fs.readFileSync(settingsPath, 'utf8');
      const parsed = JSON.parse(data);
      currentSettings = { ...DEFAULT_SETTINGS, ...parsed };
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
    currentSettings = { ...currentSettings, ...settings };
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
