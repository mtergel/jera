import {readFileSync, writeFileSync} from 'fs-extra';
import {sync as mkdirpSync} from 'mkdirp';
import {plugs, defaultCfg, cfgPath} from './paths';
import {_init, _extractDefault} from './init';

let defaultConfig: rawConfig;

const _write = (path: string, data: string) => {
  // This method will take text formatted as Unix line endings and transform it
  // to text formatted with DOS line endings. We do this because the default
  // text editor on Windows (notepad) doesn't Deal with LF files. Still. In 2017.
  const crlfify = (str: string) => {
    return str.replace(/\r?\n/g, '\r\n');
  };
  const format = process.platform === 'win32' ? crlfify(data.toString()) : data;
  writeFileSync(path, format, 'utf8');
};

const _importConf = () => {
  // init plugin directories if not present
  mkdirpSync(plugs.base);
  mkdirpSync(plugs.local);

  let defaultCfgRaw = '';
  try {
    defaultCfgRaw = readFileSync(defaultCfg, 'utf8');
  } catch (err) {
    console.log(err);
  }
  const _defaultCfg = _extractDefault(defaultCfgRaw) as rawConfig;

  // Import user config
  let userCfg: string;
  try {
    userCfg = readFileSync(cfgPath, 'utf8');
  } catch (err) {
    _write(cfgPath, defaultCfgRaw);
    userCfg = defaultCfgRaw;
  }

  return {userCfg, defaultCfg: _defaultCfg};
};

export const _import = () => {
  const imported = _importConf();
  defaultConfig = imported.defaultCfg;
  const result = _init(imported);
  return result;
};

export const getDefaultConfig = () => {
  if (!defaultConfig) {
    defaultConfig = _importConf().defaultCfg;
  }
  return defaultConfig;
};
