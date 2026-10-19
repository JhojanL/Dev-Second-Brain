import { spawnSync } from 'node:child_process';
import { repositoryRoot } from './lib/files.mjs';

const steps = ['lint:markdown', 'lint:js', 'check:vault', 'test', 'check:secrets'];
for (const step of steps) {
  console.log(`\nChecking ${step}`);
  const result = spawnSync('pnpm', ['run', step], { cwd: repositoryRoot, stdio: 'inherit', shell: false });
  if (result.error || result.status !== 0) {
    console.error(`Failed: ${step}${result.error ? `: ${result.error.message}` : ''}`);
    process.exit(result.status || 1);
  }
}
console.log('\nAll repository checks passed.');
