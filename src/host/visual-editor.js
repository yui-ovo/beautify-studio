import { TARGETS, DEFAULT_VALUES, parseSource, buildEditedCss, stepValue, createHistory } from '../core/editor.js';
import { editorMarkup } from '../ui/editor-markup.js';
import { extractImages, replaceImages, validateImageUrl } from '../core/images.js';
import { embedImage } from './images.js';
import { cssString, editTextCss, readCssString } from '../core/text.js';
import { inspectText } from './text.js';
import { describeTarget, isPickable } from './picker.js';
import { searchCss } from '../core/search.js';
import PANEL_CSS from '../ui/studio.css';

// The first release edits the active theme. Preview CSS is never persisted by this module.
export function openVisualEditor({ hostWin, theme, onClose, onSave, onDownload, onNavigateLibrary }) {
  const doc = hostWin.document;
  const nativeStyle = doc.querySelector('#custom-style');
  if (!nativeStyle) throw new Error('没有找到当前美化的样式，请先在酒馆应用一款美化。');
  const original = nativeStyle.textContent;
  const originalMedia = nativeStyle.getAttribute('media');
  let resources = [], resourceError = '';
  try { resources = extractImages(original); } catch { resourceError = 'CSS 有语法问题，暂时无法读取图片资源。'; }
  const imageAssets = new Map();
  let assetSequence = 0, imageBusy = false, currentPage = 'parts';
  const previewStyle = doc.createElement('style');
  previewStyle.id = 'beautify-visual-preview';
  doc.head.append(previewStyle);
  let draft = original;
  let state = { source: original, edits: {}, images: {}, text: {}, placeholder: null };
  const textResources = inspectText(hostWin, nativeStyle);
  const nativeInput = doc.querySelector('#send_textarea');
  const originalPlaceholder = nativeInput ? readCssString(hostWin.getComputedStyle(nativeInput).getPropertyValue('--bs-placeholder')) ?? nativeInput.getAttribute('placeholder') ?? '' : '';
  const history = createHistory(state);
  let targetKey = 'character', mode = 'radius', step = 1, compact = false, picking = false, destroyed = false, saving = false;
  let currentTarget, raf, heldTimer, heldInterval, heldButton = null, heldUntil = 0;
  let suspended = false;
  const initialFocus = doc.activeElement;
  const host = doc.createElement('div');
  host.id = 'beautify-visual-editor';
  host.style.cssText = 'all:initial!important;position:fixed!important;inset:0!important;z-index:2147483647!important;pointer-events:none!important;';
  const root = host.attachShadow({ mode: 'open' });
  const style = doc.createElement('style'); style.textContent = PANEL_CSS; root.append(style);
  const shell = doc.createElement('div'); shell.innerHTML = editorMarkup(); root.append(shell); doc.body.append(host);
  const $ = selector => root.querySelector(selector);
  const $$ = selector => [...root.querySelectorAll(selector)];
  $('.ve-theme-name').textContent = theme.name;
  const baseline = {};
  const customTargets = {};
  const targetInfo = key => TARGETS[key] || customTargets[key] || state.edits[key]?.target;
  const observer = new hostWin.MutationObserver(() => {
    if (nativeStyle.textContent !== original) { dispose(false); onClose('酒馆已切换或修改主题，微调预览已结束。'); }
  });
  observer.observe(nativeStyle, { childList: true, characterData: true, subtree: true });

  function restoreNativeMedia() {
    if (originalMedia === null) nativeStyle.removeAttribute('media');
    else nativeStyle.setAttribute('media', originalMedia);
  }
  function composeCss() {
    const replacements = Object.fromEntries(Object.entries(state.images).map(([id, asset]) => [id, imageAssets.get(asset).url]));
    let css = editTextCss(replaceImages(state.source, replacements), state.text);
    css = buildEditedCss(css, state.edits);
    if (state.placeholder !== null) css += `\n/* 输入框提示文字 · 美化工作室 */\nhtml body #send_textarea#send_textarea { --bs-placeholder: ${cssString(state.placeholder)}; }\n`;
    return css;
  }
  function writeCss(css) {
    draft = css;
    // Image replacement changes existing declarations, so preview the complete
    // draft while keeping the native CSS text intact for cancellation/stale checks.
    previewStyle.textContent = css; nativeStyle.setAttribute('media', 'not all');
  }
  function visibleTarget(key) {
    const nodes = [...doc.querySelectorAll(targetInfo(key).selector)].filter(n => n.getClientRects().length);
    return nodes.find(n => { const r = n.getBoundingClientRect(); return r.top > 50 && r.bottom < hostWin.innerHeight - 180; }) || nodes.at(-1);
  }
  function getBaseline(key) {
    if (baseline[key]) return baseline[key];
    const node = visibleTarget(key);
    if (!node) return null;
    const cs = hostWin.getComputedStyle(node), translation = cs.translate;
    const parts = translation === 'none' || !translation ? ['0px','0px'] : translation.split(/\s+/);
    const movable = hostWin.CSS.supports('translate', '1px 1px') && parts.length <= 2 && parts.every(p => /^-?\d+(\.\d+)?px$/.test(p));
    const number = (value, fallback) => Number.isFinite(parseFloat(value)) ? parseFloat(value) : fallback;
    const rgb = cs.borderTopColor.match(/^rgba?\(\s*(\d+)[, ]+\s*(\d+)[, ]+\s*(\d+)/);
    const color = rgb ? '#' + rgb.slice(1, 4).map(value => Number(value).toString(16).padStart(2, '0')).join('') : DEFAULT_VALUES.color;
    const hex = value => { const match = value.match(/^rgba?\(\s*(\d+)[, ]+\s*(\d+)[, ]+\s*(\d+)/); return match ? '#' + match.slice(1,4).map(n => Number(n).toString(16).padStart(2,'0')).join('') : '#ffffff'; };
    const radius = cs.borderTopLeftRadius.endsWith('%') ? number(cs.width, 48) * number(cs.borderTopLeftRadius, 0) / 100 : number(cs.borderTopLeftRadius, 0);
    const shellStyle = key === 'composer' && doc.querySelector('#form_sheld') ? hostWin.getComputedStyle(doc.querySelector('#form_sheld')) : null;
    const backgroundStyle = doc.querySelector('[data-bs-background]') ? hostWin.getComputedStyle(doc.querySelector('[data-bs-background]')) : shellStyle;
    const backgroundEditable = !backgroundStyle || backgroundStyle.backgroundImage !== 'none' || !['transparent', 'rgba(0, 0, 0, 0)'].includes(backgroundStyle.backgroundColor);
    baseline[key] = {
      values: { ...DEFAULT_VALUES, size: Math.round(number(cs.width, 48)), radius: Math.round(radius), border: Math.round(number(cs.borderTopWidth, 0)), color, width: Math.round(number(cs.width, node.getBoundingClientRect().width)), height: Math.round(number(cs.height, node.getBoundingClientRect().height)), fontSize: Math.round(number(cs.fontSize,16)), textColor:hex(cs.color), backgroundColor:hex(cs.backgroundColor), opacity:Math.round(number(cs.opacity,1)*100), gap: number(shellStyle?.getPropertyValue('--bs-background-offset'), 0) },
      origin: { x: movable ? parseFloat(parts[0]) : 0, y: movable ? parseFloat(parts[1] || '0') : 0, backgroundEditable }, movable,
    };
    return baseline[key];
  }
  function values() { return state.edits[targetKey]?.values || getBaseline(targetKey)?.values || DEFAULT_VALUES; }
  function feedback(text) { $('.ve-feedback').textContent = text; $('.ve-mini-status').textContent = text; }
  const meta = {
    position: { title: '位置', help: '箭头朝哪，头像就往哪挪；只移动外观，不挤动文字。' },
    size: { title: '大小', help: '宽高一起调整，头像保持正方形。', min: 16, max: 200 },
    radius: { title: '圆角', help: '数值越大，头像的边角越圆。', min: 0, max: 100 },
    border: { title: '边框', help: '调整边框粗细；设为 0 就是没有边框。', min: 0, max: 12 },
    lift: { title: '上下位置', help: '0 是原位置；正数抬高，负数降低。底栏仍跟随酒馆原有的键盘布局。', min: -120, max: 200 },
    width: { title:'宽度', help:'调整选中元素的宽度，可能改变周围排版。', min:1,max:2000 },
    height: { title:'高度', help:'调整选中元素的高度，可能改变周围排版。', min:1,max:2000 },
    fontSize: { title:'字号', help:'手动设置选中元素的字号；继承字号的内部文字会一起变化。', min:8,max:120 },
    textColor: { title:'文字颜色', help:'修改选中元素的文字颜色；继承颜色的内部文字会一起变化。' },
    backgroundColor: { title:'背景颜色', help:'修改底色，原来的背景图片仍会覆盖在底色上。' },
    opacity: { title:'不透明度', help:'100 完全显示，0 完全透明；内部内容会一起变化。', min:0,max:100 },
    gap: { title: '底部背景高度', help: '0 为原背景；正数向上延伸背景，负数缩短。输入框位置和系统安全区保持不变。', min: -120, max: 200 },
  };
  function render() {
    const v = values(), info = meta[mode], available = Boolean(visibleTarget(targetKey));
    const composer = targetKey === 'composer', generic = Boolean(targetInfo(targetKey)?.generic), colorMode = ['textColor','backgroundColor'].includes(mode);
    const modes = generic ? targetInfo(targetKey).modes : composer ? ['lift','gap'] : ['position','size','radius','border'];
    $('.ve-properties').dataset.composer = String(composer);
    $('.ve-controller').dataset.composer = String(composer);
    $$('[data-mode]').forEach(el => el.hidden = !modes.includes(el.dataset.mode));
    $('.ve-picked').hidden = !generic;
    $('.ve-targets').hidden = generic;
    $('.ve-picked-name').textContent = generic ? targetInfo(targetKey).name : '';
    $('.ve-picked-scope').textContent = generic ? targetInfo(targetKey).structural ? '按这个位置定位；界面结构变化后需重新确认。' : '仅选中的元素；修改文字或透明度可能影响其内部内容。' : '';
    $('[data-action="pick-parent"]').disabled = !isPickable(currentTarget?.parentElement);
    const selected = $('.ve-picked-list'); selected.replaceChildren();
    for (const [key, target] of Object.entries(customTargets)) { const option = doc.createElement('option'); option.value=key; option.textContent=target.name; option.selected=key===targetKey; selected.append(option); }
    $('.ve-lift-buttons').hidden = mode !== 'lift';
    $$('[data-target]').forEach(el => el.setAttribute('aria-pressed', String(el.dataset.target === targetKey)));
    $$('[data-mode]').forEach(el => el.setAttribute('aria-pressed', String(el.dataset.mode === mode)));
    $('.ve-scope').firstChild.textContent = `作用于${targetInfo(targetKey).scope} `;
    $('.ve-property-title').textContent = composer ? mode === 'gap' ? info.title : `输入栏${info.title}` : generic ? info.title : `头像${info.title}`;
    $('.ve-controller-title').textContent = `${targetInfo(targetKey).name} · ${info.title}`;
    $('.ve-help').textContent = generic && mode === 'position' ? '移动选中元素及其内容，不挤动周围排版。' : mode === 'gap' && getBaseline(targetKey)?.origin.backgroundEditable === false ? '未识别到独立的底栏背景。这款美化可能把背景画在其他元素上，暂不能单独调节。' : info.help;
    $('.ve-controller-caption').textContent = mode === 'position' ? `X ${v.x} / Y ${v.y} px` : info.help;
    $('.ve-scalar').hidden = mode === 'position' || colorMode; $('.ve-range').hidden = mode === 'position' || colorMode;
    $('.ve-position-values').hidden = mode !== 'position'; $('.ve-color-row').hidden = mode !== 'border' && !colorMode;
    $('.ve-color-row').firstChild.textContent = colorMode ? info.title : '边框颜色';
    $('.ve-color').setAttribute('aria-label', colorMode ? info.title : '边框颜色');
    $('.ve-unit').textContent = colorMode ? '' : mode === 'opacity' ? '%' : 'PX';
    $('.ve-scalar label span').textContent = mode === 'opacity' ? '%' : 'px';
    $('.ve-controller-scalar small').textContent = mode === 'opacity' ? '%' : 'px';
    $('.ve-handheld').hidden = colorMode;
    $('.ve-dpad').hidden = mode !== 'position'; $('.ve-controller-scalar').hidden = mode === 'position';
    $('.ve-x').value = v.x; $('.ve-y').value = v.y;
    if (mode !== 'position' && !colorMode) {
      for (const el of [$('.ve-number'), $('.ve-range')]) { el.min = info.min; el.max = info.max; el.value = v[mode]; }
      $('.ve-mini-value').textContent = v[mode];
    }
    $('.ve-color').value = colorMode ? v[mode] : v.color;
    $$('[data-action="undo"]').forEach(el => el.disabled = !history.canUndo || imageBusy);
    $('[data-action="redo"]').disabled = !history.canRedo || imageBusy;
    $$('[data-nudge], [data-direction], [data-lift], .ve-number, .ve-range, .ve-x, .ve-y, .ve-color').forEach(el => el.disabled = !available || imageBusy || (mode === 'gap' && getBaseline(targetKey)?.origin.backgroundEditable === false) || (['position', 'lift'].includes(mode) && !getBaseline(targetKey)?.movable));
    $('[data-action="save"]').disabled = !history.canUndo || saving || imageBusy;
    $('[data-action="download"]').disabled = !history.canUndo || saving || imageBusy;
    $('[data-action="reset-all"]').disabled = !history.canUndo || imageBusy;
    $('.ve-draft').textContent = history.canUndo ? '未保存' : '草稿';
    $$('.ve-image-card button, .ve-image-card input').forEach(el => el.disabled = imageBusy);
    renderChanges();
  }
  function updateOutline() {
    if (destroyed || suspended) return;
    if (!currentTarget?.isConnected || !currentTarget.getClientRects().length) {
      const nextTarget = visibleTarget(targetKey);
      if (nextTarget !== currentTarget) { currentTarget = nextTarget; render(); }
    }
    const outline = $('.ve-outline');
    if (currentTarget) {
      const r = currentTarget.getBoundingClientRect();
      outline.hidden = r.bottom < 45 || r.top > hostWin.innerHeight;
      outline.style.cssText = `left:${r.left - 6}px;top:${r.top - 6}px;width:${r.width + 12}px;height:${r.height + 12}px;`;
      outline.querySelector('span').textContent = targetInfo(targetKey).name;
    } else outline.hidden = true;
    raf = hostWin.requestAnimationFrame(updateOutline);
  }
  function locate(scroll = true) {
    currentTarget = visibleTarget(targetKey);
    if (!currentTarget) { feedback(`当前画面没有${targetInfo(targetKey).name}，请打开一段含这类消息的聊天。`); return; }
    if (scroll && targetKey !== 'composer' && !targetInfo(targetKey).generic) currentTarget.scrollIntoView({ block: 'center', behavior: 'smooth' });
    getBaseline(targetKey); render();
  }
  function commit(next, label, group = mode) {
    if (imageBusy || !getBaseline(targetKey)) return;
    if (group === 'gap' && getBaseline(targetKey).origin.backgroundEditable === false) return;
    if (['position','lift'].includes(group) && !getBaseline(targetKey).movable) return;
    state.edits[targetKey] = { target: customTargets[targetKey], values: next, origin: getBaseline(targetKey).origin, changed: [...new Set([...(state.edits[targetKey]?.changed || []), group])] };
    history.push(state); writeCss(composeCss()); render(); feedback(label);
    const editedKey = targetKey;
    // Check the property actually won the cascade rather than reporting a fake successful edit.
    hostWin.requestAnimationFrame(() => {
      if (destroyed || suspended || targetKey !== editedKey || !currentTarget) return;
      const cs = hostWin.getComputedStyle(currentTarget);
      const origin = getBaseline(targetKey).origin;
      const expected = group === 'size' ? [cs.width, next.size] : group === 'radius' ? [cs.borderTopLeftRadius, next.radius] : group === 'border' ? [cs.borderTopWidth, next.border] : group === 'lift' ? [cs.translate.split(/\s+/)[1] || '0', origin.y - next.lift] : ['width','height','fontSize'].includes(group) ? [cs[group],next[group]] : group === 'opacity' ? [String(Number(cs.opacity)*100),next.opacity] : null;
      if (expected && Math.abs(parseFloat(expected[0]) - expected[1]) > 1) feedback('有其他样式影响了效果；可撤销本次调整并查看作者说明。');
      if (['textColor','backgroundColor'].includes(group)) {
        const rgb = cs[group === 'textColor' ? 'color' : 'backgroundColor'].match(/^rgba?\(\s*(\d+)[, ]+\s*(\d+)[, ]+\s*(\d+)/);
        if (rgb && '#' + rgb.slice(1,4).map(n => Number(n).toString(16).padStart(2,'0')).join('') !== next[group]) feedback('有其他样式影响了颜色；可以撤销本次调整。');
      }
    });
  }
  function nudge(delta) { const v = stepValue(values(), mode, delta * step); commit(v, `${targetInfo(targetKey).name}${meta[mode].title}已调整为 ${v[mode]} ${mode === 'opacity' ? '%' : 'px'}`); }
  function move(direction) {
    if (!getBaseline(targetKey)?.movable) { feedback('原美化使用了复杂位移，这一版暂不调整位置。'); return; }
    const property = ['left','right'].includes(direction) ? 'x' : 'y';
    const delta = ['left','up'].includes(direction) ? -step : step;
    const v = stepValue(values(), property, delta); commit(v, `水平 ${v.x} px · 垂直 ${v.y} px`, 'position');
  }
  function setCompact(value) {
    compact = value; $('.ve-sheet').hidden = value; $('.ve-controller').hidden = !value;
    if (!value) $('.ve-controller').style.cssText = '';
    render();
  }
  function stopPick() { picking = false; $('.ve-pick-hint').hidden = true; $('.ve-controller').hidden = !compact; $('.ve-sheet').hidden = compact; }
  function pick(event) {
    if (!picking || event.composedPath().includes(host)) return;
    event.preventDefault(); event.stopImmediatePropagation();
    selectElement(event.target);
  }
  function selectElement(element) {
    const choice = describeTarget(hostWin, element);
    if (!choice) { feedback('这里暂不能选中，请点可见的按钮、文字、图片或容器。'); return; }
    const existing = Object.keys(customTargets).find(key => customTargets[key].selector === choice.target.selector);
    targetKey = existing || 'picked-' + (Object.keys(customTargets).length + 1);
    customTargets[targetKey] = choice.target;
    currentTarget = choice.node;
    mode = choice.target.modes.includes('fontSize') ? 'fontSize' : 'radius';
    getBaseline(targetKey); compact = false; stopPick(); setPage('parts'); render();
    feedback('已选中' + choice.target.name + '；可选外层，或打开手柄边看边调。');
  }
  function renderNotes(query = '') {
    const container = $('.ve-notes'); container.replaceChildren();
    let notes;
    try { notes = parseSource(state.source); } catch { notes = []; feedback('原 CSS 有语法问题；作者说明暂时无法解析，部位微调仍可使用。'); }
    $('.ve-note-count').textContent = notes.length;
    if (query.trim()) {
      const { count, results } = searchCss(draft, query);
      const summary = doc.createElement('p'); summary.className = 've-search-summary';
      summary.textContent = count ? `全文找到 ${count} 处匹配 · ${results.length} 段代码` : '整份 CSS 中没有找到匹配文字。';
      container.append(summary);
      let shown = 0;
      const more = doc.createElement('button'); more.className = 've-search-more'; more.textContent = '显示更多结果';
      const appendBatch = () => {
        more.remove();
        for (const result of results.slice(shown, shown + 30)) {
          const card = doc.createElement('article'); card.className = 've-note';
          const line = doc.createElement('small'); line.textContent = `CSS 原文 / 第 ${result.line}–${result.endLine} 行`;
          const code = doc.createElement('pre');
          const term = query.trim(), lower = result.code.toLowerCase(), first = lower.indexOf(term.toLowerCase());
          const start = Math.max(0, first - 800), excerpt = result.code.slice(start, start + 6000);
          if (start) code.append(doc.createTextNode('…\n'));
          let from = 0, at;
          while ((at = excerpt.toLowerCase().indexOf(term.toLowerCase(), from)) !== -1) {
            code.append(doc.createTextNode(excerpt.slice(from, at)));
            const mark = doc.createElement('mark'); mark.textContent = excerpt.slice(at, at + term.length); code.append(mark); from = at + term.length;
          }
          code.append(doc.createTextNode(excerpt.slice(from)));
          if (start + 6000 < result.code.length) code.append(doc.createTextNode('\n…（长段代码已截取匹配附近内容）'));
          card.append(line, code); container.append(card);
        }
        shown += 30; if (shown < results.length) container.append(more);
      };
      more.onclick = appendBatch; appendBatch(); return;
    }
    const filtered = notes.filter(note => (note.text + note.selector).toLowerCase().includes(query.toLowerCase()));
    for (const note of filtered) {
      const card = doc.createElement('article'); card.className = 've-note';
      const line = doc.createElement('small'); line.textContent = `作者原文 / 第 ${note.line} 行`;
      const title = doc.createElement('p'); title.textContent = note.text;
      card.append(line, title);
      if (note.code) {
        const details = doc.createElement('details'), summary = doc.createElement('summary'), code = doc.createElement('pre');
        summary.textContent = '查看附近代码'; code.textContent = note.code; details.append(summary, code); card.append(details);
      }
      if (note.selector && /avatar/.test(note.selector)) {
        const button = doc.createElement('button'); button.className = 've-text'; button.textContent = '去调整头像 ↗';
        button.addEventListener('click', () => {
          if (/is_user\s*=\s*["']?true/.test(note.selector)) targetKey = 'user';
          else if (/is_user\s*=\s*["']?false/.test(note.selector)) targetKey = 'character';
          else targetKey = 'character';
          if (!['position','size','radius','border'].includes(mode)) mode = 'radius';
          setPage('parts'); locate();
        }); card.append(button);
      }
      container.append(card);
    }
    if (!filtered.length) { const empty = doc.createElement('p'); empty.className = 've-empty'; empty.textContent = notes.length ? '没有找到相关说明。' : '这款美化没有保留下来的 CSS 注释。你仍然可以按部位调整。'; container.append(empty); }
  }
  function changeImage(resource, url, label) {
    if (destroyed || saving) return;
    const clean = validateImageUrl(url);
    const current = state.images[resource.id] ? imageAssets.get(state.images[resource.id]).url : resource.url;
    if (clean === current) { feedback('图片链接没有变化。'); return; }
    if (clean === resource.url) delete state.images[resource.id];
    else { const key = String(++assetSequence); imageAssets.set(key, { url: clean, label }); state.images[resource.id] = key; }
    history.push(state); writeCss(composeCss()); render(); renderImages();
    feedback(`已替换 ${resource.property}，保存后写入当前美化。`);
  }
  function renderImages() {
    const container = $('.ve-images'); container.replaceChildren();
    if (!resources.length) {
      const empty = doc.createElement('p'); empty.className = 've-empty';
      empty.textContent = resourceError || '这款美化没有找到 url(...) 图片。字体、渐变和聊天消息里的图片不会列在这里。';
      container.append(empty); return;
    }
    for (const resource of resources) {
      const asset = imageAssets.get(state.images[resource.id]);
      const url = asset?.url || resource.url;
      const card = doc.createElement('article'); card.className = 've-image-card';
      const thumb = doc.createElement('div'); thumb.className = 've-image-thumb';
      const img = doc.createElement('img'); img.alt = `${resource.property} 图片缩略图`; img.loading = 'lazy'; img.referrerPolicy = 'no-referrer';
      const failed = () => { const tip = doc.createElement('span'); tip.textContent = '缩略图暂不可用，仍可替换链接'; thumb.replaceChildren(tip); };
      img.onerror = failed; thumb.append(img);
      try { img.src = new URL(validateImageUrl(url), doc.baseURI).href; } catch { failed(); }
      const heading = doc.createElement('h3'); heading.textContent = resource.note.split('\n')[0].trim().slice(0, 60) || '美化图片';
      const note = doc.createElement('p'); note.className = 've-image-note'; note.textContent = resource.note || '作者没有为此图片留下附近说明。'; note.hidden = note.textContent === heading.textContent;
      const context = doc.createElement('small'); context.textContent = `${resource.property} · 第 ${resource.line} 行 · ${resource.selector || 'CSS 图片'}`;
      const urlLabel = doc.createElement('label'); urlLabel.className = 've-image-url'; urlLabel.textContent = '图片链接';
      const input = doc.createElement('input'); input.type = 'text'; input.autocomplete = 'off'; input.spellcheck = false;
      input.setAttribute('aria-label', `${resource.property} 图片链接`);
      input.value = /^data:/i.test(url) ? '' : url;
      input.placeholder = /^data:/i.test(url) ? '已内嵌图片；可粘贴新链接' : '粘贴图片链接或酒馆图片路径';
      urlLabel.append(input);
      const actions = doc.createElement('div'); actions.className = 've-image-actions';
      const apply = doc.createElement('button'); apply.textContent = '替换链接';
      apply.addEventListener('click', () => {
        if (imageBusy || saving) return;
        try { changeImage(resource, input.value, '已替换链接'); } catch (error) { feedback(error.message); }
      });
      const album = doc.createElement('button'); album.textContent = '从相册选择';
      const file = doc.createElement('input'); file.type = 'file'; file.accept = 'image/*'; file.hidden = true;
      file.setAttribute('aria-label', `${resource.property} 从相册选择`);
      album.addEventListener('click', () => { if (!imageBusy && !saving) file.click(); });
      file.addEventListener('change', async () => {
        const selected = file.files?.[0]; file.value = ''; if (!selected || imageBusy || saving) return;
        imageBusy = true; render(); feedback('正在处理图片，完成后会自动预览…');
        try {
          const result = await embedImage(hostWin, selected);
          if (destroyed) return;
          changeImage(resource, result.url, '已内嵌相册图片'); feedback(result.detail + '；保存后写入当前美化。');
        } catch (error) { if (!destroyed) feedback(error.message); }
        finally { imageBusy = false; if (!destroyed) render(); }
      });
      actions.append(apply, album, file);
      if (asset) {
        const reset = doc.createElement('button'); reset.textContent = '还原此图';
        reset.addEventListener('click', () => { if (imageBusy || saving) return; delete state.images[resource.id]; history.push(state); restoreHistory(state, '已还原这张图片，可撤销。'); });
        actions.append(reset);
      }
      const usage = doc.createElement('p'); usage.className = 've-image-usage';
      usage.textContent = resource.property.startsWith('--') ? '共享变量：使用这个变量的位置会一起换图。' : '只替换这一处图片，其他位置的同名链接保持原样。';
      card.append(thumb, heading, context, note, urlLabel, actions, usage); container.append(card);
    }
    $$('.ve-image-card button, .ve-image-card input').forEach(el => el.disabled = imageBusy);
  }
  function renderChanges() {
    const container = $('.ve-changes'); container.replaceChildren();
    for (const edit of Object.values(state.text)) {
      const row = doc.createElement('div'); row.className = 've-change';
      const label = doc.createElement('span'), value = doc.createElement('b');
      label.textContent = edit.kind === 'font' ? '正文字号' : '输入框提示文字';
      value.textContent = edit.kind === 'font' ? `${edit.value} px` : edit.value || '（留空）';
      row.append(label, value); container.append(row);
    }
    if (state.placeholder !== null) {
      const row = doc.createElement('div'); row.className = 've-change'; row.textContent = `输入框提示文字 → ${state.placeholder || '（留空）'}`; container.append(row);
    }
    for (const [key, edit] of Object.entries(state.edits)) for (const item of edit.changed) {
      const row = doc.createElement('div'); row.className = 've-change'; const label = doc.createElement('span'), value = doc.createElement('b');
      label.textContent = `${targetInfo(key).name} · ${meta[item].title}`;
      const prev = baseline[key]?.values || DEFAULT_VALUES;
      value.textContent = ['textColor','backgroundColor'].includes(item) ? edit.values[item] : item === 'position' ? `X ${edit.values.x} / Y ${edit.values.y} px` : `${prev[item]} → ${edit.values[item]} ${item === 'opacity' ? '%' : 'px'}`;
      row.append(label, value); container.append(row);
    }
    for (const [id, asset] of Object.entries(state.images)) {
      const resource = resources.find(item => item.id === id);
      const row = doc.createElement('div'); row.className = 've-change';
      const label = doc.createElement('span'), value = doc.createElement('b');
      label.textContent = `图片 · ${resource?.property || id}`; value.textContent = imageAssets.get(asset).label;
      row.append(label, value); container.append(row);
    }
    if (!container.childNodes.length) { const empty = doc.createElement('p'); empty.className = 've-empty'; empty.textContent = '还没有修改，先去给头像换个圆角吧。'; container.append(empty); }
  }
  function setPage(page) { currentPage = page; if (page === 'images') renderImages(); if (page === 'notes') renderNotes($('.ve-search input').value); $$('[data-page]').forEach(el => el.hidden = el.dataset.page !== page); $$('[data-tab]').forEach(el => el.setAttribute('aria-pressed', String(el.dataset.tab === page))); }
  function restoreHistory(next, message) { state = next; writeCss(composeCss()); render(); renderText(); if (currentPage === 'notes') renderNotes($('.ve-search input').value); if (currentPage === 'images') renderImages(); feedback(message); }
  function saveTextChange() {
    history.push(state); writeCss(composeCss()); render(); renderText(); feedback('已预览文字调整，保存后写入当前美化。');
  }
  function renderText() {
    const container = $('.ve-text-settings'); container.replaceChildren();
    for (const font of textResources.fonts) {
      const card = doc.createElement('article'); card.className = 've-text-card';
      const title = doc.createElement('b'); title.textContent = '正文字号';
      const note = doc.createElement('small'); note.textContent = `已确认不跟随酒馆字体比例 · 第 ${font.line} 行`;
      const controls = doc.createElement('div'); controls.className = 've-font-controls';
      const input = doc.createElement('input'); input.type = 'number'; input.min = '8'; input.max = '48'; input.step = '1'; input.setAttribute('aria-label', `正文字号，第 ${font.line} 行`);
      input.value = state.text[font.id]?.value ?? font.size;
      const set = value => {
        if (saving || imageBusy || !Number.isFinite(value)) return;
        value = Math.round(Math.min(48, Math.max(8, value)) * 10) / 10;
        if (value === (state.text[font.id]?.value ?? font.size)) return;
        state.text[font.id] = { kind: 'font', value, selectors: font.selectors }; saveTextChange();
      };
      const minus = doc.createElement('button'), plus = doc.createElement('button');
      minus.innerHTML = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 12h12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
      plus.innerHTML = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 12h12M12 6v12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
      minus.setAttribute('aria-label', '减小正文字号'); plus.setAttribute('aria-label', '增大正文字号');
      minus.onclick = () => set(Number(input.value) - 1); plus.onclick = () => set(Number(input.value) + 1);
      input.onchange = () => { if (input.value !== '') set(Number(input.value)); };
      const unit = doc.createElement('span'); unit.textContent = 'px';
      controls.append(minus, input, unit, plus); card.append(title, note, controls); container.append(card);
    }
    const textarea = doc.querySelector('#send_textarea');
    const hints = textResources.hints.length ? textResources.hints : textarea ? [{ id: 'native', text: originalPlaceholder }] : [];
    for (const hint of hints) {
      const card = doc.createElement('article'); card.className = 've-text-card';
      const label = doc.createElement('label'); label.textContent = '输入框提示文字';
      const input = doc.createElement('input'); input.type = 'text'; input.maxLength = 300;
      input.value = hint.id === 'native' ? state.placeholder ?? hint.text : state.text[hint.id]?.value ?? hint.text;
      input.setAttribute('aria-label', '输入框提示文字'); label.append(input);
      const note = doc.createElement('small'); note.textContent = hint.id === 'native' ? '空输入框中的提示；不会改动消息内容。需启用工作室。' : `作者叠加的文字 · 第 ${hint.line} 行 · 保留原显示条件`;
      const apply = doc.createElement('button'); apply.textContent = '预览文字';
      apply.onclick = () => {
        if (saving || imageBusy) return;
        if (hint.id === 'native') { if (state.placeholder === input.value) return; state.placeholder = input.value; }
        else { if ((state.text[hint.id]?.value ?? hint.text) === input.value) return; state.text[hint.id] = { kind: 'content', value: input.value }; }
        saveTextChange();
      };
      card.append(label, note, apply); container.append(card);
    }
  }
  function makeTheme() { return { ...JSON.parse(JSON.stringify(theme)), custom_css: draft, name: theme.name }; }
  function endHold() { hostWin.clearTimeout(heldTimer); hostWin.clearInterval(heldInterval); }
  async function action(name) {
    if (saving || (imageBusy && name !== 'close')) return;
    if (name === 'undo') return restoreHistory(history.undo(), '已撤销上一次调整。');
    if (name === 'redo') return restoreHistory(history.redo(), '已重做。');
    if (name === 'compact') return setCompact(true);
    if (name === 'expand') return setCompact(false);
    if (name === 'locate') return locate();
    if (name === 'pick-parent') { selectElement(currentTarget?.parentElement); return; }
    if (name === 'pick') { picking = true; $('.ve-sheet').hidden = true; $('.ve-controller').hidden = true; $('.ve-pick-hint').hidden = false; return; }
    if (name === 'cancel-pick') return stopPick();
    if (name === 'close') { dispose(true); onClose('已关闭微调，恢复原美化。'); return; }
    if (name === 'reset-all') { const initial = { source: original, edits: {}, images: {}, text: {}, placeholder: null }; history.push(initial); return restoreHistory(initial, '已还原全部调整，可撤销。'); }
    if (name === 'reset-mode') {
      if (!state.edits[targetKey]) return;
      state.edits[targetKey].changed = state.edits[targetKey].changed.filter(item => item !== mode);
      const initial = getBaseline(targetKey).values;
      for (const key of mode === 'position' ? ['x','y'] : mode === 'border' ? ['border','color'] : [mode]) state.edits[targetKey].values[key] = initial[key];
      history.push(state); return restoreHistory(state, '已还原当前调整项。');
    }
    if (name === 'download') { onDownload(makeTheme()); feedback('已导出主题 JSON，当前仍可继续编辑。'); return; }
    if (name === 'save') {
      const result = makeTheme(); saving = true; endHold(); render(); feedback('正在保存到当前美化…');
      observer.disconnect(); previewStyle.textContent = ''; restoreNativeMedia(); host.style.setProperty('display', 'none', 'important');
      try { await onSave(result, original); dispose(false); onClose(`已保存到当前美化「${result.name}」。`); }
      catch (error) {
        saving = false; host.style.removeProperty('display');
        if (nativeStyle.textContent === original) { writeCss(draft); observer.observe(nativeStyle, { childList: true, characterData: true, subtree: true }); }
        else { dispose(false); onClose(`保存未核实：${error.message}。请在美化库检查原美化。`); return; }
        render(); feedback(`保存失败：${error.message}；可以导出 JSON。`);
      }
    }
  }
  root.addEventListener('click', event => {
    const button = event.target.closest('button'); if (!button || button.disabled || saving) return;
    if (button.dataset.workspace === 'library') { if (suspend()) onNavigateLibrary?.(); return; }
    if (button.dataset.workspace === 'editor') return;
    if (button.dataset.action) { void action(button.dataset.action); return; }
    if (button.dataset.target) { targetKey = button.dataset.target; mode = targetKey === 'composer' ? 'lift' : ['position','size','radius','border'].includes(mode) ? mode : 'radius'; locate(); render(); feedback(`已选中${targetInfo(targetKey).name}。`); }
    if (button.dataset.mode) { mode = button.dataset.mode; render(); }
    if (button.dataset.tab) setPage(button.dataset.tab);
    if (button.dataset.step) { step = Number(button.dataset.step); $$('[data-step]').forEach(el => el.setAttribute('aria-pressed', String(Number(el.dataset.step) === step))); }
    if (button === heldButton && Date.now() < heldUntil) { heldButton = null; return; }
    if (button.dataset.nudge) nudge(button.dataset.nudge === 'plus' ? 1 : -1);
    if (button.dataset.lift) nudge(button.dataset.lift === 'up' ? 1 : -1);
    if (button.dataset.direction) move(button.dataset.direction);
  });
  root.addEventListener('pointerdown', event => {
    const button = event.target.closest('[data-nudge], [data-direction], [data-lift]'); if (!button || button.disabled) return;
    heldButton = null; endHold();
    heldTimer = hostWin.setTimeout(() => {
      heldButton = button;
      const repeat = () => { heldUntil = Date.now() + 600; button.dataset.lift ? nudge(button.dataset.lift === 'up' ? 1 : -1) : button.dataset.nudge ? nudge(button.dataset.nudge === 'plus' ? 1 : -1) : move(button.dataset.direction); };
      repeat(); heldInterval = hostWin.setInterval(repeat, 100);
    }, 380);
  });
  hostWin.addEventListener('pointerup', endHold); hostWin.addEventListener('pointercancel', endHold); hostWin.addEventListener('blur', endHold);
  $('.ve-number').addEventListener('change', event => {
    const number = Number(event.target.value); if (!Number.isFinite(number) || event.target.value === '') return render();
    const v = stepValue(values(), mode, number - values()[mode]); commit(v, `已设置为 ${v[mode]} px`);
  });
  $('.ve-range').addEventListener('input', event => { const v = { ...values(), [mode]: Number(event.target.value) }; commit(v, `已设置为 ${v[mode]} px`); });
  for (const key of ['x','y']) $(`.ve-${key}`).addEventListener('change', event => { if (!Number.isFinite(Number(event.target.value))) return render(); commit(stepValue(values(), key, Number(event.target.value) - values()[key]), '已更新头像位置。', 'position'); });
  $('.ve-color').addEventListener('input', event => { const property = ['textColor','backgroundColor'].includes(mode) ? mode : 'color'; commit({ ...values(), [property]:event.target.value }, '已更新颜色。', property === 'color' ? 'border' : mode); });
  $('.ve-picked-list').addEventListener('change', event => { targetKey=event.target.value; currentTarget=visibleTarget(targetKey); mode=targetInfo(targetKey).modes.includes('fontSize') ? 'fontSize' : 'radius'; locate(false); render(); });
  $('.ve-search input').addEventListener('input', event => renderNotes(event.target.value));
  let drag;
  $('.ve-grip').addEventListener('pointerdown', event => {
    const r = $('.ve-controller').getBoundingClientRect(); drag = { dx: event.clientX - r.left, dy: event.clientY - r.top };
    event.target.setPointerCapture(event.pointerId); event.preventDefault();
  });
  $('.ve-grip').addEventListener('pointermove', event => {
    if (!drag) return; const pad = $('.ve-controller');
    pad.style.left = `${Math.max(8, Math.min(hostWin.innerWidth - pad.offsetWidth - 8, event.clientX - drag.dx))}px`;
    pad.style.top = `${Math.max(45, Math.min(hostWin.innerHeight - pad.offsetHeight - 8, event.clientY - drag.dy))}px`;
    pad.style.bottom = 'auto'; pad.style.right = 'auto';
  });
  $('.ve-grip').addEventListener('pointerup', () => drag = null);
  $('.ve-grip').addEventListener('pointercancel', () => drag = null);
  function keyboard(event) {
    if (event.key === 'Escape') { event.preventDefault(); if (picking) stopPick(); else if (compact) setCompact(false); else void action('close'); }
    if (event.target.matches('input,textarea')) return;
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') { event.preventDefault(); void action(event.shiftKey ? 'redo' : 'undo'); }
    if (compact && mode === 'position' && ['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(event.key)) { event.preventDefault(); move(event.key.slice(5).toLowerCase()); }
    if (compact && mode === 'lift' && ['ArrowUp','ArrowDown'].includes(event.key)) { event.preventDefault(); nudge(event.key === 'ArrowUp' ? 1 : -1); }
  }
  root.addEventListener('keydown', keyboard);
  const themeSelect = doc.querySelector('#themes');
  function themeChanged() { if (!saving) { dispose(true); onClose('已切换主题，微调预览已结束。'); } }
  themeSelect?.addEventListener('change', themeChanged);
  hostWin.addEventListener('click', pick, true);
  function blockPickFocus(event) {
    if (picking && !event.composedPath().includes(host)) { event.preventDefault(); event.stopImmediatePropagation(); }
  }
  hostWin.addEventListener('pointerdown', blockPickFocus, true);
  function dispose() {
    if (destroyed) return; destroyed = true; endHold(); observer.disconnect(); hostWin.cancelAnimationFrame(raf);
    previewStyle.remove(); restoreNativeMedia();
    hostWin.removeEventListener('click', pick, true); themeSelect?.removeEventListener('change', themeChanged);
    hostWin.removeEventListener('pointerdown', blockPickFocus, true);
    hostWin.removeEventListener('pointerup', endHold); hostWin.removeEventListener('pointercancel', endHold); hostWin.removeEventListener('blur', endHold);
    host.remove(); initialFocus?.focus?.();
  }
  function suspend() {
    if (destroyed || saving || imageBusy) return false;
    endHold(); stopPick(); suspended = true; hostWin.cancelAnimationFrame(raf);
    previewStyle.textContent = ''; restoreNativeMedia(); host.style.setProperty('display', 'none', 'important');
    return true;
  }
  function resume() {
    if (destroyed) return false;
    if (!suspended) return true;
    if (nativeStyle.textContent !== original) { dispose(); onClose('美化已变化，请重新打开微调。'); return false; }
    suspended = false; host.style.removeProperty('display'); writeCss(draft); setCompact(false); updateOutline();
    $('[data-workspace="editor"]').focus({ preventScroll: true }); return true;
  }
  $('.ve-image-count').textContent = resources.length;
  renderNotes(); renderText(); locate(false); render(); updateOutline(); $('[data-action="close"]').focus({ preventScroll: true });
  const close = () => dispose(true);
  close.suspend = suspend; close.resume = resume;
  return close;
}
