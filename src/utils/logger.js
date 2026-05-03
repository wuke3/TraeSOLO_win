const fs = require('fs');
const path = require('path');
const { app } = require('electron');

const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3
};

const LOG_LEVEL_NAMES = ['DEBUG', 'INFO', 'WARN', 'ERROR'];

const MAX_LOG_SIZE = 5 * 1024 * 1024;
const MAX_LOG_FILES = 5;

let logDir = null;
let currentLogFile = null;

function ensureLogDir() {
  if (!logDir) {
    try {
      logDir = path.join(app.getPath('userData'), 'logs');
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
    } catch (error) {
      console.error('Failed to create log directory:', error.message);
      return null;
    }
  }
  return logDir;
}

function getLogFilePath() {
  const dir = ensureLogDir();
  if (!dir) return null;
  const date = new Date().toISOString().split('T')[0];
  return path.join(dir, `app-${date}.log`);
}

function rotateLogs() {
  const dir = ensureLogDir();
  if (!dir) return;
  try {
    const files = fs.readdirSync(dir)
      .filter(f => f.startsWith('app-') && f.endsWith('.log'))
      .sort()
      .reverse();
    while (files.length > MAX_LOG_FILES) {
      const toDelete = files.pop();
      fs.unlinkSync(path.join(dir, toDelete));
    }
  } catch (error) {
    console.error('Log rotation failed:', error.message);
  }
}

function writeToFile(formatted) {
  const filePath = getLogFilePath();
  if (!filePath) return;
  try {
    if (filePath !== currentLogFile) {
      currentLogFile = filePath;
      rotateLogs();
    }
    fs.appendFileSync(filePath, formatted + '\n');
  } catch (error) {
    console.error('Failed to write log file:', error.message);
  }
}

class Logger {
  constructor(moduleName = 'App') {
    this.moduleName = moduleName;
    this.currentLevel = process.env.NODE_ENV === 'production' ? LOG_LEVELS.INFO : LOG_LEVELS.DEBUG;
  }

  formatMessage(level, message, meta = null) {
    const timestamp = new Date().toISOString();
    const levelName = LOG_LEVEL_NAMES[level];
    let formatted = `[${timestamp}] [${levelName}] [${this.moduleName}] ${message}`;
    
    if (meta !== null) {
      try {
        const metaStr = typeof meta === 'object' ? JSON.stringify(meta) : String(meta);
        formatted += ` | ${metaStr}`;
      } catch (e) {
        formatted += ` | [Meta serialization failed]`;
      }
    }
    
    return formatted;
  }

  log(level, message, meta = null) {
    if (level >= this.currentLevel) {
      const formatted = this.formatMessage(level, message, meta);
      
      if (level >= LOG_LEVELS.ERROR) {
        console.error(formatted);
      } else if (level >= LOG_LEVELS.WARN) {
        console.warn(formatted);
      } else {
        console.log(formatted);
      }

      if (level >= LOG_LEVELS.INFO) {
        writeToFile(formatted);
      }
    }
  }

  debug(message, meta = null) {
    this.log(LOG_LEVELS.DEBUG, message, meta);
  }

  info(message, meta = null) {
    this.log(LOG_LEVELS.INFO, message, meta);
  }

  warn(message, meta = null) {
    this.log(LOG_LEVELS.WARN, message, meta);
  }

  error(message, meta = null) {
    this.log(LOG_LEVELS.ERROR, message, meta);
  }
}

function createLogger(moduleName) {
  return new Logger(moduleName);
}

module.exports = {
  Logger,
  createLogger,
  LOG_LEVELS
};
