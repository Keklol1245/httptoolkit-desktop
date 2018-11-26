import * as path from 'path';
import { app, BrowserWindow, shell } from 'electron';

const packageJson = require('../package.json');

const APP_URL = process.env.APP_URL || 'https://app.httptoolkit.tech';

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow: Electron.BrowserWindow | null = null;

const createWindow = async () => {
    mainWindow = new BrowserWindow({
        title: 'HTTP Toolkit',
        icon: path.join(__dirname, 'src', 'icon.png'),
        backgroundColor: '#d8e2e6',

        width: 1366,
        height: 768,
        minWidth: 1024,
        minHeight: 700,

        webPreferences: {
            contextIsolation: true,
            nodeIntegration: false
        }
    });

    mainWindow.loadURL(APP_URL);

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
};

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow();
    }
});

app.on('web-contents-created', (_event, contents) => {
    contents.on('dom-ready', () => {
        // Define & announce the desktop shell version to the app
        // Not used now, intended to allow us to detect and prompt for updates
        // in future, if a certain desktop shell version is required.
        contents.executeJavaScript(`
            window.httpToolkitDesktopVersion = '${packageJson.version}';
            window.postMessage({ httpToolkitDesktopVersion: window.httpToolkitDesktopVersion }, '*');
        `);
    });

    // Redirect all navigations & new windows to the system browser
    contents.on('will-navigate', (event, navigationUrl) => {
      const parsedUrl = new URL(navigationUrl);

      if (parsedUrl.origin !== APP_URL) {
        event.preventDefault();
        shell.openExternal(navigationUrl);
      }
    });

    contents.on('new-window', (event, navigationUrl) => {
        const parsedUrl = new URL(navigationUrl);

        if (parsedUrl.origin !== APP_URL) {
          event.preventDefault();
          shell.openExternal(navigationUrl);
        }
    });
});