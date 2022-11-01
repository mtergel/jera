import {useEffect, useState} from 'react';
import useConfigStore from './lib/config';
import {subscribeConfig, createDb} from '#preload';
import Layout from './components/layout/Layout';
import _set from 'lodash/set';
import {IconContext} from 'react-icons';
import {Provider} from '@radix-ui/react-tooltip';
import useNotebook from './lib/notebook';

function App() {
  const [loading, setLoading] = useState(true);
  const loadConfig = useConfigStore(state => state.loadConfig);
  const loadFolders = useNotebook(state => state.loadFolders);

  // setup subscriptions
  useEffect(() => {
    // setup callback
    subscribeConfig(() => {
      loadCfg();
    });

    const loadCfg = async () => {
      await loadConfig();
      setLoading(false);
    };

    loadCfg();
  }, []);

  useEffect(() => {
    createDb(() => loadFolders());
  }, []);

  if (loading) {
    return null;
  }

  return (
    <IconContext.Provider
      value={{
        size: '20px',
      }}
    >
      <Provider delayDuration={450}>
        <Layout>
          <div className="p-6">
            <p className="text-3xl">The quick brown fox jumps over the lazy dog</p>
          </div>
        </Layout>
      </Provider>
    </IconContext.Provider>
  );
}
export default App;
