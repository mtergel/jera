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
  let path = [folder.name];

  if (folder.children) {
    Object.values(folder.children).forEach(child => {
      path = path.concat(buildPath(child));
    });
  }

  return path;
}

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

  // Hook to show new folder on notebooks
  // with no children or closed
  useEffect(() => {
    if (isOpen === false && isSelected && isCreatingNewFolder) {
      onOpen(folder.name);
    }
  }, [isCreatingNewFolder]);

  // Context menu
  const treeRef = useRef<HTMLLIElement>(null);
  useEffect(() => {
    if (treeRef.current) {
      treeRef.current.addEventListener('contextmenu', e => {
        e.preventDefault();
        showTreeContext();
      });
    }
  }, []);

  return (
    <li
      role="treeitem"
      tabIndex={-1}
      ref={treeRef}
    >
      <div
        onClick={handleOnClick}
        className={clsx(
          'rounded-lg py-2 px-4',
          isSelected ? 'bg-accent-sidebar text-t-primary' : 'text-t-muted',
        )}
      >
        <div
          style={{
            paddingLeft: `calc(1rem * ${level * 0.5})`,
          }}
          className="flex items-center gap-2"
        >
          <span>
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
              />
            ) : (
              <FiFolder />
            )}
          </span>
          <span className="flex-1">{folder.name}</span>
        </div>
      </div>
      {isOpen && (
        <ul
          tabIndex={0}
          aria-multiselectable={false}
          role="tree"
          aria-label={folder.name}
        >
          {isSelected && isCreatingNewFolder && <NewFolder level={level + 1} />}
          {Object.values(folder.children ?? {}).map(child => (
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
