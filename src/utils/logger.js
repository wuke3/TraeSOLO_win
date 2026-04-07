const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3
};

const LOG_LEVEL_NAMES = ['DEBUG', 'INFO', 'WARN', 'ERROR'];

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
