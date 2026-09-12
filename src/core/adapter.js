import { VERSION, DEFAULT_OPTIONS, PATCH_START, PATCH_END, TAURI_ROOT_CLASS, COMPOSER_OPEN_CLASS } from '../config.js';
import { validateTheme } from './validation.js';
const RISK_RULES = Object.freeze([
  {
    code: 'shell-geometry',
    level: 'high',
    label: '主聊天容器使用固定几何',
    detail: '发现 #sheld 的 top/height/min-height/max-height；转换时会删除这些 ST 视口覆盖，让 TT 接管布局。',
    pattern: /#sheld\b[^{}]*\{[^{}]*(?:top|height|min-height|max-height)\s*:/gis,
  },
  {
    code: 'composer-geometry',
    level: 'high',
    label: '输入栏使用固定定位',
    detail: '发现 #form_sheld 的定位规则，可能与 TT 的键盘和底部安全区规则冲突。',
    pattern: /#form_sheld\b[^{}]*\{[^{}]*(?:position|top|bottom|left|right|transform)\s*:/gis,
  },
  {
    code: 'chat-viewport-height',
    level: 'high',
    label: '聊天列表直接使用视口高度',
    detail: '发现 #chat 使用 vh/dvh 高度；在 TT 中更适合跟随 #sheld 的可用高度。',
    pattern: /#chat\b[^{}]*\{[^{}]*(?:height|max-height|min-height)\s*:[^;}]*(?:dvh|svh|lvh|vh)\b/gis,
  },
  {
    code: 'top-geometry',
    level: 'medium',
    label: '顶部栏使用固定几何',
    detail: '发现顶部栏位置或尺寸规则，可能忽略刘海安全区；转换后仍建议实际查看。',
    pattern: /#(?:top-bar|top-settings-holder)\b[^{}]*\{[^{}]*(?:position|top|height|width|transform)\s*:/gis,
  },
  {
    code: 'drawer-geometry',
    level: 'high',
    label: '主设置抽屉使用固定 top',
    detail: '发现左右主抽屉或通用抽屉的固定 top；转换时会只删 top，让 TT 原生顶栏和抽屉自行对齐。',
    pattern: /(?:\.drawer-content|#(?:left|right)-nav-panel)\b[^{}]*\{[^{}]*top\s*:/gis,
  },
  {
    code: 'forced-display',
    level: 'medium',
    label: '主题强制显示元素',
    detail: '发现 display: … !important，可能让酒馆或 TT 已隐藏的按钮重新出现。',
    pattern: /display\s*:\s*(?!none\b)[^;{}]+!important/gi,
  },
  {
    code: 'global-important',
    level: 'low',
    label: '存在通配强制样式',
    detail: '发现通配选择器中的 !important，它可能影响 TT 或其他插件。',
    pattern: /(?:^|})[^{}]*\*\s*\{[^{}]*!important/gis,
  },
]);


export function countMatches(text, pattern) {
  const flags = pattern.flags.includes('g') ? pattern.flags : `${pattern.flags}g`;
  return Array.from(String(text || '').matchAll(new RegExp(pattern.source, flags))).length;
}

export function splitCssValueTokens(value) {
  const tokens = [];
  let token = '';
  let depth = 0;
  let quote = '';

  for (let index = 0; index < String(value || '').length; index += 1) {
    const character = String(value || '')[index];
    if (quote) {
      token += character;
      if (character === '\\') {
        index += 1;
        if (index < String(value || '').length) token += String(value || '')[index];
      } else if (character === quote) {
        quote = '';
      }
      continue;
    }

    if (character === '"' || character === "'") {
      quote = character;
      token += character;
    } else if (character === '(') {
      depth += 1;
      token += character;
    } else if (character === ')') {
      depth = Math.max(0, depth - 1);
      token += character;
    } else if (/\s/.test(character) && depth === 0) {
      if (token) tokens.push(token);
      token = '';
    } else {
      token += character;
    }
  }

  if (token) tokens.push(token);
  return tokens;
}

export function readCssDeclaration(body, property) {
  const escaped = String(property).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`(?:^|;)\\s*${escaped}\\s*:\\s*([^;}]+)`, 'gi');
  let value = null;
  for (const match of String(body || '').matchAll(pattern)) value = match[1];
  return value == null ? null : value.replace(/\s*!important\s*$/i, '').trim();
}

export function isUsableBottomReserve(value) {
  const normalized = String(value || '').trim();
  if (!normalized || /^(?:0(?:\.0+)?(?:px|rem|em|vh|vw|dvh|%)?|auto|initial|inherit|unset)$/i.test(normalized)) {
    return false;
  }
  return !/[{};]/.test(normalized) && !/^calc\(\s*-/i.test(normalized) && !/^-/.test(normalized);
}

export function bottomValueFromMargin(body) {
  const direct = readCssDeclaration(body, 'margin-bottom');
  if (isUsableBottomReserve(direct)) return direct;

  const shorthand = readCssDeclaration(body, 'margin');
  const tokens = splitCssValueTokens(shorthand);
  const bottom = tokens.length === 1
    ? tokens[0]
    : tokens.length === 2
      ? tokens[0]
      : tokens.length >= 3
        ? tokens[2]
        : null;
  return isUsableBottomReserve(bottom) ? bottom : null;
}

export function detectDecorativeBottomBar(cssText) {
  const css = stripAdapterPatch(cssText);
  const blockPattern = /([^{}]+)\{([^{}]*)\}/g;
  let reserve = null;
  let pseudoHeight = null;
  let count = 0;

  for (const match of css.matchAll(blockPattern)) {
    const selector = String(match[1] || '').trim();
    const body = String(match[2] || '');
    const selectorParts = selector.split(',').map(part => part.trim());
    const isBaseComposer = selectorParts.some(part => /#(?:send_form|form_sheld)(?:\.[\w-]+)*\s*$/i.test(part));

    if (isBaseComposer) {
      const candidate = bottomValueFromMargin(body);
      if (candidate) reserve = candidate;
    }

    const isComposerPseudo = selectorParts.some(part => /#(?:send_form|form_sheld)\s*::?(?:after|before)\b/i.test(part));
    if (!isComposerPseudo) continue;

    const positioned = /(?:^|;)\s*position\s*:\s*(?:absolute|fixed)\b/i.test(body);
    const anchoredBelow = /(?:^|;)\s*top\s*:\s*100%(?:\s*!important)?\s*(?:;|$)/i.test(body)
      || /(?:^|;)\s*bottom\s*:\s*(?:0|0px|0rem|0em)\b/i.test(body);
    const visual = /(?:^|;)\s*background(?:-image)?\s*:/i.test(body);
    if (!positioned || !anchoredBelow || !visual) continue;

    count += 1;
    const candidateHeight = readCssDeclaration(body, 'height') || readCssDeclaration(body, 'min-height');
    if (isUsableBottomReserve(candidateHeight)) pseudoHeight = candidateHeight;
  }

  return {
    detected: count > 0,
    count,
    reserve: reserve || pseudoHeight,
    safelyAdaptable: count > 0 && Boolean(reserve || pseudoHeight),
  };
}

export function detectComposerLayout(cssText) {
  const css = stripAdapterPatch(cssText);
  const blockPattern = /([^{}]+)\{([^{}]*)\}/g;
  let overlay = false;
  let position = null;
  let bottom = null;
  let hidesUntilInteraction = false;
  let revealsOnHover = false;
  let revealsOnFocus = false;
  let surface = null;

  for (const match of css.matchAll(blockPattern)) {
    const selector = String(match[1] || '').trim();
    const body = String(match[2] || '');

    if (/#form_sheld\b/i.test(selector)) {
      const candidatePosition = readCssDeclaration(body, 'position');
      const candidateBottom = readCssDeclaration(body, 'bottom');
      if (/^(?:absolute|fixed)$/i.test(candidatePosition || '') && candidateBottom != null) {
        overlay = true;
        position = candidatePosition.toLowerCase();
        bottom = candidateBottom;
      }
    }

    if (!/#send_form\b/i.test(selector)) continue;
    if (!/::?(?:before|after)\b/i.test(selector) && !/:hover\b|:focus-within\b/i.test(selector)) {
      const declarationBody = body.replace(/\/\*[\s\S]*?\*\//g, '');
      const candidateSurface = readCssDeclaration(declarationBody, 'background')
        || readCssDeclaration(declarationBody, 'background-color');
      if (candidateSurface) surface = candidateSurface;
    }
    const opacity = readCssDeclaration(body, 'opacity');
    const opacityIsHidden = /^(?:0|0\.0+)$/i.test(opacity || '');
    const opacityIsVisible = /^(?:1|1\.0+)$/i.test(opacity || '');
    if (!/:hover\b|:focus-within\b/i.test(selector) && opacityIsHidden) hidesUntilInteraction = true;
    if (/:hover\b/i.test(selector) && opacityIsVisible) revealsOnHover = true;
    if (/:focus-within\b/i.test(selector) && opacityIsVisible) revealsOnFocus = true;
  }

  return {
    overlay,
    position,
    bottom,
    stickyHoverRisk: hidesUntilInteraction && revealsOnHover,
    revealsOnFocus,
    surface,
  };
}

export function detectChatBottomPadding(cssText) {
  const css = stripAdapterPatch(cssText);
  const blockPattern = /([^{}]+)\{([^{}]*)\}/g;
  let paddingBottom = null;

  for (const match of css.matchAll(blockPattern)) {
    const selectorParts = String(match[1] || '').split(',').map(part => part.trim());
    if (!selectorParts.some(part => /#chat(?:\.[\w-]+)*\s*$/i.test(part))) continue;
    const body = String(match[2] || '').replace(/\/\*[\s\S]*?\*\//g, '');
    const direct = readCssDeclaration(body, 'padding-bottom');
    if (direct != null) paddingBottom = direct;
  }

  if (!paddingBottom || /^(?:auto|initial|inherit|unset|revert)$/i.test(paddingBottom) || /[{};]/.test(paddingBottom)) {
    return null;
  }
  return paddingBottom;
}

export function detectToolbarVisibility(cssText) {
  const css = stripAdapterPatch(cssText);
  const blockPattern = /([^{}]+)\{([^{}]*)\}/g;
  let hiddenByDefault = false;
  let stateDependentReveal = false;

  for (const match of css.matchAll(blockPattern)) {
    const selector = String(match[1] || '').trim();
    const body = String(match[2] || '');
    if (!/\.drawer-icon\b/i.test(selector)) continue;
    const opacity = readCssDeclaration(body, 'opacity');
    if (!/:has\(|\.openIcon\b|\.openDrawer\b/i.test(selector) && /^(?:0|0\.0+)$/i.test(opacity || '')) {
      hiddenByDefault = true;
    }
    if (/:has\(|\.openIcon\b|\.openDrawer\b/i.test(selector) && /^(?:1|1\.0+)$/i.test(opacity || '')) {
      stateDependentReveal = true;
    }
  }

  return {
    hiddenByDefault,
    stateDependentReveal,
    risk: hiddenByDefault && stateDependentReveal,
  };
}

export function analyzeCss(cssText) {
  const risks = RISK_RULES.map(rule => ({
    code: rule.code,
    level: rule.level,
    label: rule.label,
    detail: rule.detail,
    count: countMatches(cssText, rule.pattern),
  })).filter(item => item.count > 0);

  const bottomBar = detectDecorativeBottomBar(cssText);
  if (bottomBar.detected) {
    risks.push({
      code: 'decorative-bottom-bar',
      level: bottomBar.safelyAdaptable ? 'medium' : 'high',
      label: '主题自绘了仿 App 底栏',
      detail: bottomBar.safelyAdaptable
        ? `发现底栏伪元素和主题自带的下方留位（${bottomBar.reserve}）；新版会保留主题原始位置，不再额外填色或抬高。`
        : '发现底栏伪元素；新版会保留主题原始位置，不再额外填色或抬高。',
      count: bottomBar.count,
    });
  }

  const composer = detectComposerLayout(cssText);
  if (composer.overlay) {
    risks.push({
      code: 'overlay-composer',
      level: 'high',
      label: '主题使用悬浮输入栏',
      detail: '主题要求输入栏绝对定位；若被 TT 改回普通流式布局，会明显挤高并遮挡聊天区域。',
      count: 1,
    });
  }
  if (composer.stickyHoverRisk) {
    risks.push({
      code: 'sticky-hover-composer',
      level: 'medium',
      label: '输入栏依赖悬停显示',
      detail: '触屏 WebView 可能保留 :hover 状态，导致本应收起的输入栏一直显示；会改为失焦收起。',
      count: 1,
    });
  }
  const toolbar = detectToolbarVisibility(cssText);
  if (toolbar.risk) {
    risks.push({
      code: 'state-hidden-toolbar',
      level: 'high',
      label: '主预设工具栏依赖图标状态显示',
      detail: '主题默认把顶栏图标透明，只在特定 openIcon 状态显示；TT 的抽屉状态不同，可能让整排工具栏消失。',
      count: 1,
    });
  }
  return risks;
}

export function stripAdapterPatch(cssText) {
  const css = typeof cssText === 'string' ? cssText : '';
  let output = css;
  let start = output.indexOf(PATCH_START);
  let end = output.indexOf(PATCH_END);

  while (start !== -1 && end !== -1 && end >= start) {
    output = `${output.slice(0, start)}${output.slice(end + PATCH_END.length)}`;
    start = output.indexOf(PATCH_START);
    end = output.indexOf(PATCH_END);
  }
  return output.trimEnd();
}

export function splitSelectorList(selectorText) {
  const parts = [];
  let start = 0;
  let quote = '';
  let comment = false;
  let roundDepth = 0;
  let squareDepth = 0;
  const text = String(selectorText || '');

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    const next = text[index + 1];
    if (comment) {
      if (character === '*' && next === '/') {
        comment = false;
        index += 1;
      }
      continue;
    }
    if (quote) {
      if (character === '\\') index += 1;
      else if (character === quote) quote = '';
      continue;
    }
    if (character === '/' && next === '*') {
      comment = true;
      index += 1;
    } else if (character === '"' || character === "'") {
      quote = character;
    } else if (character === '(') {
      roundDepth += 1;
    } else if (character === ')') {
      roundDepth = Math.max(0, roundDepth - 1);
    } else if (character === '[') {
      squareDepth += 1;
    } else if (character === ']') {
      squareDepth = Math.max(0, squareDepth - 1);
    } else if (character === ',' && roundDepth === 0 && squareDepth === 0) {
      parts.push(text.slice(start, index));
      start = index + 1;
    }
  }
  parts.push(text.slice(start));
  return parts;
}

export function directGeometryTarget(selectorPart) {
  const selector = String(selectorPart || '').replace(/\/\*[\s\S]*?\*\//g, ' ').trim();
  if (!selector || /::(?:before|after)\b/i.test(selector)) return null;
  const compounds = selector.split(/\s+|[>+~]/).filter(Boolean);
  const last = compounds[compounds.length - 1] || '';
  if (/#sheld(?![\w-])/i.test(last)) return 'shell';
  if (/\.drawer-content(?![\w-])/i.test(last)
    || /#(?:left|right)-nav-panel(?![\w-])/i.test(last)) return 'drawer';
  return null;
}

export function splitDeclarationSegments(bodyText) {
  const segments = [];
  const text = String(bodyText || '');
  let start = 0;
  let quote = '';
  let comment = false;
  let roundDepth = 0;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    const next = text[index + 1];
    if (comment) {
      if (character === '*' && next === '/') {
        comment = false;
        index += 1;
      }
      continue;
    }
    if (quote) {
      if (character === '\\') index += 1;
      else if (character === quote) quote = '';
      continue;
    }
    if (character === '/' && next === '*') {
      comment = true;
      index += 1;
    } else if (character === '"' || character === "'") {
      quote = character;
    } else if (character === '(') {
      roundDepth += 1;
    } else if (character === ')') {
      roundDepth = Math.max(0, roundDepth - 1);
    } else if (character === ';' && roundDepth === 0) {
      segments.push(text.slice(start, index + 1));
      start = index + 1;
    }
  }
  if (start < text.length) segments.push(text.slice(start));
  return segments;
}

export function removeDeclarations(bodyText, propertyNames) {
  const wanted = new Set(propertyNames.map(name => String(name).toLowerCase()));
  let removed = 0;
  const counts = Object.fromEntries(Array.from(wanted, name => [name, 0]));
  const body = splitDeclarationSegments(bodyText).map(segment => {
    const match = /^((?:\s|\/\*[\s\S]*?\*\/)*)((?:--)?[-_a-zA-Z][\w-]*)\s*:/.exec(segment);
    if (!match || !wanted.has(match[2].toLowerCase())) return segment;
    removed += 1;
    counts[match[2].toLowerCase()] += 1;
    return match[1];
  }).join('');
  return { body, removed, counts };
}

export function stripTauriConflictingGeometry(cssText) {
  const stats = {
    shell: { top: 0, height: 0, minHeight: 0, maxHeight: 0 },
    drawer: { top: 0 },
    total: 0,
  };
  const css = String(cssText || '');
  const output = css.replace(/([^{}]+)\{([^{}]*)\}/g, (whole, rawSelector, rawBody) => {
    const selectorParts = splitSelectorList(rawSelector);
    const targetKinds = selectorParts.map(directGeometryTarget);
    const activeKinds = targetKinds.filter(Boolean);
    if (!activeKinds.length || activeKinds.length !== targetKinds.length) return whole;

    const uniqueKinds = new Set(activeKinds);
    if (uniqueKinds.size !== 1) return whole;
    const kind = activeKinds[0];
    const properties = kind === 'shell'
      ? ['top', 'height', 'min-height', 'max-height']
      : ['top'];
    const result = removeDeclarations(rawBody, properties);
    if (!result.removed) return whole;

    if (kind === 'shell') {
      stats.shell.top += result.counts.top || 0;
      stats.shell.height += result.counts.height || 0;
      stats.shell.minHeight += result.counts['min-height'] || 0;
      stats.shell.maxHeight += result.counts['max-height'] || 0;
    } else {
      stats.drawer.top += result.removed;
    }
    stats.total += result.removed;
    return `${rawSelector}{${result.body}}`;
  });
  return { css: output.trimEnd(), removed: stats };
}

export function buildCompatibilityCss(options = {}, context = {}) {
  const settings = { ...DEFAULT_OPTIONS, ...options };
  const composer = context?.composer || null;
  const rules = [
    PATCH_START,
    `/* Generated by 美化工作室 v${VERSION}. */`,
  ];

  if (settings.preserveHiddenControls) {
    rules.push(
      '/* Respect controls hidden by SillyTavern or TauriTavern. */',
      'html body [hidden][hidden] { display: none !important; }',
      'html body #mes_impersonate.displayNone { display: none !important; }',
      'html body #ttas_agent_send_toggle.displayNone { display: none !important; }',
    );
  }

  if (settings.hideImpersonate) {
    rules.push(
      '/* Hide Quick Impersonate (hat-and-glasses icon). */',
      'html body #mes_impersonate#mes_impersonate { display: none !important; }',
    );
  }

  if (settings.indentParagraphs) {
    rules.push(
      '/* Add a first-line indent only to chat paragraphs. */',
      'html body #chat p { text-indent: 2em; }',
    );
  }


  if (settings.mobileGeometry && composer?.overlay) {
    rules.push(
      '/* The theme already owns an absolute bottom composer; remove TT duplicate safe-area padding. */',
      `html.${TAURI_ROOT_CLASS} body #form_sheld#form_sheld { padding-bottom: 0 !important; }`,
      '@media screen and (max-width: 1000px) {',
      `  html.${TAURI_ROOT_CLASS} body #sheld#sheld > #form_sheld#form_sheld {`,
      '    position: fixed !important;',
      '    inset: auto 0 0 0 !important;',
      '    width: 100vw !important;',
      '    max-width: none !important;',
      '    flex: none !important;',
      '    z-index: 35 !important;',
      '    pointer-events: auto !important;',
      '  }',
      '}',
    );
  }

  if (settings.mobileGeometry && composer?.stickyHoverRisk) {
    rules.push(
      '/* TT WebView may report mouse hover even on touch; change visibility only, never its geometry. */',
      `html.${TAURI_ROOT_CLASS} body #send_form#send_form:not(:focus-within),`,
      `html.${TAURI_ROOT_CLASS} body.no-blur #send_form#send_form:not(:focus-within) { opacity: 0 !important; }`,
      `html.${TAURI_ROOT_CLASS} body #send_form#send_form:focus-within,`,
      `html.${TAURI_ROOT_CLASS} body.no-blur #send_form#send_form:focus-within,`,
      `html.${TAURI_ROOT_CLASS} body #form_sheld.${COMPOSER_OPEN_CLASS} #send_form#send_form,`,
      `html.${TAURI_ROOT_CLASS} body.no-blur #form_sheld.${COMPOSER_OPEN_CLASS} #send_form#send_form { opacity: 1 !important; }`,
    );
  }

  rules.push(PATCH_END);
  return rules.join('\n');
}

export function normalizeThemeName(value) {
  const name = String(value || '').trim();
  if (!name) throw new Error('这不是有效的 UI 美化：文件里缺少 name。');
  return name;
}

export function makeAdaptedName(name) {
  const normalized = normalizeThemeName(name);
  return / - TT适配(?: \(\d+\))?$/.test(normalized) ? normalized : `${normalized} - TT适配`;
}

export function adaptTheme(theme, options = {}) {
  if (!theme || typeof theme !== 'object' || Array.isArray(theme)) {
    throw new Error('请选择酒馆 UI 美化 JSON，不是角色卡、世界书或预设。');
  }

  validateTheme(theme);
  const sourceName = normalizeThemeName(theme.name);
  const sourceCss = typeof theme.custom_css === 'string' ? theme.custom_css : '';
  const settings = { ...DEFAULT_OPTIONS, ...options };
  const patchFreeCss = stripAdapterPatch(sourceCss);
  const geometry = settings.mobileGeometry
    ? stripTauriConflictingGeometry(patchFreeCss)
    : {
        css: patchFreeCss,
        removed: {
          shell: { top: 0, height: 0, minHeight: 0, maxHeight: 0 },
          drawer: { top: 0 },
          total: 0,
        },
      };
  const cleanCss = geometry.css;
  const bottomBar = detectDecorativeBottomBar(cleanCss);
  const composer = detectComposerLayout(cleanCss);
  const chatBottomPadding = detectChatBottomPadding(cleanCss);
  const toolbar = detectToolbarVisibility(cleanCss);
  const adapted = JSON.parse(JSON.stringify(theme));

  adapted.name = makeAdaptedName(sourceName);
  adapted.custom_css = `${cleanCss}\n\n${buildCompatibilityCss(settings, { composer })}`.trim();
  adapted.tta_adapter = {
    version: VERSION,
    source_name: theme.tta_adapter?.source_name || sourceName,
    converted_at: new Date().toISOString(),
    risks: analyzeCss(sourceCss).map(item => item.code),
    decorative_bottom_bar: bottomBar.safelyAdaptable
      ? { detected: true, reserve: bottomBar.reserve }
      : { detected: bottomBar.detected },
    overlay_composer: composer.overlay
      ? { detected: true, position: composer.position, bottom: composer.bottom, sticky_hover_risk: composer.stickyHoverRisk }
      : { detected: false },
    chat_bottom_padding: chatBottomPadding,
    state_hidden_toolbar: toolbar,
    removed_layout_geometry: geometry.removed,
  };
  return adapted;
}
