import {ipcRenderer} from 'electron';

export function getConfig() {
  return ipcRenderer.invoke('config:get');
}

export function subscribeConfig(fn: (event: Electron.IpcRendererEvent, ...args: any[]) => void) {
  ipcRenderer.on('config change', fn);
  ipcRenderer.on('plugins change', fn);

  return () => {
    ipcRenderer.removeListener('config change', fn);
  };
}
