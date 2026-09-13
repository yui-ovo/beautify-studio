/*! postcss-value-parser (MIT)
Copyright (c) Bogdan Chadkin <trysound@yandex.ru>

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
*/
import postcss from 'postcss';
import valueParser from 'postcss-value-parser';

function unescapeCss(value) {
  return value.replace(/\\(?:([\da-f]{1,6})\s?|([^\r\n\f]))/gi, (_, hex, char) => {
    const code = hex ? parseInt(hex, 16) : 0;
    return hex ? String.fromCodePoint(code > 0 && code <= 0x10ffff && !(code >= 0xd800 && code <= 0xdfff) ? code : 0xfffd) : char;
  });
}

export function validateImageUrl(value) {
  const url = String(value || '').trim();
  if (!url || /[\u0000-\u001f\u007f]/.test(url)) throw new Error('请填写有效的图片链接。');
  if (/^data:/i.test(url)) {
    if (!/^data:image\/(?:png|jpe?g|webp|gif|avif|bmp|svg\+xml)(?:;[^,]*)?,/i.test(url)) throw new Error('只支持图片类型的内嵌地址。');
  } else {
    if (/^[a-z][a-z\d+.-]*:/i.test(url) && !/^https?:\/\//i.test(url)) throw new Error('请使用 HTTP、HTTPS 或酒馆内的图片路径；临时 blob 地址不能保存。');
    try { const parsed = new URL(url, 'https://tavern.invalid/'); if (!['https:', 'http:'].includes(parsed.protocol)) throw 0; }
    catch { throw new Error('图片链接格式不正确。'); }
  }
  return url;
}

function visitImages(css, callback) {
  const root = postcss.parse(css);
  let declaration = 0;
  root.walkDecls(decl => {
    const index = declaration++;
    if (decl.parent.type === 'atrule' && decl.parent.name.toLowerCase() === 'font-face') return;
    if (!/^(?:--|(?:-webkit-)?(?:background|mask|border-image)|content$|list-style|cursor$)/i.test(decl.prop)) return;
    const parsed = valueParser(decl.value);
    let occurrence = 0, changed = false;
    parsed.walk(node => {
      if (node.type !== 'function' || node.value.toLowerCase() !== 'url') return;
      const id = `${index}:${occurrence++}`;
      const children = node.nodes.filter(n => !['space', 'comment'].includes(n.type));
      if (node.unclosed || children.length !== 1 || !['word', 'string'].includes(children[0].type) || children[0].unclosed) return false;
      const url = unescapeCss(children[0].value);
      if (!url || url.startsWith('#') || /\.(?:woff2?|ttf|otf|eot)(?:[?#]|$)/i.test(url)) return false;
      const replacement = callback({ id, url, decl });
      if (replacement !== undefined) {
        node.nodes = [{ type: 'string', quote: '"', value: replacement.replace(/\\/g, '\\\\').replace(/"/g, '\\"') }];
        node.before = ''; node.after = ''; changed = true;
      }
      return false;
    });
    if (changed) decl.value = parsed.toString();
  });
  return root.toString();
}

export function extractImages(css) {
  const images = [];
  visitImages(css, ({ id, url, decl }) => {
    const next = decl.next(), prev = decl.prev();
    const trailing = next?.type === 'comment' && next.source?.start?.line === decl.source?.end?.line;
    const comment = trailing ? next : prev?.type === 'comment' ? prev : decl.parent.prev()?.type === 'comment' ? decl.parent.prev() : null;
    images.push({ id, url, property: decl.prop, selector: decl.parent.selector || '',
      note: comment?.text.trim() || '', line: decl.source?.start?.line || 1 });
  });
  return images;
}

export function replaceImages(css, replacements = {}) {
  if (!Object.keys(replacements).length) return css;
  const found = new Set();
  const result = visitImages(css, ({ id }) => {
    if (!Object.hasOwn(replacements, id)) return;
    found.add(id);
    return validateImageUrl(replacements[id]);
  });
  if (found.size !== Object.keys(replacements).length) throw new Error('图片位置已变化，请重新打开编辑器。');
  return result;
}

export function imageSize(width, height, max = 1600) {
  const scale = Math.min(1, max / Math.max(width, height));
  return { width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)) };
}
