/**
 * ORBICITY Desktop App - Electron Main Process
 *
 * This gives ClawdBot full access to:
 * - File system (read CLAUDE.md, configs, etc.)
 * - Browser automation (Puppeteer with user's Chrome profile)
 * - Shell commands
 * - System resources
 */

const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const { exec, spawn } = require('child_process');

// Keep a global reference of the window object
let mainWindow;

// Use localhost only if LOCAL=true is set, otherwise use Vercel
const useLocal = process.env.LOCAL === 'true';

// URLs
const PRODUCTION_URL = 'https://orbi-city-hub.vercel.app';
const LOCAL_URL = 'http://localhost:3000';

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    title: 'ORBICITY System',
    icon: path.join(__dirname, 'icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs'),
    },
    // Modern look
    frame: true,
    backgroundColor: '#0f172a', // slate-900
    show: false, // Don't show until ready
  });

  // Load the app - Vercel by default, localhost only with LOCAL=true
  if (useLocal) {
    // Local development mode
    console.log('Loading from localhost...');
    mainWindow.loadURL(LOCAL_URL);
    mainWindow.webContents.openDevTools();
  } else {
    // Production mode - Vercel
    console.log('Loading from Vercel:', PRODUCTION_URL);
    mainWindow.loadURL(PRODUCTION_URL);
  }

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// ============================================
// IPC HANDLERS - ClawdBot System Access
// ============================================

// Read file from filesystem
ipcMain.handle('clawdbot:readFile', async (event, filePath) => {
  try {
    // Resolve relative paths from project root
    const absolutePath = path.isAbsolute(filePath)
      ? filePath
      : path.join(app.getAppPath(), '..', filePath);

    const content = fs.readFileSync(absolutePath, 'utf-8');
    return { success: true, content };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Write file to filesystem
ipcMain.handle('clawdbot:writeFile', async (event, filePath, content) => {
  try {
    const absolutePath = path.isAbsolute(filePath)
      ? filePath
      : path.join(app.getAppPath(), '..', filePath);

    fs.writeFileSync(absolutePath, content, 'utf-8');
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// List directory contents
ipcMain.handle('clawdbot:listDir', async (event, dirPath) => {
  try {
    const absolutePath = path.isAbsolute(dirPath)
      ? dirPath
      : path.join(app.getAppPath(), '..', dirPath);

    const files = fs.readdirSync(absolutePath, { withFileTypes: true });
    return {
      success: true,
      files: files.map(f => ({
        name: f.name,
        isDirectory: f.isDirectory()
      }))
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Execute shell command
ipcMain.handle('clawdbot:exec', async (event, command) => {
  return new Promise((resolve) => {
    exec(command, { maxBuffer: 10 * 1024 * 1024 }, (error, stdout, stderr) => {
      if (error) {
        resolve({ success: false, error: error.message, stderr });
      } else {
        resolve({ success: true, stdout, stderr });
      }
    });
  });
});

// Open Chrome with user profile (for scraping with cookies)
ipcMain.handle('clawdbot:openChrome', async (event, url, profilePath) => {
  try {
    const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
    const userDataDir = profilePath || 'C:\\Users\\tamuna.makharad_Medi\\orbicity_chrome_profile';

    const args = [
      `--user-data-dir="${userDataDir}"`,
      url
    ];

    spawn(chromePath, args, { detached: true, stdio: 'ignore' });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Get system info
ipcMain.handle('clawdbot:getSystemInfo', async () => {
  return {
    platform: process.platform,
    arch: process.arch,
    nodeVersion: process.version,
    electronVersion: process.versions.electron,
    appPath: app.getAppPath(),
    userDataPath: app.getPath('userData'),
    homePath: app.getPath('home'),
    desktopPath: app.getPath('desktop'),
  };
});

// Read CLAUDE.md specifically (common operation)
ipcMain.handle('clawdbot:getKnowledgeBase', async () => {
  try {
    const paths = [
      path.join(app.getAppPath(), '..', 'CLAUDE.md'),
      path.join(app.getPath('home'), 'CLAUDE.md'),
      'C:\\Users\\tamuna.makharad_Medi\\CLAUDE.md',
      'C:\\Users\\tamuna.makharad_Medi\\orbi-city-hub\\CLAUDE.md',
    ];

    for (const p of paths) {
      if (fs.existsSync(p)) {
        const content = fs.readFileSync(p, 'utf-8');
        return { success: true, content, path: p };
      }
    }

    return { success: false, error: 'CLAUDE.md not found' };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Open URL in default browser
ipcMain.handle('clawdbot:openExternal', async (event, url) => {
  try {
    await shell.openExternal(url);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// ============================================
// APP LIFECYCLE
// ============================================

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Security: Prevent new window creation
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event) => {
    event.preventDefault();
  });
});

console.log('ORBICITY Desktop App starting...');
console.log('Mode:', useLocal ? 'LOCAL (localhost:3000)' : 'PRODUCTION (Vercel)');
