import { spawnSync } from 'node:child_process';
import { realpathSync } from 'node:fs';
import path from 'node:path';
import { readJSON, repositoryRoot } from './files.mjs';

/** Compare absolute vault paths from Windows or the local OS without accepting a different directory. */
export function sameVaultPath(actual, expected) {
  const normalize = value => /^[a-z]:[\\/]/i.test(value)
    ? value.replaceAll('/', '\\').replace(/[\\]+$/, '').toLowerCase()
    : path.resolve(value);
  return normalize(actual.trim()) === normalize(expected.trim());
}

/** Construct a shell-free CLI client from a local executable, explicit vault, and expectedPath, rooted at root. */
export function obsidianClient(config, root = repositoryRoot) {
  for (const key of ['executable', 'vault', 'expectedPath']) {
    if (typeof config[key] !== 'string' || !config[key].trim() || /[\0\r\n]/.test(config[key])) throw new Error(`Invalid local Obsidian setting: ${key}`);
  }
  const run = (command, ...args) => {
    const result = spawnSync(config.executable, [`vault=${config.vault}`, command, ...args], {
      cwd: root, encoding: 'utf8', shell: false, timeout: 30_000, maxBuffer: 16 * 1024 * 1024,
    });
    if (result.error) throw new Error(`Obsidian ${command}: ${result.error.message}`);
    const output = `${result.stdout}\n${result.stderr}`;
    if (result.status !== 0 || /^(?:Error:|Vault not found\.?|File not found\.?|Unknown command|Command not found|Failed to )/mi.test(output)) {
      const error = new Error(`Obsidian ${command} failed (exit ${result.status}): ${output.trim()}`);
      error.cliExitCode = result.status;
      error.exitCode = result.status || 1;
      throw error;
    }
    return result.stdout.trim();
  };
  const assertTarget = () => {
    const actual = run('vault', 'info=path');
    if (!sameVaultPath(actual, config.expectedPath)) throw new Error(`Wrong vault: CLI returned ${actual}; expected ${config.expectedPath}.`);
    let local = actual;
    if (/^[a-z]:[\\/]/i.test(actual) && process.platform !== 'win32') {
      const converted = spawnSync('wslpath', ['-u', actual], { encoding: 'utf8', shell: false });
      if (converted.error || converted.status !== 0) throw new Error('Cannot convert Windows vault path with wslpath.');
      local = converted.stdout.trim();
    }
    if (realpathSync(local) !== realpathSync(root)) throw new Error('The CLI vault path is not this repository.');
    return actual;
  };
  return { run, assertTarget };
}

/** Load only ignored machine configuration under root and return the explicit-vault client. */
export function localObsidian(root = repositoryRoot) {
  try { return obsidianClient(readJSON(path.join(root, '.local/obsidian.json')), root); }
  catch (error) { throw new Error(`Configure .local/obsidian.json as described in System/Tooling.md. ${error.message}`, { cause: error }); }
}
