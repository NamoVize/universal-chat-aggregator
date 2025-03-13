const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electron', {
    // Settings & Authentication
    getUserSettings: () => ipcRenderer.invoke('get-user-settings'),
    saveUserSettings: (settings) => ipcRenderer.invoke('save-user-settings', settings),
    getPlatformAuth: (platform) => ipcRenderer.invoke('get-platform-auth', platform),
    savePlatformAuth: (platform, auth) => ipcRenderer.invoke('save-platform-auth', platform, auth),
    clearPlatformAuth: (platform) => ipcRenderer.invoke('clear-platform-auth', platform),
    
    // System
    platform: process.platform,
    
    // Notifications
    sendNotification: (title, body, options) => {
      ipcRenderer.send('show-notification', { title, body, options });
    },
    
    // Listeners
    on: (channel, callback) => {
      // Whitelist valid channels
      const validChannels = ['error', 'new-message', 'auth-change', 'platform-message', 'connection-status'];
      if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender` 
        ipcRenderer.on(channel, (event, ...args) => callback(...args));
      }
    },
    
    once: (channel, callback) => {
      const validChannels = ['error', 'new-message', 'auth-change', 'platform-message', 'connection-status'];
      if (validChannels.includes(channel)) {
        ipcRenderer.once(channel, (event, ...args) => callback(...args));
      }
    },
    
    removeListener: (channel, callback) => {
      const validChannels = ['error', 'new-message', 'auth-change', 'platform-message', 'connection-status'];
      if (validChannels.includes(channel)) {
        ipcRenderer.removeListener(channel, callback);
      }
    }
  }
);