const { createServer } = require('vite');
const esbuild = require('esbuild');
const { spawn } = require('child_process');
const electronPath = require('electron');
const path = require('path');
const fs = require('fs');
const { copyAssets } = require('./copy-assets');

async function dev() {
  // Ensure dist directory exists
  const distPath = path.join(__dirname, '../app-bundle');
  if (!fs.existsSync(distPath)) {
    fs.mkdirSync(distPath);
  }

  // Copy assets folder
  const assetsSrc = path.join(__dirname, '../assets');
  const assetsDest = path.join(distPath, 'assets');
  copyAssets(assetsSrc, assetsDest);

  // 1. Start Vite Dev Server
  const server = await createServer({
    configFile: path.join(__dirname, '../vite.config.ts'),
  });
  await server.listen();
  console.log(`Vite dev server running at: http://localhost:5173`);

  let electronProcess = null;

  const restartElectron = () => {
    if (electronProcess) {
      electronProcess.kill('SIGINT');
      electronProcess = null;
    }

    console.log('Starting Electron...');
    electronProcess = spawn(electronPath, ['app-bundle/main.js', '--no-sandbox'], {
      stdio: 'inherit',
      env: {
        ...process.env,
        NODE_ENV: 'development',
      },
    });

    electronProcess.on('close', (code) => {
      if (code !== null) {
        // App exited normally or crashed
        process.exit(code);
      }
    });
  };

  // 2. Build Electron main/preload using esbuild with plugin for rebuild triggers
  const rebuildPlugin = {
    name: 'rebuild-notifier',
    setup(build) {
      build.onEnd((result) => {
        if (result.errors.length > 0) {
          console.error('Esbuild compile failed with errors');
          return;
        }
        console.log('Esbuild compile successful.');
        restartElectron();
      });
    },
  };

  const context = await esbuild.context({
    entryPoints: {
      main: path.join(__dirname, '../src/main/main.ts'),
      preload: path.join(__dirname, '../src/preload/preload.ts'),
    },
    bundle: true,
    platform: 'node',
    external: ['electron'],
    outdir: distPath,
    sourcemap: 'inline',
    plugins: [rebuildPlugin],
  });

  // Watch for main/preload changes
  await context.watch();
}

dev().catch((err) => {
  console.error('Failed to start dev server:', err);
  process.exit(1);
});
