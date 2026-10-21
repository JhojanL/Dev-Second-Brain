import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { lstatSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const repositoryRoot = fileURLToPath(new URL('../../', import.meta.url));

/** Return distributable paths, including untracked files, for the given Git root. */
export function distributionFiles(root = repositoryRoot) {
  return [...new Set(execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '-z'], {
    cwd: root, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024,
  }).split('\0').filter(Boolean))].sort();
}

/** Report vendored or generated agent-skill paths, which follow upstream rather than vault conventions. */
export function isSkillFile(file) {
  return file.startsWith('.agents/') || file.startsWith('.claude/skills/');
}

/** Hash file bytes or a buffer without interpreting their contents. */
export function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

/** List regular descendants relative to directory; reject symlinks and special files. */
export function regularFiles(directory) {
  const result = [];
  const visit = (folder) => {
    for (const name of readdirSync(folder)) {
      const target = path.join(folder, name);
      const stat = lstatSync(target);
      if (stat.isSymbolicLink()) throw new Error(`Symlinks are not managed: ${target}`);
      if (stat.isDirectory()) visit(target);
      else if (stat.isFile()) result.push(path.relative(directory, target).split(path.sep).join('/'));
      else throw new Error(`Not a regular file: ${target}`);
    }
  };
  if (!lstatSync(directory).isDirectory()) throw new Error(`Not a directory: ${directory}`);
  visit(directory);
  return result.sort();
}

/** Read strict JSON from a file, preserving its path in parse errors. */
export function readJSON(file) {
  try { return JSON.parse(readFileSync(file, 'utf8')); }
  catch (error) { throw new Error(`${file}: ${error.message}`, { cause: error }); }
}

/** Report direct script execution for an import.meta.url value. */
export function isMain(url) {
  return Boolean(process.argv[1]) && path.resolve(process.argv[1]) === fileURLToPath(url);
}
