import { build } from 'esbuild';
await build({entryPoints:['tests/browser-entry.js'],bundle:true,format:'esm',loader:{'.css':'text'},outfile:'dist/browser-tests.js'});
console.log('Open /preview/regression.html on the preview server.');
