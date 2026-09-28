const esbuild = require('esbuild');
const { build } = require('vite');
const path = require('path');
const fs = require('fs');
const { copyAssets, copyBundledNotices } = require('./copy-assets');

async function compileAll() {
  const distPath = path.join(__dirname, '../app-bundle');
  
  // Clean dist folder
  if (fs.existsSync(distPath)) {
    fs.rmSync(distPath, { recursive: true, force: true });
  }
  fs.mkdirSync(distPath);

  // Copy assets folder
  const assetsSrc = path.join(__dirname, '../assets');
  const assetsDest = path.join(distPath, 'assets');
  copyAssets(assetsSrc, assetsDest);
  copyBundledNotices(path.resolve(__dirname, '..'), distPath);

  console.log('Building renderer process (React)...');
  await build({
    configFile: path.join(__dirname, '../vite.config.ts'),
  });

  console.log('Building main & preload processes (Electron)...');
  await esbuild.build({
    entryPoints: {
      main: path.join(__dirname, '../src/main/main.ts'),
      preload: path.join(__dirname, '../src/preload/preload.ts'),
    },
    bundle: true,
    platform: 'node',
    external: ['electron', 'sharp'],
    outdir: distPath,
    minify: true,
    sourcemap: false,
  });

  console.log('Build completed successfully.');
}

compileAll().catch((err) => {
  console.error('Build failed:', err);
  process.exit(1);
});
