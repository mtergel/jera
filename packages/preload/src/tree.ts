import {ipcRenderer} from 'electron';
import {db} from './db';

// open menu
// source folder id
export function showTreeContext(source: string) {
  ipcRenderer.send('showContext:tree', source);
}

// action handler
ipcRenderer.on('tree-command', async (e, command, sourceId) => {
  console.log(e, command, sourceId);
  switch (command) {
    case 'delete': {
      // TODO
      // Need to delete childrens

      const folder: any = await db.get(sourceId);
      if (folder.path) {
        const docs = await db.find({
          selector: {
            path: {
              $regex: `,${sourceId}`,
            },
          },
        });

        try {
          // its children
          docs.docs
            .slice()
            .reverse()
            .forEach(doc => {
              db.remove(doc);
            });

          // own folder
          db.remove(folder);
        } catch (error) {
          // TODO
          console.log(error);
        }
      }
    }
  }
});
