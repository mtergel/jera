import useTree from './useTree';
import shallow from 'zustand/shallow';
import {FiChevronRight, FiFolder} from 'react-icons/fi';
import {useCallback, useEffect, useRef} from 'react';
import clsx from 'clsx';
import useNotebook from '/@/lib/notebook';
import NewFolder from './NewFolder';
import {showTreeContext} from '#preload';

interface TreeFolderProps {
  folder: Folder;

  parentPath: string;
  level: number;
}

// build every children's name into path array
function buildPath(folder: Folder) {
  let path = [folder._id];

  if (folder.children) {
    Object.values(folder.children).forEach(child => {
      path = path.concat(buildPath(child));
    });
  }

  return path;
}

// TODO add focused classes
const TreeFolder: React.FC<TreeFolderProps> = ({folder, parentPath, level}) => {
  const {selectedFolder, isCreatingNewFolder} = useNotebook(
    state => ({
      selectedFolder: state.selected,
      isCreatingNewFolder: state.isCreatingNewFolder,
    }),
    shallow,
  );

  const {isOpen, onOpen, onClose, onClick} = useTree(
    state => ({
      isOpen: state.opened.has(folder._id),
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
      onOpen(folder._id);
    }
  }, [isOpen, onClick]);

  // onClick handler set from Tree
  const handleOnClick = useCallback(() => {
    if (onClick) {
      onClick(folder);
      if (!isOpen && folder.children) {
        onOpen(folder._id);
      }
    }
  }, [isOpen, onClick, folder.children]);

  const isSelected = selectedFolder && selectedFolder._id === folder._id;

  // Hook to show new folder on notebooks
  // with no children or closed
  useEffect(() => {
    if (isOpen === false && isSelected && isCreatingNewFolder) {
      onOpen(folder._id);
    }
  }, [isCreatingNewFolder]);

  // Context menu
  const treeRef = useRef<HTMLLIElement>(null);
  useEffect(() => {
    if (treeRef.current) {
      treeRef.current.addEventListener('contextmenu', e => {
        e.preventDefault();

        if (e.target && (e.target as any).id) {
          showTreeContext(folder._id);
        }
      });
    }
  }, []);

  return (
    <li
      role="treeitem"
      aria-level={level}
      aria-expanded={isOpen}
      aria-selected={isSelected ? 'true' : 'false'}
      tabIndex={isSelected ? 0 : -1}
      aria-label={folder.name}
      ref={treeRef}
      id={folder._id}
    >
      <div
        onClick={handleOnClick}
        className={clsx(
          'rounded-lg py-2 px-4',
          isSelected ? 'bg-accent-sidebar text-t-primary' : 'text-t-muted',
        )}
        id={folder._id}
      >
        <div
          style={{
            paddingLeft: `calc(1rem * ${level * 0.5})`,
          }}
          className="flex items-center gap-2 select-none"
          id={folder._id}
        >
          <span
            aria-hidden
            id={folder._id}
          >
            {folder.children ? (
              <FiChevronRight
                className={clsx(
                  'transition-all delay-75',
                  isOpen
                    ? 'rotate-90 text-t-primary'
                    : isSelected
                    ? 'text-t-primary'
                    : 'text-t-muted',
                )}
                onClick={toggleOpen}
                id={folder._id}
              />
            ) : (
              <FiFolder id={folder._id} />
            )}
          </span>
          <span
            className="flex-1"
            id={folder._id}
          >
            {folder.name}
          </span>
        </div>
      </div>
      {isOpen && (
        <ul
          tabIndex={0}
          aria-multiselectable={false}
          role="tree"
          aria-label={folder.name}
        >
          {isSelected && isCreatingNewFolder && (
            <NewFolder
              level={level + 1}
              path={parentPath.concat(folder._id + ',')}
            />
          )}
          {Object.values(folder.children ?? {}).map(child => (
            <TreeFolder
              key={child._id}
              folder={child}
              level={level + 1}
              parentPath={parentPath.concat(folder._id + ',')}
            />
          ))}
        </ul>
      )}
    </li>
  );
};

export default TreeFolder;
