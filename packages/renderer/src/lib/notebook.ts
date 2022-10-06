import create from 'zustand';
import _set from 'lodash/set';
import db from '/@/lib/db';

interface NotebookState {
  // selected Folder
  selected: Folder | null;

  // users created folders
  folders: FolderPath;

  // loading folders from db
  isFoldersLoading: boolean;

  // on select folder handler
  onSelect: (folder: Folder | null) => void;

  // load from database
  loadFolders: () => Promise<void>;
}

const handleReadData = async (callback: (input: FolderPath) => void) => {
  const res = await db.allDocs({
    include_docs: true,
  });

  const pathIndex: FolderPath = {};
  res.rows.forEach(row => {
    if (row.doc) {
      const doc: any = row.doc;

      if (!doc.path) {
        pathIndex[doc.name] = doc;
        return;
      } else {
        const path = doc.path.split(',');
        path.shift();
        path.pop();
        path.push(doc.name);
        _set(pathIndex, path.join('.children.'), row.doc);
      }
    }
  });

  callback(pathIndex);
};

const useNotebook = create<NotebookState>()(set => ({
  selected: null,
  folders: {},
  isFoldersLoading: false,

  onSelect: folder =>
    set(() => ({
      selected: folder,
    })),
  loadFolders: async () => {
    set({isFoldersLoading: true});

    await handleReadData(f => {
      set({
        isFoldersLoading: false,
        folders: f,
      });
    });
  },
}));

export default useNotebook;
