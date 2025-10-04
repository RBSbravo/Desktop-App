const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');

function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(__dirname,'src', 'assets', 'mito_logo.png'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  // Load the app
  if (isDev) {
    win.loadURL('http://localhost:3001');
    // Open the DevTools.
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, 'build', 'index.html'));
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', () => {
  Menu.setApplicationMenu(null); // Remove the menu bar
  createWindow();
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Handle IPC messages here if needed 