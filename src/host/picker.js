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
  if (cs.display === 'inline' && !node.matches('img,input,textarea')) modes.splice(0,3);
  if (node === doc.body) modes.splice(0,modes.length,'textColor','backgroundColor');
  return {node, target:{name:label.slice(0,32),selector,scope:'当前选中的元素',structural:structural || Boolean(node.closest('#chat .mes')),modes,generic:true}};
}

const primary = 'button,a,input,textarea,select,[role="button"],.avatar,.mes_text,#send_form,#top-settings-holder,img,svg';
export const MAX_PICK_GUIDES = 32;

// Sample the viewport instead of traversing an arbitrarily long chat DOM.
// At most 224 hit tests and 32 boxes per update, regardless of message count.
export function collectPickGuides(win) {
  const doc = win.document, width = win.innerWidth, height = win.innerHeight;
  const candidates = [], seen = new Set();
  const columns = Math.min(10, Math.max(3, Math.ceil(width / 72)));
  const rows = Math.min(16, Math.max(3, Math.ceil(height / 64)));
  const points = [];
  // The toolbar and composer contain small controls that can fall between grid
  // points. Walk at most 32 descendants in each; do not scan the chat history.
  for (const id of ['send_form', 'top-settings-holder']) {
    const area = doc.getElementById(id);
    if (!area) continue;
    const walker = doc.createTreeWalker(area, win.NodeFilter.SHOW_ELEMENT);
    for (let i = 0, node; i < 32 && (node = walker.nextNode()); i++) {
      if (!node.matches('button,a,input,textarea,select,[role="button"],i,svg')) continue;
      const r = node.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
      if (r.width && r.height && x > 0 && x < width && y > 0 && y < height) points.push([x, y]);
    }
  }
  for (let y = rows - 1; y >= 0; y--) for (let x = 0; x < columns; x++) points.push([(x + 0.5) * width / columns, (y + 0.5) * height / rows]);
  for (const [x, y] of points) {
      if (candidates.length >= MAX_PICK_GUIDES) break;
      const hit = doc.elementsFromPoint(x, y).find(isPickable);
      if (!hit) continue;
      const node = hit.closest(primary) || hit;
      if (!isPickable(node) || node === doc.body || seen.has(node)) continue;
      seen.add(node);
      // Do not frame a catch-all wrapper around unrelated controls. Unframed
      // regions remain tappable and their containers can be selected explicitly.
      if (!node.matches(primary) && node.children.length && !node.matches('p,label,h1,h2,h3,h4,h5,h6')) continue;
      const r = node.getBoundingClientRect();
      const cs = win.getComputedStyle(node);
      if (r.width < 12 || r.height < 12 || r.bottom <= 0 || r.top >= height || cs.visibility !== 'visible' || Number(cs.opacity) === 0) continue;
      if (r.width * r.height > width * height * 0.85) continue;
      // Suppress nested duplicates, keeping the visible interactive control.
      if (candidates.some(item => node.contains(item.node))) continue;
      for (let i = candidates.length - 1; i >= 0; i--) if (candidates[i].node.contains(node)) candidates.splice(i, 1);
      const label = known[node.id] || (node.matches('.avatar') ? '头像' : node.matches('.mes_text') ? '消息气泡' : node.getAttribute('aria-label') || node.getAttribute('title') || names[node.localName] || '区域');
      candidates.push({ node, rect: r, label: label.slice(0, 18) });
  }
  return candidates;
}

export function createPickGuides(win, layer) {
  let candidates = [];
  return {
    update() {
      candidates = collectPickGuides(win);
      const fragment = win.document.createDocumentFragment();
      for (const { rect: r, label } of candidates) {
        const box = win.document.createElement('div'); box.className = 've-pick-box';
        const left = Math.max(1, r.left), top = Math.max(1, r.top);
        box.style.cssText = `left:${left}px;top:${top}px;width:${Math.max(0, Math.min(win.innerWidth - 1, r.right) - left)}px;height:${Math.max(0, Math.min(win.innerHeight - 1, r.bottom) - top)}px;`;
        const text = win.document.createElement('span'); text.textContent = label; box.append(text); fragment.append(box);
      }
      layer.replaceChildren(fragment);
    },
    targetFor(element) {
      // Select what the visible box represents, not an unlabelled child icon.
      return candidates.find(item => item.node.isConnected && item.node.contains(element))?.node || element;
    },
    clear() { candidates = []; layer.replaceChildren(); },
  };
}

// No perpetual animation loop. Observe only while picking / using the handset,
// and coalesce relevant changes to at most one refresh every 120 ms.
export function watchSelectionLayout(win, host, refresh) {
  let timer = 0, frame = 0, stopped = false;
  const schedule = () => {
    if (stopped || timer || frame) return;
    timer = win.setTimeout(() => {
      timer = 0;
      frame = win.requestAnimationFrame(() => { frame = 0; if (!stopped) refresh(); });
    }, 120);
  };
  const observer = new win.MutationObserver(records => {
    if (records.some(record => {
      const element = record.target.nodeType === 1 ? record.target : record.target.parentElement;
      return element && element !== host && !host.contains(element) && !element.closest('#beautify-visual-editor,[data-bs-background]');
    })) schedule();
  });
  observer.observe(win.document.body, { subtree: true, childList: true, attributes: true, characterData: true });
  const resize = win.ResizeObserver ? new win.ResizeObserver(schedule) : null;
  resize?.observe(win.document.body);
  win.addEventListener('scroll', schedule, { capture: true, passive: true });
  win.addEventListener('resize', schedule, { passive: true });
  win.addEventListener('load', schedule, true);
  win.visualViewport?.addEventListener('resize', schedule);
  win.visualViewport?.addEventListener('scroll', schedule);
  refresh();
  return {
    schedule,
    stop() {
      stopped = true; observer.disconnect(); resize?.disconnect();
      win.clearTimeout(timer); win.cancelAnimationFrame(frame);
      win.removeEventListener('scroll', schedule, true); win.removeEventListener('resize', schedule); win.removeEventListener('load', schedule, true);
      win.visualViewport?.removeEventListener('resize', schedule); win.visualViewport?.removeEventListener('scroll', schedule);
    },
  };
}
