const colorList = ['base', 'line', 'textPrimary', 'textMuted', 'sidebarBase'];

export const getColorMap: {
  <T>(colors: T): T extends (infer U)[] ? {[k: string]: U} : T;
} = colors => {
  if (!Array.isArray(colors)) {
    return colors;
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return colors.reduce((result, color, index) => {
    if (index < colorList.length) {
      result[colorList[index]] = color;
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return result;
  }, {});
};
