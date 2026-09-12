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
