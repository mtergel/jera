import create from 'zustand';
import _set from 'lodash/set';
import {readFolders} from '#preload';

interface NotebookState {
  // selected Folder
  selected: Folder | null;

  // users created folders
  folders: FolderPath;

  // loading folders from db
  isFoldersLoading: boolean;

  // creating new folder
  isCreatingNewFolder: boolean;

  // on select folder handler
  onSelect: (folder: Folder | null) => void;

  // load from database
  loadFolders: () => Promise<void>;

  // enter new folder mode
  enterNewFolderMode: () => void;

  // exit new folder mode
  exitNewFolderMode: () => void;
}

const useNotebook = create<NotebookState>()(set => ({
  selected: null,
  folders: {},
  isFoldersLoading: false,
  isCreatingNewFolder: false,

  onSelect: folder =>
    set(() => ({
      selected: folder,
    })),
  loadFolders: async () => {
    set({isFoldersLoading: true});

    await readFolders(f => {
      set({
        isFoldersLoading: false,
        folders: f,
      });
    });
  },

  enterNewFolderMode: () =>
    set(() => ({
      isCreatingNewFolder: true,
    })),

  exitNewFolderMode: () =>
    set(() => ({
      isCreatingNewFolder: false,
    })),
}));

export default useNotebook;
