import { build, context } from 'esbuild';
import { readFile, rm, mkdir } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const dist = resolve(root, 'dist');
const watch = process.argv.includes('--watch');

const banner = `/*! flow-datepicker v${JSON.parse(await readFile(resolve(root, 'package.json'), 'utf8')).version} | MIT License */`;

const targets = [
  { entryPoints: ['src/index.js'], outfile: 'dist/flow-datepicker.esm.js', format: 'esm', minify: false },
  { entryPoints: ['src/index.js'], outfile: 'dist/flow-datepicker.esm.min.js', format: 'esm', minify: true },
  { entryPoints: ['src/auto.js'], outfile: 'dist/flow-datepicker.js', format: 'iife', minify: false },
  { entryPoints: ['src/auto.js'], outfile: 'dist/flow-datepicker.min.js', format: 'iife', minify: true },
  { entryPoints: ['src/flow-datepicker.css'], outfile: 'dist/flow-datepicker.css', minify: false },
  { entryPoints: ['src/flow-datepicker.css'], outfile: 'dist/flow-datepicker.min.css', minify: true }
];

const shared = {
  absWorkingDir: root,
  bundle: true,
  target: ['chrome123', 'edge123', 'firefox125', 'safari17.5'],
  banner: { js: banner, css: banner },
  sourcemap: true,
  legalComments: 'none',
  logLevel: 'warning'
};

async function report() {
  const rows = [];
  for (const file of ['flow-datepicker.min.js', 'flow-datepicker.esm.min.js', 'flow-datepicker.min.css']) {
    const content = await readFile(resolve(dist, file));
    rows.push(`${file.padEnd(30)} ${(content.length / 1024).toFixed(1).padStart(6)} KB   gzip ${(gzipSync(content).length / 1024).toFixed(1).padStart(5)} KB`);
  }
  console.log(rows.join('\n'));
}

if (watch) {
  for (const target of targets) {
    const ctx = await context({ ...shared, ...target });
    await ctx.watch();
  }
  console.log('Watching src/ ...');
} else {
  await rm(dist, { recursive: true, force: true });
  await mkdir(dist, { recursive: true });
  await Promise.all(targets.map((target) => build({ ...shared, ...target })));
  await report();
}
