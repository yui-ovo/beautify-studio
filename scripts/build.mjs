import { build } from 'esbuild';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { VERSION, BUTTON_NAME } from '../src/config.js';
await mkdir('dist', { recursive: true });
await build({ entryPoints:['src/main.js'], bundle:true, format:'esm', target:['safari15','chrome100'], loader:{'.css':'text'}, outfile:'dist/beautify-studio.js', charset:'utf8', legalComments:'inline' });
const content = await readFile('dist/beautify-studio.js', 'utf8');
await writeFile('index.js', content);
const script = {
  type:'script', enabled:true, name:`美化工作室 v${VERSION}`,
  id:'5c0e113d-ff11-4e74-937d-89791301b43e',
  info:'美化工作室：支持通用元素点选、独立底栏背景、条件正文字号和输入框提示语微调，以及浮动手柄、作者说明和图片资源替换；支持保存当前美化、直接注入原美化和副本导出。保留美化库、TT 适配和布局诊断。升级前请停用旧版 TT 美化适配脚本。',
  content, button:{enabled:true,buttons:[{name:BUTTON_NAME,visible:true}]}, data:{}, export_with:{data:true,button:true},
};
await writeFile('dist/美化工作室.json', JSON.stringify(script,null,2)+'\n');
console.log(`美化工作室 v${VERSION} · 构建完成（${Math.round(Buffer.byteLength(content)/1024)} KB）`);
