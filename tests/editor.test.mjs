import test from 'node:test';
import assert from 'node:assert/strict';
import { parseSource, buildEditedCss, stepValue, createHistory, DEFAULT_VALUES, EDIT_START } from '../src/core/editor.js';

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
