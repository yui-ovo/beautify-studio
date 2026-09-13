import { inspectText } from '../src/host/text.js';
import { editTextCss, cssString } from '../src/core/text.js';
import { buildEditedCss, DEFAULT_VALUES } from '../src/core/editor.js';
import { startEditorRuntime } from '../src/host/editor-runtime.js';
import { openVisualEditor } from '../src/host/visual-editor.js';

const out = document.querySelector('pre');
let passes = 0, failures = 0;
const equal = (a, b) => { if (a !== b) throw Error(`${JSON.stringify(a)} != ${JSON.stringify(b)}`); };
const near = (a, b) => { if (Math.abs(a - b) > 0.2) throw Error(`${a} != ${b}`); };
function test(name, run) { try { run(); passes++; out.textContent += `PASS ${name}\n`; } catch (e) { failures++; out.textContent += `FAIL ${name}: ${e.message}\n`; } }
const fixture = document.querySelector('#fixture');
fixture.innerHTML = '<div id="chat"><div class="mes_text"><p>一段正文</p></div></div><button id="unrelated">工具栏</button><div id="form_sheld"><div id="send_form"><button>菜单</button><textarea id="send_textarea" placeholder="Original"></textarea><button>发送</button></div></div>';
const base = document.createElement('style');
base.textContent = ':root{--fontScale:1;--mainFontSize:calc(var(--fontScale)*15px);--tt-inset-bottom:34px}body{font-size:var(--mainFontSize)}#chat .mes_text,#chat p{font-size:inherit}#form_sheld{position:relative;background:rgb(230,240,220);padding-bottom:var(--tt-inset-bottom);width:300px}#send_form{display:flex;position:relative;background:white}';
document.head.append(base);
const source = document.createElement('style'); source.id = 'custom-style'; document.head.append(source);
const text = document.querySelector('#chat p'), shell = document.querySelector('#form_sheld'), form = document.querySelector('#send_form'), input = document.querySelector('textarea');
const font = () => parseFloat(getComputedStyle(text).fontSize);
test('fixed author font is detected and probes restore stylesheet and font scale', () => {
  source.textContent = '#chat p{font-size:18px!important}';
  const before = source.sheet.cssRules[0].cssText;
  const result = inspectText(window, source);
  equal(result.fonts.length, 1); equal(font(), 18); equal(source.sheet.cssRules[0].cssText, before); equal(document.documentElement.style.getPropertyValue('--fontScale'), '');
  const f = result.fonts[0]; source.textContent = editTextCss(source.textContent, {[f.id]:{kind:'font',value:13,selectors:f.selectors}}); equal(font(),13);
});
test('saved font remains editable after reopening with nested selector lists', () => {
  const f = inspectText(window, source).fonts[0]; if (!f) throw Error('saved font not detected');
  source.textContent = editTextCss(source.textContent,{[f.id]:{kind:'font',value:12,selectors:f.selectors}}); equal(font(),12);
});
test('responsive font stays hidden', () => { source.textContent = '#chat p{font-size:calc(var(--fontScale)*18px)}'; equal(inspectText(window, source).fonts.length,0); });
test('fixed font shorthand preserves font family while changing size', () => {
  source.textContent = '#chat p{font:18px serif}'; const f = inspectText(window,source).fonts[0]; if (!f) throw Error('shorthand not detected');
  source.textContent = editTextCss(source.textContent,{[f.id]:{kind:'font',value:15,selectors:f.selectors}}); equal(font(),15); equal(getComputedStyle(text).fontFamily,'serif');
});
test('inactive and losing fixed rules stay hidden', () => { source.textContent = '@media(min-width:99999px){#chat p{font-size:18px}}#chat p{font-size:19px}#chat#chat p{font-size:var(--mainFontSize)}'; equal(inspectText(window, source).fonts.length,0); });
test('font fixed on body can be adjusted without changing toolbar', () => {
  source.textContent = 'body{font-size:19px}'; const f = inspectText(window,source).fonts[0]; if (!f) throw Error('not detected');
  source.textContent = editTextCss(source.textContent,{[f.id]:{kind:'font',value:14,selectors:f.selectors}}); equal(font(),14); equal(getComputedStyle(document.body).fontSize,'19px');
});
test('conditional author hint changes and still hides during typing', () => {
  source.textContent = '#send_form:has(textarea:placeholder-shown)::after{content:"Say something…"}';
  const h = inspectText(window,source).hints[0]; if (!h) throw Error('not detected');
  source.textContent = editTextCss(source.textContent,{[h.id]:{kind:'content',value:'新的提示'}});
  equal(getComputedStyle(form,'::after').content,'"新的提示"'); input.value='未发送的草稿'; equal(getComputedStyle(form,'::after').content,'none'); input.value='';
});
source.textContent = '';
const runtime = startEditorRuntime(window);
test('native hint survives reapplication and restores the latest host hint', () => {
  source.textContent = `#send_textarea{--bs-placeholder:${cssString('你好 "世界"')}}`; runtime.sync(); equal(input.placeholder,'你好 "世界"');
  input.placeholder='Host changed connection'; runtime.sync(); equal(input.placeholder,'你好 "世界"');
  input.value='未发送'; source.textContent=''; runtime.sync(); equal(input.placeholder,'Host changed connection'); equal(input.value,'未发送');
});
test('input lift leaves outer background geometry and safe padding unchanged', () => {
  const top=form.getBoundingClientRect().top, outer=shell.getBoundingClientRect().top;
  source.textContent=buildEditedCss('',{composer:{values:{...DEFAULT_VALUES,lift:12},changed:['lift'],origin:{x:0,y:0}}}); runtime.sync();
  near(form.getBoundingClientRect().top,top-12); near(shell.getBoundingClientRect().top,outer); equal(getComputedStyle(shell).paddingBottom,'34px');
});
test('background height changes independently, supports negatives and follows safe area', () => {
  const top=form.getBoundingClientRect().top;
  const make = gap => buildEditedCss('',{composer:{values:{...DEFAULT_VALUES,lift:12,gap},changed:['lift','gap'],origin:{x:0,y:0}}});
  source.textContent=make(20); runtime.sync(); const layer=shell.querySelector('[data-bs-background]'); if(!layer) throw Error('no background');
  const height=layer.getBoundingClientRect().height; near(form.getBoundingClientRect().top,top);
  source.textContent=make(-10); runtime.sync(); near(layer.getBoundingClientRect().height,height-30); near(form.getBoundingClientRect().top,top);
  document.documentElement.style.setProperty('--tt-inset-bottom','0px'); runtime.sync(); near(layer.getBoundingClientRect().height,height-64); near(form.getBoundingClientRect().top,top);
  equal(layer.style.pointerEvents,'none');
});
test('theme switch and runtime disposal remove temporary paint and restore original styles', () => {
  source.textContent=''; runtime.sync(); equal(shell.querySelector('[data-bs-background]'),null); equal(shell.hasAttribute('data-bs-paint'),false); equal(getComputedStyle(shell).backgroundColor,'rgb(230, 240, 220)'); runtime.dispose();
});
test('two-page navigation preserves unsaved edits and full-code search across switches', () => {
  source.textContent = '#chat p{font-size:18px}';
  const close = openVisualEditor({hostWin:window,theme:{name:'test',custom_css:source.textContent},onClose(){},onDownload(){},onSave(){}});
  try {
    const root = document.querySelector('#beautify-visual-editor').shadowRoot;
    equal(root.querySelectorAll('.workspace-nav button').length,2);
    root.querySelector('.ve-font-controls button:last-child').click(); equal(font(),19);
    root.querySelector('[data-tab="notes"]').click();
    const input = root.querySelector('.ve-search input'); input.value='font-size'; input.dispatchEvent(new Event('input',{bubbles:true}));
    equal(root.querySelector('.ve-note mark').textContent,'font-size');
    close.suspend(); equal(font(),18);
    close.resume(); equal(font(),19); equal(input.value,'font-size');
    equal(root.querySelector('[data-page="notes"]').hidden,false);
    root.querySelector('[data-action="undo"]').click(); equal(font(),18);
  } finally { close(); }
  equal(document.querySelector('#beautify-visual-preview'),null); equal(font(),18);
});
out.textContent += `\n${passes} passed, ${failures} failed`;
document.title = failures ? 'FAIL browser regressions' : 'PASS browser regressions';
