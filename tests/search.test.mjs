import test from 'node:test';
import assert from 'node:assert/strict';
import { searchCss } from '../src/core/search.js';

test('search covers unannotated selectors, values, URLs, comments and broken CSS', () => {
  const css = '/* 作者：背景 */\n#send_textarea {\n font-size: 18px;\n background: url("https://example.com/picture.png");\n}\n.bad{unfinished';
  for (const query of ['作者', 'SEND_TEXTAREA', '18px', 'picture.png', 'unfinished']) assert.equal(searchCss(css,query).count,1);
  assert.equal(searchCss(css,'not present').results.length,0);
  assert.equal(searchCss(css,'   ').results.length,0);
});
test('nearby hits merge with accurate line numbers and separate distant results', () => {
  const result = searchCss('hit hit\nline\nhit\n1\n2\n3\n4\n5\n6\n7\nhit','hit');
  assert.equal(result.count,4); assert.equal(result.results.length,2);
  assert.deepEqual(result.results[0].matches,[1,3]);
  assert.equal(result.results[1].endLine,11);
  assert.equal(searchCss('a\r\nb\r\nc','b').results[0].code,'a\nb\nc');
});
test('search uses literal text, not regular expressions or HTML', () => {
  assert.equal(searchCss('a{content:"<img onerror=alert(1)>.*"}','.*').count,1);
  assert.equal(searchCss('a{content:"<img onerror=alert(1)>.*"}','<img').count,1);
});
