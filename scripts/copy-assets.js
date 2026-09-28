const fs = require('fs');
const path = require('path');

const RUNTIME_ASSETS = ['icon.ico', 'icon-16.png', 'icon-512.png'];

function copyAssets(sourceDir, destinationDir) {
  fs.mkdirSync(destinationDir, { recursive: true });
  for (const file of RUNTIME_ASSETS) {
    fs.copyFileSync(path.join(sourceDir, file), path.join(destinationDir, file));
  }
}

function copyBundledNotices(projectDir, destinationDir) {
  const sources = [
    ['Framely', path.join(projectDir, 'LICENSE')],
    ['Framely notices', path.join(projectDir, 'NOTICE.md')],
    ...['react', 'react-dom', 'scheduler', 'lucide-react', '@paper-design/shaders'].map((name) => [
      name, path.join(projectDir, 'node_modules', name, 'LICENSE'),
    ]),
    ['Paper Shaders notices', path.join(projectDir, 'node_modules/@paper-design/shaders/NOTICE')],
  ];
  const notices = sources.map(([name, file]) => `=== ${name} ===\n${fs.readFileSync(file, 'utf8')}`);
  fs.writeFileSync(path.join(destinationDir, 'THIRD-PARTY-NOTICES.txt'), notices.join('\n\n'), 'utf8');
}

module.exports = { copyAssets, copyBundledNotices, RUNTIME_ASSETS };
