import {ipcMain, Menu} from 'electron';

ipcMain.on('showContext:tree', event => {
  const template = [
    {
      label: 'New Notebook',
      click: () => {
        event.sender.send('tree-command', 'new');
      },
    },
    {
      label: 'Delete',
      click: () => {
        event.sender.send('tree-command', 'delete');
      },
    },
  ];
  const menu = Menu.buildFromTemplate(template);
  menu.popup();
});
