import { randomUUID } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync, unlinkSync } from 'node:fs';
import path from 'node:path';
import { isDeepStrictEqual } from 'node:util';
import { isMain, readJSON, repositoryRoot, sha256 } from './lib/files.mjs';

/** Merge only requested keys; current and desired are plain setting objects, and conflicts collects key paths. */
function mergeSettings(current, desired, conflicts, prefix = '') {
  const next = { ...current };
  for (const [key, value] of Object.entries(desired)) {
    const label = `${prefix}${key}`;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      if (key in current && (!current[key] || typeof current[key] !== 'object' || Array.isArray(current[key]))) {
        conflicts.push(label);
        next[key] = value;
      } else next[key] = mergeSettings(current[key] ?? {}, value, conflicts, `${label}.`);
    } else {
      if (key in current && !isDeepStrictEqual(current[key], value)) conflicts.push(label);
      next[key] = value;
    }
  }
  return next;
}

/** Preview or apply missing settings at root; apply requires vaultClosed and merge permits explicit conflicts. */
export function setup(root, { apply = false, vaultClosed = false, merge = false } = {}) {
  const defaults = readJSON(path.join(root, 'schemas/obsidian-settings.json'));
  const changes = [];
  const conflicts = [];
  for (const [file, wanted] of Object.entries(defaults)) {
    const relative = `.obsidian/${file}`;
    const target = path.join(root, relative);
    const original = existsSync(target) ? readFileSync(target) : null;
    const current = original ? JSON.parse(original.toString()) : {};
    if (!current || typeof current !== 'object' || Array.isArray(current)) throw new Error(`Invalid settings object: ${relative}`);
    const localConflicts = [];
    const next = mergeSettings(current, wanted, localConflicts);
    conflicts.push(...localConflicts.map(key => `${relative}: ${key}`));
    if (!isDeepStrictEqual(current, next)) changes.push({ relative, original, content: JSON.stringify(next, null, 2) + '\n' });
  }
  const missingDirectories = ['Media', 'Daily Notes', 'Projects', 'Knowledge', 'Categories', 'Templates', 'System']
    .filter(name => !existsSync(path.join(root, name)));
  if (conflicts.length && !merge && apply) throw new Error(`Conflicting settings; review dry-run and use --merge deliberately:\n${conflicts.join('\n')}`);
  const result = { changes: changes.map(c => c.relative), missingDirectories, conflicts, backup: null };
  if (!apply) return result;
  if (!vaultClosed) throw new Error('Close this vault first and pass --vault-closed.');
  if (changes.length) {
    const id = `${new Date().toISOString().replaceAll(/[:.]/g, '-')}-${randomUUID()}`;
    const backup = path.join(root, '.local/backups', id);
    mkdirSync(backup, { recursive: true });
    const manifest = { files: {} };
    for (const change of changes) {
      const basename = path.basename(change.relative);
      if (change.original) writeFileSync(path.join(backup, basename), change.original);
      manifest.files[change.relative] = { existed: change.original !== null, backupFile: basename, appliedHash: sha256(change.content) };
    }
    writeFileSync(path.join(backup, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
    for (const change of changes) {
      mkdirSync(path.dirname(path.join(root, change.relative)), { recursive: true });
      writeFileSync(path.join(root, change.relative), change.content);
    }
    result.backup = id;
  }
  for (const name of missingDirectories) mkdirSync(path.join(root, name), { recursive: true });
  return result;
}

/** Restore one local backup ID at root after hash checks; dryRun previews, vaultClosed permits writes. */
export function restore(root, id, { dryRun = true, vaultClosed = false } = {}) {
  if (!/^[\w-]+$/.test(id)) throw new Error('Backup ID must be a directory name under .local/backups.');
  const backup = path.join(root, '.local/backups', id);
  const manifest = readJSON(path.join(backup, 'manifest.json'));
  const allowlist = readJSON(path.join(root, 'schemas/obsidian-settings.json'));
  for (const [file, entry] of Object.entries(manifest.files)) {
    if (!Object.hasOwn(allowlist, path.basename(file)) || file !== `.obsidian/${path.basename(file)}` || entry.backupFile !== path.basename(file)) {
      throw new Error(`Invalid backup target: ${file}`);
    }
    const target = path.join(root, file);
    if (!existsSync(target)) throw new Error(`Changed since setup; refusing restore: ${file}`);
    const current = readFileSync(target);
    const normalized = JSON.stringify(JSON.parse(current.toString()), null, 2) + '\n';
    if (sha256(current) !== entry.appliedHash && sha256(normalized) !== entry.appliedHash) throw new Error(`Changed since setup; refusing restore: ${file}`);
    if (entry.existed) readFileSync(path.join(backup, entry.backupFile));
  }
  if (!dryRun) {
    if (!vaultClosed) throw new Error('Close this vault first and pass --vault-closed.');
    for (const [file, entry] of Object.entries(manifest.files)) {
      if (entry.existed) writeFileSync(path.join(root, file), readFileSync(path.join(backup, entry.backupFile)));
      else unlinkSync(path.join(root, file));
    }
  }
  return Object.keys(manifest.files);
}

if (isMain(import.meta.url)) {
  try {
    const args = process.argv.slice(2).filter(arg => arg !== '--');
    const known = arg => ['--dry-run', '--apply', '--merge', '--vault-closed'].includes(arg) || arg.startsWith('--restore=');
    if (args.some(arg => !known(arg)) || (args.includes('--apply') && args.includes('--dry-run'))) throw new Error('Use --dry-run or --apply --vault-closed, optionally --merge or --restore=BACKUP_ID.');
    const backup = args.find(arg => arg.startsWith('--restore='))?.slice('--restore='.length);
    const options = { apply: args.includes('--apply'), vaultClosed: args.includes('--vault-closed'), merge: args.includes('--merge') };
    const result = backup ? restore(repositoryRoot, backup, { dryRun: !options.apply, vaultClosed: options.vaultClosed }) : setup(repositoryRoot, options);
    console.log(JSON.stringify(result, null, 2));
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
