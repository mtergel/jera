declare namespace Electron {
  interface App {
    config: typeof import('../packages/main/src/lib/config');
    plugins: typeof import('../packages/main/src/lib/plugins');
  }
}
