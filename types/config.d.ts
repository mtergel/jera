type ColorMap = {
  base: string;
  line: string;
  textPrimary: string;
  textMuted: string;
  sidebarBase: string;
};

type configOptions = {
  fontFamily: string;
  colors: ColorMap;
};

type configKeys = keyof configOptions;

type rawConfig = {
  config?: configOptions;
  plugins?: string[];
  localPlugins?: string[];
};

type parsedConfig = {
  config: configOptions;
  plugins: string[];
  localPlugins: string[];
};
