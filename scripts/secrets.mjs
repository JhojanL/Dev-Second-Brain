import { spawnSync } from 'node:child_process';
import { copyFileSync, lstatSync, mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { distributionFiles, isMain, repositoryRoot } from './lib/files.mjs';

/** Run Gitleaks with args at root; reject missing tools and scanner failures without printing secrets. */
function runScanner(args, root) {
  const result = spawnSync('gitleaks', args, { cwd: root, encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 });
  if (result.error) throw new Error('Gitleaks is required. Review mise.toml and run mise install, then mise exec -- pnpm run check.');
  if (result.status !== 0) throw new Error(`Gitleaks failed (${result.status}). ${result.stdout}${result.stderr}`);
  return result.stdout.trim();
}

/** Scan distributable working files and all reachable Git history under root using the pinned scanner. */
export function scanSecrets(root = repositoryRoot) {
  const version = runScanner(['version'], root);
  if (version !== '8.30.1') throw new Error(`Expected Gitleaks 8.30.1; found ${version}.`);
  const temp = mkdtempSync(path.join(os.tmpdir(), 'dev-second-brain-secrets-'));
  try {
    for (const file of distributionFiles(root)) {
      if (!lstatSync(path.join(root, file)).isFile()) throw new Error(`Only regular files can be distributed: ${file}`);
      mkdirSync(path.dirname(path.join(temp, file)), { recursive: true });
      copyFileSync(path.join(root, file), path.join(temp, file));
    }
    const config = path.join(root, '.gitleaks.toml');
    runScanner(['dir', temp, '--config', config, '--redact', '--no-banner'], root);
    const history = spawnSync('git', ['rev-list', '--all', '--max-count=1'], { cwd: root, encoding: 'utf8' });
    if (history.status !== 0) throw new Error(`Cannot inspect Git history: ${history.stderr}`);
    if (history.stdout.trim()) runScanner(['git', root, '--log-opts=--all', '--config', config, '--redact', '--no-banner'], root);
    return { version, workingFiles: 'passed', history: history.stdout.trim() ? 'passed (all refs)' : 'no commits yet' };
  } finally { rmSync(temp, { recursive: true, force: true }); }
}

if (isMain(import.meta.url)) {
  try { console.log(JSON.stringify(scanSecrets(), null, 2)); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
