import { textDeclarations, readCssString, splitSelectors } from '../core/text.js';

// Read displayed hint text only. Never probe live CSS or the host font scale.
export function inspectText(win, style) {
  const hints = [];
  let entries;
  try { entries = textDeclarations(style.textContent); } catch { return { hints }; }
  const active = [];
  function walk(rules) {
    for (const rule of rules) {
      if (rule.type === win.CSSRule.MEDIA_RULE && !win.matchMedia(rule.conditionText).matches) continue;
      if (rule.type === win.CSSRule.SUPPORTS_RULE && !win.CSS.supports(rule.conditionText)) continue;
      if (rule.selectorText && rule.style?.getPropertyValue('content')) active.push(rule);
      if (rule.cssRules) walk(rule.cssRules);
    }
  }
  try { walk(style.sheet.cssRules); } catch { return { hints }; }
  for (const entry of entries) {
    const value = readCssString(entry.value);
    if (value === null || !value.trim() || /^[\s\uE000-\uF8FF\u2190-\u2BFF]+$/u.test(value)) continue;
    // Ambiguous duplicate declarations are left alone.
    if (entries.filter(e => e.selector === entry.selector && e.value === entry.value).length !== 1) continue;
    if (!active.some(rule => rule.selectorText === entry.selector && readCssString(rule.style.getPropertyValue('content')) === value)) continue;
    for (const selector of splitSelectors(entry.selector)) {
      const match = selector.trim().match(/^(.*?)(::?before|::?after)$/);
      if (!match) continue;
      try {
        const node = win.document.querySelector(match[1]);
        if (!node || !(node.id === 'form_sheld' || node.closest('#send_form')) || !node.getClientRects().length) continue;
        const cs = win.getComputedStyle(node, match[2].replace(/^:([^:])/, '::$1'));
        if (readCssString(cs.content) === value && cs.display !== 'none' && cs.visibility !== 'hidden') hints.push({ ...entry, text: value });
        break;
      } catch { /* Unavailable hints stay untouched. */ }
    }
  }
  return { hints };
}
