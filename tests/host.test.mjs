import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readInstalledThemes, verifySavedTheme } from '../src/host/themes.js';
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
