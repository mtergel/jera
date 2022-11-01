import {useEffect} from 'react';
import TreeFolder from './TreeFolder';
import useTree from './useTree';

interface TreeProps {
  folders: FolderPath;
  onSelect?: (node: Folder) => void;
}

const Tree: React.FC<TreeProps> = ({folders, onSelect}) => {
  const attachOnClickHandler = useTree(state => state.attachOnClickHandler);

  useEffect(() => {
    if (onSelect) {
      attachOnClickHandler(onSelect);
    }
  }, [onSelect]);

  // TODO setup event handlers

  return (
    <ul
      aria-multiselectable={false}
      role="tree"
      aria-label="folders"
      className="flex flex-col flex-wrap relative"
    >
      {Object.values(folders).map(folder => (
        <TreeFolder
          key={folder._id}
          folder={folder}
          level={0}
          parentPath={','}
        />
      ))}
    </ul>
  );
};

export default Tree;
