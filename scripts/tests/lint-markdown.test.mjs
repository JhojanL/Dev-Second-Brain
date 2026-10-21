import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { cpSync, readFileSync, rmSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { repositoryRoot } from '../lib/files.mjs';
import { lintMarkdown } from '../lint-markdown.mjs';
import { fixture, write } from './helpers.mjs';

test('Markdown lint reports distributable violations, skips excluded files, and never rewrites them', async t => {
  const root = fixture(t);
  cpSync(path.join(repositoryRoot, '.markdownlint.json'), path.join(root, '.markdownlint.json'));
  write(root, '.gitignore', '/.local/\n');
  const files = {
    'Knowledge/Valid.md': '---\nstatus: "draft"\n---\n\n# Valid\n\nText.\n',
    'Knowledge/Invalid.md': '# One\n# Two\n',
    'LEGACY.MD': '#Heading\n',
    '.agents/skills/example/SKILL.md': '# One\n# Two\n',
    '.local/notes.md': '# One\n# Two\n',
  };
  for (const [file, text] of Object.entries(files)) write(root, file, text);
  write(root, 'Deleted.md', '# Deleted\n');
  execFileSync('git', ['add', 'Deleted.md'], { cwd: root });
  rmSync(path.join(root, 'Deleted.md'));

  const result = await lintMarkdown(root);
  assert.equal(result.counts.files, 3);
  assert.equal(result.counts.errors, result.issues.length);
  assert.deepEqual(new Set(result.issues.map(issue => issue.split(':')[0])), new Set(['Knowledge/Invalid.md', 'LEGACY.MD']));
  assert.ok(result.issues.some(issue => issue.includes('MD025/single-title')));
  assert.ok(result.issues.some(issue => issue.startsWith('LEGACY.MD:1:1 error MD018/')));
  for (const [file, text] of Object.entries(files)) assert.equal(readFileSync(path.join(root, file), 'utf8'), text);
});

test('Markdown lint reports warning-severity rules without counting them as errors', async t => {
  const root = fixture(t);
  write(root, '.markdownlint.json', '{ "default": true, "MD047": "warning" }\n');
  write(root, 'Note.md', '# Note\n\nNo final newline.');
  const result = await lintMarkdown(root);
  assert.deepEqual(result.counts, { files: 1, errors: 0 });
  assert.match(result.issues.join('\n'), /^Note\.md:3:\d+ warning MD047\//);
});
