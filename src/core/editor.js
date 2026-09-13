import postcss from 'postcss';

export const EDIT_START = '/* === BEAUTIFY_VISUAL_START === */';
export const EDIT_END = '/* === BEAUTIFY_VISUAL_END === */';
export const TARGETS = {
  character: { name: '角色头像', scope: '全部角色消息', selector: '#chat .mes[is_user="false"] .avatar', icon: '✧' },
  user: { name: '我的头像', scope: '全部用户消息', selector: '#chat .mes[is_user="true"] .avatar', icon: '◎' },
  composer: { name: '底部输入栏', scope: '输入框与底栏按钮', selector: '#send_form', icon: '▤' },
};
export const DEFAULT_VALUES = { x: 0, y: 0, size: 48, radius: 12, border: 0, color: '#727c73', lift: 0, gap: 0 };

export function parseSource(css) {
  const root = postcss.parse(String(css || ''));
  const comments = [];
  root.walkComments(node => {
    if (/BEAUTIFY_VISUAL_(START|END)/.test(node.text)) return;
    const next = node.next();
    comments.push({ text: node.text.trim(), line: node.source?.start?.line || 1,
      selector: node.parent.type === 'rule' ? node.parent.selector : next?.type === 'rule' ? next.selector : '',
      code: next && next.type !== 'comment' ? next.toString() : '',
    });
  });
  return comments;
}

export function stepValue(values, property, delta) {
  const bounds = { x: [-300, 300], y: [-300, 300], size: [16, 200], radius: [0, 100], border: [0, 12], lift: [-120, 200], gap: [-120, 200] };
  const [min, max] = bounds[property];
  return { ...values, [property]: Math.min(max, Math.max(min, Math.round((values[property] + delta) * 10) / 10)) };
}

export function buildEditedCss(source, edits) {
  const rules = [];
  for (const [key, edit] of Object.entries(edits)) {
    const target = TARGETS[key];
    if (!target) continue;
    const { values: v, changed, origin = { x: 0, y: 0 } } = edit;
    if (key === 'composer') {
      const css = [];
      if (changed.includes('lift')) rules.push(`/* 只移动输入框和其中按钮 */\nhtml body #send_form#send_form#send_form { translate: ${origin.x}px ${origin.y - v.lift}px !important; }`);
      if (changed.includes('gap')) {
        css.push(`--bs-background-offset: ${v.gap}px;`);
      }
      if (css.length) rules.push(`/* 底部背景高度 · 由美化工作室独立绘制，不改变输入栏或安全区布局 */\nhtml body #form_sheld#form_sheld#form_sheld {\n  ${css.join('\n  ')}\n}`);
      continue;
    }
    const declarations = [];
    if (changed.includes('position')) declarations.push(`translate: ${origin.x + v.x}px ${origin.y + v.y}px !important;`);
    if (changed.includes('size')) declarations.push(`width: ${v.size}px !important; height: ${v.size}px !important; min-width: ${v.size}px !important; max-width: ${v.size}px !important; max-height: ${v.size}px !important; flex-shrink: 0 !important;`);
    if (changed.includes('radius')) declarations.push(`border-radius: ${v.radius}px !important;`);
    if (changed.includes('border')) declarations.push(`border: ${v.border}px solid ${v.color} !important; box-sizing: border-box !important;`);
    if (!declarations.length) continue;
    rules.push(`/* ${target.name} · 可视化微调 */\n${target.selector} {\n  ${declarations.join('\n  ')}\n}`);
    const img = [];
    if (changed.includes('size')) img.push('width: 100% !important; height: 100% !important; max-width: 100% !important; max-height: 100% !important; object-fit: cover;');
    if (changed.includes('radius')) img.push('border-radius: inherit !important;');
    if (img.length) rules.push(`${target.selector} img { ${img.join(' ')} }`);
  }
  return rules.length ? `${source}\n\n${EDIT_START}\n${rules.join('\n\n')}\n${EDIT_END}\n` : source;
}

export function createHistory(initial) {
  const copy = value => JSON.parse(JSON.stringify(value));
  let items = [copy(initial)], index = 0;
  return {
    push(value) { items = items.slice(0, index + 1); items.push(copy(value)); if (items.length > 100) items.shift(); index = items.length - 1; },
    undo() { index = Math.max(0, index - 1); return copy(items[index]); },
    redo() { index = Math.min(items.length - 1, index + 1); return copy(items[index]); },
    get canUndo() { return index > 0; }, get canRedo() { return index < items.length - 1; },
  };
}
