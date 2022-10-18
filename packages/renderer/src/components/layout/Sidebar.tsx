import {Section, SectionHeader} from './section';
import useNotebook from '/@/lib/notebook';
import shallow from 'zustand/shallow';
import Tree from '/@/components/tree/Tree';
import {FiFolderPlus, FiRefreshCw} from 'react-icons/fi';
import NewFolder from '../tree/NewFolder';

const initialSidebarWidth = '15.714rem';

const Sidebar: React.FC = () => {
  const {
    isLoading,
    folders,
    onSelect,
    loadFolders,
    isCreatingNewFolder,
    enterNewFolderMode,
    selected,
  } = useNotebook(
    state => ({
      isLoading: state.isFoldersLoading,
      folders: state.folders,
      onSelect: state.onSelect,
      loadFolders: state.loadFolders,
      isCreatingNewFolder: state.isCreatingNewFolder,
      enterNewFolderMode: state.enterNewFolderMode,
      selected: state.selected,
    }),
    shallow,
  );

  const notebookActions: SectionAction[] = [
    {
      name: 'New Notebook',
      icon: FiFolderPlus,
      onClick: enterNewFolderMode,
    },
    {
      name: 'Refresh',
      icon: FiRefreshCw,
      onClick: loadFolders,
    },
  ];

  return (
    <div
      className="h-full bg-b-sidebar relative"
      style={{
        width: initialSidebarWidth,
      }}
    >
      <div className="drag h-[54px]" />
      {isCreatingNewFolder && <div className="bg-black/60 absolute inset-0 z-10" />}
      {isLoading ? (
        <span className="px-4 text-sm text-t-muted">Loading...</span>
      ) : (
        <Section>
          <SectionHeader
            title="Notebooks"
            actions={notebookActions}
          />
          {isCreatingNewFolder && !selected && (
            <NewFolder
              level={0}
              path={null}
            />
          )}
          {folders && (
            <Tree
              folders={folders}
              onClick={folder => {
                onSelect(folder);
              }}
            />
          )}
        </Section>
      )}
    </div>
  );
};

export default Sidebar;
