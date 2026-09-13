import test from 'node:test';
import assert from 'node:assert/strict';
import postcss from 'postcss';
import { cssString, readCssString, textDeclarations, editTextCss } from '../src/core/text.js';

test('hint strings round-trip quotes, CSS delimiters, Unicode, newlines and literal escapes', () => {
  for (const text of ['', '你好 “晚安”', 'a"; color:red; /*', '\\23 hello', '</style>\n你好', "'", '\\"']) {
    const value = cssString(text);
    assert.equal(readCssString(value), text);
    const root = postcss.parse(`a::after{content:${value}}`);
    assert.equal(root.first.nodes.length, 1);
    assert.ok(!value.includes('</style>'));
  }
  assert.equal(readCssString('none'), null);
  assert.equal(readCssString('url(foo)'), null);
  assert.equal(readCssString('"a" "b"'), null);
});

test('font edits stay in their media query and leave shared UI font declarations intact', () => {
  const css = '@media(max-width:700px){.mes_text,button{font-size:18px!important;color:red}#send_form::after{content:"Hi"}}';
  const entries = textDeclarations(css);
  const result = editTextCss(css, {
    [entries[0].id]: {kind:'font',value:14,selectors:['#chat .mes_text']},
    [entries[1].id]: {kind:'content',value:'新文字 "好"'},
  });
  const root = postcss.parse(result);
  assert.equal(root.nodes.length, 1);
  assert.equal(root.first.first.first.value, '18px');
  assert.equal(root.first.nodes[1].selector, '#chat .mes_text');
  assert.equal(root.first.nodes[1].first.value, '14px');
  assert.equal(readCssString(root.first.last.first.value), '新文字 "好"');
  assert.equal(editTextCss(css), css);
});
