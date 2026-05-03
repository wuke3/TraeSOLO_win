const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  send: (channel, ...args) => {
    const validChannels = [
      'get-settings',
      'update-settings',
      'minimize-window',
      'maximize-window',
      'close-window',
      'set-window-position',
      'update-window-icon',
      'minimize-external-window',
      'maximize-external-window',
      'close-external-window',
      'open-external-window',
      'webview-button-click'
    ];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, ...args);
    }
  },

  invoke: (channel, ...args) => {
    const validChannels = [
      'get-current-settings',
      'get-pending-external-url',
      'get-cursor-position',
      'get-window-position'
    ];
    if (validChannels.includes(channel)) {
      return ipcRenderer.invoke(channel, ...args);
    }
    return Promise.reject(new Error(`Invalid channel: ${channel}`));
  },

  on: (channel, callback) => {
    const validChannels = ['settings', 'settings-updated', 'load-external-url'];
    if (validChannels.includes(channel)) {
      const subscription = (event, ...args) => callback(...args);
      ipcRenderer.on(channel, subscription);
      return subscription;
    }
    return null;
  },

  removeListener: (channel, subscription) => {
    const validChannels = ['settings', 'settings-updated', 'load-external-url'];
    if (validChannels.includes(channel) && subscription) {
      ipcRenderer.removeListener(channel, subscription);
    }
  },

  removeAllListeners: (channel) => {
    const validChannels = ['settings', 'settings-updated', 'load-external-url'];
    if (validChannels.includes(channel)) {
      ipcRenderer.removeAllListeners(channel);
    }
  }
});
