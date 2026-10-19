import assert from 'node:assert/strict';
import { cpSync, mkdirSync, readFileSync, symlinkSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { repositoryRoot } from '../lib/files.mjs';
import { syncSkills } from '../sync-skills.mjs';
import { fixture, write } from './helpers.mjs';

/** Copy reviewed source skills into root for an isolated ownership test. */
function withSkills(root) {
  mkdirSync(path.join(root, '.agents'), { recursive: true });
  cpSync(path.join(repositoryRoot, '.agents/skills'), path.join(root, '.agents/skills'), { recursive: true });
}

test('skill synchronization previews, copies, and leaves unchanged files alone', t => {
  const root = fixture(t);
  withSkills(root);
  assert.ok(syncSkills(root, { dryRun: true }).changes.length > 3);
  syncSkills(root);
  assert.deepEqual(syncSkills(root).changes, []);
  const source = readFileSync(path.join(root, '.agents/skills/obsidian-cli/SKILL.md'));
  assert.deepEqual(readFileSync(path.join(root, '.claude/skills/obsidian-cli/SKILL.md')), source);
  write(root, '.claude/skills/obsidian-cli/SKILL.md', '# My edited instructions\n');
  assert.throws(() => syncSkills(root), /modified skill copy/);
});

test('unmanaged directories, symlinks, and changed source instructions are rejected', t => {
  const root = fixture(t);
  withSkills(root);
  mkdirSync(path.join(root, '.claude/skills'), { recursive: true });
  assert.throws(() => syncSkills(root), /Unmanaged/);
  write(root, '.agents/skills/obsidian-cli/SKILL.md', '# Altered upstream\n');
  assert.throws(() => syncSkills(root), /Reviewed skill changed/);
  const other = fixture(t);
  withSkills(other);
  mkdirSync(path.join(other, '.claude'));
  symlinkSync(path.join(other, '.agents/skills'), path.join(other, '.claude/skills'));
  assert.throws(() => syncSkills(other), /symlinked/);
});
