import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { chmodSync, cpSync, existsSync, mkdirSync, readFileSync, readdirSync } from 'node:fs';
import { devNull } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { repositoryRoot } from '../lib/files.mjs';
import { fixture, write } from './helpers.mjs';

/** Install hooks in a fixture owned by testContext using inheritedEnv as its parent environment. */
function hookFixture(testContext, inheritedEnv = process.env) {
  // User and system hook paths must not redirect fixture installation or execution.
  const gitEnv = { ...inheritedEnv, GIT_CONFIG_GLOBAL: devNull, GIT_CONFIG_NOSYSTEM: '1' };
  const root = fixture(testContext, gitEnv);
  for (const file of ['mise.toml', 'mise.lock', 'lefthook.yml', '.gitleaks.toml']) {
    cpSync(path.join(repositoryRoot, file), path.join(root, file));
  }
  write(root, '.gitignore', '/.local/\n');
  const env = {
    ...gitEnv,
    MISE_TRUSTED_CONFIG_PATHS: root,
    MISE_STATE_DIR: path.join(root, '.local/mise-state'),
    MISE_CACHE_DIR: path.join(root, '.local/mise-cache'),
    MISE_AUTO_INSTALL: '0',
    LEFTHOOK: '1',
    LEFTHOOK_BIN: '',
    LEFTHOOK_EXCLUDE: '',
  };
  // Git must still be callable when the missing-mise test empties the hook's PATH.
  const gitExecutable = env.PATH.split(path.delimiter)
    .map(directory => path.join(directory, process.platform === 'win32' ? 'git.exe' : 'git'))
    .find(candidate => existsSync(candidate));
  assert.ok(gitExecutable, 'Git is required for the hook regression checks.');
  execFileSync(gitExecutable, ['add', '.'], { cwd: root, env });
  execFileSync(gitExecutable, [
    '-c', 'core.hooksPath=.git/no-hooks',
    '-c', 'user.name=Template Acceptance', '-c', 'user.email=acceptance@example.invalid',
    'commit', '--quiet', '-m', 'Clean hook fixture',
  ], { cwd: root, env });
  execFileSync('mise', ['exec', '--', 'lefthook', 'install'], { cwd: root, env, stdio: 'pipe' });
  write(root, 'staged.txt', 'Clean staged fixture.\n');
  execFileSync(gitExecutable, ['add', 'staged.txt'], { cwd: root, env });
  return { root, env, gitExecutable };
}

/** Run the installed pre-commit hook in context, with extraEnv overriding its environment. */
function preCommit(context, extraEnv = {}) {
  const result = spawnSync(context.gitExecutable, ['hook', 'run', 'pre-commit'], {
    cwd: context.root, env: { ...context.env, ...extraEnv }, encoding: 'utf8',
  });
  assert.ifError(result.error);
  return { status: result.status, output: `${result.stdout}${result.stderr}` };
}

test('pre-commit rejects a secret left in the index after sanitizing the working copy; clean restaging passes', t => {
  const context = hookFixture(t);
  const { root, env, gitExecutable } = context;
  const synthetic = ['ghp', randomBytes(24).toString('hex').slice(0, 36)].join('_');
  write(root, 'staged.txt', `token=${synthetic}\n`);
  execFileSync(gitExecutable, ['add', 'staged.txt'], { cwd: root, env });
  const stagedBefore = execFileSync(gitExecutable, ['rev-parse', ':staged.txt'], { cwd: root, env, encoding: 'utf8' });
  write(root, 'staged.txt', 'Synthetic fixture sanitized.\n');
  assert.ok(!readFileSync(path.join(root, 'staged.txt'), 'utf8').includes(synthetic));

  const rejected = preCommit(context);
  assert.notEqual(rejected.status, 0, rejected.output);
  assert.match(rejected.output, /leaks found/i);
  assert.ok(!rejected.output.includes(synthetic), 'The synthetic credential must be redacted.');
  assert.equal(execFileSync(gitExecutable, ['rev-parse', ':staged.txt'], { cwd: root, env, encoding: 'utf8' }), stagedBefore);

  execFileSync(gitExecutable, ['add', 'staged.txt'], { cwd: root, env });
  const accepted = preCommit(context);
  assert.equal(accepted.status, 0, accepted.output);
  assert.match(accepted.output, /no leaks found/i);
});

test('the installed hook fails clearly when mise is unavailable', t => {
  const context = hookFixture(t);
  const emptyPath = path.join(context.root, 'empty-path');
  mkdirSync(emptyPath);
  const result = preCommit(context, { PATH: emptyPath });
  assert.notEqual(result.status, 0, result.output);
  assert.match(result.output, /mise.*(not found|No such file)/i);
});

test('the installed hook fails clearly when its scanner tool is not installed', t => {
  const context = hookFixture(t);
  const scanner = execFileSync('mise', ['which', 'gitleaks'], { cwd: context.root, env: context.env, encoding: 'utf8' }).trim();
  const scannerPath = context.env.PATH.split(path.delimiter).filter(directory => directory !== path.dirname(scanner)).join(path.delimiter);
  const result = preCommit(context, { MISE_GITLEAKS_VERSION: '0.0.0', PATH: scannerPath });
  assert.notEqual(result.status, 0, result.output);
  assert.match(result.output, /gitleaks@0\.0\.0/i);
  assert.match(result.output, /not installed|missing|not found/i);
});

test('the installed hook propagates Gitleaks configuration errors', t => {
  const context = hookFixture(t);
  write(context.root, '.gitleaks.toml', '[[[\n');
  const result = preCommit(context);
  assert.notEqual(result.status, 0, result.output);
  assert.match(result.output, /unable to load gitleaks config/i);
  assert.match(result.output, /toml: invalid character/i);
});

test('hook fixtures preserve a custom global hooks path and its hooks', t => {
  const root = fixture(t);
  const config = path.join(root, 'global.gitconfig');
  const hooks = path.join(root, 'shared-hooks');
  const hook = path.join(hooks, 'pre-commit');
  write(root, 'shared-hooks/pre-commit', '#!/bin/sh\nexit 99\n');
  chmodSync(hook, 0o755);
  execFileSync('git', ['config', '--file', config, 'core.hooksPath', hooks], { cwd: root });
  const configBefore = readFileSync(config);
  const hookBefore = readFileSync(hook);
  const env = { ...process.env, GIT_CONFIG_GLOBAL: config, GIT_CONFIG_NOSYSTEM: '1' };

  const context = hookFixture(t, env);
  const result = preCommit(context);
  assert.equal(result.status, 0, result.output);
  assert.match(result.output, /no leaks found/i);
  assert.equal(env.GIT_CONFIG_GLOBAL, config);
  assert.deepEqual(readFileSync(config), configBefore);
  assert.deepEqual(readFileSync(hook), hookBefore);
  assert.deepEqual(readdirSync(hooks), ['pre-commit']);
});
