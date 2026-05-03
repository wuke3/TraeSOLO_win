function setupTitleBarDrag(options = {}) {
  const {
    titleBarId = 'title-bar',
    appTitleId = 'app-title',
    appIconId = 'app-icon',
    buttonClass = 'title-bar-button',
    excludePanelId = 'settings-panel'
  } = options;

  const titleBar = document.getElementById(titleBarId);
  if (!titleBar) {
    console.error('[TitleBarDrag] Title bar element not found');
    return;
  }

  let isDragging = false;
  let dragStartWindowX = 0;
  let dragStartWindowY = 0;
  let dragStartCursorX = 0;
  let dragStartCursorY = 0;

  const handleMouseDown = async (e) => {
    if (e.target.closest('.' + buttonClass) || 
        (excludePanelId && e.target.closest('#' + excludePanelId))) {
      return;
    }

    if (e.target === titleBar || 
        e.target === document.getElementById(appTitleId) || 
        e.target.id === appIconId) {
      
      isDragging = true;

      try {
        const cursorPos = await window.electronAPI.invoke('get-cursor-position');
        const winPos = await window.electronAPI.invoke('get-window-position');
        
        dragStartCursorX = cursorPos.x;
        dragStartCursorY = cursorPos.y;
        dragStartWindowX = winPos[0];
        dragStartWindowY = winPos[1];
      } catch (err) {
        console.error('[TitleBarDrag] Failed to get position:', err);
        isDragging = false;
      }
    }
  };

  const handleMouseMove = async (e) => {
    if (!isDragging) return;

    try {
      const cursorPos = await window.electronAPI.invoke('get-cursor-position');
      const dx = cursorPos.x - dragStartCursorX;
      const dy = cursorPos.y - dragStartCursorY;
      window.electronAPI.send('set-window-position', dragStartWindowX + dx, dragStartWindowY + dy);
    } catch (err) {
      console.error('[TitleBarDrag] Failed to move window:', err);
    }
  };

  const handleMouseUp = () => {
    if (isDragging) {
      isDragging = false;
    }
  };

  titleBar.addEventListener('mousedown', handleMouseDown);
  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', handleMouseUp);

  return () => {
    titleBar.removeEventListener('mousedown', handleMouseDown);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { setupTitleBarDrag };
}
