import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readInstalledThemes, verifySavedTheme, deleteInstalledThemes } from '../src/host/themes.js';
function host(payload, status=200) {
  return {SillyTavern:{getContext:()=>({getRequestHeaders:()=>({'X-CSRF-Token':'test'})})},AbortController,setTimeout,clearTimeout,
    fetch:async (url, options)=>{
      assert.equal(url,'/api/settings/get');
      assert.equal(options.method,'POST');
      assert.equal(options.headers['X-CSRF-Token'],'test');
      return new Response(JSON.stringify(payload),{status});
    }};
}
test('reads stored themes, filters unrelated fields and returns isolated data', async()=>{
  const theme = {name:'收藏',custom_css:'.mes {color:red;}'};
  const result = await readInstalledThemes(host({themes:[theme,JSON.stringify(theme),'bad',{name:'角色'}],settings:'PRIVATE'}));
  assert.equal(result.length,2); assert.equal(result[0].custom_css,theme.custom_css);
  result[0].custom_css='changed'; assert.notEqual(theme.custom_css,'changed');
  assert.equal(result.settings,undefined);
});
test('checks saved CSS, not merely the presence of a new dropdown option',async()=>{
  const theme = {name:'收藏',custom_css:'abc'};
  assert.equal(await verifySavedTheme(host({themes:[theme]}),theme),true);
  assert.equal(await verifySavedTheme(host({themes:[{...theme,custom_css:'old'}]}),theme),false);
});
test('disconnected host, failed request and unexpected schema give actionable errors',async()=>{
  await assert.rejects(readInstalledThemes({}),/未连接酒馆/);
  await assert.rejects(readInstalledThemes(host({},403)),/403/);
  await assert.rejects(readInstalledThemes(host({})),/未返回美化列表/);
});
test('deletes selected themes through the native endpoint and verifies removal',async()=>{
  const remaining = [{name:'保留',custom_css:'keep'}];
  const calls = [];
  const h = {SillyTavern:{getContext:()=>({getRequestHeaders:()=>({'X-CSRF-Token':'test'})})},AbortController,setTimeout,clearTimeout,fetch:async(url,options)=>{
    calls.push({url,body:options.body,headers:options.headers});
    if(url==='/api/themes/delete') { const name=JSON.parse(options.body).name; const index=remaining.findIndex(t=>t.name===name); if(index>=0) remaining.splice(index,1); return new Response('',{status:200}); }
    return new Response(JSON.stringify({themes:remaining}),{status:200});
  }};
  assert.equal(await deleteInstalledThemes(h,['删掉','删掉']),1);
  assert.deepEqual(calls.filter(x=>x.url==='/api/themes/delete').map(x=>JSON.parse(x.body).name),['删掉']);
  assert.equal(calls.find(x=>x.url==='/api/themes/delete').headers['Content-Type'],'application/json');
});
