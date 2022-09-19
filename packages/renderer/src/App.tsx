import {useEffect, useState} from 'react';
import useConfigStore from './lib/config';
import {subscribeConfig} from '#preload';
import Layout from './components/layout/Layout';
import _set from 'lodash/set';
import {IconContext} from 'react-icons';

function App() {
  const [loading, setLoading] = useState(true);
  const loadConfig = useConfigStore(state => state.loadConfig);

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

  if (loading) {
    return null;
  }

  return (
    <IconContext.Provider
      value={{
        size: '20px',
      }}
    >
      <Layout>
        <div className="p-6">
          <p className="text-3xl">The quick brown fox jumps over the lazy dog</p>
          <p className="text-2xl">The quick brown fox jumps over the lazy dog</p>
          <p className="text-xl">The quick brown fox jumps over the lazy dog</p>
          <p className="text-lg">The quick brown fox jumps over the lazy dog</p>
          <p className="text-base">The quick brown fox jumps over the lazy dog</p>
        </div>
      </Layout>
    </IconContext.Provider>
  );
}
export default App;
