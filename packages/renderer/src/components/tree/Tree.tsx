import {useEffect} from 'react';
import TreeFolder from './TreeFolder';
import useTree from './useTree';

interface TreeProps {
  folders: FolderPath;
  onClick?: (node: Folder) => void;
}

const Tree: React.FC<TreeProps> = ({folders, onClick}) => {
  const attachOnClickHandler = useTree(state => state.attachOnClickHandler);

  useEffect(() => {
    if (onClick) {
      attachOnClickHandler(onClick);
    }
  }, [onClick]);

  return (
    <ul
      tabIndex={0}
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
