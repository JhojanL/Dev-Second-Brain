import { spawnSync } from 'node:child_process';
import { repositoryRoot } from './lib/files.mjs';

// Hooks export Git repository selectors; child checks and disposable fixtures
// must resolve their own repositories instead of inheriting the parent's index.
const gitEnvironment = spawnSync('git', ['rev-parse', '--local-env-vars'], { cwd: repositoryRoot, encoding: 'utf8' });
if (gitEnvironment.error || gitEnvironment.status !== 0) {
  console.error('Cannot identify Git repository environment variables. Git is required for repository checks.');
  process.exit(1);
}
const env = { ...process.env };
for (const name of gitEnvironment.stdout.trim().split('\n')) delete env[name];

const steps = ['lint:markdown', 'lint:js', 'check:vault', 'test', 'check:secrets'];
for (const step of steps) {
  console.log(`\nChecking ${step}`);
  const result = spawnSync('pnpm', ['run', step], { cwd: repositoryRoot, env, stdio: 'inherit', shell: false });
  if (result.error || result.status !== 0) {
    console.error(`Failed: ${step}${result.error ? `: ${result.error.message}` : ''}`);
    process.exit(result.status || 1);
  }
}
console.log('\nAll repository checks passed.');
