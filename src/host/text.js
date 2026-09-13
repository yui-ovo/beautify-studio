import { textDeclarations, readCssString, splitSelectors } from '../core/text.js';

// Synchronous CSSOM probes are restored before the browser paints. Neither the
// theme text nor the user's font slider is changed or saved by detection.
export function inspectText(win, style) {
  const doc = win.document, fonts = [], hints = [];
  let entries;
  try { entries = textDeclarations(style.textContent); } catch { return { fonts, hints }; }
  const rules = [];
  function walk(list) { for (const rule of list) { if (rule.style && rule.selectorText) rules.push(rule); if (rule.cssRules) walk(rule.cssRules); } }
  try { walk(style.sheet.cssRules); } catch { return { fonts, hints }; }
  const samples = [...doc.querySelectorAll('#chat .mes_text, #chat .mes_text p, #chat .mes_text span')].filter(n => n.getClientRects().length).slice(-60);
  const root = doc.documentElement;
  const baseScale = parseFloat(win.getComputedStyle(root).getPropertyValue('--fontScale'));
  const before = samples.map(n => parseFloat(win.getComputedStyle(n).fontSize));
  const old = root.style.getPropertyValue('--fontScale'), priority = root.style.getPropertyPriority('--fontScale');
  let fixed = [];
  if (Number.isFinite(baseScale) && baseScale > 0) {
    try {
      root.style.setProperty('--fontScale', String(baseScale * 0.75), 'important');
      fixed = samples.filter((n, i) => Math.abs(parseFloat(win.getComputedStyle(n).fontSize) - before[i]) < 0.1 && !win.getComputedStyle(n).transitionProperty.split(',').some(p => ['all', 'font-size'].includes(p.trim()) && win.getComputedStyle(n).transitionDuration !== '0s'));
    } finally { if (old) root.style.setProperty('--fontScale', old, priority); else root.style.removeProperty('--fontScale'); }
  }
  for (const entry of entries) {
    const candidates = rules.filter(r => r.selectorText === entry.selector && r.style.getPropertyValue(entry.property).trim() === entry.value.trim());
    if (candidates.length !== 1 || entries.filter(e => e.selector === entry.selector && e.property === entry.property && e.value === entry.value).length !== 1) continue;
    const rule = candidates[0];
    if (['font-size', 'font'].includes(entry.property)) {
      if (/^(inherit|unset|revert|revert-layer)$/i.test(entry.value)) continue;
      // A rule must actually affect a visible, scale-independent text sample.
      const affected = [], original = rule.style.cssText;
      const sizes = fixed.map(n => parseFloat(win.getComputedStyle(n).fontSize));
      try {
        rule.style.setProperty('font-size', '3px', rule.style.getPropertyPriority('font-size'));
        fixed.forEach((n, i) => { if (Math.abs(parseFloat(win.getComputedStyle(n).fontSize) - sizes[i]) > 0.5) affected.push(n); });
      } finally { rule.style.cssText = original; }
      if (!affected.length) continue;
      const selectors = new Set();
      for (const selector of splitSelectors(entry.selector)) {
        try {
          if (affected.some(n => n.matches(selector))) selectors.add(`html body #chat#chat :is(.mes_text, .mes_text *)${`:is(${selector.trim()})`}`);
          else if (affected.some(n => n.closest(selector))) selectors.add(`:is(${selector.trim()}) #chat#chat .mes_text, #chat#chat:is(${selector.trim()}) .mes_text, #chat#chat :is(${selector.trim()}) .mes_text`);
        } catch { /* Unsupported selectors are left alone. */ }
      }
      if (selectors.size) fonts.push({ ...entry, size: Math.round(parseFloat(win.getComputedStyle(affected[0]).fontSize) * 10) / 10, selectors: [...selectors] });
    } else {
      const value = readCssString(entry.value);
      if (value === null || !value.trim()) continue;
      for (const selector of splitSelectors(entry.selector)) {
        const match = selector.trim().match(/^(.*?)(::?before|::?after)$/);
        if (!match) continue;
        try {
          const node = doc.querySelector(match[1]);
          if (!node || !(node.id === 'form_sheld' || node.closest('#send_form')) || !node.getClientRects().length) continue;
          const cs = win.getComputedStyle(node, match[2].replace(/^:([^:])/, '::$1'));
          if (readCssString(cs.content) !== value || cs.display === 'none' || cs.visibility === 'hidden') continue;
          // Do not treat icon glyphs as editable hint sentences.
          if (/^[\s\uE000-\uF8FF\u2190-\u2BFF]+$/u.test(value)) continue;
          const original = rule.style.cssText;
          let wins = false;
          try {
            rule.style.setProperty('content', '"bs-hint-probe"', rule.style.getPropertyPriority('content'));
            wins = readCssString(win.getComputedStyle(node, match[2].replace(/^:([^:])/, '::$1')).content) === 'bs-hint-probe';
          } finally { rule.style.cssText = original; }
          if (wins) hints.push({ ...entry, text: value });
          break;
        } catch { /* Conditional/unavailable hints stay untouched. */ }
      }
    }
  }
  return { fonts, hints };
}
