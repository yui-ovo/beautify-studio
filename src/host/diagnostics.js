import { VERSION, PATCH_START } from '../config.js';
import { analyzeCss, detectComposerLayout } from '../core/adapter.js';

function readNodeDiagnostic(hostWin, element) {
  if (!element) return null;
  const rect = element.getBoundingClientRect?.();
  const computed = typeof hostWin.getComputedStyle === 'function' ? hostWin.getComputedStyle(element) : null;
  return {
    rect: rect ? {
      top: Number(rect.top.toFixed(2)),
      bottom: Number(rect.bottom.toFixed(2)),
      left: Number(rect.left.toFixed(2)),
      right: Number(rect.right.toFixed(2)),
      width: Number(rect.width.toFixed(2)),
      height: Number(rect.height.toFixed(2)),
    } : null,
    computed: computed ? {
      display: computed.display,
      position: computed.position,
      top: computed.top,
      bottom: computed.bottom,
      height: computed.height,
      minHeight: computed.minHeight,
      maxHeight: computed.maxHeight,
      paddingTop: computed.paddingTop,
      paddingBottom: computed.paddingBottom,
      marginBottom: computed.marginBottom,
      overflow: computed.overflow,
      opacity: computed.opacity,
      backgroundColor: computed.backgroundColor,
      zIndex: computed.zIndex,
    } : null,
    classes: String(element.className || ''),
  };
}

function readElementDiagnostic(hostWin, doc, id) {
  return readNodeDiagnostic(hostWin, doc.getElementById(id));
}

function readSelectorDiagnostic(hostWin, doc, selector) {
  return readNodeDiagnostic(hostWin, doc.querySelector?.(selector));
}

export function makeLayoutDiagnostic(hostWin) {
  const doc = hostWin.document;
  const rootStyle = typeof hostWin.getComputedStyle === 'function'
    ? hostWin.getComputedStyle(doc.documentElement)
    : null;
  const readVariable = name => String(rootStyle?.getPropertyValue?.(name) || '').trim();
  const customCss = String(doc.getElementById('custom-style')?.textContent || '');
  const composer = detectComposerLayout(customCss);
  const themeSelect = doc.getElementById('themes');
  const stylePins = doc.querySelectorAll?.('#chat > .style-pins style, #chat style') || [];

  return {
    diagnostic_version: VERSION,
    captured_at: new Date().toISOString(),
    is_tauri_tavern: Boolean(hostWin.__TAURITAVERN__ || hostWin.__TAURI_INTERNALS__ || doc.getElementById('ttas_agent_send_toggle')),
    selected_theme: String(themeSelect?.value || themeSelect?.selectedOptions?.[0]?.textContent || ''),
    viewport: {
      innerWidth: hostWin.innerWidth ?? null,
      innerHeight: hostWin.innerHeight ?? null,
      visualViewport: hostWin.visualViewport ? {
        width: hostWin.visualViewport.width,
        height: hostWin.visualViewport.height,
        offsetTop: hostWin.visualViewport.offsetTop,
        offsetLeft: hostWin.visualViewport.offsetLeft,
        scale: hostWin.visualViewport.scale,
      } : null,
    },
    css_variables: {
      ttInsetTop: readVariable('--tt-inset-top'),
      ttInsetRight: readVariable('--tt-inset-right'),
      ttInsetBottom: readVariable('--tt-inset-bottom'),
      ttInsetLeft: readVariable('--tt-inset-left'),
      ttImeBottom: readVariable('--tt-ime-bottom'),
      ttBaseViewportHeight: readVariable('--tt-base-viewport-height'),
      docHeight: readVariable('--doc-height'),
      topBarBlockSize: readVariable('--topBarBlockSize'),
      bottomFormBlockSize: readVariable('--bottomFormBlockSize'),
    },
    theme_css: {
      length: customCss.length,
      hasAdapterPatch: customCss.includes(PATCH_START),
      composer,
      riskCodes: analyzeCss(customCss).map(item => item.code),
    },
    chat_embedded_styles: {
      count: Number(stylePins.length || 0),
      pinnedContainerPresent: Boolean(doc.querySelector?.('#chat > .style-pins')),
    },
    page_state: {
      welcomePanelCount: Number(doc.querySelectorAll?.('#chat > .welcomePanel, #chat .welcomePanel').length || 0),
      welcomePanel: readSelectorDiagnostic(hostWin, doc, '#chat > .welcomePanel, #chat .welcomePanel'),
      openDrawers: Array.from(doc.querySelectorAll?.('#left-nav-panel.openDrawer, #right-nav-panel.openDrawer, #top-settings-holder .drawer-content.openDrawer, #top-settings-holder .drawer-content.open') || [])
        .map(element => ({ id: String(element.id || ''), diagnostic: readNodeDiagnostic(hostWin, element) })),
    },
    elements: Object.fromEntries([
      'top-bar',
      'top-settings-holder',
      'user-settings-block',
      'left-nav-panel',
      'right-nav-panel',
      'sheld',
      'chat',
      'form_sheld',
      'send_form',
      'nonQRFormItems',
      'send_textarea',
    ].map(id => [id, readElementDiagnostic(hostWin, doc, id)])),
  };
}

export function downloadLayoutDiagnostic(hostWin) {
  const doc = hostWin.document;
  const data = makeLayoutDiagnostic(hostWin);
  const file = new hostWin.File(
    [JSON.stringify(data, null, 2)],
    `TT布局诊断-v${VERSION}.json`,
    { type: 'application/json' },
  );
  const url = hostWin.URL.createObjectURL(file);
  const anchor = doc.createElement('a');
  anchor.href = url;
  anchor.download = file.name;
  anchor.style.cssText = 'display:none!important';
  doc.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  hostWin.setTimeout(() => hostWin.URL.revokeObjectURL(url), 2000);
  return data;
}
