import create from 'zustand';

interface NotebookState {
  selected: Folder | null;

  onSelect: (folder: Folder | null) => void;
}

const useNotebook = create<NotebookState>()(set => ({
  selected: null,
  onSelect: folder =>
    set(() => ({
      selected: folder,
    })),
}));

export default useNotebook;
