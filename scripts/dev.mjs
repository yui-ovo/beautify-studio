import http from 'node:http';
import path from 'node:path';
import { readFile } from 'node:fs/promises';
import { context } from 'esbuild';
const ctx = await context({ entryPoints:['src/main.js'], bundle:true, format:'iife', target:'es2020', loader:{'.css':'text'}, outfile:'dist/beautify-studio.js', charset:'utf8' });
await ctx.watch();
const root = process.cwd();
const types = { '.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png' };
http.createServer(async (req,res) => {
  try {
    const url = new URL(req.url,'http://localhost');
    const relative = url.pathname === '/' ? 'preview/index.html' : decodeURIComponent(url.pathname).slice(1);
    if (!['preview/','dist/','docs/'].some(prefix=>relative.startsWith(prefix))) throw new Error('Forbidden');
    const file = path.resolve(root,relative);
    if (!file.startsWith(root+path.sep)) throw new Error('Forbidden');
    res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});
    res.end(await readFile(file));
  } catch { res.writeHead(404); res.end('Not found'); }
}).listen(4173,'127.0.0.1',()=>console.log('Studio preview: http://127.0.0.1:4173'));
