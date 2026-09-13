import test from 'node:test';
import assert from 'node:assert/strict';
import postcss from 'postcss';
import { cssString, readCssString, textDeclarations, editTextCss, removeStudioFontOverrides } from '../src/core/text.js';

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

test('hint edits ignore legacy font changes and preserve author font declarations', () => {
  const css = '@media(max-width:700px){.mes_text,button{font-size:18px!important;color:red}#send_form::after{content:"Hi"}}';
  const entries = textDeclarations(css);
  assert.equal(entries.length, 1);
  const result = editTextCss(css, {
    '0': {kind:'font',value:14,selectors:['#chat .mes_text']},
    [entries[0].id]: {kind:'content',value:'新的提示'},
  });
  const root = postcss.parse(result);
  assert.equal(root.first.nodes.length, 2);
  assert.equal(root.first.first.first.value, '18px');
  assert.equal(readCssString(root.first.last.first.value), '新的提示');
  assert.equal(editTextCss(css), css);
});

test('cleanup requires both owned block and selector, preserving all author font rules', () => {
  const selector = ':is(#beautify-specificity#beautify-specificity, #one):where(#one)';
  const author = 'body{font:18px serif}html body #chat#chat :is(.mes_text, .mes_text *):is(p){font-size:12px!important}';
  const outside = selector + '{font-size:20px}';
  const block = '/* === BEAUTIFY_VISUAL_START === */' + selector + '{font-size:10px!important;color:red}' + '#chat{font-size:21px}' + '/* === BEAUTIFY_VISUAL_END === */';
  const original = author + outside + block + '@media(max-width:700px){' + block + '}';
  const result = removeStudioFontOverrides(original);
  assert.equal(result.count, 2);
  assert.ok(result.css.startsWith(author + outside));
  assert.ok(result.css.includes('color:red'));
  assert.ok(result.css.includes('#chat{font-size:21px}'));
  assert.ok(!result.css.includes('10px'));
  assert.equal(removeStudioFontOverrides(result.css).count, 0);
  assert.equal(removeStudioFontOverrides(author).css, author);
  assert.equal(removeStudioFontOverrides('invalid {').count, 0);
});
