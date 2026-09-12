(() => {
  // src/config.js
  var VERSION = "1.0.4";
  var BUTTON_NAME = "美化工作室";
  var STORAGE_KEY = "tt-theme-helper-options-v2";
  var OVERLAY_HOST_ID = "tt-theme-helper-overlay-host";
  var RUNTIME_STYLE_ID = "tt-theme-helper-runtime-style";
  var WAND_ENTRY_ID = "tt-theme-helper-wand-entry";
  var TAURI_ROOT_CLASS = "tta-tauri-runtime";
  var COMPOSER_OPEN_CLASS = "tta-composer-touch-open";
  var PATCH_START = "/* === TT_THEME_ADAPTER_PATCH_START === */";
  var PATCH_END = "/* === TT_THEME_ADAPTER_PATCH_END === */";
  var DEFAULT_OPTIONS = Object.freeze({
    hideImpersonate: true,
    preserveHiddenControls: true,
    mobileGeometry: true,
    indentParagraphs: false
  });

  // src/core/validation.js
  var THEME_KEYS = ["custom_css", "main_text_color", "blur_tint_color", "chat_tint_color", "font_scale", "blur_strength", "avatar_style", "chat_display"];
  function validateTheme(theme) {
    if (!theme || typeof theme !== "object" || Array.isArray(theme) || typeof theme.name !== "string" || !theme.name.trim() || !THEME_KEYS.some((key) => Object.hasOwn(theme, key))) {
      throw new Error("请选择 UI 美化 JSON：需要主题名称和 UI 样式字段，角色卡、世界书或模型预设不适用。");
    }
    if (theme.custom_css != null && typeof theme.custom_css !== "string") {
      throw new Error("主题的 custom_css 必须是文本。");
    }
    return theme;
  }

  // src/core/adapter.js
  var RISK_RULES = Object.freeze([
    {
      code: "shell-geometry",
      level: "high",
      label: "主聊天容器使用固定几何",
      detail: "发现 #sheld 的 top/height/min-height/max-height；转换时会删除这些 ST 视口覆盖，让 TT 接管布局。",
      pattern: /#sheld\b[^{}]*\{[^{}]*(?:top|height|min-height|max-height)\s*:/gis
    },
    {
      code: "composer-geometry",
      level: "high",
      label: "输入栏使用固定定位",
      detail: "发现 #form_sheld 的定位规则，可能与 TT 的键盘和底部安全区规则冲突。",
      pattern: /#form_sheld\b[^{}]*\{[^{}]*(?:position|top|bottom|left|right|transform)\s*:/gis
    },
    {
      code: "chat-viewport-height",
      level: "high",
      label: "聊天列表直接使用视口高度",
      detail: "发现 #chat 使用 vh/dvh 高度；在 TT 中更适合跟随 #sheld 的可用高度。",
      pattern: /#chat\b[^{}]*\{[^{}]*(?:height|max-height|min-height)\s*:[^;}]*(?:dvh|svh|lvh|vh)\b/gis
    },
    {
      code: "top-geometry",
      level: "medium",
      label: "顶部栏使用固定几何",
      detail: "发现顶部栏位置或尺寸规则，可能忽略刘海安全区；转换后仍建议实际查看。",
      pattern: /#(?:top-bar|top-settings-holder)\b[^{}]*\{[^{}]*(?:position|top|height|width|transform)\s*:/gis
    },
    {
      code: "drawer-geometry",
      level: "high",
      label: "主设置抽屉使用固定 top",
      detail: "发现左右主抽屉或通用抽屉的固定 top；转换时会只删 top，让 TT 原生顶栏和抽屉自行对齐。",
      pattern: /(?:\.drawer-content|#(?:left|right)-nav-panel)\b[^{}]*\{[^{}]*top\s*:/gis
    },
    {
      code: "forced-display",
      level: "medium",
      label: "主题强制显示元素",
      detail: "发现 display: … !important，可能让酒馆或 TT 已隐藏的按钮重新出现。",
      pattern: /display\s*:\s*(?!none\b)[^;{}]+!important/gi
    },
    {
      code: "global-important",
      level: "low",
      label: "存在通配强制样式",
      detail: "发现通配选择器中的 !important，它可能影响 TT 或其他插件。",
      pattern: /(?:^|})[^{}]*\*\s*\{[^{}]*!important/gis
    }
  ]);
  function countMatches(text, pattern) {
    const flags = pattern.flags.includes("g") ? pattern.flags : `${pattern.flags}g`;
    return Array.from(String(text || "").matchAll(new RegExp(pattern.source, flags))).length;
  }
  function splitCssValueTokens(value) {
    const tokens = [];
    let token = "";
    let depth = 0;
    let quote = "";
    for (let index = 0; index < String(value || "").length; index += 1) {
      const character = String(value || "")[index];
      if (quote) {
        token += character;
        if (character === "\\") {
          index += 1;
          if (index < String(value || "").length) token += String(value || "")[index];
        } else if (character === quote) {
          quote = "";
        }
        continue;
      }
      if (character === '"' || character === "'") {
        quote = character;
        token += character;
      } else if (character === "(") {
        depth += 1;
        token += character;
      } else if (character === ")") {
        depth = Math.max(0, depth - 1);
        token += character;
      } else if (/\s/.test(character) && depth === 0) {
        if (token) tokens.push(token);
        token = "";
      } else {
        token += character;
      }
    }
    if (token) tokens.push(token);
    return tokens;
  }
  function readCssDeclaration(body, property) {
    const escaped = String(property).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp(`(?:^|;)\\s*${escaped}\\s*:\\s*([^;}]+)`, "gi");
    let value = null;
    for (const match of String(body || "").matchAll(pattern)) value = match[1];
    return value == null ? null : value.replace(/\s*!important\s*$/i, "").trim();
  }
  function isUsableBottomReserve(value) {
    const normalized = String(value || "").trim();
    if (!normalized || /^(?:0(?:\.0+)?(?:px|rem|em|vh|vw|dvh|%)?|auto|initial|inherit|unset)$/i.test(normalized)) {
      return false;
    }
    return !/[{};]/.test(normalized) && !/^calc\(\s*-/i.test(normalized) && !/^-/.test(normalized);
  }
  function bottomValueFromMargin(body) {
    const direct = readCssDeclaration(body, "margin-bottom");
    if (isUsableBottomReserve(direct)) return direct;
    const shorthand = readCssDeclaration(body, "margin");
    const tokens = splitCssValueTokens(shorthand);
    const bottom = tokens.length === 1 ? tokens[0] : tokens.length === 2 ? tokens[0] : tokens.length >= 3 ? tokens[2] : null;
    return isUsableBottomReserve(bottom) ? bottom : null;
  }
  function detectDecorativeBottomBar(cssText) {
    const css = stripAdapterPatch(cssText);
    const blockPattern = /([^{}]+)\{([^{}]*)\}/g;
    let reserve = null;
    let pseudoHeight = null;
    let count = 0;
    for (const match of css.matchAll(blockPattern)) {
      const selector = String(match[1] || "").trim();
      const body = String(match[2] || "");
      const selectorParts = selector.split(",").map((part) => part.trim());
      const isBaseComposer = selectorParts.some((part) => /#(?:send_form|form_sheld)(?:\.[\w-]+)*\s*$/i.test(part));
      if (isBaseComposer) {
        const candidate = bottomValueFromMargin(body);
        if (candidate) reserve = candidate;
      }
      const isComposerPseudo = selectorParts.some((part) => /#(?:send_form|form_sheld)\s*::?(?:after|before)\b/i.test(part));
      if (!isComposerPseudo) continue;
      const positioned = /(?:^|;)\s*position\s*:\s*(?:absolute|fixed)\b/i.test(body);
      const anchoredBelow = /(?:^|;)\s*top\s*:\s*100%(?:\s*!important)?\s*(?:;|$)/i.test(body) || /(?:^|;)\s*bottom\s*:\s*(?:0|0px|0rem|0em)\b/i.test(body);
      const visual = /(?:^|;)\s*background(?:-image)?\s*:/i.test(body);
      if (!positioned || !anchoredBelow || !visual) continue;
      count += 1;
      const candidateHeight = readCssDeclaration(body, "height") || readCssDeclaration(body, "min-height");
      if (isUsableBottomReserve(candidateHeight)) pseudoHeight = candidateHeight;
    }
    return {
      detected: count > 0,
      count,
      reserve: reserve || pseudoHeight,
      safelyAdaptable: count > 0 && Boolean(reserve || pseudoHeight)
    };
  }
  function detectComposerLayout(cssText) {
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
      const selector = String(match[1] || "").trim();
      const body = String(match[2] || "");
      if (/#form_sheld\b/i.test(selector)) {
        const candidatePosition = readCssDeclaration(body, "position");
        const candidateBottom = readCssDeclaration(body, "bottom");
        if (/^(?:absolute|fixed)$/i.test(candidatePosition || "") && candidateBottom != null) {
          overlay = true;
          position = candidatePosition.toLowerCase();
          bottom = candidateBottom;
        }
      }
      if (!/#send_form\b/i.test(selector)) continue;
      if (!/::?(?:before|after)\b/i.test(selector) && !/:hover\b|:focus-within\b/i.test(selector)) {
        const declarationBody = body.replace(/\/\*[\s\S]*?\*\//g, "");
        const candidateSurface = readCssDeclaration(declarationBody, "background") || readCssDeclaration(declarationBody, "background-color");
        if (candidateSurface) surface = candidateSurface;
      }
      const opacity = readCssDeclaration(body, "opacity");
      const opacityIsHidden = /^(?:0|0\.0+)$/i.test(opacity || "");
      const opacityIsVisible = /^(?:1|1\.0+)$/i.test(opacity || "");
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
      surface
    };
  }
  function detectChatBottomPadding(cssText) {
    const css = stripAdapterPatch(cssText);
    const blockPattern = /([^{}]+)\{([^{}]*)\}/g;
    let paddingBottom = null;
    for (const match of css.matchAll(blockPattern)) {
      const selectorParts = String(match[1] || "").split(",").map((part) => part.trim());
      if (!selectorParts.some((part) => /#chat(?:\.[\w-]+)*\s*$/i.test(part))) continue;
      const body = String(match[2] || "").replace(/\/\*[\s\S]*?\*\//g, "");
      const direct = readCssDeclaration(body, "padding-bottom");
      if (direct != null) paddingBottom = direct;
    }
    if (!paddingBottom || /^(?:auto|initial|inherit|unset|revert)$/i.test(paddingBottom) || /[{};]/.test(paddingBottom)) {
      return null;
    }
    return paddingBottom;
  }
  function detectToolbarVisibility(cssText) {
    const css = stripAdapterPatch(cssText);
    const blockPattern = /([^{}]+)\{([^{}]*)\}/g;
    let hiddenByDefault = false;
    let stateDependentReveal = false;
    for (const match of css.matchAll(blockPattern)) {
      const selector = String(match[1] || "").trim();
      const body = String(match[2] || "");
      if (!/\.drawer-icon\b/i.test(selector)) continue;
      const opacity = readCssDeclaration(body, "opacity");
      if (!/:has\(|\.openIcon\b|\.openDrawer\b/i.test(selector) && /^(?:0|0\.0+)$/i.test(opacity || "")) {
        hiddenByDefault = true;
      }
      if (/:has\(|\.openIcon\b|\.openDrawer\b/i.test(selector) && /^(?:1|1\.0+)$/i.test(opacity || "")) {
        stateDependentReveal = true;
      }
    }
    return {
      hiddenByDefault,
      stateDependentReveal,
      risk: hiddenByDefault && stateDependentReveal
    };
  }
  function analyzeCss(cssText) {
    const risks = RISK_RULES.map((rule) => ({
      code: rule.code,
      level: rule.level,
      label: rule.label,
      detail: rule.detail,
      count: countMatches(cssText, rule.pattern)
    })).filter((item) => item.count > 0);
    const bottomBar = detectDecorativeBottomBar(cssText);
    if (bottomBar.detected) {
      risks.push({
        code: "decorative-bottom-bar",
        level: bottomBar.safelyAdaptable ? "medium" : "high",
        label: "主题自绘了仿 App 底栏",
        detail: bottomBar.safelyAdaptable ? `发现底栏伪元素和主题自带的下方留位（${bottomBar.reserve}）；新版会保留主题原始位置，不再额外填色或抬高。` : "发现底栏伪元素；新版会保留主题原始位置，不再额外填色或抬高。",
        count: bottomBar.count
      });
    }
    const composer = detectComposerLayout(cssText);
    if (composer.overlay) {
      risks.push({
        code: "overlay-composer",
        level: "high",
        label: "主题使用悬浮输入栏",
        detail: "主题要求输入栏绝对定位；若被 TT 改回普通流式布局，会明显挤高并遮挡聊天区域。",
        count: 1
      });
    }
    if (composer.stickyHoverRisk) {
      risks.push({
        code: "sticky-hover-composer",
        level: "medium",
        label: "输入栏依赖悬停显示",
        detail: "触屏 WebView 可能保留 :hover 状态，导致本应收起的输入栏一直显示；会改为失焦收起。",
        count: 1
      });
    }
    const toolbar = detectToolbarVisibility(cssText);
    if (toolbar.risk) {
      risks.push({
        code: "state-hidden-toolbar",
        level: "high",
        label: "主预设工具栏依赖图标状态显示",
        detail: "主题默认把顶栏图标透明，只在特定 openIcon 状态显示；TT 的抽屉状态不同，可能让整排工具栏消失。",
        count: 1
      });
    }
    return risks;
  }
  function stripAdapterPatch(cssText) {
    const css = typeof cssText === "string" ? cssText : "";
    let output = css;
    let start2 = output.indexOf(PATCH_START);
    let end = output.indexOf(PATCH_END);
    while (start2 !== -1 && end !== -1 && end >= start2) {
      output = `${output.slice(0, start2)}${output.slice(end + PATCH_END.length)}`;
      start2 = output.indexOf(PATCH_START);
      end = output.indexOf(PATCH_END);
    }
    return output.trimEnd();
  }
  function splitSelectorList(selectorText) {
    const parts = [];
    let start2 = 0;
    let quote = "";
    let comment = false;
    let roundDepth = 0;
    let squareDepth = 0;
    const text = String(selectorText || "");
    for (let index = 0; index < text.length; index += 1) {
      const character = text[index];
      const next = text[index + 1];
      if (comment) {
        if (character === "*" && next === "/") {
          comment = false;
          index += 1;
        }
        continue;
      }
      if (quote) {
        if (character === "\\") index += 1;
        else if (character === quote) quote = "";
        continue;
      }
      if (character === "/" && next === "*") {
        comment = true;
        index += 1;
      } else if (character === '"' || character === "'") {
        quote = character;
      } else if (character === "(") {
        roundDepth += 1;
      } else if (character === ")") {
        roundDepth = Math.max(0, roundDepth - 1);
      } else if (character === "[") {
        squareDepth += 1;
      } else if (character === "]") {
        squareDepth = Math.max(0, squareDepth - 1);
      } else if (character === "," && roundDepth === 0 && squareDepth === 0) {
        parts.push(text.slice(start2, index));
        start2 = index + 1;
      }
    }
    parts.push(text.slice(start2));
    return parts;
  }
  function directGeometryTarget(selectorPart) {
    const selector = String(selectorPart || "").replace(/\/\*[\s\S]*?\*\//g, " ").trim();
    if (!selector || /::(?:before|after)\b/i.test(selector)) return null;
    const compounds = selector.split(/\s+|[>+~]/).filter(Boolean);
    const last = compounds[compounds.length - 1] || "";
    if (/#sheld(?![\w-])/i.test(last)) return "shell";
    if (/\.drawer-content(?![\w-])/i.test(last) || /#(?:left|right)-nav-panel(?![\w-])/i.test(last)) return "drawer";
    return null;
  }
  function splitDeclarationSegments(bodyText) {
    const segments = [];
    const text = String(bodyText || "");
    let start2 = 0;
    let quote = "";
    let comment = false;
    let roundDepth = 0;
    for (let index = 0; index < text.length; index += 1) {
      const character = text[index];
      const next = text[index + 1];
      if (comment) {
        if (character === "*" && next === "/") {
          comment = false;
          index += 1;
        }
        continue;
      }
      if (quote) {
        if (character === "\\") index += 1;
        else if (character === quote) quote = "";
        continue;
      }
      if (character === "/" && next === "*") {
        comment = true;
        index += 1;
      } else if (character === '"' || character === "'") {
        quote = character;
      } else if (character === "(") {
        roundDepth += 1;
      } else if (character === ")") {
        roundDepth = Math.max(0, roundDepth - 1);
      } else if (character === ";" && roundDepth === 0) {
        segments.push(text.slice(start2, index + 1));
        start2 = index + 1;
      }
    }
    if (start2 < text.length) segments.push(text.slice(start2));
    return segments;
  }
  function removeDeclarations(bodyText, propertyNames) {
    const wanted = new Set(propertyNames.map((name) => String(name).toLowerCase()));
    let removed = 0;
    const counts = Object.fromEntries(Array.from(wanted, (name) => [name, 0]));
    const body = splitDeclarationSegments(bodyText).map((segment) => {
      const match = /^((?:\s|\/\*[\s\S]*?\*\/)*)((?:--)?[-_a-zA-Z][\w-]*)\s*:/.exec(segment);
      if (!match || !wanted.has(match[2].toLowerCase())) return segment;
      removed += 1;
      counts[match[2].toLowerCase()] += 1;
      return match[1];
    }).join("");
    return { body, removed, counts };
  }
  function stripTauriConflictingGeometry(cssText) {
    const stats = {
      shell: { top: 0, height: 0, minHeight: 0, maxHeight: 0 },
      drawer: { top: 0 },
      total: 0
    };
    const css = String(cssText || "");
    const output = css.replace(/([^{}]+)\{([^{}]*)\}/g, (whole, rawSelector, rawBody) => {
      const selectorParts = splitSelectorList(rawSelector);
      const targetKinds = selectorParts.map(directGeometryTarget);
      const activeKinds = targetKinds.filter(Boolean);
      if (!activeKinds.length || activeKinds.length !== targetKinds.length) return whole;
      const uniqueKinds = new Set(activeKinds);
      if (uniqueKinds.size !== 1) return whole;
      const kind = activeKinds[0];
      const properties = kind === "shell" ? ["top", "height", "min-height", "max-height"] : ["top"];
      const result = removeDeclarations(rawBody, properties);
      if (!result.removed) return whole;
      if (kind === "shell") {
        stats.shell.top += result.counts.top || 0;
        stats.shell.height += result.counts.height || 0;
        stats.shell.minHeight += result.counts["min-height"] || 0;
        stats.shell.maxHeight += result.counts["max-height"] || 0;
      } else {
        stats.drawer.top += result.removed;
      }
      stats.total += result.removed;
      return `${rawSelector}{${result.body}}`;
    });
    return { css: output.trimEnd(), removed: stats };
  }
  function buildCompatibilityCss(options2 = {}, context = {}) {
    const settings = { ...DEFAULT_OPTIONS, ...options2 };
    const composer = context?.composer || null;
    const rules = [
      PATCH_START,
      `/* Generated by 美化工作室 v${VERSION}. */`
    ];
    if (settings.preserveHiddenControls) {
      rules.push(
        "/* Respect controls hidden by SillyTavern or TauriTavern. */",
        "html body [hidden][hidden] { display: none !important; }",
        "html body #mes_impersonate.displayNone { display: none !important; }",
        "html body #ttas_agent_send_toggle.displayNone { display: none !important; }"
      );
    }
    if (settings.hideImpersonate) {
      rules.push(
        "/* Hide Quick Impersonate (hat-and-glasses icon). */",
        "html body #mes_impersonate#mes_impersonate { display: none !important; }"
      );
    }
    if (settings.indentParagraphs) {
      rules.push(
        "/* Add a first-line indent only to chat paragraphs. */",
        "html body #chat p { text-indent: 2em; }"
      );
    }
    if (settings.mobileGeometry && composer?.overlay) {
      rules.push(
        "/* The theme already owns an absolute bottom composer; remove TT duplicate safe-area padding. */",
        `html.${TAURI_ROOT_CLASS} body #form_sheld#form_sheld { padding-bottom: 0 !important; }`,
        "@media screen and (max-width: 1000px) {",
        `  html.${TAURI_ROOT_CLASS} body #sheld#sheld > #form_sheld#form_sheld {`,
        "    position: fixed !important;",
        "    inset: auto 0 0 0 !important;",
        "    width: 100vw !important;",
        "    max-width: none !important;",
        "    flex: none !important;",
        "    z-index: 35 !important;",
        "    pointer-events: auto !important;",
        "  }",
        "}"
      );
    }
    if (settings.mobileGeometry && composer?.stickyHoverRisk) {
      rules.push(
        "/* TT WebView may report mouse hover even on touch; change visibility only, never its geometry. */",
        `html.${TAURI_ROOT_CLASS} body #send_form#send_form:not(:focus-within),`,
        `html.${TAURI_ROOT_CLASS} body.no-blur #send_form#send_form:not(:focus-within) { opacity: 0 !important; }`,
        `html.${TAURI_ROOT_CLASS} body #send_form#send_form:focus-within,`,
        `html.${TAURI_ROOT_CLASS} body.no-blur #send_form#send_form:focus-within,`,
        `html.${TAURI_ROOT_CLASS} body #form_sheld.${COMPOSER_OPEN_CLASS} #send_form#send_form,`,
        `html.${TAURI_ROOT_CLASS} body.no-blur #form_sheld.${COMPOSER_OPEN_CLASS} #send_form#send_form { opacity: 1 !important; }`
      );
    }
    rules.push(PATCH_END);
    return rules.join("\n");
  }
  function normalizeThemeName(value) {
    const name = String(value || "").trim();
    if (!name) throw new Error("这不是有效的 UI 美化：文件里缺少 name。");
    return name;
  }
  function makeAdaptedName(name) {
    const normalized = normalizeThemeName(name);
    return / - TT适配(?: \(\d+\))?$/.test(normalized) ? normalized : `${normalized} - TT适配`;
  }
  function adaptTheme(theme, options2 = {}) {
    if (!theme || typeof theme !== "object" || Array.isArray(theme)) {
      throw new Error("请选择酒馆 UI 美化 JSON，不是角色卡、世界书或预设。");
    }
    validateTheme(theme);
    const sourceName = normalizeThemeName(theme.name);
    const sourceCss = typeof theme.custom_css === "string" ? theme.custom_css : "";
    const settings = { ...DEFAULT_OPTIONS, ...options2 };
    const patchFreeCss = stripAdapterPatch(sourceCss);
    const geometry = settings.mobileGeometry ? stripTauriConflictingGeometry(patchFreeCss) : {
      css: patchFreeCss,
      removed: {
        shell: { top: 0, height: 0, minHeight: 0, maxHeight: 0 },
        drawer: { top: 0 },
        total: 0
      }
    };
    const cleanCss = geometry.css;
    const bottomBar = detectDecorativeBottomBar(cleanCss);
    const composer = detectComposerLayout(cleanCss);
    const chatBottomPadding = detectChatBottomPadding(cleanCss);
    const toolbar = detectToolbarVisibility(cleanCss);
    const adapted = JSON.parse(JSON.stringify(theme));
    adapted.name = makeAdaptedName(sourceName);
    adapted.custom_css = `${cleanCss}

${buildCompatibilityCss(settings, { composer })}`.trim();
    adapted.tta_adapter = {
      version: VERSION,
      source_name: theme.tta_adapter?.source_name || sourceName,
      converted_at: (/* @__PURE__ */ new Date()).toISOString(),
      risks: analyzeCss(sourceCss).map((item) => item.code),
      decorative_bottom_bar: bottomBar.safelyAdaptable ? { detected: true, reserve: bottomBar.reserve } : { detected: bottomBar.detected },
      overlay_composer: composer.overlay ? { detected: true, position: composer.position, bottom: composer.bottom, sticky_hover_risk: composer.stickyHoverRisk } : { detected: false },
      chat_bottom_padding: chatBottomPadding,
      state_hidden_toolbar: toolbar,
      removed_layout_geometry: geometry.removed
    };
    return adapted;
  }

  // src/host/diagnostics.js
  function readNodeDiagnostic(hostWin, element) {
    if (!element) return null;
    const rect = element.getBoundingClientRect?.();
    const computed = typeof hostWin.getComputedStyle === "function" ? hostWin.getComputedStyle(element) : null;
    return {
      rect: rect ? {
        top: Number(rect.top.toFixed(2)),
        bottom: Number(rect.bottom.toFixed(2)),
        left: Number(rect.left.toFixed(2)),
        right: Number(rect.right.toFixed(2)),
        width: Number(rect.width.toFixed(2)),
        height: Number(rect.height.toFixed(2))
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
        zIndex: computed.zIndex
      } : null,
      classes: String(element.className || "")
    };
  }
  function readElementDiagnostic(hostWin, doc, id) {
    return readNodeDiagnostic(hostWin, doc.getElementById(id));
  }
  function readSelectorDiagnostic(hostWin, doc, selector) {
    return readNodeDiagnostic(hostWin, doc.querySelector?.(selector));
  }
  function makeLayoutDiagnostic(hostWin) {
    const doc = hostWin.document;
    const rootStyle = typeof hostWin.getComputedStyle === "function" ? hostWin.getComputedStyle(doc.documentElement) : null;
    const readVariable = (name) => String(rootStyle?.getPropertyValue?.(name) || "").trim();
    const customCss = String(doc.getElementById("custom-style")?.textContent || "");
    const composer = detectComposerLayout(customCss);
    const themeSelect = doc.getElementById("themes");
    const stylePins = doc.querySelectorAll?.("#chat > .style-pins style, #chat style") || [];
    return {
      diagnostic_version: VERSION,
      captured_at: (/* @__PURE__ */ new Date()).toISOString(),
      is_tauri_tavern: Boolean(hostWin.__TAURITAVERN__ || hostWin.__TAURI_INTERNALS__ || doc.getElementById("ttas_agent_send_toggle")),
      selected_theme: String(themeSelect?.value || themeSelect?.selectedOptions?.[0]?.textContent || ""),
      viewport: {
        innerWidth: hostWin.innerWidth ?? null,
        innerHeight: hostWin.innerHeight ?? null,
        visualViewport: hostWin.visualViewport ? {
          width: hostWin.visualViewport.width,
          height: hostWin.visualViewport.height,
          offsetTop: hostWin.visualViewport.offsetTop,
          offsetLeft: hostWin.visualViewport.offsetLeft,
          scale: hostWin.visualViewport.scale
        } : null
      },
      css_variables: {
        ttInsetTop: readVariable("--tt-inset-top"),
        ttInsetRight: readVariable("--tt-inset-right"),
        ttInsetBottom: readVariable("--tt-inset-bottom"),
        ttInsetLeft: readVariable("--tt-inset-left"),
        ttImeBottom: readVariable("--tt-ime-bottom"),
        ttBaseViewportHeight: readVariable("--tt-base-viewport-height"),
        docHeight: readVariable("--doc-height"),
        topBarBlockSize: readVariable("--topBarBlockSize"),
        bottomFormBlockSize: readVariable("--bottomFormBlockSize")
      },
      theme_css: {
        length: customCss.length,
        hasAdapterPatch: customCss.includes(PATCH_START),
        composer,
        riskCodes: analyzeCss(customCss).map((item) => item.code)
      },
      chat_embedded_styles: {
        count: Number(stylePins.length || 0),
        pinnedContainerPresent: Boolean(doc.querySelector?.("#chat > .style-pins"))
      },
      page_state: {
        welcomePanelCount: Number(doc.querySelectorAll?.("#chat > .welcomePanel, #chat .welcomePanel").length || 0),
        welcomePanel: readSelectorDiagnostic(hostWin, doc, "#chat > .welcomePanel, #chat .welcomePanel"),
        openDrawers: Array.from(doc.querySelectorAll?.("#left-nav-panel.openDrawer, #right-nav-panel.openDrawer, #top-settings-holder .drawer-content.openDrawer, #top-settings-holder .drawer-content.open") || []).map((element) => ({ id: String(element.id || ""), diagnostic: readNodeDiagnostic(hostWin, element) }))
      },
      elements: Object.fromEntries([
        "top-bar",
        "top-settings-holder",
        "user-settings-block",
        "left-nav-panel",
        "right-nav-panel",
        "sheld",
        "chat",
        "form_sheld",
        "send_form",
        "nonQRFormItems",
        "send_textarea"
      ].map((id) => [id, readElementDiagnostic(hostWin, doc, id)]))
    };
  }
  function downloadLayoutDiagnostic(hostWin) {
    const doc = hostWin.document;
    const data = makeLayoutDiagnostic(hostWin);
    const file = new hostWin.File(
      [JSON.stringify(data, null, 2)],
      `TT布局诊断-v${VERSION}.json`,
      { type: "application/json" }
    );
    const url = hostWin.URL.createObjectURL(file);
    const anchor = doc.createElement("a");
    anchor.href = url;
    anchor.download = file.name;
    anchor.style.cssText = "display:none!important";
    doc.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    hostWin.setTimeout(() => hostWin.URL.revokeObjectURL(url), 2e3);
    return data;
  }

  // src/host/themes.js
  async function readHostSettings(host) {
    const context = host.SillyTavern?.getContext?.();
    if (!context || typeof host.fetch !== "function") {
      throw new Error("未连接酒馆，请在酒馆助手中打开；也可以上传美化 JSON。");
    }
    const controller = new host.AbortController();
    const timer = host.setTimeout(() => controller.abort(), 12e3);
    try {
      let headers;
      if (typeof context.getRequestHeaders === "function") headers = context.getRequestHeaders();
      else {
        const tokenResponse = await host.fetch("/csrf-token", { credentials: "same-origin", signal: controller.signal });
        if (!tokenResponse.ok) throw new Error("无法获取酒馆请求凭据，请刷新酒馆后重试。");
        const { token } = await tokenResponse.json();
        headers = { "Content-Type": "application/json", "X-CSRF-Token": token };
      }
      const response = await host.fetch("/api/settings/get", {
        method: "POST",
        headers,
        body: "{}",
        credentials: "same-origin",
        signal: controller.signal
      });
      if (!response.ok) throw new Error(`酒馆美化读取失败（${response.status}），请刷新列表或上传 JSON。`);
      return await response.json();
    } finally {
      host.clearTimeout(timer);
    }
  }
  async function themeRequest(host, name) {
    const context = host.SillyTavern?.getContext?.();
    if (!context || typeof host.fetch !== "function") throw new Error("未连接酒馆，请刷新后重试。");
    const headers = typeof context.getRequestHeaders === "function" ? context.getRequestHeaders() : {};
    const response = await host.fetch("/api/themes/delete", { method: "POST", headers, body: JSON.stringify({ name }), credentials: "same-origin" });
    if (!response.ok) throw new Error(`删除「${name}」失败（${response.status}）。`);
  }
  async function readInstalledThemes(host) {
    const { themes } = await readHostSettings(host);
    if (!Array.isArray(themes)) throw new Error("当前酒馆未返回美化列表，请使用 JSON 导入。");
    return themes.flatMap((value) => {
      try {
        const theme = typeof value === "string" ? JSON.parse(value) : value;
        validateTheme(theme);
        return [JSON.parse(JSON.stringify(theme))];
      } catch {
        return [];
      }
    });
  }
  async function verifySavedTheme(host, theme) {
    const themes = await readInstalledThemes(host);
    return themes.some((item) => item.name === theme.name && item.custom_css === theme.custom_css);
  }
  async function deleteInstalledThemes(host, names) {
    const uniqueNames = [...new Set(names.filter((name) => typeof name === "string" && name.trim()))];
    for (const name of uniqueNames) await themeRequest(host, name);
    const remaining = await readInstalledThemes(host);
    const stillThere = new Set(remaining.map((theme) => theme.name));
    const failed = uniqueNames.filter((name) => stillThere.has(name));
    if (failed.length) throw new Error(`有 ${failed.length} 款美化删除后仍在列表中：${failed.join("、")}`);
    return uniqueNames.length;
  }

  // src/ui/markup.js
  var star = '<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M20 0C22 14 26 18 40 20C26 22 22 26 20 40C18 26 14 22 0 20C14 18 18 14 20 0Z" fill="currentColor"/></svg>';
  var arrow = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6"/></svg>';
  var upload = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M12 16V3m-5 5 5-5 5 5M4 15v5h16v-5"/></svg>';
  function panelMarkup(detected) {
    return `<div class="backdrop" role="presentation">
    <section class="panel" role="dialog" aria-modal="true" aria-labelledby="studio-title">
      <header class="header">
        <div class="brand-mark">${star}</div>
        <div class="titlebox"><h1 id="studio-title">美化工作室</h1><span class="wordmark">BEAUTIFY STUDIO</span></div>
        <span class="version">VOL. 01 <i>/</i> v${VERSION}</span>
        <button class="close-x icon-button" type="button" aria-label="关闭工作室">×</button>
      </header>
      <div class="body">
        <div class="masthead"><span>YOUR THEME, YOUR WAY</span><span>${star} THE STUDIO ${star}</span><span>MADE FOR TAVERN</span></div>
        <div class="intro"><span class="connection" data-connected="${detected}"><i></i>${detected ? "TauriTavern 已连接" : "美化适配工作台"}</span></div>
        <div class="workspace">
          <section class="source-section">
            <div class="section-heading"><h3><span>01</span> 选择美化</h3><span class="caption">THE COLLECTION</span></div>
            <div class="source-card">
              <div class="source-tabs" role="tablist" aria-label="美化来源"><button type="button" id="tab-installed" role="tab" aria-controls="source-installed" aria-selected="true" data-source="installed">酒馆内的美化</button><button type="button" id="tab-upload" role="tab" aria-controls="source-upload" aria-selected="false" tabindex="-1" data-source="upload">上传 JSON</button></div>
              <div id="source-installed" role="tabpanel" aria-labelledby="tab-installed"><div class="collection-meta"><span class="library-count">正在读取美化…</span><span class="collection-actions"><button class="search-toggle icon-button" type="button" aria-label="搜索美化" aria-expanded="false">⌕</button><button class="batch-delete icon-button danger" type="button" aria-label="删除当前列表中的美化">⌫</button><button class="refresh text-button" type="button" aria-label="刷新酒馆美化列表">↻ 刷新</button></span></div><div class="theme-search" hidden><label><span class="sr-only">按名称搜索美化</span><input type="search" class="search-input" placeholder="搜索美化名称…" autocomplete="off"></label></div><div class="library" aria-label="已导入的美化"></div></div>
              <div id="source-upload" role="tabpanel" aria-labelledby="tab-upload" hidden><input class="file-input" type="file" accept=".json,application/json" hidden><button class="choose" type="button"><span class="upload-icon">${upload}</span><strong>把喜欢的美化放进来</strong><span>点击选择，或将 JSON 拖到这里</span><span class="upload-pill">选择美化文件 ${arrow}</span></button><p class="upload-note">支持 SillyTavern UI 美化 JSON · 最大 10 MB</p></div>
              <div class="selection"><span class="selection-star">${star}</span><div><span class="tiny-label">SELECTED THEME</span><div class="filename">还没有选择美化</div></div><span class="selected-indicator" aria-hidden="true">↗</span></div>
            </div>
          </section>
          <section class="settings-section"><div class="section-heading"><h3><span>02</span> 调整适配</h3><span class="caption">MAKE IT FIT</span></div><div class="settings-card"><div class="options">
            <label class="option"><span class="option-number">01</span><span><b>隐藏快速扮演按钮</b><small>隐藏墨镜黑衣人，不影响发送与角色回复。</small></span><input data-option="hideImpersonate" type="checkbox" role="switch" aria-label="隐藏快速扮演按钮"></label>
            <label class="option"><span class="option-number">02</span><span><b>保持隐藏按钮的状态</b><small>防止美化让已经隐藏的按钮重新出现。</small></span><input data-option="preserveHiddenControls" type="checkbox" role="switch" aria-label="保持隐藏按钮的状态"></label>
            <label class="option"><span class="option-number">03</span><span><b>修复布局冲突</b><small>适配聊天区域、顶部抽屉与悬浮输入栏。</small></span><input data-option="mobileGeometry" type="checkbox" role="switch" aria-label="修复布局冲突"></label>
            <label class="option"><span class="option-number">04</span><span><b>段落首行缩进</b><small>给聊天内容的每个段落增加 2em 首行缩进。</small></span><input data-option="indentParagraphs" type="checkbox" role="switch" aria-label="段落首行缩进"></label>
          </div><div class="settings-note"><span>♡</span> 保留原来的美化，所有调整写入新副本。</div></div>
          <div class="check-card"><div class="check-heading"><h3>${star} 兼容检查</h3><span class="check-count">等待选择</span></div><div class="report"><div class="risk" data-level="idle"><b>好看的开始，从选择开始</b><span>选择一款美化后，在这里查看适配建议。</span></div></div></div>
          </section>
        </div>
        <footer class="actions"><div class="action-buttons"><button class="action primary import-apply needs-theme" type="button" disabled>生成并应用 ${arrow}</button><div class="secondary-actions"><button class="action batch-import needs-host" type="button">批量生成并导入</button><button class="action download needs-theme" type="button" disabled>↓ 仅下载适配版</button><button class="action diagnose" type="button">布局诊断 ↗</button></div></div></footer>
        <div class="status" role="status" aria-live="polite">选择美化后即可开始。原主题会完整保留。</div>
        <div class="colophon"><span>BEAUTIFY STUDIO</span><span>WITH A LITTLE ${star} & A LOT OF CARE</span><span>美化工作室</span></div>
      </div>
    </section>
  </div>`;
  }

  // src/ui/studio.css
  var studio_default = ':host { all: initial; color-scheme: light; --ink:#272829; --muted:#737577; --line:#dedfe0; --paper:#fafafa; }\n*,*::before,*::after { box-sizing:border-box; }\n[hidden] { display:none !important; }\nbutton,input { font:inherit; }\nbutton { cursor:pointer; color:inherit; }\nbutton:disabled { cursor:not-allowed; }\nbutton:focus-visible,input:focus-visible { outline:2px solid #53585d; outline-offset:4px; }\nsvg { display:block; width:24px; height:24px; flex-shrink:0; }\n.backdrop { position:fixed; inset:0; display:flex; justify-content:center; align-items:center; padding:24px; background:#68696b88; backdrop-filter:blur(12px); -webkit-backdrop-filter:blur(12px); color:var(--ink); font:14px/1.6 "PingFang SC","Microsoft YaHei",system-ui,sans-serif; }\n.panel { width:min(1000px,100%); max-height:100%; display:flex; flex-direction:column; border:1px solid #ffffffb3; border-radius:25px; background:var(--paper); box-shadow:0 28px 90px #24262830; overflow:hidden; }\n.header { display:flex; align-items:center; gap:13px; padding:20px 32px; border-bottom:1px solid var(--line); background:#fafafa; }\n.brand-mark { display:grid; place-items:center; width:47px; height:47px; background:linear-gradient(145deg,#f8f8f8,#c8cacc); border:1px solid #d1d2d3; border-radius:50%; box-shadow:inset 0 2px 3px white; }\n.brand-mark svg { width:27px; height:27px; }\n.titlebox { flex:1; }\nh1,h2,h3,p { margin:0; }\nh1 { font-size:20px; letter-spacing:3px; line-height:1.4; font-weight:600; }\n.wordmark { display:block; font-size:10px; letter-spacing:2.5px; margin-top:3px; }\n.version { font:11px/1.5 ui-monospace,monospace; letter-spacing:1px; color:#6d6f71; }\n.version i { padding:0 8px; color:#b2b3b4; }\n.icon-button { border:1px solid #d8d9da; border-radius:50%; width:34px; height:34px; display:grid; place-items:center; font-size:25px; line-height:1; background:transparent; margin-left:12px; padding:0; }\n.icon-button:hover { background:#e9eaeb; }\n.body { padding:24px 32px 18px; overflow:auto; overscroll-behavior:contain; background-image:radial-gradient(#c7c8c94a .65px,transparent .65px); background-size:7px 7px; }\n.masthead { background:#292a2b; color:#f2f2f2; display:flex; justify-content:space-between; padding:10px 17px; font:10px/1.4 Georgia,serif; letter-spacing:.7px; }\n.masthead span:nth-child(2) { display:flex; gap:9px; align-items:center; }\n.masthead svg { width:9px; height:9px; }\n.intro { display:flex; align-items:center; justify-content:flex-end; gap:20px; padding:15px 0 17px; }\n.eyebrow { font:10px/1.5 ui-monospace,monospace; letter-spacing:1.7px; color:#747678; }\nh2 { font-size:27px; font-weight:500; letter-spacing:2px; margin-top:7px; line-height:1.45; }\nh2 em { font-style:normal; color:#808284; }\n.connection { display:flex; align-items:center; gap:7px; font-size:12px; border:1px solid #d8d9da; border-radius:24px; padding:6px 12px; white-space:nowrap; background:#f7f7f7; }\n.connection i { width:6px; height:6px; border-radius:50%; background:#a3a5a7; }\n.connection[data-connected="true"] i { background:#607368; }\n.workspace { display:grid; grid-template-columns:1.06fr 1fr; gap:26px; }\n.section-heading { display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; gap:8px; }\nh3 { font-size:15px; font-weight:600; }\n.section-heading h3>span { color:#939597; font:12px ui-monospace,monospace; margin-right:9px; }\n.caption { font:9px ui-monospace,monospace; color:#777a7c; letter-spacing:1.2px; }\n.source-card,.settings-card,.check-card { border:1px solid #d8dadb; border-radius:20px; background:#fafafae8; overflow:hidden; }\n.source-card { padding:15px; }\n.source-tabs { display:grid; grid-template-columns:1fr 1fr; background:#eceded; padding:4px; border-radius:24px; gap:4px; }\n.source-tabs button { border:0; padding:9px 6px; border-radius:24px; background:transparent; font-size:13px; color:#77797b; transition:background .18s; }\n.source-tabs button[aria-selected="true"] { background:#fff; color:#272829; box-shadow:0 1px 5px #00000010; }\n.collection-meta { display:flex; justify-content:space-between; align-items:center; gap:8px; padding:16px 3px 10px; font-size:12px; color:var(--muted); }\n.collection-actions { display:flex; align-items:center; gap:8px; }\n.collection-actions .icon-button { width:27px; height:27px; font-size:20px; margin:0; }\n.collection-actions .icon-button.danger { color:#985347; font-size:17px; }\n.theme-search { padding:0 3px 9px; }\n.search-input { width:100%; border:1px solid #d5d7d8; border-radius:18px; padding:8px 12px; background:#fff; color:var(--ink); font-size:12px; }\n.sr-only { position:absolute; width:1px; height:1px; padding:0; margin:-1px; overflow:hidden; clip:rect(0,0,0,0); white-space:nowrap; border:0; }\n.text-button { background:none; border:0; padding:4px; font-size:12px; }\n.text-button:hover { text-decoration:underline; }\n.library { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:10px; max-height:226px; overflow:auto; padding:3px; scrollbar-width:thin; }\n.theme-card { position:relative; text-align:left; background:white; border:1px solid #dddfe0; border-radius:13px; padding:5px; min-width:0; }\n.theme-card[aria-pressed="true"] { border-color:#3f4244; box-shadow:0 0 0 1px #3f4244; }\n.theme-card:hover { border-color:#777b7e; }\n.theme-thumbnail { height:83px; border-radius:9px; background:var(--theme-bg,#e0e1e2); position:relative; overflow:hidden; color:var(--theme-text,#373a3c); }\n.preview-topbar { position:absolute; inset:0 0 auto; height:13px; background:#0002; }\n.preview-avatar { position:absolute; left:8px; top:22px; width:13px; height:13px; border-radius:50%; background:var(--theme-user,#aeb4b8); }\n.preview-message { position:absolute; height:12px; border-radius:7px; opacity:.9; }\n.preview-message-user { left:27px; right:12px; top:23px; background:var(--theme-user,#aeb4b8); }\n.preview-message-bot { left:12px; right:30px; top:46px; background:var(--theme-bot,#f0f1f1); }\n.preview-composer { position:absolute; bottom:8px; left:10px; right:10px; height:7px; border-radius:6px; background:#fff9; }\n.theme-card[aria-pressed="true"] .theme-thumbnail::after { content:"✓"; background:#2b2d2f; color:white; width:19px; height:19px; bottom:7px; right:7px; text-align:center; line-height:19px; border-radius:50%; font-size:11px; }\n.theme-name { display:block; font-size:12px; font-weight:500; padding:5px 5px 2px; overflow:hidden; white-space:nowrap; text-overflow:ellipsis; }\n.library-empty { grid-column:1/-1; padding:27px 13px; min-height:206px; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; gap:8px; color:var(--muted); font-size:13px; }\n.library-empty strong { color:var(--ink); font-weight:500; }\n.selection { margin-top:15px; padding:13px 8px 1px; border-top:1px solid var(--line); display:flex; gap:11px; align-items:center; }\n.selection-star svg { width:26px; height:26px; color:#7b7e80; }\n.selection>div { flex:1; min-width:0; }\n.tiny-label { color:#7b7e80; font:9px/1.5 ui-monospace,monospace; letter-spacing:1.3px; }\n.filename { font-size:13px; margin-top:2px; overflow-wrap:anywhere; }\n.selected-indicator { font-size:20px; }\n.choose { display:flex; width:100%; min-height:240px; flex-direction:column; align-items:center; justify-content:center; gap:12px; border:1px dashed #c7c9cb; border-radius:14px; background:linear-gradient(135deg,#f4f4f4,#e9eaeb); margin-top:16px; }\n.choose.dragover { background:#d9dcde; border-color:#3d4144; }\n.choose strong { font-size:16px; font-weight:500; }\n.choose>span:not(.upload-icon):not(.upload-pill) { font-size:12px; color:#747779; }\n.upload-icon { padding:14px; border-radius:50%; border:1px solid #d5d7d8; background:#f8f8f8; }\n.upload-pill { display:flex; align-items:center; gap:14px; font-size:12px; border-radius:20px; background:#fff; padding:7px 15px; }\n.upload-pill svg { width:15px; height:15px; }\n.upload-note { margin-top:10px; font-size:11px; text-align:center; color:#777a7c; }\n.keepsake { display:none; }\n.keepsake-copy>span { font:17px/1.3 Georgia,serif; color:#55595b; }\n.keepsake-copy small { display:block; font-size:10px; color:#6d7174; margin-top:9px; }\n.sticker { position:absolute; right:15px; width:66px; height:80px; border:3px solid #ffffffd9; border-radius:14px; display:grid; place-items:center; background:#e7e8e9b0; box-shadow:0 2px 5px #6661; }\n.sticker svg { width:31px; height:31px; color:#fafafa; }\n.s-one { right:105px; transform:rotate(-11deg); }\n.s-two { right:58px; transform:rotate(-2deg); }\n.s-three { transform:rotate(12deg); }\n.keepsake-index { position:absolute; right:17px; bottom:9px; color:#747779; font:8px ui-monospace,monospace; letter-spacing:1px; }\n.options { padding:4px 18px; }\n.option { display:grid; grid-template-columns:17px 1fr 34px; align-items:center; gap:11px; padding:18px 0; cursor:pointer; }\n.option+.option { border-top:1px solid #e5e6e7; }\n.option-number { align-self:start; font:10px/2.3 ui-monospace,monospace; color:#939698; }\n.option b { display:block; font-size:14px; font-weight:500; }\n.option small { display:block; margin-top:4px; font-size:12px; color:#797c7e; line-height:1.6; }\n.option input { appearance:none; width:33px; height:19px; border-radius:15px; margin:0; background:#c9ccce; position:relative; cursor:pointer; transition:background .2s; }\n.option input::after { content:""; position:absolute; top:3px; left:3px; width:13px; height:13px; border-radius:50%; background:#fff; transition:transform .2s; }\n.option input:checked { background:#343738; }\n.option input:checked::after { transform:translateX(14px); }\n.settings-note { padding:10px 14px; display:flex; gap:7px; align-items:center; justify-content:center; background:#eeeeef; font-size:11px; color:#75787a; }\n.settings-note>span { font-size:17px; }\n.check-card { margin-top:17px; padding:16px 18px; }\n.check-heading { display:flex; justify-content:space-between; gap:8px; align-items:center; margin-bottom:12px; }\n.check-heading h3 { display:flex; gap:7px; align-items:center; font-size:13px; }\n.check-heading svg { width:13px; height:13px; }\n.check-count { border:1px solid #dbddde; border-radius:15px; padding:2px 8px; color:#777a7b; font-size:10px; }\n.report { max-height:130px; overflow:auto; scrollbar-width:thin; }\n.risk { padding:10px 0 10px 13px; border-left:2px solid #a5a9ab; margin-bottom:8px; }\n.risk:last-child { margin-bottom:0; }\n.risk b { display:block; font-size:12px; font-weight:500; }\n.risk span { display:block; font-size:11px; color:#777a7c; line-height:1.7; margin-top:4px; }\n.risk[data-level="high"] { border-color:#a27a68; }\n.risk[data-level="ok"] { border-color:#758779; }\n.risk[data-level="idle"] { border-color:#d3d5d6; }\n.actions { display:flex; align-items:center; justify-content:flex-end; gap:25px; padding:25px 0 17px; margin-top:22px; border-top:1px solid #d5d7d8; }\n.action-note p { font-size:16px; line-height:1.6; margin-top:5px; letter-spacing:1px; }\n.action-buttons { width:calc((100% - 26px)/2.06); }\n.action { border:0; background:none; padding:7px 4px; font-size:12px; }\n.primary { width:100%; display:flex; align-items:center; justify-content:space-between; gap:20px; border-radius:30px; background:#292b2c; color:#fff; min-height:48px; padding:12px 21px; font-size:14px; }\n.primary:hover:not(:disabled) { background:#474a4c; }\n.primary:disabled { background:#dddfe0; color:#898c8e; }\n.secondary-actions { display:flex; justify-content:space-between; gap:12px; margin-top:7px; }\n.secondary-actions .action { color:#666a6d; }\n.secondary-actions .action:hover:not(:disabled) { text-decoration:underline; }\n.secondary-actions .action:disabled { color:#a6a8aa; }\n.secondary-actions .batch-import { color:#44484a; font-weight:500; }\n.status { color:#777b7d; font-size:11px; line-height:1.7; padding-bottom:15px; overflow-wrap:anywhere; }\n.status[data-kind="error"] { color:#985347; }\n.status[data-kind="success"] { color:#516c59; }\n.colophon { display:flex; justify-content:space-between; align-items:center; gap:12px; border-top:1px solid #d5d7d8; padding-top:13px; font:9px/1.4 Georgia,serif; color:#777b7d; letter-spacing:.6px; }\n.colophon span:nth-child(2) { display:flex; align-items:center; gap:5px; }\n.colophon svg { width:9px; height:9px; }\n@media (max-width:700px) {\n  .backdrop { padding: max(10px,env(safe-area-inset-top)) 10px max(10px,env(safe-area-inset-bottom)); }\n  .panel { border-radius:21px; }\n  .header { padding:16px 18px; gap:10px; }\n  .brand-mark { width:40px; height:40px; }\n  h1 { font-size:18px; letter-spacing:2px; }\n  .wordmark { font-size:8px; letter-spacing:2px; }\n  .version { font-size:9px; letter-spacing:0; }\n  .version i { padding:0 4px; }\n  .icon-button { margin-left:0; width:30px; height:30px; }\n  .body { padding:18px 18px 15px; }\n  .masthead { font-size:8px; padding:9px 10px; letter-spacing:0; }\n  .masthead span:last-child { display:none; }\n  .intro { padding:10px 0 13px; display:flex; }\n  .eyebrow { font-size:8px; letter-spacing:1px; }\n  h2 { font-size:24px; letter-spacing:1px; }\n  .connection { width:fit-content; margin-top:12px; font-size:10px; padding:4px 9px; }\n  .workspace { grid-template-columns:minmax(0,1fr); gap:24px; }\n  .keepsake { display:none; }\n  .keepsake-copy>span { font-size:15px; }\n  .sticker { width:55px; height:65px; }\n  .s-one { right:96px; }.s-two { right:54px; }\n  .theme-thumbnail { height:76px; }\n  .library { max-height:247px; }\n  .option { padding:18px 0; }\n  .option small { font-size:12px; }\n  .actions { align-items:flex-start; margin-top:24px; gap:16px; flex-direction:column; padding-top:19px; }\n  .action-note p br { display:none; }\n  .action-note p { font-size:14px; }\n  .action-buttons { width:100%; }\n  .primary { min-height:49px; }\n  .colophon { font-size:8px; }.colophon span:last-child { display:none; }\n}\n@media (prefers-reduced-motion:reduce) { *,*::before,*::after { transition:none !important; } }\n';

  // src/main.js
  var selectedTheme = null;
  var selectedFileName = "";
  var panelHost = null;
  var previousFocus = null;
  var busy = false;
  var wandRegistrations = [];
  var runtimeInteractionRegistrations = [];
  function resolveHostWindow() {
    const candidates = [];
    for (const candidate of [window.parent, window.top, window]) {
      if (!candidate || candidates.includes(candidate)) continue;
      candidates.push(candidate);
    }
    for (const candidate of candidates) {
      try {
        const doc = candidate.document;
        if (doc?.querySelector?.("#sheld, #chat, #extensions_settings2, #extensions_settings")) {
          return candidate;
        }
      } catch (_) {
      }
    }
    return window.parent || window;
  }
  function collectRuntimeDocuments() {
    const documents = [];
    let current = window;
    for (let depth = 0; depth < 8; depth += 1) {
      try {
        if (current.document && !documents.includes(current.document)) documents.push(current.document);
        if (!current.parent || current.parent === current) break;
        void current.parent.document;
        current = current.parent;
      } catch (_) {
        break;
      }
    }
    return documents.length ? documents : [document];
  }
  function getHostDocument() {
    try {
      return resolveHostWindow().document;
    } catch (_) {
      return document;
    }
  }
  function isTauriTavern(hostWin = resolveHostWindow()) {
    try {
      return Boolean(
        hostWin.__TAURITAVERN__ || hostWin.__TAURI_INTERNALS__ || hostWin.document?.getElementById?.("ttas_agent_send_toggle") || /Tauri/i.test(hostWin.navigator?.userAgent || "")
      );
    } catch (_) {
      return false;
    }
  }
  function loadOptions() {
    try {
      const hostWin = resolveHostWindow();
      const stored = JSON.parse(hostWin.localStorage?.getItem(STORAGE_KEY) || "{}");
      return Object.fromEntries(Object.entries(DEFAULT_OPTIONS).map(([key, fallback]) => [key, typeof stored[key] === "boolean" ? stored[key] : fallback]));
    } catch (error) {
      console.warn("[BeautifyStudio] 无法读取设置，使用默认值。", error);
      return { ...DEFAULT_OPTIONS };
    }
  }
  var options = loadOptions();
  function saveOptions() {
    try {
      resolveHostWindow().localStorage?.setItem(STORAGE_KEY, JSON.stringify(options));
    } catch (error) {
      console.warn("[BeautifyStudio] 无法保存设置。", error);
    }
  }
  function buildRuntimePreferenceCss(settings = {}) {
    const rules = [
      `/* 美化工作室 v${VERSION}: runtime preferences only; TT keeps ownership of layout. */`
    ];
    if (settings.hideImpersonate) {
      rules.push("html body #mes_impersonate#mes_impersonate { display: none !important; }");
    }
    return rules.join("\n");
  }
  function applyRuntimeCompatibility() {
    const hostWin = resolveHostWindow();
    const doc = hostWin.document;
    if (!doc?.head) return;
    doc.documentElement?.classList?.toggle?.(TAURI_ROOT_CLASS, isTauriTavern(hostWin));
    let style = doc.getElementById(RUNTIME_STYLE_ID);
    if (!style) {
      style = doc.createElement("style");
      style.id = RUNTIME_STYLE_ID;
      doc.head.appendChild(style);
    }
    const nextCss = buildRuntimePreferenceCss(options);
    if (style.textContent !== nextCss) style.textContent = nextCss;
  }
  function findComposerShell(doc, target) {
    try {
      const closest = target?.closest?.("#form_sheld");
      if (closest) return closest;
      const shell = doc?.getElementById?.("form_sheld");
      return shell?.contains?.(target) ? shell : null;
    } catch (_) {
      return null;
    }
  }
  function startComposerInteractions() {
    for (const doc of collectRuntimeDocuments()) {
      if (typeof doc?.addEventListener !== "function") continue;
      const open = (shell) => {
        for (const other of doc.querySelectorAll?.(`#form_sheld.${COMPOSER_OPEN_CLASS}`) || []) {
          if (other !== shell) other.classList?.remove?.(COMPOSER_OPEN_CLASS);
        }
        shell?.classList?.add?.(COMPOSER_OPEN_CLASS);
      };
      const close = () => {
        for (const shell of doc.querySelectorAll?.(`#form_sheld.${COMPOSER_OPEN_CLASS}`) || []) {
          shell.classList?.remove?.(COMPOSER_OPEN_CLASS);
        }
      };
      const onPress = (event) => {
        const shell = findComposerShell(doc, event?.target);
        if (shell) open(shell);
        else close();
      };
      const onFocusIn = (event) => {
        const shell = findComposerShell(doc, event?.target);
        if (shell) open(shell);
      };
      doc.addEventListener("pointerdown", onPress, true);
      doc.addEventListener("touchstart", onPress, true);
      doc.addEventListener("focusin", onFocusIn, true);
      runtimeInteractionRegistrations.push({ doc, onPress, onFocusIn });
    }
  }
  function notify(kind, message, title = "美化工作室") {
    try {
      const toast = resolveHostWindow().toastr;
      if (typeof toast?.[kind] === "function") toast[kind](message, title);
    } catch (_) {
    }
  }
  function getThemeSelect(doc = getHostDocument()) {
    return doc?.getElementById?.("themes") || null;
  }
  function getUniqueThemeName(baseName) {
    const select = getThemeSelect();
    if (!select?.options) return baseName;
    const names = new Set(Array.from(select.options, (option) => String(option.value || option.textContent || "")));
    if (!names.has(baseName)) return baseName;
    let index = 2;
    while (names.has(`${baseName} (${index})`)) index += 1;
    return `${baseName} (${index})`;
  }
  function makeAdaptedTheme() {
    if (!selectedTheme) throw new Error("请先选择一个美化 JSON。");
    const adapted = adaptTheme(selectedTheme, options);
    adapted.name = getUniqueThemeName(adapted.name);
    return adapted;
  }
  function safeFileName(name) {
    return String(name || "TT适配主题").replace(/[\\/:*?"<>|]/g, "_").trim() || "TT适配主题";
  }
  function createThemeFile(theme) {
    const hostWin = resolveHostWindow();
    return new hostWin.File(
      [JSON.stringify(theme, null, 4)],
      `${safeFileName(theme.name)}.json`,
      { type: "application/json" }
    );
  }
  function readFileText(file) {
    if (typeof file?.text === "function") return file.text();
    const hostWin = resolveHostWindow();
    return new Promise((resolve, reject) => {
      const reader = new hostWin.FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(reader.error || new Error("读取文件失败。"));
      reader.readAsText(file);
    });
  }
  function downloadTheme(theme) {
    const hostWin = resolveHostWindow();
    const doc = hostWin.document;
    const file = createThemeFile(theme);
    const url = hostWin.URL.createObjectURL(file);
    const anchor = doc.createElement("a");
    anchor.href = url;
    anchor.download = file.name;
    anchor.style.cssText = "display:none!important";
    doc.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    hostWin.setTimeout(() => hostWin.URL.revokeObjectURL(url), 2e3);
  }
  function delayInHost(hostWin, milliseconds) {
    return new Promise((resolve) => hostWin.setTimeout(resolve, milliseconds));
  }
  async function waitForHostCondition(hostWin, predicate, timeout = 1e4, interval = 100) {
    const startedAt = Date.now();
    while (Date.now() - startedAt < timeout) {
      const value = predicate();
      if (value) return value;
      await delayInHost(hostWin, interval);
    }
    throw new Error("等待酒馆完成主题操作超时。");
  }
  function assignFileToNativeInput(hostWin, input, file) {
    if (typeof hostWin.DataTransfer === "function") {
      const transfer = new hostWin.DataTransfer();
      transfer.items.add(file);
      input.files = transfer.files;
      return;
    }
    Object.defineProperty(input, "files", {
      configurable: true,
      value: Object.freeze([file])
    });
  }
  async function importAndApplyTheme(theme) {
    const hostWin = resolveHostWindow();
    const doc = hostWin.document;
    const nativeInput = doc.getElementById("ui_preset_import_file");
    const themeSelect = getThemeSelect(doc);
    if (!nativeInput || !themeSelect) {
      throw new Error("没有找到酒馆原生主题导入控件，请打开一次“用户设置 → UI主题”后重试。");
    }
    const file = createThemeFile(theme);
    assignFileToNativeInput(hostWin, nativeInput, file);
    const EventCtor = hostWin.Event || Event;
    nativeInput.dispatchEvent(new EventCtor("change", { bubbles: true }));
    await waitForHostCondition(hostWin, () => Array.from(themeSelect.options || []).some((option) => String(option.value || option.textContent || "") === theme.name), 12e4);
    themeSelect.value = theme.name;
    const hostJquery = hostWin.jQuery || hostWin.$;
    if (typeof hostJquery === "function") {
      hostJquery(themeSelect).val(theme.name).trigger("change");
    } else {
      themeSelect.dispatchEvent(new EventCtor("change", { bubbles: true }));
    }
    await waitForHostCondition(hostWin, () => {
      const selected = String(themeSelect.value || "");
      const css = String(doc.getElementById("custom-style")?.textContent || "");
      return selected === theme.name && css.includes(PATCH_START);
    });
    await delayInHost(hostWin, 1400);
    if (String(themeSelect.value || "") !== theme.name) {
      throw new Error("主题导入后未保持选中，请重试。");
    }
    return theme;
  }
  function setPanelStatus(root, text, kind = "info") {
    const status = root.querySelector(".status");
    if (!status) return;
    status.textContent = text;
    status.dataset.kind = kind;
  }
  function setPanelActions(root, enabled) {
    for (const button of root.querySelectorAll(".needs-theme")) button.disabled = !enabled || busy;
    for (const control of root.querySelectorAll(".theme-card, [data-source], [data-option], .choose, .refresh")) control.disabled = busy;
    root.querySelector(".batch-import").disabled = busy;
    root.querySelector(".batch-delete").disabled = busy;
    if (!getThemeSelect() || !getHostDocument().getElementById("ui_preset_import_file")) root.querySelector(".import-apply").disabled = true;
  }
  async function batchImportThemes(root) {
    if (busy) return;
    const themes = root.__installedThemes || await readInstalledThemes(resolveHostWindow());
    if (!themes.length) throw new Error("没有可批量处理的已导入美化。");
    busy = true;
    setPanelActions(root, false);
    let completed = 0;
    try {
      for (const source of themes) {
        const adapted = adaptTheme(source, options);
        adapted.name = getUniqueThemeName(adapted.name);
        setPanelStatus(root, `正在导入 ${completed + 1}/${themes.length}：${adapted.name}…`);
        await importAndApplyTheme(adapted);
        completed += 1;
      }
      setPanelStatus(root, `已批量生成并导入 ${completed} 款适配版；原主题均未修改。`, "success");
    } finally {
      busy = false;
      setPanelActions(root, Boolean(selectedTheme));
      refreshLibrary(root);
    }
  }
  function renderRisks(root, risks) {
    const report = root.querySelector(".report");
    if (!report) return;
    report.replaceChildren();
    root.querySelector(".check-count").textContent = risks.length ? `${risks.length} 项建议` : "检查完成";
    const list = risks.length ? risks : [{
      level: "ok",
      label: "没有发现常见冲突",
      detail: "仍会写入通用 TT 兼容层，导入后请实际查看一次。",
      count: 0
    }];
    for (const risk of list) {
      const item = getHostDocument().createElement("div");
      item.className = "risk";
      item.dataset.level = risk.level;
      const title = getHostDocument().createElement("b");
      title.textContent = risk.count ? `${risk.label} × ${risk.count}` : risk.label;
      const detail = getHostDocument().createElement("span");
      detail.textContent = risk.detail;
      item.append(title, detail);
      report.appendChild(item);
    }
  }
  function syncPanelFromState(root) {
    for (const input of root.querySelectorAll("[data-option]")) {
      input.checked = Boolean(options[input.dataset.option]);
    }
    const filename = root.querySelector(".filename");
    if (filename) {
      filename.textContent = selectedTheme ? selectedTheme.name : "还没有选择美化";
      filename.title = selectedFileName;
    }
    setPanelActions(root, Boolean(selectedTheme));
    if (selectedTheme) renderRisks(root, analyzeCss(selectedTheme.custom_css));
  }
  function closePanel() {
    if (busy) return;
    try {
      panelHost?.remove();
    } catch (_) {
    }
    panelHost = null;
    previousFocus?.focus?.();
  }
  async function handleSelectedFile(root, file) {
    if (!file || busy) return;
    try {
      if (file.size > 10 * 1024 * 1024) throw new Error("文件超过 10 MB，请选择较小的 UI 美化文件。");
      const parsed = JSON.parse(await readFileText(file));
      validateTheme(parsed);
      selectedTheme = parsed;
      selectedFileName = file.name || "";
      for (const card of root.querySelectorAll(".theme-card")) card.setAttribute("aria-pressed", "false");
      syncPanelFromState(root);
      renderRisks(root, analyzeCss(parsed.custom_css));
      const cssLength = typeof parsed.custom_css === "string" ? parsed.custom_css.length : 0;
      setPanelStatus(root, `已读取：${parsed.name}（自定义 CSS ${cssLength.toLocaleString()} 字符）`, "success");
    } catch (error) {
      selectedTheme = null;
      selectedFileName = "";
      syncPanelFromState(root);
      renderRisks(root, [{ level: "high", label: "读取失败", detail: String(error?.message || error), count: 0 }]);
      setPanelStatus(root, `读取失败：${error?.message || error}`, "error");
    }
  }
  function showSource(root, source) {
    for (const tab of root.querySelectorAll("[data-source]")) {
      const active = tab.dataset.source === source;
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
      root.querySelector(`#source-${tab.dataset.source}`).hidden = !active;
    }
  }
  async function refreshLibrary(root) {
    const library = root.querySelector(".library");
    const refresh = root.querySelector(".refresh");
    refresh.disabled = true;
    root.querySelector(".library-count").textContent = "正在读取美化…";
    library.setAttribute("aria-busy", "true");
    library.replaceChildren();
    try {
      const themes = await readInstalledThemes(resolveHostWindow());
      root.querySelector(".library-count").textContent = `${themes.length} 款已导入的美化`;
      if (!themes.length) throw new Error("酒馆还没有已导入的美化，可以先上传一个 JSON。");
      root.__installedThemes = themes;
      renderThemeCards(root, themes);
    } catch (error) {
      root.querySelector(".library-count").textContent = "暂无可用美化";
      const empty = getHostDocument().createElement("div");
      empty.className = "library-empty";
      const heading = getHostDocument().createElement("strong");
      heading.textContent = "从你喜欢的美化开始";
      const detail = getHostDocument().createElement("span");
      detail.textContent = error.name === "AbortError" ? "读取超时，请刷新列表或上传 JSON。" : error.message;
      empty.append(heading, detail);
      library.append(empty);
    } finally {
      refresh.disabled = busy;
      library.removeAttribute("aria-busy");
    }
  }
  function safeColor(theme, keys, fallback) {
    const css = resolveHostWindow().CSS;
    for (const key of keys) {
      const value = String(theme?.[key] || "").trim();
      if (value && css?.supports?.("color", value)) return value;
    }
    return fallback;
  }
  function createThemeThumbnail(theme) {
    const thumbnail = getHostDocument().createElement("div");
    thumbnail.className = "theme-thumbnail";
    thumbnail.setAttribute("aria-hidden", "true");
    thumbnail.style.setProperty("--theme-bg", safeColor(theme, ["chat_tint_color", "blur_tint_color"], "#d5d7d8"));
    thumbnail.style.setProperty("--theme-text", safeColor(theme, ["main_text_color"], "#373a3c"));
    thumbnail.style.setProperty("--theme-user", safeColor(theme, ["user_mes_blur_tint_color", "blur_tint_color"], "#aeb4b8"));
    thumbnail.style.setProperty("--theme-bot", safeColor(theme, ["bot_mes_blur_tint_color", "blur_tint_color"], "#f0f1f1"));
    thumbnail.innerHTML = '<span class="preview-topbar"></span><span class="preview-avatar"></span><span class="preview-message preview-message-user"></span><span class="preview-message preview-message-bot"></span><span class="preview-composer"></span>';
    return thumbnail;
  }
  function renderThemeCards(root, themes) {
    const library = root.querySelector(".library");
    root.__visibleThemes = themes;
    library.replaceChildren();
    if (!themes.length) {
      const empty = getHostDocument().createElement("div");
      empty.className = "library-empty";
      empty.textContent = "没有找到对应美化";
      library.append(empty);
      return;
    }
    for (const theme of themes) {
      const button = getHostDocument().createElement("button");
      button.type = "button";
      button.className = "theme-card";
      button.title = theme.name;
      button.setAttribute("aria-pressed", String(selectedFileName === "酒馆内的美化" && selectedTheme?.name === theme.name));
      const name = getHostDocument().createElement("span");
      name.className = "theme-name";
      name.textContent = theme.name;
      button.append(createThemeThumbnail(theme), name);
      button.addEventListener("click", () => {
        if (busy) return;
        selectedTheme = JSON.parse(JSON.stringify(theme));
        selectedFileName = "酒馆内的美化";
        for (const card of library.querySelectorAll(".theme-card")) card.setAttribute("aria-pressed", String(card === button));
        syncPanelFromState(root);
        setPanelStatus(root, `已选择「${theme.name}」。生成时会创建独立的 TT 适配副本。`, "success");
      });
      library.append(button);
    }
  }
  function openPanel(preferredDocument = null) {
    const preferredIsDocument = Boolean(preferredDocument?.createElement && preferredDocument?.body);
    const doc = preferredIsDocument ? preferredDocument : getHostDocument();
    const hostWin = doc?.defaultView || resolveHostWindow();
    if (!doc?.body) return;
    const existing = doc.getElementById(OVERLAY_HOST_ID);
    if (existing) {
      existing.style.setProperty("display", "block", "important");
      panelHost = existing;
      return;
    }
    const host = doc.createElement("div");
    host.id = OVERLAY_HOST_ID;
    host.style.cssText = "position:fixed!important;inset:0!important;z-index:2147483647!important;display:block!important;width:100%!important;height:100%!important;margin:0!important;padding:0!important;";
    const root = host.attachShadow({ mode: "open" });
    const style = doc.createElement("style");
    style.textContent = studio_default;
    root.appendChild(style);
    const shell = doc.createElement("div");
    shell.innerHTML = panelMarkup(isTauriTavern(hostWin));
    while (shell.firstChild) root.appendChild(shell.firstChild);
    doc.body.appendChild(host);
    panelHost = host;
    previousFocus = doc.activeElement;
    syncPanelFromState(root);
    if (selectedTheme) setPanelStatus(root, `已选择「${selectedTheme.name}」，可以继续调整或生成适配副本。`);
    if (selectedFileName && selectedFileName !== "酒馆内的美化") showSource(root, "upload");
    refreshLibrary(root);
    for (const tab of root.querySelectorAll("[data-source]")) {
      tab.addEventListener("click", () => showSource(root, tab.dataset.source));
      tab.addEventListener("keydown", (event) => {
        if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
        event.preventDefault();
        const source = event.key === "Home" ? "installed" : event.key === "End" ? "upload" : tab.dataset.source === "installed" ? "upload" : "installed";
        showSource(root, source);
        root.querySelector(`[data-source="${source}"]`).focus();
      });
    }
    root.querySelector(".refresh").addEventListener("click", () => refreshLibrary(root));
    root.querySelector(".batch-delete").addEventListener("click", async () => {
      const visibleThemes = root.__visibleThemes || root.__installedThemes || [];
      if (!visibleThemes.length) {
        setPanelStatus(root, "当前没有可删除的美化。", "error");
        return;
      }
      const names = visibleThemes.map((theme) => theme.name);
      const preview = names.length > 6 ? `${names.slice(0, 6).join("、")} 等 ${names.length} 款` : names.join("、");
      if (!resolveHostWindow().confirm(`确定彻底删除当前列表中的 ${names.length} 款美化吗？

${preview}

删除后无法恢复。`)) return;
      busy = true;
      setPanelActions(root, false);
      setPanelStatus(root, `正在删除 ${names.length} 款美化…`);
      try {
        const count = await deleteInstalledThemes(resolveHostWindow(), names);
        selectedTheme = null;
        selectedFileName = "";
        setPanelStatus(root, `已彻底删除 ${count} 款美化，并已核对酒馆列表。`, "success");
        await refreshLibrary(root);
      } catch (error) {
        setPanelStatus(root, `批量删除失败：${error?.message || error}`, "error");
      } finally {
        busy = false;
        setPanelActions(root, Boolean(selectedTheme));
      }
    });
    const searchToggle = root.querySelector(".search-toggle");
    const searchPanel = root.querySelector(".theme-search");
    const searchInput = root.querySelector(".search-input");
    searchToggle.addEventListener("click", () => {
      const expanded = searchToggle.getAttribute("aria-expanded") === "true";
      searchToggle.setAttribute("aria-expanded", String(!expanded));
      searchPanel.hidden = expanded;
      if (!expanded) searchInput.focus();
      else {
        searchInput.value = "";
        renderThemeCards(root, root.__installedThemes || []);
      }
    });
    searchInput.addEventListener("input", () => {
      const query = searchInput.value.trim().toLocaleLowerCase();
      renderThemeCards(root, (root.__installedThemes || []).filter((theme) => theme.name.toLocaleLowerCase().includes(query)));
      root.querySelector(".library-count").textContent = query ? `${root.querySelectorAll(".theme-card").length} 款匹配美化` : `${(root.__installedThemes || []).length} 款已导入的美化`;
    });
    const input = root.querySelector(".file-input");
    root.querySelector(".choose")?.addEventListener("click", () => input?.click());
    const dropzone = root.querySelector(".choose");
    for (const type of ["dragover", "dragleave", "drop"]) dropzone.addEventListener(type, (event) => {
      event.preventDefault();
      dropzone.classList.toggle("dragover", type === "dragover");
      if (type === "drop") handleSelectedFile(root, event.dataTransfer?.files?.[0]);
    });
    input?.addEventListener("change", async () => {
      await handleSelectedFile(root, input.files?.[0]);
      input.value = "";
    });
    for (const optionInput of root.querySelectorAll("[data-option]")) {
      optionInput.addEventListener("change", () => {
        options = { ...options, [optionInput.dataset.option]: optionInput.checked };
        saveOptions();
        applyRuntimeCompatibility();
        if (selectedTheme) renderRisks(root, analyzeCss(selectedTheme.custom_css));
      });
    }
    root.querySelector(".import-apply")?.addEventListener("click", async () => {
      if (busy) return;
      busy = true;
      setPanelActions(root, false);
      try {
        const adapted = makeAdaptedTheme();
        setPanelStatus(root, `正在通过酒馆原生流程导入：${adapted.name}…`, "info");
        host.style.setProperty("visibility", "hidden", "important");
        await importAndApplyTheme(adapted);
        if (!await verifySavedTheme(hostWin, adapted)) throw new Error("界面已应用，但未核实副本保存，请检查酒馆连接或下载备份。");
        setPanelStatus(root, `已导入并应用「${adapted.name}」，已核实副本保存。`, "success");
        notify("success", adapted.name, "TT 适配主题已应用");
      } catch (error) {
        console.error("[BeautifyStudio] 主题导入或应用失败。", error);
        setPanelStatus(root, `导入失败：${error?.message || error}`, "error");
      } finally {
        host.style.removeProperty("visibility");
        busy = false;
        setPanelActions(root, Boolean(selectedTheme));
        refreshLibrary(root);
        root.querySelector(".import-apply")?.focus();
      }
    });
    root.querySelector(".batch-import")?.addEventListener("click", async () => {
      try {
        await batchImportThemes(root);
      } catch (error) {
        busy = false;
        setPanelActions(root, Boolean(selectedTheme));
        setPanelStatus(root, `批量导入失败：${error?.message || error}`, "error");
      }
    });
    root.querySelector(".download")?.addEventListener("click", () => {
      try {
        const adapted = makeAdaptedTheme();
        downloadTheme(adapted);
        setPanelStatus(root, `已生成下载：${adapted.name}.json`, "success");
        notify("success", adapted.name, "已生成 TT 适配版");
      } catch (error) {
        setPanelStatus(root, `生成失败：${error?.message || error}`, "error");
      }
    });
    root.querySelector(".diagnose")?.addEventListener("click", () => {
      try {
        const data = downloadLayoutDiagnostic(resolveHostWindow());
        const pins = data.chat_embedded_styles.count;
        setPanelStatus(root, `布局诊断已下载。当前主题：${data.selected_theme || "未识别"}；聊天内嵌样式：${pins} 个。`, "success");
      } catch (error) {
        console.error("[BeautifyStudio] 布局诊断生成失败。", error);
        setPanelStatus(root, `诊断生成失败：${error?.message || error}`, "error");
      }
    });
    root.querySelector(".close-x")?.addEventListener("click", closePanel);
    root.querySelector(".backdrop")?.addEventListener("click", (event) => {
      if (event.target === event.currentTarget) closePanel();
    });
    root.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closePanel();
      if (event.key === "Tab") {
        const focusable = [...root.querySelectorAll('button:not(:disabled),input:not(:disabled),[tabindex="0"]')].filter((el) => el.getClientRects().length && el.tabIndex >= 0);
        const first = focusable[0], last = focusable.at(-1);
        if (event.shiftKey && root.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && root.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    });
    root.querySelector(".close-x")?.focus();
  }
  function findStandardWandButton(menu) {
    try {
      return Array.from(menu.querySelectorAll('div, button, [role="button"]')).find(
        (node) => node.id !== WAND_ENTRY_ID && String(node.textContent || "").trim() === BUTTON_NAME
      ) || null;
    } catch (_) {
      return null;
    }
  }
  function ensureWandEntry(doc) {
    if (!doc?.body) return;
    const menu = doc.getElementById?.("extensionsMenu");
    if (!menu) return;
    let entry = doc.getElementById?.(WAND_ENTRY_ID);
    if (findStandardWandButton(menu)) {
      entry?.remove?.();
      return;
    }
    if (!entry) {
      entry = doc.createElement("div");
      entry.id = WAND_ENTRY_ID;
      entry.setAttribute("role", "button");
      entry.setAttribute("tabindex", "0");
      entry.title = "打开 美化工作室";
      entry.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i><span>美化工作室</span>';
      const activate = (event) => {
        event?.preventDefault?.();
        event?.stopPropagation?.();
        try {
          menu.style.display = "none";
        } catch (_) {
        }
        openPanel(doc);
      };
      entry.addEventListener("click", activate);
      entry.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") activate(event);
      });
      menu.prepend(entry);
    } else if (entry.parentElement !== menu) {
      menu.prepend(entry);
    }
    const menuButton = doc.getElementById?.("extensionsMenuButton");
    if (menuButton && menuButton.style.display === "none") menuButton.style.display = "flex";
  }
  function startWandEntries() {
    for (const doc of collectRuntimeDocuments()) {
      const boot = () => {
        ensureWandEntry(doc);
        if (!doc.body) return;
        const ViewMutationObserver = doc.defaultView?.MutationObserver || globalThis.MutationObserver;
        let observer = null;
        if (typeof ViewMutationObserver === "function") {
          observer = new ViewMutationObserver(() => ensureWandEntry(doc));
          observer.observe(doc.body, { childList: true, subtree: true });
        }
        const setIntervalFn = doc.defaultView?.setInterval?.bind(doc.defaultView) || setInterval;
        const clearIntervalFn = doc.defaultView?.clearInterval?.bind(doc.defaultView) || clearInterval;
        const timer = setIntervalFn(() => ensureWandEntry(doc), 1200);
        wandRegistrations.push({ doc, observer, timer, clearIntervalFn });
      };
      if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", boot, { once: true });
      else boot();
    }
  }
  function cleanup() {
    busy = false;
    closePanel();
    try {
      getHostDocument()?.getElementById?.(RUNTIME_STYLE_ID)?.remove();
    } catch (_) {
    }
    try {
      getHostDocument()?.documentElement?.classList?.remove?.(TAURI_ROOT_CLASS);
    } catch (_) {
    }
    for (const registration of runtimeInteractionRegistrations.splice(0)) {
      try {
        registration.doc.removeEventListener?.("pointerdown", registration.onPress, true);
      } catch (_) {
      }
      try {
        registration.doc.removeEventListener?.("touchstart", registration.onPress, true);
      } catch (_) {
      }
      try {
        registration.doc.removeEventListener?.("focusin", registration.onFocusIn, true);
      } catch (_) {
      }
      try {
        for (const shell of registration.doc.querySelectorAll?.(`#form_sheld.${COMPOSER_OPEN_CLASS}`) || []) {
          shell.classList?.remove?.(COMPOSER_OPEN_CLASS);
        }
      } catch (_) {
      }
    }
    for (const registration of wandRegistrations.splice(0)) {
      try {
        registration.observer?.disconnect?.();
      } catch (_) {
      }
      try {
        registration.clearIntervalFn?.(registration.timer);
      } catch (_) {
      }
      try {
        registration.doc?.getElementById?.(WAND_ENTRY_ID)?.remove?.();
      } catch (_) {
      }
    }
  }
  function start() {
    startWandEntries();
    if (typeof appendInexistentScriptButtons === "function") {
      appendInexistentScriptButtons([{ name: BUTTON_NAME, visible: true }]);
    }
    if (typeof eventOn === "function" && typeof getButtonEvent === "function") {
      eventOn(getButtonEvent(BUTTON_NAME), openPanel);
    } else {
      console.error("[BeautifyStudio] 没有找到酒馆助手按钮接口。");
    }
    try {
      applyRuntimeCompatibility();
      startComposerInteractions();
    } catch (error) {
      console.warn("[BeautifyStudio] 运行时兼容暂未完全启用，但魔法棒入口仍可使用。", error);
    }
    window.addEventListener?.("beforeunload", cleanup, { once: true });
    console.info(`[BeautifyStudio] v${VERSION} 已加载。`);
  }
  try {
    start();
  } catch (error) {
    console.error("[BeautifyStudio] 启动失败。", error);
  }
})();
