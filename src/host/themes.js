import { validateTheme } from '../core/validation.js';

// Use the host's fetch: TauriTavern routes this API through its own native adapter.
// Do not switch the active preset to inspect it. getThemeObject(name) only renames
// a snapshot of the CURRENT theme; it does not look up a stored theme by name.
async function readHostSettings(host) {
  const context = host.SillyTavern?.getContext?.();
  if (!context || typeof host.fetch !== 'function') {
    throw new Error('未连接酒馆，请在酒馆助手中打开；也可以上传美化 JSON。');
  }
  const controller = new host.AbortController();
  const timer = host.setTimeout(() => controller.abort(), 12000);
  try {
    let headers;
    if (typeof context.getRequestHeaders === 'function') headers = context.getRequestHeaders();
    else {
      const tokenResponse = await host.fetch('/csrf-token', { credentials: 'same-origin', signal: controller.signal });
      if (!tokenResponse.ok) throw new Error('无法获取酒馆请求凭据，请刷新酒馆后重试。');
      const { token } = await tokenResponse.json();
      headers = { 'Content-Type': 'application/json', 'X-CSRF-Token': token };
    }
    const response = await host.fetch('/api/settings/get', {
      method: 'POST', headers, body: '{}', credentials: 'same-origin', signal: controller.signal,
    });
    if (!response.ok) throw new Error(`酒馆美化读取失败（${response.status}），请刷新列表或上传 JSON。`);
    return await response.json();
  } finally { host.clearTimeout(timer); }
}

async function themeRequest(host, name) {
  const context = host.SillyTavern?.getContext?.();
  if (!context || typeof host.fetch !== 'function') throw new Error('未连接酒馆，请刷新后重试。');
  const headers = {
    'Content-Type': 'application/json',
    ...(typeof context.getRequestHeaders === 'function' ? context.getRequestHeaders() : {}),
  };
  const response = await host.fetch('/api/themes/delete', { method: 'POST', headers, body: JSON.stringify({ name }), credentials: 'same-origin' });
  if (!response.ok) throw new Error(`删除「${name}」失败（${response.status}）。`);
}

export async function readInstalledThemes(host) {
  const { themes } = await readHostSettings(host);
  if (!Array.isArray(themes)) throw new Error('当前酒馆未返回美化列表，请使用 JSON 导入。');
  return themes.flatMap(value => {
    try {
      const theme = typeof value === 'string' ? JSON.parse(value) : value;
      validateTheme(theme);
      return [JSON.parse(JSON.stringify(theme))];
    } catch { return []; }
  });
}

export async function verifySavedTheme(host, theme) {
  const themes = await readInstalledThemes(host);
  return themes.some(item => item.name === theme.name && item.custom_css === theme.custom_css);
}

// Use the native input and update button so the saved preset, in-memory theme
// library, and active power_user settings all change together on ST and TT.
export async function updateActiveThemeCss(host, theme, expectedCss) {
  const doc = host.document;
  const select = doc?.getElementById('themes');
  const input = doc?.getElementById('customCSS');
  const update = doc?.getElementById('ui-preset-update-button');
  const style = doc?.getElementById('custom-style');
  if (!select || !input || !update || !style) throw new Error('没有找到原生美化保存控件，请打开一次酒馆的用户设置后重试。');
  const checkActive = () => {
    if (select.value !== theme.name) throw new Error('当前美化已切换，已停止保存，请重新打开微调。');
  };
  checkActive();
  const themes = await readInstalledThemes(host);
  if (!themes.some(item => item.name === theme.name)) throw new Error('原美化已经不存在，请刷新美化列表。');
  checkActive();
  if (expectedCss !== undefined && style.textContent !== expectedCss) throw new Error('当前美化已被其他操作修改，请重新打开后再保存。');
  input.value = theme.custom_css;
  input.dispatchEvent(new host.Event('input', { bubbles: true }));
  checkActive();
  if (style.textContent !== theme.custom_css) throw new Error('酒馆未接收 CSS 修改，请刷新后重试。');
  update.click();
  // Native save updates the theme library only after the server acknowledges it.
  // Verify the persisted preset; a visible style change alone is insufficient.
  for (let attempt = 0; attempt < 16; attempt += 1) {
    await new Promise(resolve => host.setTimeout(resolve, 250));
    checkActive();
    if (await verifySavedTheme(host, theme)) {
      if (style.textContent !== theme.custom_css) throw new Error('保存期间 CSS 被其他操作修改，请刷新核对。');
      return theme;
    }
  }
  throw new Error('当前 CSS 已应用，但未核实原美化保存；请检查连接后重新保存或导出 JSON。');
}

export async function deleteInstalledThemes(host, names) {
  const uniqueNames = [...new Set(names.filter(name => typeof name === 'string' && name.trim()))];
  for (const name of uniqueNames) await themeRequest(host, name);
  const remaining = await readInstalledThemes(host);
  const stillThere = new Set(remaining.map(theme => theme.name));
  const failed = uniqueNames.filter(name => stillThere.has(name));
  if (failed.length) throw new Error(`有 ${failed.length} 款美化删除后仍在列表中：${failed.join('、')}`);
  return uniqueNames.length;
}
