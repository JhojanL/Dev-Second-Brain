import assert from 'node:assert/strict';
import { cpSync, readFileSync, rmSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { repositoryRoot } from '../lib/files.mjs';
import { renderTemplate, validateVault, validLocalDate } from '../validate.mjs';
import { fixture, note, write } from './helpers.mjs';

test('calendar validation rejects normalized invalid dates and wrong timestamp shapes', () => {
  assert.equal(validLocalDate('2024-02-29'), true);
  for (const value of ['2026-02-29', '2026-04-31', '2026-13-01', '2026-00-10']) assert.equal(validLocalDate(value), false);
  assert.equal(validLocalDate('2026-10-18T23:59:59', true), true);
  for (const value of ['2026-10-18T24:00:00', '2026-10-18T12:60:00', '2026-10-18T12:00:00Z']) assert.equal(validLocalDate(value, true), false);
});

test('invalid metadata types, calendar dates, enum values, and classifications fail', t => {
  const root = fixture(t);
  for (const [index, overrides] of [
    { categories: 'API Testing' }, { created_at: '2026-02-30T12:00:00' },
    { classification: 'internal' }, { status: 'complete' }, { technologies: [42] },
  ].entries()) write(root, `Knowledge/Testing/Invalid ${index}.md`, note(overrides));
  const result = validateVault(root, { checkSkills: false });
  assert.equal(result.errors.length, 5);
  assert.ok(result.errors.some(error => error.includes('local-datetime')));
  assert.ok(result.errors.some(error => error.includes('restricted classification')));
});

test('Obsidian links, embeds, headings, blocks, and code examples are distinguished', t => {
  const root = fixture(t);
  write(root, 'Categories/Testing.md', note({ type: 'category' }, '# Testing\n'));
  write(root, 'Media/test.svg', '<svg xmlns="http://www.w3.org/2000/svg"/>');
  write(root, 'Knowledge/Testing/Target.md', note({}, '# Target\n\n## A heading\n\nA paragraph. ^evidence\n'));
  write(root, 'Projects/Example Issue Tracker/Brief.md', note({ type: 'project', categories: ['[[Categories/Testing]]'] }, '# Brief\n\n> [!note] A callout\n> [[Knowledge/Testing/Target#A heading|read]]\n\n![[Media/test.svg|100]]\n\n[[Knowledge/Testing/Target#^evidence]]\n\n`[[Not a link]]`\n\n```text\n[[Also not a link]]\n```\n'));
  assert.deepEqual(validateVault(root, { checkSkills: false }).errors, []);
  write(root, 'Projects/Example Issue Tracker/Brief.md', note({ type: 'project' }, '# Brief\n\n[[Knowledge/Testing/Missing]]\n'));
  assert.match(validateVault(root, { checkSkills: false }).errors.join('\n'), /Missing link target/);
});

test('draft future notes warn while missing attachments and metadata targets fail', t => {
  const root = fixture(t);
  write(root, 'Knowledge/Testing/Draft.md', note({}, '# Draft\n\n[[Later]]\n\n![[Media/missing.png]]\n'));
  write(root, 'Daily Notes/2026-10-18.md', note({ type: 'daily', categories: ['[[Categories/Absent]]'] }));
  const result = validateVault(root, { checkSkills: false });
  assert.equal(result.warnings.length, 1);
  assert.equal(result.errors.length, 2);
});

test('all seven shipped core templates resolve to schema-valid notes', t => {
  const root = fixture(t);
  for (const name of ['Concept', 'Playbook', 'Project', 'Decision', 'Source', 'Category', 'Daily']) {
    const raw = readFileSync(path.join(repositoryRoot, `Templates/${name}.md`), 'utf8');
    write(root, `Templates/${name}.md`, raw);
    write(root, `Knowledge/Testing/${name}.md`, renderTemplate(raw, name));
  }
  assert.deepEqual(validateVault(root, { checkSkills: false }).errors, []);
  assert.throws(() => renderTemplate('{{unsupported}}'), /Unsupported/);
  write(root, 'Templates/Concept.md', '---\ntype: {{title}\n---\n');
  assert.match(validateVault(root, { checkSkills: false }).errors.join('\n'), /Malformed template/);
});

test('removing an optional module and its incoming navigation preserves a working core in a disposable copy', t => {
  const root = fixture(t);
  cpSync(path.join(repositoryRoot, 'Knowledge/Frontend'), path.join(root, 'Knowledge/Frontend'), { recursive: true });
  write(root, 'Categories/Frontend.md', note({ type: 'category' }, '# Frontend\n'));
  write(root, 'Categories/Design.md', note({ type: 'category' }, '# Design\n'));
  write(root, 'Categories/Architecture.md', note({ type: 'category' }, '# Architecture\n'));
  write(root, 'Knowledge/Architecture/Core.md', note({ categories: ['[[Categories/Architecture]]'] }, '# Core\n'));
  write(root, 'index.md', '# Home\n\n[[Categories/Frontend]]\n\n[[Knowledge/Architecture/Core]]\n');
  assert.deepEqual(validateVault(root, { checkSkills: false }).errors, []);
  rmSync(path.join(root, 'Knowledge/Frontend'), { recursive: true });
  rmSync(path.join(root, 'Categories/Frontend.md'));
  write(root, 'index.md', '# Home\n\n[[Knowledge/Architecture/Core]]\n');
  assert.deepEqual(validateVault(root, { checkSkills: false }).errors, []);
});

test('heading and Base-view typos fail even when their files exist', t => {
  const root = fixture(t);
  write(root, 'Knowledge/Testing/Target.md', note({}, '# Target\n'));
  write(root, 'Templates/Bases/Test.base', 'filters: type == "concept"\nviews:\n  - type: table\n    name: Existing\n    order: [file.name]\n');
  write(root, 'index.md', '# Home\n\n[[Knowledge/Testing/Target#Missing heading]]\n\n![[Templates/Bases/Test.base#Missing view]]\n');
  assert.equal(validateVault(root, { checkSkills: false }).errors.length, 2);
});
