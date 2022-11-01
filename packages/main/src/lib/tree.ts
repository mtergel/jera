import {ipcMain, Menu} from 'electron';

ipcMain.on('showContext:tree', (event, ...args) => {
  const template = [
    {
      label: 'New Notebook',
      click: () => {
        event.sender.send('tree-command', 'new', ...args);
      },
    },
    {
      label: 'Delete',
      click: () => {
        event.sender.send('tree-command', 'delete', ...args);
      },
    },
  ];
  const menu = Menu.buildFromTemplate(template);
  menu.popup();
});
