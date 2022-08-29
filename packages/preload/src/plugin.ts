import {ipcRenderer} from 'electron';

export function listInstalledPlugins() {
  return ipcRenderer.invoke('plugins:get');
}

export function installPlugin(plugin: string, locally?: boolean) {
  return ipcRenderer.invoke('plugins:install', plugin, locally);
}

export function uninstallPlugin(plugin: string) {
  return ipcRenderer.invoke('plugins:uninstall', plugin);
}
