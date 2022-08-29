import {useEffect, useState} from 'react';
import useConfigStore from './lib/config';
import {subscribeConfig, listInstalledPlugins, installPlugin, uninstallPlugin} from '#preload';

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
    <div className="p-6">
      <blockquote>“Freedom without any purpose feels a whole lot like boredom.”</blockquote>
      <p className="text-t-muted">― Inio Asano</p>

      <div className="mt-6">
        <Plugins />
      </div>
    </div>
  );
}

const Plugins: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [plugins, setPlugins] = useState<string | false | null>(null);

  const handleLoad = async () => {
    setLoading(true);
    const data = await listInstalledPlugins();
    setPlugins(data);
    setLoading(false);
    console.log(plugins, typeof plugins);
  };

  return (
    <div>
      <h2 className="font-bold">Installed Plugins</h2>
      <div className="mt-4">
        <button
          type="button"
          className="bg-blue-300 text-black px-3.5 py-2 rounded-md"
          onClick={handleLoad}
        >
          {loading ? 'Loading' : 'Load installed plugins'}{' '}
        </button>
      </div>
      <div className="mt-4">
        <InstallPlugin />
      </div>
      <div className="mt-4">
        <UninstallPlugin />
      </div>
    </div>
  );
};

const pluginName = 'jera-everforest-dark';

const InstallPlugin: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const handleLoad = async () => {
    setLoading(true);
    await installPlugin(pluginName);
    setLoading(false);
  };

  return (
    <button
      type="button"
      className="bg-blue-300 text-black px-3.5 py-2 rounded-md"
      onClick={handleLoad}
    >
      {loading ? 'Loading' : 'Install Everforest Theme'}
    </button>
  );
};

const UninstallPlugin: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const handleLoad = async () => {
    setLoading(true);
    await uninstallPlugin(pluginName);
    setLoading(false);
  };

  return (
    <button
      type="button"
      className="bg-red-300 text-black px-3.5 py-2 rounded-md"
      onClick={handleLoad}
    >
      {loading ? 'Loading' : 'Uninstall Everforest Theme'}
    </button>
  );
};

export default App;
