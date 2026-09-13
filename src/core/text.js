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
    if (decl.parent.type !== 'rule' || decl.prop.toLowerCase() !== 'content') return;
    entries.push({ id, property: decl.prop.toLowerCase(), value: decl.value, selector: decl.parent.selector, line: decl.source.start.line });
  });
  return entries;
}

export function editTextCss(source, changes = {}) {
  if (!Object.keys(changes).length) return source;
  const root = postcss.parse(source);
  let index = 0;
  root.walkDecls(decl => {
    const edit = changes[String(index++)];
    if (!edit) return;
    if (decl.prop.toLowerCase() === 'content' && edit.kind === 'content') decl.value = cssString(edit.value);
  });
  return root.toString();
}

// Only v1.7 generic edits have both an owned block and an owned selector.
// Earlier scoped font rules have no provenance marker: never guess their owner.
export function removeStudioFontOverrides(source) {
  let root;
  try { root = postcss.parse(source); } catch { return { css: source, count: 0 }; }
  let count = 0;
  function clean(container) {
    let owned = false;
    for (const node of [...container.nodes || []]) {
      if (node.type === 'comment' && node.text.trim() === '=== BEAUTIFY_VISUAL_START ===') owned = true;
      else if (node.type === 'comment' && node.text.trim() === '=== BEAUTIFY_VISUAL_END ===') owned = false;
      else if (owned && node.type === 'rule' && node.selector.startsWith(':is(#beautify-specificity#beautify-specificity, ') && node.selector.includes('):where(')) {
        for (const decl of [...node.nodes]) {
          if (decl.type === 'decl' && decl.prop.toLowerCase() === 'font-size') { decl.remove(); count++; }
        }
        if (!node.nodes.length) node.remove();
      } else if (node.type === 'atrule' && node.nodes) clean(node);
    }
  }
  clean(root);
  return { css: count ? root.toString() : source, count };
}
