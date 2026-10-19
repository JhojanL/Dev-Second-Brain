import assert from 'node:assert/strict';
import { chmodSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { obsidianClient, sameVaultPath } from '../lib/obsidian.mjs';
import { unresolvedLinks } from '../obsidian-smoke.mjs';
import { fixture, write } from './helpers.mjs';

test('vault identity normalizes Windows separators and case without accepting neighboring paths', () => {
  assert.ok(sameVaultPath('C:\\Vaults\\Dev Second Brain', 'c:/vaults/dev second brain/'));
  assert.equal(sameVaultPath('C:\\Vaults\\Other', 'C:\\Vaults\\Dev Second Brain'), false);
  assert.equal(sameVaultPath('/tmp/vault-two', '/tmp/vault'), false);
});

test('CLI configuration requires explicit nonempty values without line or null injection', () => {
  assert.throws(() => obsidianClient({ executable: 'obsidian', vault: '', expectedPath: '/tmp/vault' }), /Invalid local Obsidian setting/);
  assert.throws(() => obsidianClient({ executable: 'obsidian', vault: 'A\nB', expectedPath: '/tmp/vault' }), /Invalid local Obsidian setting/);
});

test('installed CLI empty-result sentinel is explicit and other malformed output fails', () => {
  assert.deepEqual(unresolvedLinks('No unresolved links found.'), []);
  assert.deepEqual(unresolvedLinks('[]'), []);
  assert.throws(() => unresolvedLinks('Vault not found.'), /Unexpected token/);
});

test('CLI wrapper preserves literal argument boundaries and nonzero exit codes', t => {
  const root = fixture(t);
  const executable = path.join(root, 'fake-obsidian');
  write(root, 'fake-obsidian', '#!/usr/bin/env node\nif(process.argv.includes("fail"))process.exit(7);\nconsole.log(JSON.stringify(process.argv.slice(2)));\n');
  chmodSync(executable, 0o755);
  const client = obsidianClient({ executable, vault: 'Dev Second Brain', expectedPath: root }, root);
  const literal = 'content=literal $() `backticks` & %PATH% "quotes" and spaces';
  assert.deepEqual(JSON.parse(client.run('create', literal)), ['vault=Dev Second Brain', 'create', literal]);
  assert.throws(() => client.run('fail'), error => error.exitCode === 7 && error.cliExitCode === 7);
});
