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

  const handleButtonClick = (action) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      window.electronAPI.send(`${action}-${prefix}window`);
    } catch (error) {
      console.error(`[WindowControls] ${action} failed:`, error);
    }
  };

  if (minimizeButton) {
    minimizeButton.addEventListener('click', handleButtonClick('minimize'));
  }

  if (maximizeButton) {
    maximizeButton.addEventListener('click', handleButtonClick('maximize'));
  }

  if (closeButton) {
    closeButton.addEventListener('click', handleButtonClick('close'));
  }

  return () => {
    if (minimizeButton) {
      minimizeButton.removeEventListener('click', handleButtonClick('minimize'));
    }
    if (maximizeButton) {
      maximizeButton.removeEventListener('click', handleButtonClick('maximize'));
    }
    if (closeButton) {
      closeButton.removeEventListener('click', handleButtonClick('close'));
    }
  };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { setupWindowControls };
}
