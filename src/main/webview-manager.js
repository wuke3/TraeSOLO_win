const { app, dialog, BrowserWindow } = require('electron');
const { createLogger } = require('../utils/logger');
const { isExternalLink } = require('../utils/validators');
const { createExternalWindow, getMainWindow } = require('./window-manager');

const logger = createLogger('WebviewManager');

function injectHideScrollbarCSS(contents) {
  contents.executeJavaScript(`
    (function() {
      if (document.getElementById('hide-scrollbar-style')) {
        return;
      }
      const style = document.createElement('style');
      style.id = 'hide-scrollbar-style';
      style.textContent = \`
        ::-webkit-scrollbar {
          display: none !important;
        }
        html, body {
          scrollbar-width: none !important;
          -ms-overflow-style: none !important;
        }
        * {
          scrollbar-width: none !important;
          -ms-overflow-style: none !important;
        }
      \`;
      document.head.appendChild(style);
    })();
  `).catch(err => {
    logger.warn('Failed to inject scrollbar CSS', { error: err.message });
  });
}

function injectClickHandler(contents) {
  contents.executeJavaScript(`
    (function() {
      document.addEventListener('click', function(e) {
        let target = e.target;
        while (target && target !== document) {
          if (target.tagName === 'BUTTON' || 
              target.tagName === 'A' ||
              target.classList.contains('button-utcdjo') ||
              target.classList.contains('label-mfBJsy')) {
            
            if (target.classList.contains('button-utcdjo')) {
              const parentA = target.closest('a');
              if (parentA && parentA.href) {
                e.preventDefault();
                e.stopPropagation();
                
                if (window.ipcRenderer) {
                  window.ipcRenderer.send('webview-button-click', parentA.href);
                } else {
                  window.parent.postMessage({ type: 'webview-button-click', url: parentA.href }, '*');
                }
                return;
              }
            }
            break;
          }
          target = target.parentElement;
        }
      }, true);
    })();
  `).catch(err => {
    logger.warn('Failed to inject click handler', { error: err.message });
  });
}

function setupWebviewEvents() {
  app.on('web-contents-created', (event, contents) => {
    const isWebview = contents.getType() === 'webview';
    
    if (isWebview) {
      logger.debug('Webview created');
      
      contents.on('did-start-loading', () => {
        injectHideScrollbarCSS(contents);
      });
      
      contents.on('dom-ready', () => {
        injectHideScrollbarCSS(contents);
        injectClickHandler(contents);
      });
      
      contents.on('will-download', async (event, item, webContents) => {
        event.preventDefault();
        
        try {
          const hostWebContents = webContents.hostWebContents;
          const win = hostWebContents ? BrowserWindow.fromWebContents(hostWebContents) : getMainWindow();
          
          const { filePath, canceled } = await dialog.showSaveDialog(win || getMainWindow(), {
            title: '保存文件',
            defaultPath: item.getFilename()
          });
          
          if (canceled) {
            return;
          }
          
          item.setSavePath(filePath);
          
          item.on('done', (event, state) => {
            if (state !== 'completed') {
              logger.error('Download failed', { state });
            } else {
              logger.info('Download completed', { filePath });
            }
          });
          
        } catch (error) {
          logger.error('Download handler error', { error: error.message });
        }
      });
      
      contents.on('new-window', (event, navigationUrl) => {
        logger.debug('New window requested', { url: navigationUrl });
        event.preventDefault();
        createExternalWindow(navigationUrl);
      });
      
      contents.on('will-navigate', (event, navigationUrl) => {
        const currentUrl = contents.getURL();
        
        if (isExternalLink(currentUrl, navigationUrl)) {
          logger.debug('External link detected', { currentUrl, navigationUrl });
          event.preventDefault();
          createExternalWindow(navigationUrl);
        }
      });
    }
  });
}

module.exports = {
  setupWebviewEvents
};
