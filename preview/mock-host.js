// This fixture and its simulated persistence are never included in the release bundle.
if (new URLSearchParams(location.search).has('layout-test')) await import('./layout-fixture.js');
const themes = [
  { name: '林间来信', blur_tint_color: '#c2ccba', custom_css: `/* --- 在这里自定义💙 --- */
/* 图片可在「图片资源」中替换 */
:root {
  --cover-char: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='240'%3E%3Crect width='600' height='240' fill='%23d8dfce'/%3E%3Ccircle cx='460' cy='60' r='36' fill='%23f9f4da'/%3E%3Cpath d='M0 240V190L160 80 330 220 480 130 600 210V240' fill='%238c9e80'/%3E%3C/svg%3E"); /* 角色封面 · 林间山色 */
  --cover-user: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='240'%3E%3Crect width='600' height='240' fill='%23ddd9cd'/%3E%3Ccircle cx='145' cy='80' r='45' fill='%23f7eee0'/%3E%3Cpath d='M0 170Q150 120 300 180T600 160V240H0' fill='%23aaa89d'/%3E%3C/svg%3E"); /* 用户封面 · 傍晚海岸 */
}
.chat-heading { background-image: var(--cover-char); background-size: cover; }
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
// Opt-in regression fixtures, never included in the release bundle.
const textFixture = new URLSearchParams(location.search).get('text-test');
if (textFixture) {
  const base = document.createElement('style');
  base.textContent = ':root{--fontScale:1;--mainFontSize:calc(var(--fontScale)*15px)} #chat .mes_text,#chat .mes_text p{font-size:var(--mainFontSize)}';
  document.head.append(base);
  if (textFixture === 'fixed') themes[0].custom_css += '\n/* 作者固定字号 */\n#chat .mes_text p{font-size:18px}';
  if (textFixture === 'responsive') themes[0].custom_css += '\n#chat .mes_text p{font-size:calc(var(--fontScale)*18px)}';
  if (textFixture === 'inherited') themes[0].custom_css += '\nbody{font-size:18px}#chat .mes_text,#chat .mes_text p{font-size:inherit}';
  if (textFixture === 'hint') themes[0].custom_css += '\n#send_form{position:relative}#send_form:has(#send_textarea:placeholder-shown)::after{content:"Say something…";position:absolute;left:55px;pointer-events:none}#send_textarea::placeholder{color:transparent}';
  if (textFixture === 'inactive') themes[0].custom_css += '\n@media(min-width:99999px){#chat .mes_text p{font-size:25px}}';
}
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
const cssInput = document.createElement('textarea'); cssInput.id = 'customCSS'; cssInput.hidden = true; document.body.append(cssInput);
const updateButton = document.createElement('button'); updateButton.id = 'ui-preset-update-button'; updateButton.hidden = true; document.body.append(updateButton);
cssInput.addEventListener('input', () => document.querySelector('#custom-style').textContent = cssInput.value);
updateButton.addEventListener('click', () => {
  const theme = themes.find(item => item.name === select.value);
  if (theme) theme.custom_css = cssInput.value;
});
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
