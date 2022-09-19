import {app, BrowserWindow} from 'electron';
import {join} from 'path';
import {URL} from 'url';
import windowStateKeeper from 'electron-window-state';
import toElectronBackgroundColor from './utils/to-electron-background-color';

async function createWindow() {
  // load plugins module
  const plugins = await import('./lib/plugins');
  app.plugins = plugins;

  // get decorated config;
  let cfg = plugins.getDecoratedConfig();

  const mainWindowState = windowStateKeeper({
    defaultHeight: 800,
    defaultWidth: 1000,
  });

  const browserWindow = new BrowserWindow({
    show: false, // Use the 'ready-to-show' event to show the instantiated BrowserWindow.
    title: 'Jera Notes',
    minWidth: 700,
    minHeight: 370,
    x: mainWindowState.x,
    y: mainWindowState.y,
    width: mainWindowState.width,
    height: mainWindowState.height,
    backgroundColor: cfg.colors.base,
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: {
      x: 19,
      y: 19,
    },
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false, // Sandbox disabled because the demo of preload script depend on the Node.js api
      webviewTag: false, // The webview tag is not recommended. Consider alternatives like an iframe or Electron's BrowserView. @see https://www.electronjs.org/docs/latest/api/webview-tag#warning
      preload: join(app.getAppPath(), 'packages/preload/dist/index.cjs'),
    },
  });

  const updateBackgroundColor = () => {
    browserWindow.setBackgroundColor(toElectronBackgroundColor(cfg.colors.base || '#000'));
  };

  // config changes
  const cfgUnsubscribe = app.config.subscribe(() => {
    const cfg_ = app.plugins.getDecoratedConfig();

    // notify renderer
    browserWindow.webContents.send('config change');

    // update background color if necessary
    updateBackgroundColor();

    cfg = cfg_;
  });

  // plugin changes
  const pluginsUnsubscribe = app.plugins.subscribe((err: any) => {
    if (!err) {
      browserWindow.webContents.send('plugins change');
      updateBackgroundColor();
    }
  });

  // register window manager
  mainWindowState.manage(browserWindow);

  // setup api
  await import('./lib/api');

  /**
   * If the 'show' property of the BrowserWindow's constructor is omitted from the initialization options,
   * it then defaults to 'true'. This can cause flickering as the window loads the html content,
   * and it also has show problematic behaviour with the closing of the window.
   * Use `show: false` and listen to the  `ready-to-show` event to show the window.
   *
   * @see https://github.com/electron/electron/issues/25012 for the afford mentioned issue.
   */
  browserWindow.on('ready-to-show', () => {
    browserWindow?.show();

    // if (import.meta.env.DEV) {
    //   browserWindow?.webContents.openDevTools();
    // }
  });

  browserWindow.on('close', () => {
    cfgUnsubscribe();
    pluginsUnsubscribe();
  });

  /**
   * URL for main window.
   * Vite dev server for development.
   * `file://../renderer/index.html` for production and test.
   */
  const pageUrl =
    import.meta.env.DEV && import.meta.env.VITE_DEV_SERVER_URL !== undefined
      ? import.meta.env.VITE_DEV_SERVER_URL
      : new URL('../renderer/dist/index.html', 'file://' + __dirname).toString();

  await browserWindow.loadURL(pageUrl);

  return browserWindow;
}

/**
 * Restore an existing BrowserWindow or Create a new BrowserWindow.
 */
export async function restoreOrCreateWindow() {
  let window = BrowserWindow.getAllWindows().find(w => !w.isDestroyed());

  if (window === undefined) {
    window = await createWindow();
  }

  if (window.isMinimized()) {
    window.restore();
  }

  window.focus();
}
