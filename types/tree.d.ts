type Folder = {
  _id: string;
  name: string;
  path: string | null;

  children?: FolderPath;
};

type FolderPath = {[key: string]: Folder};
