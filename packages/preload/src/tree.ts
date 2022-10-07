import {ipcRenderer} from 'electron';

export function showTreeContext() {
  ipcRenderer.send('showContext:tree');
}
