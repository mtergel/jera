import create from 'zustand';
import {getConfig} from '#preload';

interface ConfigState {
  config: configOptions;
  loadConfig: () => Promise<void>;
  reloadConfig: () => Promise<void>;
}

const defaultConfig = {
  fontFamily: 'Poppins',
  colors: {
    base: '#282828',
    line: '#4f4f4f',
    textPrimary: '#ffffff',
    textMuted: '#aaaaaa',
    sidebarBase: '#1f1f1f',
  },
};

const root = document.documentElement;

const fetchConfig = async () => {
  return await getConfig();
};

const setVariables = (cfg: configOptions) => {
  root.style.setProperty('--font-system', cfg.fontFamily);

  root.style.setProperty('--color-base', cfg.colors.base);
  root.style.setProperty('--color-line', cfg.colors.line);
  root.style.setProperty('--color-text-primary', cfg.colors.textPrimary);
  root.style.setProperty('--color-text-muted', cfg.colors.textMuted);
  root.style.setProperty('--color-sidebar-base', cfg.colors.sidebarBase);
};

const useConfigStore = create<ConfigState>()(set => ({
  config: defaultConfig,
  loadConfig: async () => {
    const cfg = await fetchConfig();
    setVariables(cfg);
    set({
      config: cfg,
    });
  },
  reloadConfig: async () => {
    const cfg = await fetchConfig();
    console.log('Reloading config: ', cfg);
    setVariables(cfg);
    set({
      config: cfg,
    });
  },
}));

export default useConfigStore;
