import { execFileSync } from 'node:child_process';
import { cpSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { repositoryRoot } from '../lib/files.mjs';

/** Create a Git fixture owned by testContext, using env for initialization. */
export function fixture(testContext, env = process.env) {
  const root = mkdtempSync(path.join(os.tmpdir(), 'dev-second-brain-test-'));
  testContext.after(() => rmSync(root, { recursive: true, force: true }));
  execFileSync('git', ['init', '--quiet'], { cwd: root, env });
  mkdirSync(path.join(root, 'schemas'));
  cpSync(path.join(repositoryRoot, 'schemas/note.schema.json'), path.join(root, 'schemas/note.schema.json'));
  cpSync(path.join(repositoryRoot, 'schemas/obsidian-settings.json'), path.join(root, 'schemas/obsidian-settings.json'));
  return root;
}

/** Write text under root at a relative file path, creating parent folders. */
export function write(root, file, text) {
  mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
  writeFileSync(path.join(root, file), text);
}

/** Return valid public draft frontmatter, with overrides replacing metadata values and body as Markdown. */
export function note(overrides = {}, body = '# A note\n') {
  const values = { type: 'concept', status: 'draft', created_at: '2026-10-18T12:00:00', updated_at: '2026-10-18T12:00:00', classification: 'public', categories: [], ...overrides };
  return `---\n${Object.entries(values).map(([key, value]) => `${key}: ${JSON.stringify(value)}`).join('\n')}\n---\n\n${body}`;
}
