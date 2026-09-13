import { readCssString } from '../core/text.js';

// Settings live in the active theme CSS, so switching themes also switches these
// enhancements. The DOM additions belong only to this runtime and are reversible.
export function startEditorRuntime(win) {
  const doc = win.document;
  let input, savedHint, appliedHint, shell, layer, stopped = false;
  const style = doc.createElement('style');
  style.textContent = `html body #form_sheld#form_sheld#form_sheld#form_sheld[data-bs-paint] { background: transparent !important; isolation: isolate !important; }
html body #form_sheld[data-bs-static] { position: relative !important; }`;
  doc.head.append(style);
  function restoreHint() {
    if (input && appliedHint !== undefined && input.getAttribute('placeholder') === appliedHint) {
      if (savedHint === null) input.removeAttribute('placeholder'); else input.setAttribute('placeholder', savedHint);
    }
    input = null; savedHint = appliedHint = undefined;
  }
  function restoreBackground() {
    layer?.remove(); layer = null;
    shell?.removeAttribute('data-bs-paint'); shell?.removeAttribute('data-bs-static'); shell = null;
  }
  function sync() {
    if (stopped) return;
    const nextInput = doc.querySelector('#send_textarea');
    if (nextInput !== input) { restoreHint(); input = nextInput; savedHint = input?.getAttribute('placeholder'); }
    if (input) {
      const hint = readCssString(win.getComputedStyle(input).getPropertyValue('--bs-placeholder'));
      const current = input.getAttribute('placeholder');
      if (appliedHint !== undefined && current !== appliedHint) savedHint = current;
      if (hint !== null) { if (appliedHint === undefined) savedHint = current; if (current !== hint) input.setAttribute('placeholder', hint); appliedHint = hint; }
      else if (appliedHint !== undefined) { restoreHint(); input = nextInput; savedHint = input.getAttribute('placeholder'); }
    }
    const nextShell = doc.querySelector('#form_sheld');
    if (nextShell !== shell) restoreBackground();
    if (!nextShell) return;
    const cs = win.getComputedStyle(nextShell);
    const offset = parseFloat(cs.getPropertyValue('--bs-background-offset'));
    if (!Number.isFinite(offset) || offset === 0) { restoreBackground(); return; }
    shell = nextShell;
    if (!layer) {
      layer = doc.createElement('beautify-background'); layer.setAttribute('aria-hidden', 'true'); layer.dataset.bsBackground = '';
      shell.append(layer);
    }
    // Temporarily expose the original paint for sampling; do not freeze a theme
    // color, image or media-query value into a saved CSS declaration.
    shell.removeAttribute('data-bs-paint'); shell.removeAttribute('data-bs-static');
    const original = win.getComputedStyle(shell);
    const background = original.background, radius = original.borderRadius, isStatic = original.position === 'static';
    layer.style.cssText = `all:initial!important;display:block!important;position:absolute!important;pointer-events:none!important;left:0!important;bottom:0!important;width:100%!important;height:max(0px,calc(100% + ${Math.max(-200, Math.min(300, offset))}px))!important;z-index:-1!important;box-sizing:border-box!important;`;
    layer.style.setProperty('background', background, 'important');
    layer.style.setProperty('border-radius', radius, 'important');
    if (isStatic) shell.setAttribute('data-bs-static', '');
    shell.setAttribute('data-bs-paint', '');
  }
  const timer = win.setInterval(sync, 180);
  sync();
  return { sync, dispose() { stopped = true; win.clearInterval(timer); restoreHint(); restoreBackground(); style.remove(); } };
}
