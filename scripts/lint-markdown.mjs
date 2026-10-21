import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { formatLintResults } from 'markdownlint/helpers';
import { lint } from 'markdownlint/promise';
import { distributionFiles, isMain, isSkillFile, readJSON, repositoryRoot } from './lib/files.mjs';

/** Lint distributable Markdown under root with its .markdownlint.json, reporting issues without writing files. */
export async function lintMarkdown(root = repositoryRoot) {
  // check:vault reports tracked files missing from the working tree.
  const files = distributionFiles(root)
    .filter(file => /\.md$/i.test(file) && !isSkillFile(file) && existsSync(path.join(root, file)));
  const strings = Object.fromEntries(files.map(file => [file, readFileSync(path.join(root, file), 'utf8')]));
  const results = await lint({ strings, config: readJSON(path.join(root, '.markdownlint.json')) });
  const errors = Object.values(results).flat().filter(issue => issue.severity === 'error').length;
  return { issues: formatLintResults(results), counts: { files: files.length, errors } };
}

if (isMain(import.meta.url)) {
  try {
    const result = await lintMarkdown();
    for (const issue of result.issues) console.error(issue);
    console.log(JSON.stringify(result.counts));
    if (result.counts.errors) process.exitCode = 1;
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
