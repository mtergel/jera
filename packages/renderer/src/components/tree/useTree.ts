import create from 'zustand';

type OnClickHandler = (path: Folder) => void;

interface TreeState {
  opened: Set<string>;
  onOpen: (node: string) => void;
  onClose: (path: string[]) => void;

  onClick?: OnClickHandler;
  attachOnClickHandler: (callback: OnClickHandler) => void;
}

const useTree = create<TreeState>()(set => ({
  opened: new Set<string>(),

  onOpen: node =>
    set(state => ({
      opened: state.opened.add(node),
    })),

  onClose: path =>
    set(state => {
      const openedNodes = state.opened;
      path.forEach(node => openedNodes.delete(node));

      return {
        opened: openedNodes,
      };
    }),

  attachOnClickHandler: callbackFn =>
    set(() => ({
      onClick: callbackFn,
    })),
}));

export default useTree;
