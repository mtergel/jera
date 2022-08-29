// This module exports paths, names, and other metadata that is referenced
import {homedir} from 'os';
import {app} from 'electron';
import {statSync} from 'fs';
import {resolve, join} from 'path';

const cfgFile = '.jera.js';
const defaultCfgFile = 'config-default.js';
const homeDirectory = homedir();

// If the user defines XDG_CONFIG_HOME they definitely want their config there,
// otherwise use the home directory in linux/mac and userdata in windows
const applicationDirectory =
  process.env.XDG_CONFIG_HOME !== undefined
    ? join(process.env.XDG_CONFIG_HOME, 'hyper')
    : process.platform == 'win32'
    ? app.getPath('userData')
    : homedir();

let cfgDir = applicationDirectory;
let cfgPath = join(applicationDirectory, cfgFile);

const devDir = resolve(__dirname, '../../');
const devCfg = join(devDir, cfgFile);
const defaultCfg = resolve(__dirname, defaultCfgFile);

if (import.meta.env.DEV) {
  // if a local config file exists, use it
  try {
    statSync(devCfg);
    cfgPath = devCfg;
    cfgDir = devDir;
    console.log('using config file:', cfgPath);
  } catch (err) {
    // ignore
  }
}

const plugins = resolve(cfgDir, '.jera_plugins');
const plugs = {
  base: plugins,
  local: resolve(plugins, 'local'),
  cache: resolve(plugins, 'cache'),
};
const yarn = resolve(__dirname, './bin/yarn-standalone.js');

export {cfgDir, cfgPath, cfgFile, defaultCfg, plugs, yarn, homeDirectory};
