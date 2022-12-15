import {ipcRenderer} from 'electron';
import {db} from './db';

let setNewFolderMode: (folderId: string) => void;

// open menu
// source folder id
export function showTreeContext(source: string) {
  ipcRenderer.send('showContext:tree', source);
}

interface TreeContextActions {
  newFolder: (folderId: string) => void;
}

export function setTreeContextCallback(input: TreeContextActions) {
  setNewFolderMode = input.newFolder;
}

// action handler
ipcRenderer.on('tree-command', async (_, command, sourceId) => {
  console.log(command, sourceId);
  switch (command) {
    case 'delete': {
      // sourceFolder
      const folder: any = await db.get(sourceId);

      // get it's children
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

        // source folder
        db.remove(folder);
      } catch (error) {
        // TODO
        console.log(error);
      }

      break;
    }

    case 'new': {
      setNewFolderMode(sourceId);
    }
  }
});
