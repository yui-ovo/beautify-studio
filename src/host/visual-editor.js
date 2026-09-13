import { TARGETS, DEFAULT_VALUES, parseSource, buildEditedCss, stepValue, createHistory } from '../core/editor.js';
import { editorMarkup } from '../ui/editor-markup.js';
import PANEL_CSS from '../ui/studio.css';

// The first release edits the active theme. Preview CSS is never persisted by this module.
export function openVisualEditor({ hostWin, theme, onClose, onSave, onDownload }) {
  const doc = hostWin.document;
  const nativeStyle = doc.querySelector('#custom-style');
  if (!nativeStyle) throw new Error('没有找到当前美化的样式，请先在酒馆应用一款美化。');
  const original = nativeStyle.textContent;
  const previewStyle = doc.createElement('style');
  previewStyle.id = 'beautify-visual-preview';
  doc.head.append(previewStyle);
  let draft = original;
  let state = { source: original, edits: {} };
  const history = createHistory(state);
  let targetKey = 'character', mode = 'radius', step = 1, compact = false, picking = false, destroyed = false, saving = false;
  let currentTarget, raf, heldTimer, heldInterval, heldButton = null, heldUntil = 0;
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
  const observer = new hostWin.MutationObserver(() => {
    if (nativeStyle.textContent !== original) { dispose(false); onClose('酒馆已切换或修改主题，微调预览已结束。'); }
  });
  observer.observe(nativeStyle, { childList: true, characterData: true, subtree: true });

  function writeCss(css) {
    draft = css;
    previewStyle.textContent = css.slice(original.length);
  }
  function visibleTarget(key) {
    const nodes = [...doc.querySelectorAll(TARGETS[key].selector)].filter(n => n.getClientRects().length);
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
    const radius = cs.borderTopLeftRadius.endsWith('%') ? number(cs.width, 48) * number(cs.borderTopLeftRadius, 0) / 100 : number(cs.borderTopLeftRadius, 0);
    baseline[key] = {
      values: { ...DEFAULT_VALUES, size: Math.round(number(cs.width, 48)), radius: Math.round(radius), border: Math.round(number(cs.borderTopWidth, 0)), color },
      origin: { x: movable ? parseFloat(parts[0]) : 0, y: movable ? parseFloat(parts[1] || '0') : 0 }, movable,
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
  };
  function render() {
    const v = values(), info = meta[mode], available = Boolean(visibleTarget(targetKey));
    $$('[data-target]').forEach(el => el.setAttribute('aria-pressed', String(el.dataset.target === targetKey)));
    $$('[data-mode]').forEach(el => el.setAttribute('aria-pressed', String(el.dataset.mode === mode)));
    $('.ve-scope').firstChild.textContent = `作用于${TARGETS[targetKey].scope} `;
    $('.ve-property-title').textContent = `头像${info.title}`;
    $('.ve-controller-title').textContent = `${TARGETS[targetKey].name} · ${info.title}`;
    $('.ve-help').textContent = info.help;
    $('.ve-controller-caption').textContent = mode === 'position' ? `X ${v.x} / Y ${v.y} px` : info.help;
    $('.ve-scalar').hidden = mode === 'position'; $('.ve-range').hidden = mode === 'position';
    $('.ve-position-values').hidden = mode !== 'position'; $('.ve-color-row').hidden = mode !== 'border';
    $('.ve-dpad').hidden = mode !== 'position'; $('.ve-controller-scalar').hidden = mode === 'position';
    $('.ve-x').value = v.x; $('.ve-y').value = v.y;
    if (mode !== 'position') {
      for (const el of [$('.ve-number'), $('.ve-range')]) { el.min = info.min; el.max = info.max; el.value = v[mode]; }
      $('.ve-mini-value').textContent = v[mode];
    }
    $('.ve-color').value = v.color;
    $$('[data-action="undo"]').forEach(el => el.disabled = !history.canUndo);
    $('[data-action="redo"]').disabled = !history.canRedo;
    $$('[data-nudge], [data-direction], .ve-number, .ve-range, .ve-x, .ve-y, .ve-color').forEach(el => el.disabled = !available || (mode === 'position' && !getBaseline(targetKey)?.movable));
    $('[data-action="save"]').disabled = !history.canUndo || saving;
    $('[data-action="download"]').disabled = !history.canUndo || saving;
    $('[data-action="reset-all"]').disabled = !history.canUndo;
    $('.ve-draft').textContent = history.canUndo ? '未保存' : '草稿';
    renderChanges();
  }
  function updateOutline() {
    if (destroyed) return;
    if (!currentTarget?.isConnected || !currentTarget.getClientRects().length) {
      const nextTarget = visibleTarget(targetKey);
      if (nextTarget !== currentTarget) { currentTarget = nextTarget; render(); }
    }
    const outline = $('.ve-outline');
    if (currentTarget) {
      const r = currentTarget.getBoundingClientRect();
      outline.hidden = r.bottom < 45 || r.top > hostWin.innerHeight;
      outline.style.cssText = `left:${r.left - 6}px;top:${r.top - 6}px;width:${r.width + 12}px;height:${r.height + 12}px;`;
      outline.querySelector('span').textContent = TARGETS[targetKey].name;
    } else outline.hidden = true;
    raf = hostWin.requestAnimationFrame(updateOutline);
  }
  function locate(scroll = true) {
    currentTarget = visibleTarget(targetKey);
    if (!currentTarget) { feedback(`当前画面没有${TARGETS[targetKey].name}，请打开一段含这类消息的聊天。`); return; }
    if (scroll) currentTarget.scrollIntoView({ block: 'center', behavior: 'smooth' });
    getBaseline(targetKey); render();
  }
  function commit(next, label, group = mode) {
    if (!getBaseline(targetKey)) return;
    state.edits[targetKey] = { values: next, origin: getBaseline(targetKey).origin, changed: [...new Set([...(state.edits[targetKey]?.changed || []), group])] };
    history.push(state); writeCss(buildEditedCss(state.source, state.edits)); render(); feedback(label);
    // Check the property actually won the cascade rather than reporting a fake successful edit.
    hostWin.requestAnimationFrame(() => {
      if (destroyed || !currentTarget) return;
      const cs = hostWin.getComputedStyle(currentTarget);
      const expected = mode === 'size' ? [cs.width, next.size] : mode === 'radius' ? [cs.borderTopLeftRadius, next.radius] : mode === 'border' ? [cs.borderTopWidth, next.border] : null;
      if (expected && Math.abs(parseFloat(expected[0]) - expected[1]) > 1) feedback('有其他样式影响了效果；可撤销本次调整并查看作者说明。');
    });
  }
  function nudge(delta) { const v = stepValue(values(), mode, delta * step); commit(v, `${TARGETS[targetKey].name}${meta[mode].title}已调整为 ${v[mode]} px`); }
  function move(direction) {
    if (!getBaseline(targetKey)?.movable) { feedback('原美化使用了复杂位移，这一版暂不调整位置。'); return; }
    const property = ['left','right'].includes(direction) ? 'x' : 'y';
    const delta = ['left','up'].includes(direction) ? -step : step;
    const v = stepValue(values(), property, delta); commit(v, `水平 ${v.x} px · 垂直 ${v.y} px`, 'position');
  }
  function setCompact(value) {
    compact = value; $('.ve-sheet').hidden = value; $('.ve-controller').hidden = !value;
    if (!value) { $('.ve-controller').style.left = ''; $('.ve-controller').style.top = ''; }
    render();
  }
  function stopPick() { picking = false; $('.ve-pick-hint').hidden = true; $('.ve-controller').hidden = !compact; $('.ve-sheet').hidden = compact; }
  function pick(event) {
    if (!picking || event.composedPath().includes(host)) return;
    event.preventDefault(); event.stopImmediatePropagation();
    const avatar = event.target.closest?.('#chat .mes .avatar');
    if (!avatar) { feedback('请点聊天消息旁边的头像。'); return; }
    targetKey = avatar.closest('.mes').getAttribute('is_user') === 'true' ? 'user' : 'character';
    currentTarget = avatar; getBaseline(targetKey); compact = true; stopPick(); render(); feedback(`已选中${TARGETS[targetKey].name}，调整作用于${TARGETS[targetKey].scope}。`);
  }
  function renderNotes(query = '') {
    const container = $('.ve-notes'); container.replaceChildren();
    let notes;
    try { notes = parseSource(state.source); } catch { notes = []; feedback('原 CSS 有语法问题；作者说明暂时无法解析，部位微调仍可使用。'); }
    $('.ve-note-count').textContent = notes.length;
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
          setPage('parts'); locate();
        }); card.append(button);
      }
      container.append(card);
    }
    if (!filtered.length) { const empty = doc.createElement('p'); empty.className = 've-empty'; empty.textContent = notes.length ? '没有找到相关说明。' : '这款美化没有保留下来的 CSS 注释。你仍然可以按部位调整。'; container.append(empty); }
  }
  function renderChanges() {
    const container = $('.ve-changes'); container.replaceChildren();
    for (const [key, edit] of Object.entries(state.edits)) for (const item of edit.changed) {
      const row = doc.createElement('div'); row.className = 've-change'; const label = doc.createElement('span'), value = doc.createElement('b');
      label.textContent = `${TARGETS[key].name} · ${meta[item].title}`;
      const prev = baseline[key]?.values || DEFAULT_VALUES;
      value.textContent = item === 'position' ? `X ${edit.values.x} / Y ${edit.values.y} px` : `${prev[item]} → ${edit.values[item]} px`;
      row.append(label, value); container.append(row);
    }
    if (!container.childNodes.length) { const empty = doc.createElement('p'); empty.className = 've-empty'; empty.textContent = '还没有修改，先去给头像换个圆角吧。'; container.append(empty); }
  }
  function setPage(page) { $$('[data-page]').forEach(el => el.hidden = el.dataset.page !== page); $$('[data-tab]').forEach(el => el.setAttribute('aria-pressed', String(el.dataset.tab === page))); }
  function restoreHistory(next, message) { state = next; writeCss(buildEditedCss(state.source, state.edits)); render(); feedback(message); }
  function makeTheme() { return { ...JSON.parse(JSON.stringify(theme)), custom_css: draft, name: `${theme.name} · 我的微调` }; }
  function endHold() { hostWin.clearTimeout(heldTimer); hostWin.clearInterval(heldInterval); }
  async function action(name) {
    if (saving) return;
    if (name === 'undo') return restoreHistory(history.undo(), '已撤销上一次调整。');
    if (name === 'redo') return restoreHistory(history.redo(), '已重做。');
    if (name === 'compact') return setCompact(true);
    if (name === 'expand') return setCompact(false);
    if (name === 'locate') return locate();
    if (name === 'pick') { picking = true; $('.ve-sheet').hidden = true; $('.ve-controller').hidden = true; $('.ve-pick-hint').hidden = false; return; }
    if (name === 'cancel-pick') return stopPick();
    if (name === 'close') { dispose(true); onClose('已关闭微调，恢复原美化。'); return; }
    if (name === 'reset-all') { history.push({ source: original, edits: {} }); return restoreHistory({ source: original, edits: {} }, '已还原全部调整，可撤销。'); }
    if (name === 'reset-mode') {
      if (!state.edits[targetKey]) return;
      state.edits[targetKey].changed = state.edits[targetKey].changed.filter(item => item !== mode);
      const initial = getBaseline(targetKey).values;
      for (const key of mode === 'position' ? ['x','y'] : mode === 'border' ? ['border','color'] : [mode]) state.edits[targetKey].values[key] = initial[key];
      history.push(state); return restoreHistory(state, '已还原当前调整项。');
    }
    if (name === 'download') { onDownload(makeTheme()); feedback('已导出主题 JSON，当前仍可继续编辑。'); return; }
    if (name === 'save') {
      const result = makeTheme(); saving = true; endHold(); render(); feedback('正在通过酒馆保存副本…');
      observer.disconnect(); previewStyle.textContent = ''; host.style.setProperty('display', 'none', 'important');
      try { await onSave(result); dispose(false); onClose(`已保存并应用「${result.name}」。`); }
      catch (error) {
        saving = false; host.style.removeProperty('display');
        if (nativeStyle.textContent === original) { writeCss(draft); observer.observe(nativeStyle, { childList: true, characterData: true, subtree: true }); }
        else { dispose(false); onClose(`保存未核实：${error.message}。请在美化库检查副本。`); return; }
        render(); feedback(`保存失败：${error.message}；可以导出 JSON。`);
      }
    }
  }
  root.addEventListener('click', event => {
    const button = event.target.closest('button'); if (!button || button.disabled || saving) return;
    if (button.dataset.action) { void action(button.dataset.action); return; }
    if (button.dataset.target) { targetKey = button.dataset.target; locate(); render(); feedback(`已选中${TARGETS[targetKey].name}。`); }
    if (button.dataset.mode) { mode = button.dataset.mode; render(); }
    if (button.dataset.tab) setPage(button.dataset.tab);
    if (button.dataset.step) { step = Number(button.dataset.step); $$('[data-step]').forEach(el => el.setAttribute('aria-pressed', String(Number(el.dataset.step) === step))); }
    if (button === heldButton && Date.now() < heldUntil) { heldButton = null; return; }
    if (button.dataset.nudge) nudge(button.dataset.nudge === 'plus' ? 1 : -1);
    if (button.dataset.direction) move(button.dataset.direction);
  });
  root.addEventListener('pointerdown', event => {
    const button = event.target.closest('[data-nudge], [data-direction]'); if (!button || button.disabled) return;
    heldButton = null; endHold();
    heldTimer = hostWin.setTimeout(() => {
      heldButton = button;
      const repeat = () => { heldUntil = Date.now() + 600; button.dataset.nudge ? nudge(button.dataset.nudge === 'plus' ? 1 : -1) : move(button.dataset.direction); };
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
  $('.ve-color').addEventListener('input', event => commit({ ...values(), color: event.target.value }, '已更新边框颜色。', 'border'));
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
  }
  root.addEventListener('keydown', keyboard);
  const themeSelect = doc.querySelector('#themes');
  function themeChanged() { if (!saving) { dispose(true); onClose('已切换主题，微调预览已结束。'); } }
  themeSelect?.addEventListener('change', themeChanged);
  doc.addEventListener('click', pick, true);
  function dispose() {
    if (destroyed) return; destroyed = true; endHold(); observer.disconnect(); hostWin.cancelAnimationFrame(raf);
    previewStyle.remove();
    doc.removeEventListener('click', pick, true); themeSelect?.removeEventListener('change', themeChanged);
    hostWin.removeEventListener('pointerup', endHold); hostWin.removeEventListener('pointercancel', endHold); hostWin.removeEventListener('blur', endHold);
    host.remove(); initialFocus?.focus?.();
  }
  renderNotes(); locate(false); render(); updateOutline(); $('[data-action="close"]').focus({ preventScroll: true });
  return () => dispose(true);
}
