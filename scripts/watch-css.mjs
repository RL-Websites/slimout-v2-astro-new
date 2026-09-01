// Dev-time companion to build-css.mjs: compiles once immediately, then watches the
// public-hosted SCSS source tree and recompiles on every change. Runs alongside
// `astro dev` (see package.json's "dev" script) since Astro/Vite has no visibility into
// public/ contents and can't trigger this itself.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildCss } from './build-css.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const scssDir = path.join(root, 'public/Themes/Thrivewellrx.Theme.SlimoutV2/assets/scss');

let pending = false;
let running = false;

async function rebuild() {
  if (running) {
    pending = true;
    return;
  }
  running = true;
  try {
    await buildCss();
  } catch (err) {
    console.error('[css] build failed:', err.message);
  } finally {
    running = false;
    if (pending) {
      pending = false;
      rebuild();
    }
  }
}

await rebuild();

fs.watch(scssDir, { recursive: true }, (_event, filename) => {
  if (!filename || !filename.endsWith('.scss')) return;
  rebuild();
});

console.log(`[css] watching ${path.relative(root, scssDir).split(path.sep).join('/')} for changes`);
