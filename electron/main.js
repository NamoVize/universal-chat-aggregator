const { app, BrowserWindow, ipcMain, Menu, Tray, shell, dialog } = require('electron');
const path = require('path');
const url = require('url');
const log = require('electron-log');
const Store = require('electron-store');
const fs = require('fs');

// Initialize settings store
const store = new Store({
  encryptionKey: 'universal-chat-aggregator-secure-key'
});

// Keep a global reference of the window object to avoid garbage collection
let mainWindow;
let tray;
let isQuitting = false;

// Set up logging
log.transports.file.level = 'info';
log.info('Application starting...');

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, '../assets/icon.png'),
    show: false, // Don't show until ready-to-show
    title: 'Universal Chat Aggregator'
  });

  // Load the app - either from React dev server or built files
  const startUrl = process.env.ELECTRON_START_URL || url.format({
    pathname: path.join(__dirname, '../build/index.html'),
    protocol: 'file:',
    slashes: true
  });
  
  mainWindow.loadURL(startUrl);

  // Show window when it's ready to avoid flashing
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Open external links in browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow.hide();
      return false;
    }
  });

  // Clean up on window close
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Create tray icon
  createTray();

  // Open DevTools in development
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  log.info('Main window created');
}

function createTray() {
  tray = new Tray(path.join(__dirname, '../assets/tray-icon.png'));
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Open Universal Chat Aggregator', click: () => { mainWindow.show(); } },
    { type: 'separator' },
    { label: 'Quit', click: () => { isQuitting = true; app.quit(); } }
  ]);
  
  tray.setToolTip('Universal Chat Aggregator');
  tray.setContextMenu(contextMenu);
  
  tray.on('click', () => {
    mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
  });

  log.info('Tray icon created');
}

// Initialize app when Electron is ready
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  isQuitting = true;
});

// IPC handlers for platform authentication and message retrieval
ipcMain.handle('get-user-settings', () => {
  return store.get('user-settings') || {};
});

ipcMain.handle('save-user-settings', (event, settings) => {
  store.set('user-settings', settings);
  return true;
});

ipcMain.handle('get-platform-auth', (event, platform) => {
  return store.get(`auth.${platform}`);
});

ipcMain.handle('save-platform-auth', (event, platform, auth) => {
  store.set(`auth.${platform}`, auth);
  return true;
});

ipcMain.handle('clear-platform-auth', (event, platform) => {
  store.delete(`auth.${platform}`);
  return true;
});

// Error handling
process.on('uncaughtException', (error) => {
  log.error('Uncaught exception:', error);
  
  if (mainWindow) {
    mainWindow.webContents.send('error', {
      type: 'uncaught-exception',
      message: error.message,
      stack: error.stack
    });
  }
});

log.info('Main process initialized');