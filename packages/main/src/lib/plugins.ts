import {app, dialog, ipcMain} from 'electron';
import {resolve, basename} from 'path';
import {writeFileSync} from 'fs';
import Config from 'electron-store';
import * as config from './config';
import notify from '../lib/notify';
import {availableExtensions} from '../plugins/extensions';
import {plugs} from '../config/paths';
import {promisify} from 'util';
import {exec, execFile} from 'child_process';
import {install} from '../plugins/install';
import * as api from './api';

// local storage
const cache = new Config();

const path = plugs.base;
const localPath = plugs.local;

// caches
let plugins = config.getPlugins();
let paths = getPaths();
let id = getId(plugins);
let modules = requirePlugins();

function getId(plugins_: any) {
  return JSON.stringify(plugins_);
}

const watchers: Function[] = [];

// we listen on configuration updates to trigger
// plugin installation
config.subscribe(() => {
  const plugins_ = config.getPlugins();
  if (plugins !== plugins_) {
    const id_ = getId(plugins_);
    if (id !== id_) {
      id = id_;
      plugins = plugins_;
      updatePlugins();
    }
  }
});

let updating = false;

function updatePlugins({force = false} = {}) {
  if (updating) {
    return notify('Plugin update in progress');
  }
  updating = true;
  syncPackageJSON();
  const id_ = id;
  install(err => {
    updating = false;

    if (err) {
      notify('Error updating plugins.', err, {error: err});
    } else {
      // flag successful plugin update
      cache.set('jera.plugins', id_);

      // cache paths
      paths = getPaths();

      // clear require cache
      clearCache();

      // cache modules
      modules = requirePlugins();

      const loaded = modules.length;
      const total = paths.plugins.length + paths.localPlugins.length;
      const pluginVersions = JSON.stringify(getPluginVersions());
      const changed = cache.get('jera.plugin-versions') !== pluginVersions && loaded === total;
      cache.set('jera.plugin-versions', pluginVersions);

      // notify watchers
      watchers.forEach(fn => {
        fn(err, {force});
      });

      if (force || changed) {
        if (changed) {
          notify(
            'Plugins Updated',
            'Restart the app or hot-reload with "View" > "Reload" to enjoy the updates!',
          );
        } else {
          notify('Plugins Updated', 'No changes!');
        }
      }
    }
  });
}

function getPluginVersions() {
  const paths_ = paths.plugins.concat(paths.localPlugins);
  return paths_.map(path_ => {
    let version: string | null = null;
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      version = require(resolve(path_, 'package.json')).version;
      //eslint-disable-next-line no-empty
    } catch (err) {}
    return [basename(path_), version];
  });
}

function clearCache() {
  // trigger unload hooks
  modules.forEach(mod => {
    if (mod.onUnload) {
      mod.onUnload(app);
    }
  });

  // clear require cache
  for (const entry in require.cache) {
    if (entry.indexOf(path) === 0 || entry.indexOf(localPath) === 0) {
      delete require.cache[entry];
    }
  }
}

export {updatePlugins};

export const getLoadedPluginVersions = () => {
  return modules.map(mod => ({name: mod._name, version: mod._version}));
};

// we schedule the initial plugins update
// a bit after the user launches the terminal
// to prevent slowness
if (cache.get('jera.plugins') !== id) {
  // install immediately if the user changed plugins
  console.log('plugins have changed / not init, scheduling plugins installation');
  setTimeout(() => {
    updatePlugins();
  }, 1000);
}

function syncPackageJSON() {
  const dependencies = toDependencies(plugins);
  const pkg = {
    name: 'jera-plugins',
    description: 'Auto-generated from `~/.jera.js`!',
    private: true,
    version: '0.0.1',
    repository: 'tergelm/jera',
    dependencies,
  };

  const file = resolve(path, 'package.json');
  try {
    writeFileSync(file, JSON.stringify(pkg, null, 2));
  } catch (err) {
    alert(`An error occurred writing to ${file}`);
  }
}

function alert(message: string) {
  void dialog.showMessageBox({
    message,
    buttons: ['Ok'],
  });
}

function toDependencies(plugins_: {plugins: string[]}) {
  const obj: Record<string, string> = {};
  plugins_.plugins.forEach(plugin => {
    const regex = /.(@|#)/;
    const match = regex.exec(plugin);

    if (match) {
      const index = match.index + 1;
      const pieces: string[] = [];

      pieces[0] = plugin.substring(0, index);
      pieces[1] = plugin.substring(index + 1, plugin.length);
      obj[pieces[0]] = pieces[1];
    } else {
      obj[plugin] = 'latest';
    }
  });
  return obj;
}

export const subscribe = (fn: Function) => {
  watchers.push(fn);
  return () => {
    watchers.splice(watchers.indexOf(fn), 1);
  };
};

function getPaths() {
  return {
    plugins: plugins.plugins.map(name => {
      return resolve(path, 'node_modules', name.split('#')[0]);
    }),
    localPlugins: plugins.localPlugins.map(name => {
      return resolve(localPath, name);
    }),
  };
}

// expose to renderer
export {getPaths};

// get paths from renderer
export const getBasePaths = () => {
  return {path, localPath};
};

function requirePlugins(): any[] {
  const {plugins: plugins_, localPlugins} = paths;

  const load = (path_: string) => {
    let mod: any;
    try {
      mod = require(path_);
      const exposed = mod && Object.keys(mod).some(key => availableExtensions.has(key));
      if (!exposed) {
        notify(
          'Plugin error!',
          `${`Plugin "${basename(path_)}" does not expose any `}Jera extension API methods`,
        );
        return;
      }

      // populate the name for internal errors here
      mod._name = basename(path_);
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        mod._version = require(resolve(path_, 'package.json')).version;
      } catch (err) {
        console.warn(`No package.json found in ${path_}`);
      }
      console.log(`Plugin ${mod._name} (${mod._version}) loaded.`);

      return mod;
    } catch (_err) {
      const err = _err as {code: string; message: string};
      if (err.code === 'MODULE_NOT_FOUND') {
        console.warn(`Plugin error while loading "${basename(path_)}" (${path_}): ${err.message}`);
      } else {
        notify('Plugin error!', `Plugin "${basename(path_)}" failed to load (${err.message})`, {
          error: err,
        });
      }
    }
  };

  return plugins_
    .map(load)
    .concat(localPlugins.map(load))
    .filter(v => Boolean(v));
}

// decorates the base entity by calling plugin[key]
// for all the available plugins
function decorateEntity(base: any, key: string, type: 'object' | 'function') {
  let decorated = base;
  modules.forEach(plugin => {
    if (plugin[key]) {
      let res;
      try {
        res = plugin[key](decorated);
      } catch (e) {
        notify('Plugin error!', `"${plugin._name}" when decorating ${key}`, {error: e});
        return;
      }
      if (res && (!type || typeof res === type)) {
        decorated = res;
      } else {
        notify('Plugin error!', `"${plugin._name}": invalid return type for \`${key}\``);
      }
    }
  });

  return decorated;
}

function decorateObject<T>(base: T, key: string): T {
  return decorateEntity(base, key, 'object');
}

export const decorateMenu = (tpl: any) => {
  return decorateObject(tpl, 'decorateMenu');
};

export const getDecoratedEnv = (baseEnv: Record<string, string>) => {
  return decorateObject(baseEnv, 'decorateEnv');
};

export const getDecoratedConfig = () => {
  const baseConfig = config.getConfig();
  const decoratedConfig = decorateObject(baseConfig, 'decorateConfig');
  const fixedConfig = config.fixConfigDefaults(decoratedConfig);
  return fixedConfig;
};

export {toDependencies as _toDependencies};

ipcMain.handle('child_process.exec', (_, args) => {
  const {command, options} = args;
  return promisify(exec)(command, options);
});

ipcMain.handle('child_process.execFile', (_, _args) => {
  const {file, args, options} = _args;
  return promisify(execFile)(file, args, options);
});

ipcMain.handle('config:get', _ => {
  return getDecoratedConfig();
});

ipcMain.handle('plugins:get', _ => {
  return api.list();
});

ipcMain.handle('plugins:install', (_, plugin, locally) => {
  return api.install(plugin, locally);
});

ipcMain.handle('plugins:uninstall', (_, plugin) => {
  return api.uninstall(plugin);
});
