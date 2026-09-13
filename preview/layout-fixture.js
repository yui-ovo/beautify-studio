// Explicit test fixture, enabled only by ?layout-test=1. Never bundled in extension.
window.__TAURITAVERN__ = true;
const root = document.documentElement;
root.style.setProperty('--tt-inset-bottom', '34px');
root.style.setProperty('--tt-ime-bottom', '0px');
const style = document.createElement('style');
style.textContent = `#sheld{display:flex;flex-direction:column;height:calc(100dvh - 240px - var(--tt-ime-bottom));min-height:200px}#chat{flex:1;min-height:0;max-height:none}#form_sheld{flex-shrink:0;padding-bottom:var(--tt-inset-bottom)!important}#layout-fixture{position:fixed;bottom:4px;right:4px;z-index:2147483647;background:white;border:1px solid #999;padding:5px;font-size:11px}#layout-fixture button{margin-left:6px}`;
document.head.append(style);
const bar = document.createElement('div'); bar.id = 'layout-fixture';
bar.append(document.createTextNode('布局模拟（非真机）'));
const safe = document.createElement('button'); safe.textContent = '切换安全区 34/0';
safe.onclick = () => root.style.setProperty('--tt-inset-bottom', root.style.getPropertyValue('--tt-inset-bottom') === '34px' ? '0px' : '34px');
const keyboard = document.createElement('button'); keyboard.textContent = '切换模拟键盘';
keyboard.onclick = () => root.style.setProperty('--tt-ime-bottom', root.style.getPropertyValue('--tt-ime-bottom') === '0px' ? '180px' : '0px');
bar.append(safe, keyboard); document.body.append(bar);
