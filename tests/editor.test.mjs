import test from 'node:test';
import assert from 'node:assert/strict';
import { parseSource, buildEditedCss, stepValue, createHistory, DEFAULT_VALUES, EDIT_START } from '../src/core/editor.js';

test('generic edits keep dimensions separate, scope colors and preserve transparency values', () => {
  const css = buildEditedCss('/* original */', {'picked-1':{
    target:{generic:true,name:'按钮 */',selector:'#one'},
    origin:{x:2,y:3}, values:{...DEFAULT_VALUES,width:120,opacity:75,textColor:'#123456'},changed:['width','textColor','opacity'],
  }});
  assert.match(css,/width: 120px/);assert.ok(!css.includes('height:'));
  assert.match(css,/color: #123456/);assert.match(css,/opacity: 0.75/);
  assert.ok(!css.includes('#one img'));assert.match(css,/:where\(#one\)/);
  assert.ok(css.startsWith('/* original */'));assert.ok(!css.includes('按钮 */'));
});
test('generic numeric fields enforce their own bounds', () => {
  assert.equal(stepValue(DEFAULT_VALUES,'width',-500).width,1);
  assert.equal(stepValue(DEFAULT_VALUES,'height',3000).height,2000);
  assert.equal(stepValue(DEFAULT_VALUES,'opacity',5).opacity,100);
  assert.equal(stepValue(DEFAULT_VALUES,'fontSize',-500).fontSize,8);
});

test('composer lift preserves host positioning, keyboard rules, transform and safe-area variables', () => {
  const source = '#form_sheld{position:relative;padding-bottom:var(--tt-inset-bottom);transform:scale(.99)}';
  const css = buildEditedCss(source, { composer: { values: { ...DEFAULT_VALUES, lift: 7 }, changed: ['lift'], origin: { x: 2, y: 3 } } });
  const patch = css.slice(source.length);
  assert.match(patch, /translate: 2px -4px !important/);
  assert.ok(!/position:|bottom:|height:|transform:|--tt-ime-bottom:|--tt-inset-bottom:/.test(patch));
  const lowered = buildEditedCss('', { composer: { values: { ...DEFAULT_VALUES, lift: -5 }, changed: ['lift'], origin: { x: 0, y: 0 } } });
  assert.match(lowered, /translate: 0px 5px/);
});

test('composer background adjustment never changes padding or input geometry', () => {
  const css = buildEditedCss('', { composer: { values: { ...DEFAULT_VALUES, gap: -12, lift: 7 }, changed: ['gap', 'lift'], origin: {x:0,y:0,paddingBottom:34} } });
  assert.match(css, /--bs-background-offset: -12px/);
  assert.match(css, /#send_form#send_form#send_form \{ translate: 0px -7px/);
  assert.ok(!/padding-bottom:|height:|--tt-inset-bottom:/.test(css));
});

test('composer values support upward and downward adjustments with finite bounds', () => {
  assert.equal(stepValue(DEFAULT_VALUES, 'lift', 1).lift, 1);
  assert.equal(stepValue(DEFAULT_VALUES, 'lift', -1).lift, -1);
  assert.equal(stepValue(DEFAULT_VALUES, 'gap', -500).gap, -120);
  assert.equal(stepValue(DEFAULT_VALUES, 'gap', 500).gap, 200);
});

test('author notes preserve Chinese text, nested comments, order and source lines', () => {
  const css = '/* 自定义💙 */\n@media(max-width:700px){\n/* 头像圆角 */\n.avatar{ border-radius:6px; /* 保留 */ }\n}';
  const notes = parseSource(css);
  assert.deepEqual(notes.map(n => n.text), ['自定义💙','头像圆角','保留']);
  assert.equal(notes[1].line, 3);
  assert.equal(notes[1].selector, '.avatar');
});
test('increment clamps sizes and arrow coordinates without changing unrelated fields', () => {
  assert.equal(stepValue({ ...DEFAULT_VALUES, radius: 6 }, 'radius', 1).radius, 7);
  assert.equal(stepValue(DEFAULT_VALUES, 'size', -100).size, 16);
  assert.equal(stepValue(DEFAULT_VALUES, 'y', -1).y, -1);
  assert.equal(stepValue(DEFAULT_VALUES, 'x', 1000).x, 300);
  assert.equal(stepValue(DEFAULT_VALUES, 'radius', 1).size, 48);
});
test('preview CSS preserves original theme and existing transform, limits edits to selected scope', () => {
  const original = '/* 原作者说明 */\n.avatar{transform:rotate(3deg);}\n@media(max-width:700px){.avatar{opacity:.9}}';
  const edits = { character: { values: { ...DEFAULT_VALUES, x: 2, y: -1 }, origin: { x: 6, y: 8 }, changed: ['position'] } };
  const css = buildEditedCss(original, edits);
  assert.ok(css.startsWith(original));
  assert.match(css, /translate: 8px 7px !important/);
  assert.match(css, /is_user="false"/);
  assert.ok(!css.includes('is_user="true"'));
  assert.equal((css.match(/transform:/g) || []).length, 1);
  assert.equal(buildEditedCss(original, edits), css);
  assert.equal(css.split(EDIT_START).length, 2);
  assert.equal(buildEditedCss(original, {}), original);
});
test('undo and redo preserve snapshots and discard redo branch after a new edit', () => {
  const initial = { edits: {} }, history = createHistory(initial);
  initial.edits.a = 1;
  history.push({ edits: { a: 2 } });
  assert.deepEqual(history.undo(), { edits: {} });
  assert.deepEqual(history.redo(), { edits: { a: 2 } });
  history.undo(); history.push({ edits: { b: 3 } });
  assert.equal(history.canRedo, false);
  const result = history.undo(); result.edits.a = 99;
  assert.deepEqual(history.undo(), { edits: {} });
});
