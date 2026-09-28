import { app, BrowserWindow, shell, Tray, Menu, session } from 'electron';
import * as path from 'path';
import { loadSettings, saveSettings } from './settings';
import { registerIpcHandlers } from './ipc';
import { registerBurstIpcHandlers } from './burst';
import { setupFocusCheck, updateCaptureConfigurations, cleanupCaptureModule, triggerOSScreenCapture } from './capture';

const isDev = process.env.NODE_ENV === 'development';
let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let isQuitting = false;

// XWayland avoids startup failures observed on some hybrid-GPU systems.
// Respect explicit backend choices and native-Wayland-only sessions.
if (process.platform === 'linux' && process.env.DISPLAY &&
    !app.commandLine.hasSwitch('ozone-platform')) {
  app.commandLine.appendSwitch('ozone-platform', 'x11');
}

function createWindow(settings: any) {
  const { width, height, x, y } = settings.windowBounds;

  mainWindow = new BrowserWindow({
    width,
    height,
    x,
    y,
    minWidth: 900,
    minHeight: 650,
    backgroundColor: '#0b0f19',
    show: false,
    icon: process.platform === 'win32'
      ? path.join(__dirname, 'assets/icon.ico')
      : process.platform === 'darwin' ? path.join(__dirname, 'assets/icon-512.png')
      : path.join(__dirname, 'assets/icon-512.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    titleBarStyle: process.platform === 'darwin' || process.platform === 'win32' ? 'hidden' : 'default',
    titleBarOverlay: process.platform === 'win32' ? {
      color: '#0b0f19',
      symbolColor: '#9699a3',
      height: 32
    } : false,
  });

  // Open external links in user's default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.setAutoHideMenuBar(true);
  mainWindow.setMenuBarVisibility(false);

  const win = mainWindow;
  let startupFinished = false;
  let showTimer: ReturnType<typeof setTimeout> | undefined;
  const finishStartup = () => {
    startupFinished = true;
    clearTimeout(showTimer);
  };
  const showOnce = () => {
    if (startupFinished || win.isDestroyed()) return;
    finishStartup();
    win.show();
  };
  win.once('ready-to-show', showOnce);
  // Never let a timeout or delayed ready event undo a user's tray action.
  win.once('show', finishStartup);
  win.once('hide', finishStartup);
  win.once('minimize', finishStartup);
  win.once('close', finishStartup);
  win.once('closed', finishStartup);
  // Some Linux/GPU setups never emit ready-to-show. This exposes the window
  // but does not claim to recover a crashed renderer or GPU process.
  if (process.platform === 'linux') showTimer = setTimeout(showOnce, 3000);

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, 'renderer/index.html'));
  }

  // Save window dimensions on close or resize
  const saveWindowBounds = () => {
    if (!mainWindow) return;
    const bounds = mainWindow.getBounds();
    const currentSettings = loadSettings();
    currentSettings.windowBounds = bounds;
    saveSettings(currentSettings);
  };

  mainWindow.on('resize', saveWindowBounds);
  mainWindow.on('move', saveWindowBounds);

  mainWindow.on('closed', () => {
    mainWindow = null;
    tray = null;
  });

  // Minimize / close to tray on Windows & Linux
  if (process.platform === 'win32' || process.platform === 'linux') {
    mainWindow.on('minimize', () => {
      mainWindow?.hide();
      createTray();
    });

    mainWindow.on('close', (event) => {
      if (!isQuitting) {
        event.preventDefault();
        mainWindow?.hide();
        createTray();
      }
    });
  }

  // Setup event-driven focus check for clipboard import
  setupFocusCheck(mainWindow);
}

function getTrayIconPath(): string {
  return path.join(__dirname, 'assets/icon-16.png');
}

function createTray() {
  if (tray) return;
  tray = new Tray(getTrayIconPath());
  tray.setToolTip('Framely');

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Capture Screenshot',
      click: () => {
        triggerOSScreenCapture();
      },
    },
    { type: 'separator' },
    {
      label: 'Show Framely',
      click: () => {
        mainWindow?.show();
        mainWindow?.focus();
      },
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        isQuitting = true;
        if (mainWindow) mainWindow.destroy();
        app.quit();
      },
    },
  ]);
  tray.setContextMenu(contextMenu);

  tray.on('click', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
        mainWindow.focus();
      }
    }
  });
}

app.whenReady().then(() => {
  const settings = loadSettings();

  createWindow(settings);

  // Auto-grant local-fonts permission for querying system fonts
  session.defaultSession.setPermissionRequestHandler((_webContents, permission, callback) => {
    if ((permission as string) === 'local-fonts') {
      callback(true);
    } else {
      callback(false);
    }
  });

  // Register all IPC handlers
  registerIpcHandlers(() => mainWindow);
  registerBurstIpcHandlers(() => mainWindow);

  // Initialize and register global screenshot shortcuts dynamically
  updateCaptureConfigurations(settings, mainWindow);

  // Build standard Application Menu
  const template: any[] = [
    {
      label: 'File',
      submenu: [
        { role: 'quit' }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        { role: 'close' }
      ]
    }
  ];

  if (process.platform === 'darwin') {
    template.unshift({
      label: app.name,
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    });
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow(loadSettings());
    } else if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    }
  });
});

app.on('before-quit', () => {
  isQuitting = true;
});

app.on('will-quit', () => {
  cleanupCaptureModule();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    if (isQuitting) {
      app.quit();
    }
  }
});
