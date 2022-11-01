import PouchDb from 'pouchdb';
import PouchFind from 'pouchdb-find';
import {nanoid} from 'nanoid';
import _set from 'lodash/set';
import _sortBy from 'lodash/sortBy';

PouchDb.plugin(PouchFind);

// TODO
// make this remote, with auth or something
let db: PouchDB.Database<{}>;

const createDb = async (callback: (changes: any) => void) => {
  db = new PouchDb('oxymoron');

  await db.createIndex({
    index: {
      fields: ['path'],
    },
  });

  await db
    .changes({
      since: 'now',
      live: true,
      include_docs: true,
    })
    .on('change', callback);
};

const readFolders = async (callback: (input: FolderPath) => void) => {
  const pathIndex: FolderPath = {};

  const res: any = await db.allDocs({
    include_docs: true,
    startkey: 'folder_',
    endkey: 'folder_\ufff0',
  });

  // this sort might cause bottleneck
  // might need to change this
  res.rows
    .sort((a: any, b: any) => {
      const leftHas = Object.prototype.hasOwnProperty.call(a.doc, 'path');
      const rightHas = Object.prototype.hasOwnProperty.call(b.doc, 'path');
      if (leftHas && rightHas && a.doc.path && b.doc.path) {
        return a.doc.path.length - b.doc.path.length;
      }

      return leftHas ? -1 : rightHas ? 1 : 0;
    })
    .forEach((row: any) => {
      if (row.doc) {
        const doc: any = row.doc;

        if (!doc.path) {
          pathIndex[doc._id] = {
            ...pathIndex[doc._id],
            _id: doc._id,
            name: doc.name,
            path: null,
          };
          return;
        } else {
          const path = doc.path.split(',');
          path.shift();
          path.pop();
          path.push(doc._id);

          _set(pathIndex, path.join('.children.'), {
            _id: row.doc._id,
            name: row.doc.name,
            path: row.doc.path,
          });
        }
      }
    });

  callback(pathIndex);
};

// path: ",Books,Programming,"
const createFolder = async (input: {name: string; path: string | null}) => {
  const id = `folder_${nanoid()}`;

  await db.put({
    _id: id,
    ...input,
  });
};

export {readFolders, createFolder, createDb, db};
