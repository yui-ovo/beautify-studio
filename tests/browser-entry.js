import { inspectText } from '../src/host/text.js';
import { editTextCss, cssString } from '../src/core/text.js';
import { buildEditedCss, DEFAULT_VALUES } from '../src/core/editor.js';
import { startEditorRuntime } from '../src/host/editor-runtime.js';
import { openVisualEditor } from '../src/host/visual-editor.js';
import { describeTarget, collectPickGuides, MAX_PICK_GUIDES, watchSelectionLayout } from '../src/host/picker.js';

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
test('opening and inspecting never probes fonts or offers font controls', () => {
  source.textContent = '#chat p{font-size:18px!important}';
  const nativeSet = CSSStyleDeclaration.prototype.setProperty;
  const writes = [];
  CSSStyleDeclaration.prototype.setProperty = function(name, ...args) { if (['--fontScale','font-size','font'].includes(name)) writes.push(name); return nativeSet.call(this,name,...args); };
  let close;
  try {
    equal(inspectText(window, source).fonts, undefined);
    close = openVisualEditor({hostWin:window,theme:{name:'test'},onClose(){},onSave(){},onDownload(){}});
    const root = document.querySelector('#beautify-visual-editor').shadowRoot;
    equal(root.querySelector('[data-mode="fontSize"]'),null);
    equal(root.querySelector('.ve-font-controls'),null);
    equal(describeTarget(window,text).target.modes.includes('fontSize'),false);
    equal(font(),18); equal(writes.length,0);
  } finally { close?.(); CSSStyleDeclaration.prototype.setProperty = nativeSet; }
  equal(font(),18);
});

test('inactive hint rules never become editable because their text matches', () => {
  source.textContent = '@media(min-width:99999px){#send_form::after{content:"Hello"}}#send_form#send_form::after{content:"Hello"}';
  const hints = inspectText(window,source).hints;
  equal(hints.length,1); equal(hints[0].selector,'#send_form#send_form::after');
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
    const hint = root.querySelector('.ve-text-settings input'); hint.value='草稿提示';
    root.querySelector('.ve-text-settings button').click();
    if (!document.querySelector('#beautify-visual-preview').textContent.includes('草稿提示')) throw Error('hint edit lost');
    root.querySelector('[data-tab="notes"]').click();
    const input = root.querySelector('.ve-search input'); input.value='font-size'; input.dispatchEvent(new Event('input',{bubbles:true}));
    equal(root.querySelector('.ve-note mark').textContent,'font-size');
    close.suspend(); equal(font(),18);
    close.resume(); equal(font(),18); equal(input.value,'font-size');
    if (!document.querySelector('#beautify-visual-preview').textContent.includes('草稿提示')) throw Error('draft lost');
    equal(root.querySelector('[data-page="notes"]').hidden,false);
    root.querySelector('[data-action="undo"]').click(); equal(font(),18);
  } finally { close(); }
  equal(document.querySelector('#beautify-visual-preview'),null); equal(font(),18);
});
test('universal picker suppresses button actions and edits only the selected element', () => {
  source.textContent=''; const selected=document.querySelector('#unrelated'), other=form.querySelector('button');
  let clicks=0; const onClick=()=>clicks++; selected.addEventListener('click',onClick);
  const close=openVisualEditor({hostWin:window,theme:{name:'test',custom_css:''},onClose(){},onDownload(){},onSave(){}});
  let saved;
  try {
    const root=document.querySelector('#beautify-visual-editor').shadowRoot;
    root.querySelector('[data-action="pick"]').click();
    if (!root.querySelectorAll('.ve-pick-box').length) throw Error('no visible guides');
    if (root.querySelectorAll('.ve-pick-box').length > MAX_PICK_GUIDES) throw Error('too many guides');
    selected.click(); equal(clicks,0); equal(root.querySelectorAll('.ve-pick-box').length,0);
    equal(root.querySelector('.ve-picked').hidden,false);
    const otherColor=getComputedStyle(other).color;
    root.querySelector('.ve-sheet [data-mode="textColor"]').click();
    const color=root.querySelector('.ve-color');color.value='#123456';color.dispatchEvent(new Event('input',{bubbles:true}));
    equal(getComputedStyle(selected).color,'rgb(18, 52, 86)'); equal(getComputedStyle(other).color,otherColor);
    root.querySelector('.ve-sheet [data-mode="width"]').click();
    const previous=parseFloat(getComputedStyle(selected).width);
    root.querySelector('.ve-sheet [data-nudge="plus"]').click(); near(parseFloat(getComputedStyle(selected).width),Math.round(previous)+1);
    root.querySelector('[data-action="pick"]').click(); other.click();
    equal(root.querySelectorAll('.ve-picked-list option').length,2);
    const list=root.querySelector('.ve-picked-list');list.value=list.options[0].value;list.dispatchEvent(new Event('change',{bubbles:true}));
    equal(root.querySelector('.ve-picked-name').textContent,'按钮 · 工具栏');
    saved=document.querySelector('#beautify-visual-preview').textContent;
  } finally { close(); selected.removeEventListener('click',onClick); }
  source.textContent=saved;equal(getComputedStyle(selected).color,'rgb(18, 52, 86)');
});
test('picker escapes unusual IDs, selects SVG as a unit and rejects its own UI', () => {
  const node=document.createElement('button');node.id='x"]:{odd}';fixture.append(node);
  try { const selected=describeTarget(window,node);equal(document.querySelector(selected.target.selector),node); } finally {node.remove();}
  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg'),path=document.createElementNS(svg.namespaceURI,'path');svg.append(path);fixture.append(svg);
  try {equal(describeTarget(window,path).node,svg);} finally {svg.remove();}
  equal(describeTarget(window,document.head),null);
});
test('known old font cleanup previews, undoes, exports and restores on close', () => {
  source.textContent = '#chat p{font-size:18px}/* === BEAUTIFY_VISUAL_START === */:is(#beautify-specificity#beautify-specificity, #chat p):where(#chat p){font-size:10px!important;color:red}/* === BEAUTIFY_VISUAL_END === */';
  let exported;
  const close=openVisualEditor({hostWin:window,theme:{name:'test'},onClose(){},onSave(){},onDownload(theme){exported=theme.custom_css;}});
  try {
    const root=document.querySelector('#beautify-visual-editor').shadowRoot;
    equal(font(),10);
    root.querySelector('[data-action="remove-fonts"]').click(); equal(font(),18);
    root.querySelector('[data-action="undo"]').click(); equal(font(),10);
    root.querySelector('[data-action="redo"]').click(); equal(font(),18);
    root.querySelector('[data-action="download"]').click();
    if (exported.includes('10px')) throw Error('old font exported');
    equal(getComputedStyle(text).color,'rgb(255, 0, 0)');
  } finally {close();}
  equal(font(),10);
});

test('viewport guide scan stays bounded and excludes its own editor', () => {
  let hits=0; const original=document.elementsFromPoint.bind(document);
  document.elementsFromPoint=(...args)=>{hits++;return original(...args);};
  try {
    const candidates=collectPickGuides(window);
    if(hits>224)throw Error('unbounded hit tests');
    if(candidates.length>32)throw Error('unbounded guides');
    if(candidates.some(item=>item.node.closest('#beautify-visual-editor')))throw Error('self guide');
  } finally { document.elementsFromPoint=original; }
});

// Async lifecycle checks exercise actual observer delivery and coalescing.
try {
  let refreshes=0;
  const host=document.createElement('div'); document.body.append(host);
  const tracker=watchSelectionLayout(window,host,()=>refreshes++);
  equal(refreshes,1);
  await new Promise(r=>setTimeout(r,220));
  const idle=refreshes;
  await new Promise(r=>setTimeout(r,220)); equal(refreshes,idle);
  for(let i=0;i<30;i++) { fixture.dataset.change=String(i); window.dispatchEvent(new Event('scroll')); }
  await new Promise(r=>setTimeout(r,220)); equal(refreshes,idle+1);
  tracker.stop(); const stopped=refreshes;
  fixture.dataset.change='stopped'; window.dispatchEvent(new Event('resize'));
  await new Promise(r=>setTimeout(r,220)); equal(refreshes,stopped); host.remove();
  let scans=0; const hitTest=document.elementsFromPoint.bind(document);
  document.elementsFromPoint=(...args)=>{scans++;return hitTest(...args);};
  const close=openVisualEditor({hostWin:window,theme:{name:'test'},onClose(){},onSave(){},onDownload(){}});
  try {
    const root=document.querySelector('#beautify-visual-editor').shadowRoot;
    equal(scans,0);
    root.querySelector('[data-action="pick"]').click();
    if (!scans) throw Error('picker never sampled');
    root.querySelector('[data-action="cancel-pick"]').click(); const afterCancel=scans;
    equal(root.querySelectorAll('.ve-pick-box').length,0);
    window.dispatchEvent(new Event('resize'));
    await new Promise(r=>setTimeout(r,240)); equal(scans,afterCancel);
    root.querySelector('[data-action="pick"]').click();
    close.suspend(); const afterSuspend=scans;
    window.dispatchEvent(new Event('scroll'));
    await new Promise(r=>setTimeout(r,240)); equal(scans,afterSuspend);
    close.resume(); equal(scans,afterSuspend);
  } finally {close();document.elementsFromPoint=hitTest;}
  passes++; out.textContent+='PASS guide lifecycle coalesces updates, stays idle and stops completely\n';
} catch(e) {failures++;out.textContent+='FAIL guide lifecycle: '+e.message+'\n';}
out.textContent += `\n${passes} passed, ${failures} failed`;
document.title = failures ? 'FAIL browser regressions' : 'PASS browser regressions';
