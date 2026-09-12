import { test } from 'node:test';
import assert from 'node:assert/strict';
import { adaptTheme, stripAdapterPatch, stripTauriConflictingGeometry, analyzeCss } from '../src/core/adapter.js';
import { DEFAULT_OPTIONS, PATCH_START } from '../src/config.js';
import { validateTheme } from '../src/core/validation.js';

test('conversion keeps the source and arbitrary theme fields intact', () => {
  const source = {name:'我的美化',custom_css:'#sheld { top:10px; height:100vh; color:red; }',extension:{nested:[1,2]},font_scale:1.2};
  const before = JSON.stringify(source);
  const adapted = adaptTheme(source);
  assert.equal(JSON.stringify(source),before);
  assert.equal(adapted.name,'我的美化 - TT适配');
  assert.deepEqual(adapted.extension,source.extension);
  assert.equal(adapted.font_scale,1.2);
  assert.match(adapted.custom_css,/color:red/);
  assert.doesNotMatch(stripAdapterPatch(adapted.custom_css),/top:10px|height:100vh/);
});

test('repeated conversion replaces the patch without duplication', () => {
  const once = adaptTheme({name:'重复',custom_css:'.mes { color: red; }'});
  const twice = adaptTheme(once);
  assert.equal(twice.name,once.name);
  assert.equal(twice.custom_css,once.custom_css);
  assert.equal(twice.custom_css.split(PATCH_START).length,2);
});

test('removed Agent preference cannot force-hide the Agent even from old data', () => {
  assert.equal(Object.hasOwn(DEFAULT_OPTIONS,'hideAgentToggle'),false);
  const adapted = adaptTheme({name:'旧设置',custom_css:''},{hideAgentToggle:true});
  assert.doesNotMatch(adapted.custom_css,/#ttas_agent_send_toggle#ttas_agent_send_toggle/);
  assert.match(adapted.custom_css,/#ttas_agent_send_toggle\.displayNone/);
});

test('geometry repair respects the opt-out and other selectors', () => {
  const css = '#sheld {top:1px;height:100vh;color:red;} .mes{top:3px;height:10px;}';
  const adapted = adaptTheme({name:'布局',custom_css:css},{mobileGeometry:false});
  assert.equal(stripAdapterPatch(adapted.custom_css).trim(),css);
  assert.match(stripTauriConflictingGeometry(css).css,/\.mes\{top:3px;height:10px;\}/);
});

test('overlay composer patch is conditional, never added to ordinary flow', () => {
  const regular = adaptTheme({name:'流式',custom_css:'#form_sheld {position:relative;}'});
  const overlay = adaptTheme({name:'悬浮',custom_css:'#form_sheld {position:absolute;bottom:0;}'});
  assert.doesNotMatch(regular.custom_css,/position: fixed !important/);
  assert.match(overlay.custom_css,/position: fixed !important/);
});

test('rejects character cards, presets and malformed CSS, accepts color-only themes', () => {
  for (const value of [null,[],{name:'角色',description:'hello'},{name:'预设',temperature:1},{name:'坏主题',custom_css:{}}]) assert.throws(()=>validateTheme(value));
  assert.doesNotThrow(()=>adaptTheme({name:'纯色',main_text_color:'#ffffff'}));
});

test('risk analysis is stable across repeated calls', () => {
  const css = '#sheld {height:100vh;} .mes { display:flex !important; }';
  assert.deepEqual(analyzeCss(css),analyzeCss(css));
  assert.ok(analyzeCss(css).length >= 2);
});

test('paragraph indentation is scoped to chat and remains idempotent', () => {
  const adapted = adaptTheme({name:'缩进',custom_css:'.mes_text p { color:red; }'}, { indentParagraphs:true });
  assert.match(adapted.custom_css, /#chat p \{ text-indent: 2em; \}/);
  assert.doesNotMatch(adapted.custom_css, /(^|\})\s*p\s*\{/);
  assert.equal(adaptTheme(adapted, { indentParagraphs:true }).custom_css, adapted.custom_css);
});
