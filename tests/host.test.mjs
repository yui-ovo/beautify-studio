import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readInstalledThemes, verifySavedTheme, deleteInstalledThemes, updateActiveThemeCss } from '../src/host/themes.js';
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

function editableHost({save=true}={}) {
  const preset={name:'原美化',custom_css:'old',blur_strength:12};
  const library=[preset];
  const h=host({themes:library});
  let clicks=0;
  const select={value:preset.name};
  const style={textContent:'old'};
  const input={value:'old',dispatchEvent(event){assert.equal(event.type,'input');style.textContent=this.value;}};
  const update={click(){clicks++;if(save) preset.custom_css=input.value;}};
  h.Event=Event;
  h.setTimeout=(fn,ms)=>setTimeout(fn,ms===250?0:ms);
  h.document={getElementById:id=>({themes:select,customCSS:input,'custom-style':style,'ui-preset-update-button':update})[id]};
  return {h,preset,library,select,style,input,get clicks(){return clicks;}};
}

test('updates the active preset through native controls without creating a copy',async()=>{
  const f=editableHost();
  await updateActiveThemeCss(f.h,{name:'原美化',custom_css:'new'},'old');
  assert.equal(f.clicks,1);
  assert.equal(f.style.textContent,'new');
  assert.equal(f.input.value,'new');
  assert.deepEqual(f.library,[{name:'原美化',custom_css:'new',blur_strength:12}]);
});

test('refuses stale CSS or a switched theme before writing',async()=>{
  const f=editableHost();
  await assert.rejects(updateActiveThemeCss(f.h,{name:'原美化',custom_css:'new'},'stale'),/其他操作修改/);
  f.select.value='其他美化';
  await assert.rejects(updateActiveThemeCss(f.h,{name:'原美化',custom_css:'new'},'old'),/当前美化已切换/);
  assert.equal(f.clicks,0);assert.equal(f.style.textContent,'old');
});

test('does not report success when the visible CSS changed but saving failed',async()=>{
  const f=editableHost({save:false});
  await assert.rejects(updateActiveThemeCss(f.h,{name:'原美化',custom_css:'new'},'old'),/未核实原美化保存/);
  assert.equal(f.preset.custom_css,'old');assert.equal(f.style.textContent,'new');
  assert.equal(f.clicks,1);
});
