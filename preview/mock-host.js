// This fixture and its simulated persistence are never included in the release bundle.
if (new URLSearchParams(location.search).has('layout-test')) await import('./layout-fixture.js');
const themes = [
  { name: '林间来信', blur_tint_color: '#c2ccba', custom_css: `/* --- 在这里自定义💙 --- */
/* 角色头像圆角：小一点方方的，大一点圆圆的 */
#chat .mes[is_user="false"] .avatar { border-radius: 6px; }
/* 我的头像：像一枚小小的邮票 */
#chat .mes[is_user="true"] .avatar { border-radius: 12px; }
/* 顶部图标深绿色 */
#top-settings-holder button { color: #5d7451; }
/* 聊天气泡：淡淡的草木色 */
#chat .mes_text { background-color: #eef2e7; }
/* 头像大小：宽和高建议一起修改 */
#chat .avatar { width: 48px; height: 48px; }
/* 给消息留一点呼吸感 */
#chat .mes { margin-bottom: 22px; }
/* 手机端也要舒服地阅读 */
@media (max-width: 700px) { #chat .mes_text { line-height: 1.9; } }` },
  { name: '银色来信', blur_tint_color: '#b9bdc1', custom_css: '#chat .avatar { border-radius: 15px; }' },
  { name: '奶油放映室', blur_tint_color: '#c9c2b7', custom_css: '/* 头像圆角 */\n#chat .avatar { border-radius: 20px; }' },
];
let openStudio;
window.appendInexistentScriptButtons = () => {};
window.getButtonEvent = value => value;
window.eventOn = (_, handler) => {
  openStudio = () => {
    handler();
    const root = document.querySelector('#tt-theme-helper-overlay-host')?.shadowRoot;
    const badge = root?.querySelector('.connection');
    if (badge) { badge.textContent = '交互原型 · 示例数据'; badge.dataset.connected = 'false'; }
  };
};
window.SillyTavern = { getContext: () => ({ getRequestHeaders: () => ({ 'Content-Type': 'application/json' }) }) };
const nativeFetch = window.fetch.bind(window);
window.fetch = async (input, options) => {
  if (input === '/api/settings/get') return new Response(JSON.stringify({ themes }), { headers: { 'Content-Type': 'application/json' } });
  if (input === '/api/themes/delete') { const { name } = JSON.parse(options.body); const i = themes.findIndex(t => t.name === name); if (i >= 0) themes.splice(i, 1); const item = [...select.options].find(o => o.value === name); item?.remove(); return new Response('{}'); }
  return nativeFetch(input, options);
};
const select = document.querySelector('#themes');
function addOption(theme) { const option = document.createElement('option'); option.value = theme.name; option.textContent = theme.name; select.append(option); }
themes.forEach(addOption);
document.querySelector('#custom-style').textContent = themes[0].custom_css;
document.querySelector('#ui_preset_import_file').addEventListener('change', async event => {
  const theme = JSON.parse(await event.target.files[0].text()); themes.push(theme); addOption(theme); event.target.value = '';
});
select.addEventListener('change', () => { document.querySelector('#custom-style').textContent = themes.find(t => t.name === select.value)?.custom_css || ''; });
document.querySelector('#launch').addEventListener('click', () => openStudio?.());
document.querySelector('#send_form').addEventListener('submit', event => { event.preventDefault(); });
new MutationObserver(() => document.body.classList.toggle('editor-active', Boolean(document.querySelector('#beautify-visual-editor')))).observe(document.body, { childList: true });
await import('/dist/beautify-studio.js');
openStudio?.();
document.querySelector('#tt-theme-helper-overlay-host')?.shadowRoot.querySelector('.visual-edit')?.click();
