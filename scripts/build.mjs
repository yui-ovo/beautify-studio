import { build } from 'esbuild';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { VERSION, BUTTON_NAME } from '../src/config.js';
await mkdir('dist', { recursive: true });
await build({ entryPoints:['src/main.js'], bundle:true, format:'esm', target:['safari15','chrome100'], loader:{'.css':'text'}, outfile:'dist/beautify-studio.js', charset:'utf8', legalComments:'none' });
const content = await readFile('dist/beautify-studio.js', 'utf8');
await writeFile('index.js', content);
const script = {
  type:'script', enabled:true, name:`美化工作室 v${VERSION}`,
  id:'5c0e113d-ff11-4e74-937d-89791301b43e',
  info:'美化工作室：支持头像与底栏可视化微调、浮动手柄和作者说明；支持主题副本保存/导出。保留美化库、TT 适配和布局诊断。升级前请停用旧版 TT 美化适配脚本。',
  content, button:{enabled:true,buttons:[{name:BUTTON_NAME,visible:true}]}, data:{}, export_with:{data:true,button:true},
};
await writeFile('dist/美化工作室.json', JSON.stringify(script,null,2)+'\n');
console.log(`美化工作室 v${VERSION} · 构建完成（${Math.round(Buffer.byteLength(content)/1024)} KB）`);
