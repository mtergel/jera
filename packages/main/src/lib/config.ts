import chokidar from 'chokidar';
import notify from './notify';
import {_import, getDefaultConfig} from '../config/import';
import {cfgPath, cfgDir} from '../config/paths';
import {getColorMap} from '../utils/colors';
import {app} from 'electron';

const watchers: Function[] = [];
let cfg: parsedConfig = {} as any;
let _watcher: chokidar.FSWatcher;

const checkDeprecatedConfig = () => {
  if (!cfg.config) {
    return;
  }

  // ADD
};

const _watch = () => {
  if (_watcher) {
    return;
  }

  const onChange = () => {
    // Need to wait 100ms to ensure that write is complete
    setTimeout(() => {
      cfg = _import();
      notify('Configuration updated', 'Hyper configuration reloaded!');
      watchers.forEach(fn => {
        fn();
      });
    }, 100);
  };

  _watcher = chokidar.watch(cfgPath);
  _watcher.on('change', onChange);
  _watcher.on('error', error => {
    console.error('error watching config', error);
  });

  app.on('before-quit', () => {
    if (Object.keys(_watcher.getWatched()).length > 0) {
      _watcher.close().catch(err => {
        console.warn(err);
      });
    }
  });
};

export const subscribe = (fn: Function) => {
  watchers.push(fn);
  return () => {
    watchers.splice(watchers.indexOf(fn), 1);
  };
};

export const getConfigDir = () => {
  // expose config directory to load plugin from the right place
  return cfgDir;
};

export const getConfig = () => {
  return cfg.config;
};

export const getPlugins = (): {plugins: string[]; localPlugins: string[]} => {
  return {
    plugins: cfg.plugins,
    localPlugins: cfg.localPlugins,
  };
};

export const setup = () => {
  cfg = _import();
  _watch();
  checkDeprecatedConfig();
};

export const fixConfigDefaults = (decoratedConfig: configOptions) => {
  const defaultConfig = getDefaultConfig().config!;
  decoratedConfig.colors = getColorMap(decoratedConfig.colors) || {};
  // We must have default colors for xterm css.
  decoratedConfig.colors = {...defaultConfig.colors, ...decoratedConfig.colors};
  return decoratedConfig;
};
