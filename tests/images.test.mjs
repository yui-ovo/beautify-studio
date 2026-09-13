import test from 'node:test';
import assert from 'node:assert/strict';
import { extractImages, replaceImages, validateImageUrl, imageSize } from '../src/core/images.js';
import { createHistory, buildEditedCss, DEFAULT_VALUES } from '../src/core/editor.js';
import { embedImage } from '../src/host/images.js';

test('extracts custom variables, layered images and nearby Chinese notes, excludes fonts/imports/fragments', () => {
  const css = `@import url('theme.css');
@font-face{src:url(font.woff2)}
:root{--cover-char:url('https://example.com/a(1).jpg'); /* 角色封面 */
--cover-user:url(/user.png); /* 用户封面 */ }
@media(max-width:700px){.mes{background:linear-gradient(red,blue),url(a.png),url(b.png);mask:url(#mask)}}`;
  const items = extractImages(css);
  assert.deepEqual(items.map(x => x.url), ['https://example.com/a(1).jpg','/user.png','a.png','b.png']);
  assert.equal(items[0].note,'角色封面'); assert.equal(items[1].note,'用户封面');
  assert.equal(new Set(items.map(x => x.id)).size,4);
});

test('replaces only one occurrence, keeps comments, layers, media and important declarations', () => {
  const css = '/* url(a.png) author */\n@media(min-width:1px){.a{background:url(a.png), url(a.png) !important;color:red}}';
  const [first, second] = extractImages(css);
  const changed = replaceImages(css, {[second.id]:'https://example.com/new "image".png'});
  assert.match(changed,/author/); assert.match(changed,/@media\(min-width:1px\)/);
  assert.match(changed,/!important;color:red/);
  assert.equal(extractImages(changed)[0].url,first.url);
  assert.equal(extractImages(changed)[1].url,'https://example.com/new "image".png');
  assert.equal(replaceImages(css,{}),css);
  assert.throws(()=>replaceImages(css,{'missing':'a.png'}),/图片位置已变化/);
});

test('decodes CSS escapes and safely quotes replacements without adding declarations', () => {
  const css = String.raw`.a{background:url("a\20 b.png")}`;
  const [item] = extractImages(css); assert.equal(item.url,'a b.png');
  const url='https://example.com/x");color:red;/*';
  const changed=replaceImages(css,{[item.id]:url});
  assert.equal(extractImages(changed)[0].url,url);
  assert.equal(extractImages(changed).length,1);
});

test('rejects temporary and executable URL schemes, accepts durable image addresses', () => {
  for(const url of ['javascript:alert(1)','blob:https://a/id','file:///a.png','data:text/html,hi','a\nb']) assert.throws(()=>validateImageUrl(url));
  for(const url of ['https://a.test/pic?id=1','/backgrounds/图.png','../images/a.png','data:image/png;base64,aA==']) assert.equal(validateImageUrl(url),url);
});

test('image edits coexist with geometry and undo/redo restores both kinds of edits', () => {
  const css='.a{background:url(a.png)}', id=extractImages(css)[0].id;
  const initial={images:{},edits:{}}; const history=createHistory(initial);
  const changed={images:{[id]:'asset-1'},edits:{character:{values:{...DEFAULT_VALUES,radius:7},changed:['radius']}}};
  history.push(changed);
  assert.deepEqual(history.undo(),initial); assert.deepEqual(history.redo(),changed);
  const result=buildEditedCss(replaceImages(css,{[id]:'data:image/png;base64,aA=='}),changed.edits);
  assert.match(result,/data:image\/png/); assert.match(result,/border-radius: 7px/);
});

test('album sizing never upscales, caps long edge and rejects oversized/non-image files',async()=>{
  assert.deepEqual(imageSize(4000,2000),{width:1600,height:800});
  assert.deepEqual(imageSize(100,200),{width:100,height:200});
  await assert.rejects(embedImage({}, {type:'text/plain',size:1}),/请选择图片/);
  await assert.rejects(embedImage({}, {type:'image/png',size:21*1024*1024}),/20 MB/);
});
