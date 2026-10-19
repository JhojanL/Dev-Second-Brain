import { existsSync, lstatSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { isMain, readJSON, regularFiles, repositoryRoot, sha256 } from './lib/files.mjs';

/** Verify the pinned source files under root; return the provenance manifest. */
export function verifySkills(root) {
  const source = path.join(root, '.agents/skills');
  const provenance = readJSON(path.join(source, 'provenance.json'));
  if (!/^[a-f\d]{40}$/.test(provenance.commit)) throw new Error('Skills need an exact upstream commit.');
  const actual = regularFiles(source).filter(file => file !== 'provenance.json');
  if (JSON.stringify(actual) !== JSON.stringify(Object.keys(provenance.files).sort())) throw new Error('Skill files differ from the reviewed provenance list.');
  for (const file of actual) {
    if (sha256(readFileSync(path.join(source, file))) !== provenance.files[file]) throw new Error(`Reviewed skill changed: ${file}`);
  }
  for (const skill of provenance.skills) {
    if (!actual.includes(`${skill}/SKILL.md`)) throw new Error(`Skill manifest missing: ${skill}`);
  }
  return provenance;
}

/** Generate Claude copies in root; dryRun checks ownership and reports changes without writing. */
export function syncSkills(root, { dryRun = false } = {}) {
  const source = path.join(root, '.agents/skills');
  const destination = path.join(root, '.claude/skills');
  const provenance = verifySkills(root);
  const wanted = { ...provenance.files, 'provenance.json': sha256(readFileSync(path.join(source, 'provenance.json'))) };
  const manifestPath = path.join(destination, '.ownership.json');
  if (existsSync(destination) && lstatSync(destination).isSymbolicLink()) throw new Error('Refusing a symlinked Claude skills directory.');
  if (existsSync(destination) && !existsSync(manifestPath)) throw new Error('Unmanaged .claude/skills directory; refusing to overwrite.');
  const old = existsSync(manifestPath) ? readJSON(manifestPath) : { owner: 'dev-second-brain/skills-sync', files: {} };
  if (old.owner !== 'dev-second-brain/skills-sync') throw new Error('Unrecognized skill-copy ownership manifest.');
  if (existsSync(destination)) {
    const actual = regularFiles(destination).filter(file => file !== '.ownership.json');
    for (const file of actual) {
      if (!old.files[file] || sha256(readFileSync(path.join(destination, file))) !== old.files[file]) throw new Error(`Unmanaged or modified skill copy: ${file}`);
    }
  }
  if (Object.keys(old.files).some(file => !(file in wanted))) throw new Error('Skill removal needs deliberate review; no generated copies were deleted.');
  const changes = Object.keys(wanted).filter(file => !existsSync(path.join(destination, file)) || sha256(readFileSync(path.join(destination, file))) !== wanted[file]);
  if (!dryRun) {
    for (const file of changes) {
      mkdirSync(path.dirname(path.join(destination, file)), { recursive: true });
      writeFileSync(path.join(destination, file), readFileSync(path.join(source, file)));
    }
    if (changes.length || !existsSync(manifestPath)) writeFileSync(manifestPath, JSON.stringify({ owner: old.owner, files: wanted }, null, 2) + '\n');
  }
  return { dryRun, changes };
}

if (isMain(import.meta.url)) {
  try {
    if (process.argv.slice(2).some(arg => !['--', '--dry-run'].includes(arg))) throw new Error('Only --dry-run is supported.');
    console.log(JSON.stringify(syncSkills(repositoryRoot, { dryRun: process.argv.includes('--dry-run') }), null, 2));
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
