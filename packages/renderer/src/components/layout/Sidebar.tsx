import {Section, SectionHeader} from './section';
import useNotebook from '/@/lib/notebook';
import shallow from 'zustand/shallow';
import Tree from '/@/components/tree/Tree';
import {TbFolderPlus, TbRefresh} from 'react-icons/tb';

const initialSidebarWidth = '15.714rem';

interface SidebarProps {}

const Sidebar: React.FC<SidebarProps> = () => {
  const {isLoading, folders, onSelect} = useNotebook(
    state => ({
      isLoading: state.isFoldersLoading,
      folders: state.folders,
      onSelect: state.onSelect,
    }),
    shallow,
  );

  const notebookActions: SectionAction[] = [
    {
      name: 'New Notebook',
      icon: TbFolderPlus,
      onClick: () => {},
    },
    {
      name: 'Refresh Notebooks',
      icon: TbRefresh,
      onClick: () => {},
    },
  ];

  return (
    <div
      className="h-full bg-b-sidebar"
      style={{
        width: initialSidebarWidth,
      }}
    >
      <div className="drag h-[54px]" />
      {isLoading ? (
        <span className="px-4 text-sm text-t-muted">Loading...</span>
      ) : (
        <Section>
          <SectionHeader
            title="Notebook"
            actions={notebookActions}
          />
          {folders && (
            <Tree
              folders={folders}
              onClick={folder => {
                console.log(folder);
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
