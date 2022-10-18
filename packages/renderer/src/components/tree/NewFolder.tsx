import {useCallback} from 'react';
import {SubmitHandler, useForm} from 'react-hook-form';
import {FiFolder} from 'react-icons/fi';
import shallow from 'zustand/shallow';
import useNotebook from '/@/lib/notebook';
import {createFolder} from '#preload';

interface NewFolderProps {
  level: number;
  path: string | null;
}

interface NewFolderForm {
  name: string;
}

const NewFolder: React.FC<NewFolderProps> = ({level, path}) => {
  const {exitNewFolderMode, loadFolders} = useNotebook(
    state => ({
      exitNewFolderMode: state.exitNewFolderMode,
      loadFolders: state.loadFolders,
    }),
    shallow,
  );

  const {register, handleSubmit} = useForm<NewFolderForm>();
  const onSubmit: SubmitHandler<NewFolderForm> = async ({name}) => {
    if (!name) {
      exitNewFolderMode();
    }

    console.log('Creating new folder: ', {
      name,
      path,
    });

    await createFolder({
      name,
      path,
    });

    await loadFolders();
    exitNewFolderMode();
  };

  const handleBlur = useCallback(() => {
    exitNewFolderMode();
  }, []);

  return (
    <form
      className="relative z-20"
      onSubmit={handleSubmit(onSubmit)}
      onKeyDown={e => e.key === 'Escape' && exitNewFolderMode()}
    >
      <div className="rounded-lg py-2 px-4 bg-accent-sidebar text-t-primary">
        <div
          style={{
            paddingLeft: `calc(1rem * ${level * 0.5})`,
          }}
          className="flex items-center gap-2"
        >
          <span>
            <FiFolder />
          </span>
          <div className="flex-1">
            <input
              type="text"
              className="p-0 bg-transparent w-full border-0 focus:outline-none focus:ring-0"
              autoFocus
              {...register('name', {
                onBlur: handleBlur,
              })}
            />
          </div>
        </div>
      </div>
    </form>
  );
};

export default NewFolder;
