// Runs the CSS watcher and `astro dev` side by side (no extra dependency like
// `concurrently` — just two child processes sharing stdio). Ctrl+C stops both.

import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const astroBin = path.join(root, 'node_modules/astro/bin/astro.mjs');

const children = [
  spawn(process.execPath, [path.join(__dirname, 'watch-css.mjs')], { cwd: root, stdio: 'inherit' }),
  spawn(process.execPath, [astroBin, 'dev'], { cwd: root, stdio: 'inherit' }),
];

function shutdown() {
  for (const child of children) child.kill();
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

for (const child of children) {
  child.on('exit', (code) => {
    if (code !== 0 && code !== null) shutdown();
  });
}
