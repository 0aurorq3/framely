const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const asar = require('@electron/asar');
const { RUNTIME_ASSETS } = require('./copy-assets');

const project = path.resolve(__dirname, '..');
const directory = path.resolve(process.argv[2] || path.join(project, 'release/win-unpacked'));
const archive = path.join(directory, 'resources/app.asar');
const sourcePackage = JSON.parse(fs.readFileSync(path.join(project, 'package.json'), 'utf8'));
const packaged = JSON.parse(asar.extractFile(archive, 'package.json').toString());
const files = asar.listPackage(archive).map((file) => file.replaceAll('\\', '/').replace(/^\//, ''));

assert.equal(packaged.version, sourcePackage.version, 'Packaged version does not match the source');
assert(files.includes('main.js') && files.includes('preload.js') && files.includes('renderer/index.html'));
for (const name of ['react', 'react-dom', 'scheduler', 'lucide-react', '@paper-design/shaders']) {
  assert(!files.some((file) => file.startsWith(`node_modules/${name}/`)), `Bundled-only dependency was copied: ${name}`);
}
assert(!files.some((file) => file.endsWith('.map')), 'Development source maps were packaged');
assert(!files.some((file) => /^node_modules\/sharp\/(src|install|lib)\//.test(file)), 'Sharp build sources were packaged');
assert(!files.some((file) => /^node_modules\/sharp\/dist\/.*\.(mjs|d\.cts|d\.mts)$/.test(file)), 'Unused Sharp modules were packaged');
assert(files.some((file) => file.endsWith('.node')), 'Native image processing binary is missing');
assert.equal(files.filter((file) => /^renderer\/assets\/[^/]+\.webp$/.test(file)).length, 10, 'Background presets are missing');
for (const file of RUNTIME_ASSETS) assert(files.includes(`assets/${file}`), `Runtime icon is missing: ${file}`);
const notices = asar.extractFile(archive, 'THIRD-PARTY-NOTICES.txt').toString();
for (const name of ['react', 'react-dom', 'scheduler', 'lucide-react', '@paper-design/shaders']) {
  assert(notices.includes(`=== ${name} ===`), `Bundled license notice is missing: ${name}`);
}

const locales = fs.readdirSync(path.join(directory, 'locales')).filter((file) => file.endsWith('.pak')).sort();
assert.deepEqual(locales, ['en-US.pak', 'ja.pak'], 'Unexpected Windows locale files');

// Exercise Sharp inside the actual packaged Electron runtime, not the developer's Node.js.
const executable = path.join(directory, `${sourcePackage.build.productName}.exe`);
const code = `
  const assert = require('node:assert/strict');
  const path = require('node:path');
  const sharp = require(path.join(${JSON.stringify(archive)}, 'node_modules/sharp'));
  (async () => {
    for (const format of ['png', 'jpeg', 'webp']) {
      const output = await sharp({ create: { width: 32, height: 24, channels: 4, background: '#6572ff' } })[format]().toBuffer();
      const metadata = await sharp(output).metadata();
      assert.equal(metadata.format, format);
      assert.equal(metadata.width, 32);
      assert.equal(metadata.height, 24);
    }
    console.log('Packaged PNG / JPEG / WebP encoding passed');
  })().catch(error => { console.error(error); process.exitCode = 1; });
`;
const result = spawnSync(executable, ['-e', code], {
  encoding: 'utf8',
  windowsHide: true,
  timeout: 30000,
  env: { ...process.env, ELECTRON_RUN_AS_NODE: '1' },
});
if (result.error) throw result.error;
assert.equal(result.status, 0, result.stderr || result.stdout || 'Packaged runtime failed');
process.stdout.write(result.stdout);

function directorySize(folder) {
  return fs.readdirSync(folder, { withFileTypes: true }).reduce((total, entry) => {
    const file = path.join(folder, entry.name);
    return total + (entry.isDirectory() ? directorySize(file) : entry.isFile() ? fs.statSync(file).size : 0);
  }, 0);
}
console.log(JSON.stringify({
  version: packaged.version,
  archiveBytes: fs.statSync(archive).size,
  unpackedAppBytes: directorySize(directory),
  locales,
  backgrounds: 10,
}, null, 2));
