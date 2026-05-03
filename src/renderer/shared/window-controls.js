function setupWindowControls(options = {}) {
  const {
    minimizeBtnId = 'minimize-button',
    maximizeBtnId = 'maximize-button',
    closeBtnId = 'close-button',
    isExternal = false
  } = options;

  const prefix = isExternal ? 'external-' : '';

  const minimizeButton = document.getElementById(minimizeBtnId);
  const maximizeButton = document.getElementById(maximizeBtnId);
  const closeButton = document.getElementById(closeBtnId);

  const handlers = {};

  if (minimizeButton) {
    handlers.minimize = (e) => {
      e.preventDefault();
      e.stopPropagation();
      try {
        window.electronAPI.send(`minimize-${prefix}window`);
      } catch (error) {
        console.error('[WindowControls] minimize failed:', error);
      }
    };
    minimizeButton.addEventListener('click', handlers.minimize);
  }

  if (maximizeButton) {
    handlers.maximize = (e) => {
      e.preventDefault();
      e.stopPropagation();
      try {
        window.electronAPI.send(`maximize-${prefix}window`);
      } catch (error) {
        console.error('[WindowControls] maximize failed:', error);
      }
    };
    maximizeButton.addEventListener('click', handlers.maximize);
  }

  if (closeButton) {
    handlers.close = (e) => {
      e.preventDefault();
      e.stopPropagation();
      try {
        window.electronAPI.send(`close-${prefix}window`);
      } catch (error) {
        console.error('[WindowControls] close failed:', error);
      }
    };
    closeButton.addEventListener('click', handlers.close);
  }

  return () => {
    if (minimizeButton && handlers.minimize) {
      minimizeButton.removeEventListener('click', handlers.minimize);
    }
    if (maximizeButton && handlers.maximize) {
      maximizeButton.removeEventListener('click', handlers.maximize);
    }
    if (closeButton && handlers.close) {
      closeButton.removeEventListener('click', handlers.close);
    }
  };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { setupWindowControls };
}
