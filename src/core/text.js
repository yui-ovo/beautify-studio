import postcss from 'postcss';
import valueParser from 'postcss-value-parser';
export const splitSelectors = value => postcss.list.comma(value);

export function cssString(text) {
  return '"' + String(text).replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/[\n\r\f<>]/g, c => `\\${c.charCodeAt(0).toString(16)} `) + '"';
}
export function readCssString(value) {
  const nodes = valueParser(String(value).trim()).nodes;
  if (nodes.length !== 1 || nodes[0].type !== 'string' || nodes[0].unclosed) return null;
  return nodes[0].value.replace(/\\([0-9a-f]{1,6})\s?|\\([^\n\r])/gi, (_, hex, char) => hex ? String.fromCodePoint(Math.min(parseInt(hex, 16) || 0xfffd, 0x10ffff)) : char);
}
export function textDeclarations(source) {
  const entries = [];
  let index = 0;
  postcss.parse(source).walkDecls(decl => {
    const id = String(index++);
    if (decl.parent.type !== 'rule' || !['font', 'font-size', 'content'].includes(decl.prop.toLowerCase())) return;
    entries.push({ id, property: decl.prop.toLowerCase(), value: decl.value, selector: decl.parent.selector, line: decl.source.start.line });
  });
  return entries;
}

// Keep declaration indices stable: insert scoped font rules only after walking.
export function editTextCss(source, changes = {}) {
  if (!Object.keys(changes).length) return source;
  const root = postcss.parse(source), additions = [];
  let index = 0;
  root.walkDecls(decl => {
    const edit = changes[String(index++)];
    if (!edit) return;
    if (decl.prop.toLowerCase() === 'content' && edit.kind === 'content') decl.value = cssString(edit.value);
    if (['font-size', 'font'].includes(decl.prop.toLowerCase()) && edit.kind === 'font' && edit.selectors?.length && Number.isFinite(edit.value)) {
      const rule = postcss.rule({ selector: edit.selectors.join(',\n') });
      rule.append({ prop: 'font-size', value: `${Math.min(48, Math.max(8, edit.value))}px`, important: true });
      additions.push([decl.parent, rule]);
    }
  });
  for (const [anchor, rule] of additions) anchor.after(rule);
  return root.toString();
}
