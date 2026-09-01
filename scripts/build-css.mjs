// Compiles src-less SCSS: Sass source lives under
// public/Themes/Thrivewellrx.Theme.SlimoutV2/assets/scss/, which Astro/Vite never processes
// (everything under public/ is copied byte-for-byte). So this script runs *before* Astro,
// outside its build pipeline entirely: Sass compiles our BEM partials, then plain PostCSS +
// Tailwind resolves @apply/@layer against tailwind.config.js, and the final CSS is written
// back into public/ as a plain, already-compiled file — which Astro then just copies as-is.
//
// The `@import "tailwindcss"` + `@config` lines are injected here (not in main.scss) because
// Sass's own import resolution tries to load a bare `@import "tailwindcss";` as a Sass
// partial and fails (no such .scss file exists) unless something else is running interception
// first (which is what Vite normally provided). Feeding it directly to plain PostCSS instead
// — with no Sass involved on that line — is the setup Tailwind v4 documents for non-Vite
// toolchains, and it works reliably here.

import { compile } from 'sass';
import postcss from 'postcss';
import tailwindcss from '@tailwindcss/postcss';
import autoprefixer from 'autoprefixer';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const THEME_ASSETS = path.join(root, 'public/Themes/Thrivewellrx.Theme.SlimoutV2/assets');
const scssEntry = path.join(THEME_ASSETS, 'scss/main.scss');
const outDir = path.join(THEME_ASSETS, 'css');
const outFile = path.join(outDir, 'style.css');
const tailwindConfig = path.join(root, 'tailwind.config.js').split(path.sep).join('/');

export async function buildCss({ silent = false } = {}) {
  const started = Date.now();

  // `@import` is deprecated in Dart Sass (removal targeted for 3.0.0) but is what lets each
  // partial resolve relative to itself regardless of nesting depth; switching to `@use`/
  // `@forward` changes scoping semantics (namespacing, no implicit global leakage) and isn't
  // a drop-in swap. Silencing the warning here is intentional, not an oversight.
  const sassResult = compile(scssEntry, {
    style: 'expanded',
    silenceDeprecations: ['import'],
  });

  const source = `@import "tailwindcss";\n@config "${tailwindConfig}";\n${sassResult.css}`;

  const result = await postcss([tailwindcss(), autoprefixer()]).process(source, {
    from: scssEntry,
    to: outFile,
  });

  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outFile, result.css);

  if (!silent) {
    const kb = (Buffer.byteLength(result.css) / 1024).toFixed(1);
    const rel = path.relative(root, outFile).split(path.sep).join('/');
    console.log(`[css] ${rel} (${kb} KB) in ${Date.now() - started}ms`);
  }
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  buildCss().catch((err) => {
    console.error('[css] build failed:', err.message);
    process.exit(1);
  });
}
