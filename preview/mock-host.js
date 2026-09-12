// Development fixtures only. This file is never included in the release bundle.
const themes = [
  { name:'银色来信', blur_tint_color:'#b9bdc1', custom_css:'#sheld { top: 0; height: 100vh; border-radius: 20px; } #chat { height: 90vh; }' },
  { name:'月亮不营业', blur_tint_color:'#545a64', custom_css:'#form_sheld { position:absolute; bottom:0; }' },
  { name:'奶油放映室', blur_tint_color:'#c9c2b7', custom_css:'.mes { border-radius: 16px; }' },
  { name:'薄雾日记', blur_tint_color:'#a9b8b6', custom_css:'#left-nav-panel { top: 40px; }' },
];
let openStudio;
window.appendInexistentScriptButtons = () => {};
window.getButtonEvent = value => value;
window.eventOn = (_, handler) => {
  openStudio = () => {
    handler();
    const root = document.querySelector('#tt-theme-helper-overlay-host')?.shadowRoot;
    const badge = root?.querySelector('.connection');
    if (badge) { badge.textContent = '演示模式 · 示例数据'; badge.dataset.connected = 'false'; }
  };
};
window.__TAURITAVERN__ = true;
window.SillyTavern = {getContext:()=>({getRequestHeaders:()=>({'Content-Type':'application/json'})})};
const nativeFetch = window.fetch.bind(window);
window.fetch = async (input, options) => {
  if (input === '/api/settings/get') return new Response(JSON.stringify({ themes }),{headers:{'Content-Type':'application/json'}});
  return nativeFetch(input, options);
};
const select = document.querySelector('#themes');
function addOption(theme) { const option = document.createElement('option'); option.value=theme.name; option.textContent=theme.name; select.append(option); }
themes.forEach(addOption);
document.querySelector('#ui_preset_import_file').addEventListener('change',async event=>{
  const theme = JSON.parse(await event.target.files[0].text());
  themes.push(theme); addOption(theme); event.target.value='';
});
select.addEventListener('change',()=>{document.querySelector('#custom-style').textContent = themes.find(t=>t.name===select.value)?.custom_css || '';});
document.querySelector('#launch').addEventListener('click',()=>openStudio?.());
await import('/dist/beautify-studio.js');
openStudio?.();
