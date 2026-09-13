const excluded = 'html,head,script,style,link,meta,iframe,beautify-background';
const names = {button:'按钮',textarea:'输入框',input:'输入控件',img:'图片',svg:'图标',i:'图标',p:'段落',span:'文字',a:'链接',section:'区域',header:'顶栏',div:'容器',body:'页面背景'};
const known = { 'top-bar':'顶栏背景', 'top-settings-holder':'顶部工具栏', 'send_textarea':'消息输入框', 'send_form':'底部输入栏', 'form_sheld':'底栏背景', 'chat':'聊天区域', 'sheld':'聊天面板' };

export function isPickable(node) {
  return Boolean(node?.nodeType === 1 && !node.matches(excluded) && !node.closest('#beautify-visual-editor,#tt-theme-helper-overlay-host,[data-bs-background]'));
}

// Prefer IDs; fall back to an exact structural path. Never install temporary
// classes on host elements: the exported CSS must still match after reload.
export function describeTarget(win, element) {
  let node = element;
  if (node?.closest('svg')) node = node.closest('svg');
  if (!isPickable(node)) return null;
  const doc = node.ownerDocument, escape = win.CSS.escape;
  const path = [];
  let cursor = node, structural = false;
  while (cursor && cursor !== doc.documentElement) {
    if (cursor.id) {
      const id = '#' + escape(cursor.id);
      if (doc.querySelectorAll(id).length === 1) { path.unshift(id); break; }
    }
    const tag = cursor.localName;
    const siblings = [...(cursor.parentElement?.children || [])].filter(n => n.localName === tag);
    // Stable message identity is preferable to the current DOM sibling index.
    if (cursor.matches('#chat .mes[mesid]')) {
      const id = cursor.getAttribute('mesid');
      path.unshift(`.mes[mesid="${escape(id)}"]`);
      structural = true;
    } else {
      const index = siblings.indexOf(cursor) + 1;
      path.unshift(escape(tag) + (siblings.length > 1 ? `:nth-of-type(${index})` : ''));
      if (siblings.length > 1) structural = true;
    }
    cursor = cursor.parentElement;
  }
  const selector = path.join(' > ');
  if (!selector || doc.querySelectorAll(selector).length !== 1 || doc.querySelector(selector) !== node) return null;
  const cs = win.getComputedStyle(node);
  const text = ['button','p','span','a','label'].includes(node.localName) ? node.textContent.trim().replace(/\s+/g,' ').slice(0,18) : '';
  const label = known[node.id] || node.getAttribute('aria-label') || node.getAttribute('title') || (names[node.localName] || '页面元素') + (text ? ` · ${text}` : '');
  const modes = ['position','width','height','radius','border','textColor','backgroundColor','opacity'];
  if (node.textContent?.trim() || node.matches('input,textarea,i,button,a')) modes.splice(3,0,'fontSize');
  if (cs.display === 'inline' && !node.matches('img,input,textarea')) modes.splice(0,3);
  if (node === doc.body) modes.splice(0,modes.length,'fontSize','textColor','backgroundColor');
  return {node, target:{name:label.slice(0,32),selector,scope:'当前选中的元素',structural:structural || Boolean(node.closest('#chat .mes')),modes,generic:true}};
}
