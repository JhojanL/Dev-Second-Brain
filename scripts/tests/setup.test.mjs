import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { distributionFiles, readJSON } from '../lib/files.mjs';
import { restore, setup } from '../setup.mjs';
import { fixture, write } from './helpers.mjs';

test('setup previews without mutations, preserves unrelated keys, and reruns without changes', t => {
  const root = fixture(t);
  write(root, '.obsidian/app.json', '{"customSetting":true}\n');
  const before = distributionFiles(root);
  assert.ok(setup(root).changes.length);
  assert.deepEqual(distributionFiles(root), before);
  assert.throws(() => setup(root, { apply: true }), /Close this vault/);
  const result = setup(root, { apply: true, vaultClosed: true });
  assert.ok(result.backup);
  assert.equal(readJSON(path.join(root, '.obsidian/app.json')).customSetting, true);
  const bytes = readFileSync(path.join(root, '.obsidian/app.json'));
  assert.equal(setup(root, { apply: true, vaultClosed: true }).backup, null);
  assert.deepEqual(readFileSync(path.join(root, '.obsidian/app.json')), bytes);
});

test('conflicts require deliberate merge; backup restoration is byte exact and protects later edits', t => {
  const root = fixture(t);
  const original = '{"attachmentFolderPath":"Personal media","customSetting":42}\n';
  write(root, '.obsidian/app.json', original);
  assert.throws(() => setup(root, { apply: true, vaultClosed: true }), /Conflicting settings/);
  const { backup } = setup(root, { apply: true, vaultClosed: true, merge: true });
  assert.ok(restore(root, backup).includes('.obsidian/app.json'));
  restore(root, backup, { dryRun: false, vaultClosed: true });
  assert.equal(readFileSync(path.join(root, '.obsidian/app.json'), 'utf8'), original);
  const second = setup(root, { apply: true, vaultClosed: true, merge: true });
  write(root, '.obsidian/app.json', '{}\n');
  assert.throws(() => restore(root, second.backup, { dryRun: false, vaultClosed: true }), /Changed since setup/);
});

test('Obsidian whitespace normalization does not prevent restoring unchanged setting values', t => {
  const root = fixture(t);
  const original = '{}';
  write(root, '.obsidian/app.json', original);
  const { backup } = setup(root, { apply: true, vaultClosed: true });
  const file = path.join(root, '.obsidian/app.json');
  write(root, '.obsidian/app.json', JSON.stringify(readJSON(file)));
  restore(root, backup, { dryRun: false, vaultClosed: true });
  assert.equal(readFileSync(file, 'utf8'), original);
});
