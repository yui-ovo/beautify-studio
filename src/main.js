import { downloadLayoutDiagnostic } from './host/diagnostics.js';
import { VERSION, BUTTON_NAME, STORAGE_KEY, OVERLAY_HOST_ID, RUNTIME_STYLE_ID, WAND_ENTRY_ID, TAURI_ROOT_CLASS, COMPOSER_OPEN_CLASS, DEFAULT_OPTIONS, PATCH_START } from './config.js';
import { adaptTheme, analyzeCss } from './core/adapter.js';
import { validateTheme } from './core/validation.js';
import { readInstalledThemes, verifySavedTheme } from './host/themes.js';
import { panelMarkup } from './ui/markup.js';
import PANEL_CSS from './ui/studio.css';
let selectedTheme = null;
let selectedFileName = '';
let panelHost = null;
let previousFocus = null;
let busy = false;
const wandRegistrations = [];
const runtimeInteractionRegistrations = [];
function resolveHostWindow() {
  const candidates = [];
  for (const candidate of [window.parent, window.top, window]) {
    if (!candidate || candidates.includes(candidate)) continue;
    candidates.push(candidate);
  }

  for (const candidate of candidates) {
    try {
      const doc = candidate.document;
      if (doc?.querySelector?.('#sheld, #chat, #extensions_settings2, #extensions_settings')) {
        return candidate;
      }
    } catch (_) {}
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
      hostWin.__TAURITAVERN__
      || hostWin.__TAURI_INTERNALS__
      || hostWin.document?.getElementById?.('ttas_agent_send_toggle')
      || /Tauri/i.test(hostWin.navigator?.userAgent || '')
    );
  } catch (_) {
    return false;
  }
}

function loadOptions() {
  try {
    const hostWin = resolveHostWindow();
    const stored = JSON.parse(hostWin.localStorage?.getItem(STORAGE_KEY) || '{}');
    return Object.fromEntries(Object.entries(DEFAULT_OPTIONS).map(([key, fallback]) => [key, typeof stored[key] === 'boolean' ? stored[key] : fallback]));
  } catch (error) {
    console.warn('[BeautifyStudio] 无法读取设置，使用默认值。', error);
    return { ...DEFAULT_OPTIONS };
  }
}

let options = loadOptions();

function saveOptions() {
  try {
    resolveHostWindow().localStorage?.setItem(STORAGE_KEY, JSON.stringify(options));
  } catch (error) {
    console.warn('[BeautifyStudio] 无法保存设置。', error);
  }
}

function buildRuntimePreferenceCss(settings = {}) {
  const rules = [
    `/* 美化工作室 v${VERSION}: runtime preferences only; TT keeps ownership of layout. */`,
  ];
  if (settings.hideImpersonate) {
    rules.push('html body #mes_impersonate#mes_impersonate { display: none !important; }');
  }
  return rules.join('\n');
}

function applyRuntimeCompatibility() {
  const hostWin = resolveHostWindow();
  const doc = hostWin.document;
  if (!doc?.head) return;
  doc.documentElement?.classList?.toggle?.(TAURI_ROOT_CLASS, isTauriTavern(hostWin));

  let style = doc.getElementById(RUNTIME_STYLE_ID);
  if (!style) {
    style = doc.createElement('style');
    style.id = RUNTIME_STYLE_ID;
    doc.head.appendChild(style);
  }

  const nextCss = buildRuntimePreferenceCss(options);
  if (style.textContent !== nextCss) style.textContent = nextCss;
}

function findComposerShell(doc, target) {
  try {
    const closest = target?.closest?.('#form_sheld');
    if (closest) return closest;
    const shell = doc?.getElementById?.('form_sheld');
    return shell?.contains?.(target) ? shell : null;
  } catch (_) {
    return null;
  }
}

function startComposerInteractions() {
  for (const doc of collectRuntimeDocuments()) {
    if (typeof doc?.addEventListener !== 'function') continue;

    const open = shell => {
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
    const onPress = event => {
      const shell = findComposerShell(doc, event?.target);
      if (shell) open(shell);
      else close();
    };
    const onFocusIn = event => {
      const shell = findComposerShell(doc, event?.target);
      if (shell) open(shell);
    };

    doc.addEventListener('pointerdown', onPress, true);
    doc.addEventListener('touchstart', onPress, true);
    doc.addEventListener('focusin', onFocusIn, true);
    runtimeInteractionRegistrations.push({ doc, onPress, onFocusIn });
  }
}

function notify(kind, message, title = '美化工作室') {
  try {
    const toast = resolveHostWindow().toastr;
    if (typeof toast?.[kind] === 'function') toast[kind](message, title);
  } catch (_) {}
}

function getThemeSelect(doc = getHostDocument()) {
  return doc?.getElementById?.('themes') || null;
}

function getUniqueThemeName(baseName) {
  const select = getThemeSelect();
  if (!select?.options) return baseName;
  const names = new Set(Array.from(select.options, option => String(option.value || option.textContent || '')));
  if (!names.has(baseName)) return baseName;

  let index = 2;
  while (names.has(`${baseName} (${index})`)) index += 1;
  return `${baseName} (${index})`;
}

function makeAdaptedTheme() {
  if (!selectedTheme) throw new Error('请先选择一个美化 JSON。');
  const adapted = adaptTheme(selectedTheme, options);
  adapted.name = getUniqueThemeName(adapted.name);
  return adapted;
}

function safeFileName(name) {
  return String(name || 'TT适配主题').replace(/[\\/:*?"<>|]/g, '_').trim() || 'TT适配主题';
}

function createThemeFile(theme) {
  const hostWin = resolveHostWindow();
  return new hostWin.File(
    [JSON.stringify(theme, null, 4)],
    `${safeFileName(theme.name)}.json`,
    { type: 'application/json' },
  );
}

function readFileText(file) {
  if (typeof file?.text === 'function') return file.text();
  const hostWin = resolveHostWindow();
  return new Promise((resolve, reject) => {
    const reader = new hostWin.FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(reader.error || new Error('读取文件失败。'));
    reader.readAsText(file);
  });
}

function downloadTheme(theme) {
  const hostWin = resolveHostWindow();
  const doc = hostWin.document;
  const file = createThemeFile(theme);
  const url = hostWin.URL.createObjectURL(file);
  const anchor = doc.createElement('a');
  anchor.href = url;
  anchor.download = file.name;
  anchor.style.cssText = 'display:none!important';
  doc.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  hostWin.setTimeout(() => hostWin.URL.revokeObjectURL(url), 2000);
}

function delayInHost(hostWin, milliseconds) {
  return new Promise(resolve => hostWin.setTimeout(resolve, milliseconds));
}

async function waitForHostCondition(hostWin, predicate, timeout = 10000, interval = 100) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeout) {
    const value = predicate();
    if (value) return value;
    await delayInHost(hostWin, interval);
  }
  throw new Error('等待酒馆完成主题操作超时。');
}

function assignFileToNativeInput(hostWin, input, file) {
  if (typeof hostWin.DataTransfer === 'function') {
    const transfer = new hostWin.DataTransfer();
    transfer.items.add(file);
    input.files = transfer.files;
    return;
  }
  Object.defineProperty(input, 'files', {
    configurable: true,
    value: Object.freeze([file]),
  });
}

async function importAndApplyTheme(theme) {
  const hostWin = resolveHostWindow();
  const doc = hostWin.document;
  const nativeInput = doc.getElementById('ui_preset_import_file');
  const themeSelect = getThemeSelect(doc);
  if (!nativeInput || !themeSelect) {
    throw new Error('没有找到酒馆原生主题导入控件，请打开一次“用户设置 → UI主题”后重试。');
  }

  const file = createThemeFile(theme);
  assignFileToNativeInput(hostWin, nativeInput, file);
  const EventCtor = hostWin.Event || Event;
  nativeInput.dispatchEvent(new EventCtor('change', { bubbles: true }));

  await waitForHostCondition(hostWin, () => Array.from(themeSelect.options || [])
    .some(option => String(option.value || option.textContent || '') === theme.name), 120000);

  themeSelect.value = theme.name;
  const hostJquery = hostWin.jQuery || hostWin.$;
  if (typeof hostJquery === 'function') {
    hostJquery(themeSelect).val(theme.name).trigger('change');
  } else {
    themeSelect.dispatchEvent(new EventCtor('change', { bubbles: true }));
  }

  await waitForHostCondition(hostWin, () => {
    const selected = String(themeSelect.value || '');
    const css = String(doc.getElementById('custom-style')?.textContent || '');
    return selected === theme.name && css.includes(PATCH_START);
  });

  /* SillyTavern saves settings with a one-second debounce. Do not report success
     until that native save window has elapsed, or chat navigation can restore the previous theme. */
  await delayInHost(hostWin, 1400);
  if (String(themeSelect.value || '') !== theme.name) {
    throw new Error('主题导入后未保持选中，请重试。');
  }
  return theme;
}

function setPanelStatus(root, text, kind = 'info') {
  const status = root.querySelector('.status');
  if (!status) return;
  status.textContent = text;
  status.dataset.kind = kind;
}

function setPanelActions(root, enabled) {
  for (const button of root.querySelectorAll('.needs-theme')) button.disabled = !enabled || busy;
  for (const control of root.querySelectorAll('.theme-card, [data-source], [data-option], .choose, .refresh')) control.disabled = busy;
  if (!getThemeSelect() || !getHostDocument().getElementById('ui_preset_import_file')) root.querySelector('.import-apply').disabled = true;
}

function renderRisks(root, risks) {
  const report = root.querySelector('.report');
  if (!report) return;
  report.replaceChildren();
  root.querySelector('.check-count').textContent = risks.length ? `${risks.length} 项建议` : '检查完成';

  const list = risks.length ? risks : [{
    level: 'ok',
    label: '没有发现常见冲突',
    detail: '仍会写入通用 TT 兼容层，导入后请实际查看一次。',
    count: 0,
  }];

  for (const risk of list) {
    const item = getHostDocument().createElement('div');
    item.className = 'risk';
    item.dataset.level = risk.level;
    const title = getHostDocument().createElement('b');
    title.textContent = risk.count ? `${risk.label} × ${risk.count}` : risk.label;
    const detail = getHostDocument().createElement('span');
    detail.textContent = risk.detail;
    item.append(title, detail);
    report.appendChild(item);
  }
}

function syncPanelFromState(root) {
  for (const input of root.querySelectorAll('[data-option]')) {
    input.checked = Boolean(options[input.dataset.option]);
  }
  const filename = root.querySelector('.filename');
  if (filename) {
    filename.textContent = selectedTheme
      ? selectedTheme.name
      : '还没有选择美化';
    filename.title = selectedFileName;
  }
  setPanelActions(root, Boolean(selectedTheme));
  if (selectedTheme) renderRisks(root, analyzeCss(selectedTheme.custom_css));
}

function closePanel() {
  if (busy) return;
  try { panelHost?.remove(); } catch (_) {}
  panelHost = null;
  previousFocus?.focus?.();
}

async function handleSelectedFile(root, file) {
  if (!file || busy) return;
  try {
    if (file.size > 10 * 1024 * 1024) throw new Error('文件超过 10 MB，请选择较小的 UI 美化文件。');
    const parsed = JSON.parse(await readFileText(file));
    validateTheme(parsed);
    selectedTheme = parsed;
    selectedFileName = file.name || '';
    for (const card of root.querySelectorAll('.theme-card')) card.setAttribute('aria-pressed', 'false');
    syncPanelFromState(root);
    renderRisks(root, analyzeCss(parsed.custom_css));
    const cssLength = typeof parsed.custom_css === 'string' ? parsed.custom_css.length : 0;
    setPanelStatus(root, `已读取：${parsed.name}（自定义 CSS ${cssLength.toLocaleString()} 字符）`, 'success');
  } catch (error) {
    selectedTheme = null;
    selectedFileName = '';
    syncPanelFromState(root);
    renderRisks(root, [{ level: 'high', label: '读取失败', detail: String(error?.message || error), count: 0 }]);
    setPanelStatus(root, `读取失败：${error?.message || error}`, 'error');
  }
}

function showSource(root, source) {
  for (const tab of root.querySelectorAll('[data-source]')) {
    const active = tab.dataset.source === source;
    tab.setAttribute('aria-selected', String(active));
    tab.tabIndex = active ? 0 : -1;
    root.querySelector(`#source-${tab.dataset.source}`).hidden = !active;
  }
}

async function refreshLibrary(root) {
  const library = root.querySelector('.library');
  const refresh = root.querySelector('.refresh');
  refresh.disabled = true;
  root.querySelector('.library-count').textContent = '正在读取美化…';
  library.setAttribute('aria-busy', 'true');
  library.replaceChildren();
  try {
    const themes = await readInstalledThemes(resolveHostWindow());
    root.querySelector('.library-count').textContent = `${themes.length} 款已导入的美化`;
    if (!themes.length) throw new Error('酒馆还没有已导入的美化，可以先上传一个 JSON。');
    root.__installedThemes = themes;
    renderThemeCards(root, themes);
  } catch (error) {
    root.querySelector('.library-count').textContent = '暂无可用美化';
    const empty = getHostDocument().createElement('div');
    empty.className = 'library-empty';
    const heading = getHostDocument().createElement('strong');
    heading.textContent = '从你喜欢的美化开始';
    const detail = getHostDocument().createElement('span');
    detail.textContent = error.name === 'AbortError' ? '读取超时，请刷新列表或上传 JSON。' : error.message;
    empty.append(heading, detail);
    library.append(empty);
  } finally { refresh.disabled = busy; library.removeAttribute('aria-busy'); }
}

function safeColor(theme, keys, fallback) {
  const css = resolveHostWindow().CSS;
  for (const key of keys) {
    const value = String(theme?.[key] || '').trim();
    if (value && css?.supports?.('color', value)) return value;
  }
  return fallback;
}

function createThemeThumbnail(theme) {
  const thumbnail = getHostDocument().createElement('div');
  thumbnail.className = 'theme-thumbnail';
  thumbnail.setAttribute('aria-hidden', 'true');
  thumbnail.style.setProperty('--theme-bg', safeColor(theme, ['chat_tint_color', 'blur_tint_color'], '#d5d7d8'));
  thumbnail.style.setProperty('--theme-text', safeColor(theme, ['main_text_color'], '#373a3c'));
  thumbnail.style.setProperty('--theme-user', safeColor(theme, ['user_mes_blur_tint_color', 'blur_tint_color'], '#aeb4b8'));
  thumbnail.style.setProperty('--theme-bot', safeColor(theme, ['bot_mes_blur_tint_color', 'blur_tint_color'], '#f0f1f1'));
  thumbnail.innerHTML = '<span class="preview-topbar"></span><span class="preview-avatar"></span><span class="preview-message preview-message-user"></span><span class="preview-message preview-message-bot"></span><span class="preview-composer"></span>';
  return thumbnail;
}

function renderThemeCards(root, themes) {
  const library = root.querySelector('.library');
  library.replaceChildren();
  if (!themes.length) {
    const empty = getHostDocument().createElement('div'); empty.className = 'library-empty'; empty.textContent = '没有找到对应美化'; library.append(empty); return;
  }
  for (const theme of themes) {
    const button = getHostDocument().createElement('button');
    button.type = 'button'; button.className = 'theme-card'; button.title = theme.name;
    button.setAttribute('aria-pressed', String(selectedFileName === '酒馆内的美化' && selectedTheme?.name === theme.name));
    const name = getHostDocument().createElement('span'); name.className = 'theme-name'; name.textContent = theme.name;
    button.append(createThemeThumbnail(theme), name);
    button.addEventListener('click', () => {
      if (busy) return;
      selectedTheme = JSON.parse(JSON.stringify(theme)); selectedFileName = '酒馆内的美化';
      for (const card of library.querySelectorAll('.theme-card')) card.setAttribute('aria-pressed', String(card === button));
      syncPanelFromState(root); setPanelStatus(root, `已选择「${theme.name}」。生成时会创建独立的 TT 适配副本。`, 'success');
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
    existing.style.setProperty('display', 'block', 'important');
    panelHost = existing;
    return;
  }

  const host = doc.createElement('div');
  host.id = OVERLAY_HOST_ID;
  host.style.cssText = 'position:fixed!important;inset:0!important;z-index:2147483647!important;display:block!important;width:100%!important;height:100%!important;margin:0!important;padding:0!important;';
  const root = host.attachShadow({ mode: 'open' });
  const style = doc.createElement('style');
  style.textContent = PANEL_CSS;
  root.appendChild(style);
  const shell = doc.createElement('div');
  shell.innerHTML = panelMarkup(isTauriTavern(hostWin));
  while (shell.firstChild) root.appendChild(shell.firstChild);
  doc.body.appendChild(host);
  panelHost = host;
  previousFocus = doc.activeElement;

  syncPanelFromState(root);
  if (selectedTheme) setPanelStatus(root, `已选择「${selectedTheme.name}」，可以继续调整或生成适配副本。`);
  if (selectedFileName && selectedFileName !== '酒馆内的美化') showSource(root, 'upload');
  refreshLibrary(root);
  for (const tab of root.querySelectorAll('[data-source]')) {
    tab.addEventListener('click', () => showSource(root, tab.dataset.source));
    tab.addEventListener('keydown', event => {
      if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
      event.preventDefault();
      const source = event.key === 'Home' ? 'installed' : event.key === 'End' ? 'upload' : tab.dataset.source === 'installed' ? 'upload' : 'installed';
      showSource(root, source);
      root.querySelector(`[data-source="${source}"]`).focus();
    });
  }
  root.querySelector('.refresh').addEventListener('click', () => refreshLibrary(root));
  const searchToggle = root.querySelector('.search-toggle');
  const searchPanel = root.querySelector('.theme-search');
  const searchInput = root.querySelector('.search-input');
  searchToggle.addEventListener('click', () => {
    const expanded = searchToggle.getAttribute('aria-expanded') === 'true';
    searchToggle.setAttribute('aria-expanded', String(!expanded)); searchPanel.hidden = expanded;
    if (!expanded) searchInput.focus(); else { searchInput.value = ''; renderThemeCards(root, root.__installedThemes || []); }
  });
  searchInput.addEventListener('input', () => {
    const query = searchInput.value.trim().toLocaleLowerCase();
    renderThemeCards(root, (root.__installedThemes || []).filter(theme => theme.name.toLocaleLowerCase().includes(query)));
    root.querySelector('.library-count').textContent = query ? `${root.querySelectorAll('.theme-card').length} 款匹配美化` : `${(root.__installedThemes || []).length} 款已导入的美化`;
  });
  const input = root.querySelector('.file-input');
  root.querySelector('.choose')?.addEventListener('click', () => input?.click());
  const dropzone = root.querySelector('.choose');
  for (const type of ['dragover','dragleave','drop']) dropzone.addEventListener(type, event => {
    event.preventDefault();
    dropzone.classList.toggle('dragover', type === 'dragover');
    if (type === 'drop') handleSelectedFile(root, event.dataTransfer?.files?.[0]);
  });
  input?.addEventListener('change', async () => {
    await handleSelectedFile(root, input.files?.[0]);
    input.value = '';
  });

  for (const optionInput of root.querySelectorAll('[data-option]')) {
    optionInput.addEventListener('change', () => {
      options = { ...options, [optionInput.dataset.option]: optionInput.checked };
      saveOptions();
      applyRuntimeCompatibility();
      if (selectedTheme) renderRisks(root, analyzeCss(selectedTheme.custom_css));
    });
  }

  root.querySelector('.import-apply')?.addEventListener('click', async () => {
    if (busy) return;
    busy = true;
    setPanelActions(root, false);
    try {
      const adapted = makeAdaptedTheme();
      setPanelStatus(root, `正在通过酒馆原生流程导入：${adapted.name}…`, 'info');
      // Let native confirmation dialogs (e.g. CSS @import) remain accessible.
      host.style.setProperty('visibility', 'hidden', 'important');
      await importAndApplyTheme(adapted);
      if (!await verifySavedTheme(hostWin, adapted)) throw new Error('界面已应用，但未核实副本保存，请检查酒馆连接或下载备份。');
      setPanelStatus(root, `已导入并应用「${adapted.name}」，已核实副本保存。`, 'success');
      notify('success', adapted.name, 'TT 适配主题已应用');
    } catch (error) {
      console.error('[BeautifyStudio] 主题导入或应用失败。', error);
      setPanelStatus(root, `导入失败：${error?.message || error}`, 'error');
    } finally {
      host.style.removeProperty('visibility');
      busy = false;
      setPanelActions(root, Boolean(selectedTheme));
      refreshLibrary(root);
      root.querySelector('.import-apply')?.focus();
    }
  });

  root.querySelector('.download')?.addEventListener('click', () => {
    try {
      const adapted = makeAdaptedTheme();
      downloadTheme(adapted);
      setPanelStatus(root, `已生成下载：${adapted.name}.json`, 'success');
      notify('success', adapted.name, '已生成 TT 适配版');
    } catch (error) {
      setPanelStatus(root, `生成失败：${error?.message || error}`, 'error');
    }
  });

  root.querySelector('.diagnose')?.addEventListener('click', () => {
    try {
      const data = downloadLayoutDiagnostic(resolveHostWindow());
      const pins = data.chat_embedded_styles.count;
      setPanelStatus(root, `布局诊断已下载。当前主题：${data.selected_theme || '未识别'}；聊天内嵌样式：${pins} 个。`, 'success');
    } catch (error) {
      console.error('[BeautifyStudio] 布局诊断生成失败。', error);
      setPanelStatus(root, `诊断生成失败：${error?.message || error}`, 'error');
    }
  });

  root.querySelector('.close-x')?.addEventListener('click', closePanel);
  root.querySelector('.backdrop')?.addEventListener('click', event => {
    if (event.target === event.currentTarget) closePanel();
  });
  root.addEventListener('keydown', event => {
    if (event.key === 'Escape') closePanel();
    if (event.key === 'Tab') {
      const focusable = [...root.querySelectorAll('button:not(:disabled),input:not(:disabled),[tabindex="0"]')].filter(el => el.getClientRects().length && el.tabIndex >= 0);
      const first = focusable[0], last = focusable.at(-1);
      if (event.shiftKey && root.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && root.activeElement === last) { event.preventDefault(); first?.focus(); }
    }
  });
  root.querySelector('.close-x')?.focus();
}

function findStandardWandButton(menu) {
  try {
    return Array.from(menu.querySelectorAll('div, button, [role="button"]')).find(node =>
      node.id !== WAND_ENTRY_ID && String(node.textContent || '').trim() === BUTTON_NAME
    ) || null;
  } catch (_) {
    return null;
  }
}

function ensureWandEntry(doc) {
  if (!doc?.body) return;
  const menu = doc.getElementById?.('extensionsMenu');
  if (!menu) return;

  let entry = doc.getElementById?.(WAND_ENTRY_ID);
  if (findStandardWandButton(menu)) {
    entry?.remove?.();
    return;
  }

  if (!entry) {
    entry = doc.createElement('div');
    entry.id = WAND_ENTRY_ID;
    entry.setAttribute('role', 'button');
    entry.setAttribute('tabindex', '0');
    entry.title = '打开 美化工作室';
    entry.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i><span>美化工作室</span>';
    const activate = event => {
      event?.preventDefault?.();
      event?.stopPropagation?.();
      try { menu.style.display = 'none'; } catch (_) {}
      openPanel(doc);
    };
    entry.addEventListener('click', activate);
    entry.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') activate(event);
    });
    menu.prepend(entry);
  } else if (entry.parentElement !== menu) {
    menu.prepend(entry);
  }

  const menuButton = doc.getElementById?.('extensionsMenuButton');
  if (menuButton && menuButton.style.display === 'none') menuButton.style.display = 'flex';
}

function startWandEntries() {
  for (const doc of collectRuntimeDocuments()) {
    const boot = () => {
      ensureWandEntry(doc);
      if (!doc.body) return;
      const ViewMutationObserver = doc.defaultView?.MutationObserver || globalThis.MutationObserver;
      let observer = null;
      if (typeof ViewMutationObserver === 'function') {
        observer = new ViewMutationObserver(() => ensureWandEntry(doc));
        observer.observe(doc.body, { childList: true, subtree: true });
      }
      const setIntervalFn = doc.defaultView?.setInterval?.bind(doc.defaultView) || setInterval;
      const clearIntervalFn = doc.defaultView?.clearInterval?.bind(doc.defaultView) || clearInterval;
      const timer = setIntervalFn(() => ensureWandEntry(doc), 1200);
      wandRegistrations.push({ doc, observer, timer, clearIntervalFn });
    };
    if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', boot, { once: true });
    else boot();
  }
}

function cleanup() {
  busy = false;
  closePanel();
  try { getHostDocument()?.getElementById?.(RUNTIME_STYLE_ID)?.remove(); } catch (_) {}
  try { getHostDocument()?.documentElement?.classList?.remove?.(TAURI_ROOT_CLASS); } catch (_) {}
  for (const registration of runtimeInteractionRegistrations.splice(0)) {
    try { registration.doc.removeEventListener?.('pointerdown', registration.onPress, true); } catch (_) {}
    try { registration.doc.removeEventListener?.('touchstart', registration.onPress, true); } catch (_) {}
    try { registration.doc.removeEventListener?.('focusin', registration.onFocusIn, true); } catch (_) {}
    try {
      for (const shell of registration.doc.querySelectorAll?.(`#form_sheld.${COMPOSER_OPEN_CLASS}`) || []) {
        shell.classList?.remove?.(COMPOSER_OPEN_CLASS);
      }
    } catch (_) {}
  }
  for (const registration of wandRegistrations.splice(0)) {
    try { registration.observer?.disconnect?.(); } catch (_) {}
    try { registration.clearIntervalFn?.(registration.timer); } catch (_) {}
    try { registration.doc?.getElementById?.(WAND_ENTRY_ID)?.remove?.(); } catch (_) {}
  }
}

function start() {
  /* Register the visible entry first, so a later compatibility error cannot hide the launcher. */
  startWandEntries();

  if (typeof appendInexistentScriptButtons === 'function') {
    appendInexistentScriptButtons([{ name: BUTTON_NAME, visible: true }]);
  }
  if (typeof eventOn === 'function' && typeof getButtonEvent === 'function') {
    eventOn(getButtonEvent(BUTTON_NAME), openPanel);
  } else {
    console.error('[BeautifyStudio] 没有找到酒馆助手按钮接口。');
  }

  try {
    applyRuntimeCompatibility();
    startComposerInteractions();
  } catch (error) {
    console.warn('[BeautifyStudio] 运行时兼容暂未完全启用，但魔法棒入口仍可使用。', error);
  }

  window.addEventListener?.('beforeunload', cleanup, { once: true });
  console.info(`[BeautifyStudio] v${VERSION} 已加载。`);
}

try {
  start();
} catch (error) {
  console.error('[BeautifyStudio] 启动失败。', error);
}
