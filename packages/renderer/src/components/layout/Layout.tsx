import db from '/@/lib/db';
import _set from 'lodash/set';
import {useEffect, useState} from 'react';
import Tree from '../tree/Tree';
import useNotebook from '/@/lib/notebook';

interface LayoutProps {
  children: React.ReactNode;
}

const initialSidebarWidth = '15.714rem';

const handleReadData = async (callback: (input: FolderPath) => void) => {
  const res = await db.allDocs({
    include_docs: true,
  });

  const pathIndex: FolderPath = {};
  res.rows.forEach(row => {
    if (row.doc) {
      const doc: any = row.doc;

      if (!doc.path) {
        pathIndex[doc.name] = doc;
        return;
      } else {
        const path = doc.path.split(',');
        path.shift();
        path.pop();
        path.push(doc.name);
        _set(pathIndex, path.join('.children.'), row.doc);
      }
    }
  });

  callback(pathIndex);
};

const Layout: React.FC<LayoutProps> = ({children}) => {
  // maybe use immer for this
  const [folders, setFolders] = useState<FolderPath>();
  const onSelect = useNotebook(state => state.onSelect);

  useEffect(() => {
    // get folders
    handleReadData(setFolders);
  }, []);

  return (
    <div className="flex h-full">
      <div
        className="h-full bg-b-sidebar"
        style={{
          width: initialSidebarWidth,
        }}
      >
        <div className="drag h-[54px]" />
        {folders && (
          <Tree
            folders={folders}
            onClick={folder => {
              console.log(folder);
              onSelect(folder);
            }}
          />
        )}
      </div>
      <main>{children}</main>
    </div>
  );
};

export default Layout;
