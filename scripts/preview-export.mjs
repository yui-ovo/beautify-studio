import { build } from 'esbuild';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const output = path.resolve(process.argv[2] || '../../outputs');
await mkdir(output, { recursive: true });
const result = await build({ entryPoints: ['src/main.js'], bundle: true, format: 'iife', target: ['safari15', 'chrome100'], loader: { '.css': 'text' }, charset: 'utf8', write: false });
const css = await readFile('preview/preview.css', 'utf8');
const fixture = (await readFile('preview/mock-host.js', 'utf8')).replace("await import('/dist/beautify-studio.js');", () => result.outputFiles[0].text);
const html = (await readFile('preview/index.html', 'utf8'))
  .replace('<link rel="stylesheet" href="/preview/preview.css">', () => `<style>${css}</style>`)
  .replace('<script type="module" src="/preview/mock-host.js"></script>', () => `<script type="module">${fixture.replace(/<\/script/gi, '<\\/script')}</script>`);
await writeFile(path.join(output, '美化工作室-交互预览.html'), html);
console.log('Standalone preview exported.');
