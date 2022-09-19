import useTree from './useTree';
import shallow from 'zustand/shallow';
import {TbChevronRight} from 'react-icons/tb';
import {useCallback} from 'react';
import clsx from 'clsx';
import useNotebook from '/@/lib/notebook';

interface TreeFolderProps {
  folder: Folder;

  parentPath: string;
  level: number;
}

// build every children's name into path array
function buildPath(folder: Folder) {
  let path = [folder.name];

  if (folder.children) {
    Object.values(folder.children).forEach(child => {
      path = path.concat(buildPath(child));
    });
  }

  return path;
}

const TreeFolder: React.FC<TreeFolderProps> = ({folder, parentPath, level}) => {
  const selectedFolder = useNotebook(state => state.selected);

  const {isOpen, onOpen, onClose, onClick} = useTree(
    state => ({
      isOpen: state.opened.has(folder.name),
      onOpen: state.onOpen,
      onClose: state.onClose,
      onClick: state.onClick,
    }),
    shallow,
  );

  // toggle open based on current state
  const toggleOpen = useCallback(() => {
    if (isOpen) {
      const path = buildPath(folder);
      onClose(path);
    } else {
      onOpen(folder.name);
    }
  }, [isOpen, onClick]);

  // onClick handler set from Tree
  const handleOnClick = useCallback(() => {
    if (onClick) {
      onClick(folder);
      if (!isOpen && folder.children) {
        onOpen(folder.name);
      }
    }
  }, [isOpen, onClick, folder.children, folder.name]);

  const isSelected = selectedFolder && selectedFolder._id === folder._id;

  return (
    <li
      role="treeitem"
      tabIndex={-1}
    >
      <div
        onClick={handleOnClick}
        className="relative px-3"
        style={{
          marginLeft: `calc(1rem * ${level * 0.875})`,
        }}
      >
        <div
          className={clsx(
            'flex items-center rounded-md px-1 h-9',
            isSelected ? 'bg-accent-sidebar text-t-primary' : 'text-t-muted',
          )}
        >
          <div className="w-5 flex-shrink-0">
            {folder.children && (
              <div onClick={toggleOpen}>
                <TbChevronRight
                  className={clsx(
                    'transition-all delay-75',
                    isOpen
                      ? 'rotate-90 text-t-primary'
                      : isSelected
                      ? 'text-t-primary'
                      : 'text-t-muted',
                  )}
                />
              </div>
            )}
          </div>
          <div className="flex-grow pl-1.5">
            <span>{folder.name}</span>
          </div>
        </div>
      </div>
      {isOpen && folder.children && (
        <ul>
          {Object.values(folder.children).map(child => (
            <TreeFolder
              key={child._id}
              folder={child}
              level={level + 1}
              parentPath={parentPath.concat(folder.name + ',')}
            />
          ))}
        </ul>
      )}
    </li>
  );
};

export default TreeFolder;
