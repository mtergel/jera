import {useEffect} from 'react';
import Sidebar from './Sidebar';
import useNotebook from '/@/lib/notebook';

const Layout: React.FC<React.PropsWithChildren> = ({children}) => {
  // load folders from db into memory
  const loadFolders = useNotebook(state => state.loadFolders);

  useEffect(() => {
    loadFolders();
  }, []);

  return (
    <div className="flex h-full">
      <Sidebar />
      <main>{children}</main>
    </div>
  );
};

export default Layout;
