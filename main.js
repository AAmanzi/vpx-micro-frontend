// This file bootstraps the TypeScript Electron main under src/electron
require('ts-node').register({
  transpileOnly: true,
  compilerOptions: { module: 'commonjs', esModuleInterop: true },
});
require('tsconfig-paths/register');
require('./src/electron/main.ts');
