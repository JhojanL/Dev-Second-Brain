import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { cpSync, unlinkSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { repositoryRoot } from '../lib/files.mjs';
import { scanSecrets } from '../secrets.mjs';
import { fixture, write } from './helpers.mjs';

test('missing Gitleaks fails clearly instead of skipping the required scanner', () => {
  const result = spawnSync(process.execPath, ['scripts/secrets.mjs'], {
    cwd: repositoryRoot, encoding: 'utf8', env: { ...process.env, PATH: '/nonexistent' },
  });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Gitleaks is required/);
});

test('synthetic credentials are caught in working files and after deletion from Git history', t => {
  const root = fixture(t);
  cpSync(path.join(repositoryRoot, '.gitleaks.toml'), path.join(root, '.gitleaks.toml'));
  const synthetic = ['ghp', randomBytes(24).toString('hex').slice(0, 36)].join('_');
  write(root, 'synthetic-credential.txt', `token=${synthetic}\n`);
  assert.throws(() => scanSecrets(root), /Gitleaks failed/);
  const git = args => execFileSync('git', args, { cwd: root, stdio: 'pipe' });
  git(['add', '.']);
  git(['-c', 'user.name=Template Acceptance', '-c', 'user.email=acceptance@example.invalid', 'commit', '--quiet', '-m', 'Synthetic scanner fixture']);
  unlinkSync(path.join(root, 'synthetic-credential.txt'));
  git(['add', '-u']);
  git(['-c', 'user.name=Template Acceptance', '-c', 'user.email=acceptance@example.invalid', 'commit', '--quiet', '-m', 'Remove synthetic fixture']);
  assert.throws(() => scanSecrets(root), /Gitleaks failed/);
});
