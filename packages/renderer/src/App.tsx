import {useEffect, useState} from 'react';
import useConfigStore from './lib/config';
import {subscribeConfig} from '#preload';

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
    <div className="p-6 bg-base text-t-primary">
      <p className="text-t-muted">Hey psst!</p>
      <p className="text-t-muted">The world is yours boss.</p>
    </div>
  );
}

export default App;
