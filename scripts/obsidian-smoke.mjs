import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { setTimeout } from 'node:timers/promises';
import { distributionFiles, isMain, readJSON, repositoryRoot } from './lib/files.mjs';
import { localObsidian } from './lib/obsidian.mjs';
import { renderTemplate, splitNote, validLocalDate } from './validate.mjs';

/** Interpret only the installed CLI's documented JSON or observed empty-result sentinel. */
export function unresolvedLinks(output) {
  if (output === 'No unresolved links found.') return [];
  const result = JSON.parse(output);
  if (!result || typeof result !== 'object') throw new Error('Unexpected unresolved-link response.');
  return result;
}

/** Poll a synchronous predicate for short cache propagation; description names the observable failure. */
async function eventually(predicate, description) {
  for (let attempt = 0; attempt < 20; attempt++) {
    if (predicate()) return;
    await setTimeout(150);
  }
  throw new Error(`Timed out: ${description}`);
}

/** Read-only app smoke checks using the explicitly targeted client at root. */
export function readOnlySmoke(client, root = repositoryRoot) {
  const target = client.assertTarget();
  const help = client.run('help');
  for (const command of ['base:query', 'backlinks', 'template:read', 'rename', 'daily:path']) assert.ok(help.includes(command), `Missing installed command: ${command}`);
  assert.ok(client.run('read', 'path=index.md').includes('# Dev Second Brain'));
  const enabled = client.run('plugins:enabled', 'filter=core', 'format=json');
  for (const id of ['backlink', 'outgoing-link', 'global-search', 'properties', 'daily-notes', 'templates', 'bases']) assert.ok(enabled.includes(`"${id}"`), `Core plugin missing: ${id}`);
  const templates = client.run('templates');
  for (const name of ['Concept', 'Playbook', 'Project', 'Decision', 'Source', 'Category', 'Daily']) assert.ok(templates.includes(name), `Template missing: ${name}`);
  const backlinks = client.run('backlinks', 'path=Categories/API Testing.md', 'format=json');
  assert.ok(backlinks.includes('API Testing Playbook'), 'API Testing category should have the playbook backlink.');
  const unresolved = unresolvedLinks(client.run('unresolved', 'format=json'));
  assert.ok(Array.isArray(unresolved) ? unresolved.length === 0 : Object.keys(unresolved).length === 0, `Unresolved links remain: ${JSON.stringify(unresolved)}`);
  const views = [];
  for (const file of distributionFiles(root).filter(file => file.endsWith('.base'))) {
    const output = client.run('base:query', `path=${file}`, 'format=paths');
    const category = file.match(/^Templates\/Bases\/Category (.+)\.base$/)?.[1];
    if (!category || existsSync(path.join(root, `Categories/${category}.md`))) assert.ok(output.trim(), `Base has no sample rows: ${file}`);
    if (file === 'Templates/Bases/Projects.base') assert.ok(output.includes('Projects/Example Issue Tracker/Brief.md'));
    if (file === 'Templates/Bases/Playbooks.base') assert.ok(output.includes('Knowledge/Testing/API Testing Playbook.md'));
    if (file === 'Templates/Bases/Category API Testing.base') assert.ok(output.includes('Knowledge/Testing/API Testing Playbook.md'));
    if (file === 'Templates/Bases/Review.base') assert.ok(output.includes('Projects/Example Issue Tracker/Brief.md'));
    views.push({ file, rows: output.split(/\r?\n/).filter(Boolean).length });
  }
  const daily = readJSON(path.join(root, '.obsidian/daily-notes.json'));
  assert.equal(daily.folder, 'Daily Notes');
  assert.equal(daily.format, 'YYYY-MM-DD');
  assert.equal(daily.template, 'Templates/Daily.md');
  assert.equal(readJSON(path.join(root, '.obsidian/app.json')).attachmentFolderPath, 'Media');
  return { target, templates: 7, backlinks: 'passed', unresolved: 0, views };
}

/** Exercise UUID-owned temporary note, daily, backlink, attachment, and rename behavior, cleaning only owned paths. */
export async function fixtureSmoke(client, root = repositoryRoot) {
  client.assertTarget();
  const token = `Acceptance ${randomUUID()}`;
  const concept = `Knowledge/Architecture/${token}.md`;
  const renamed = `Knowledge/Architecture/${token} Renamed.md`;
  const peer = `Knowledge/Architecture/${token} Links.md`;
  const media = `Media/${token}.svg`;
  const dailyTemporary = `Daily Notes/${token}.md`;
  const owned = new Set();
  const claim = file => { assert.ok(!existsSync(path.join(root, file)), `Fixture already exists: ${file}`); owned.add(file); };
  let existingDailyPreserved = false;
  try {
    claim(concept);
    client.run('create', `path=${concept}`, 'template=Concept');
    const conceptData = splitNote(client.run('read', `path=${concept}`)).metadata;
    assert.equal(conceptData.type, 'concept');
    assert.ok(validLocalDate(conceptData.created_at, true));
    claim(media);
    mkdirSync(path.join(root, 'Media'), { recursive: true });
    writeFileSync(path.join(root, media), '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><rect width="32" height="32" fill="#2563eb"/></svg>\n');
    claim(peer);
    const raw = readFileSync(path.join(root, 'Templates/Concept.md'), 'utf8');
    writeFileSync(path.join(root, peer), `${renderTemplate(raw, `${token} Links`)}\n[[${concept.slice(0, -3)}]]\n\n![[${media}]]\n`);
    await eventually(() => client.run('backlinks', `path=${concept}`, 'format=json').includes(`${token} Links`), 'fixture backlink');
    claim(renamed);
    client.run('rename', `path=${concept}`, `name=${token} Renamed`);
    await eventually(() => readFileSync(path.join(root, peer), 'utf8').includes(`${token} Renamed`), 'automatic link update after rename');
    assert.ok(!existsSync(path.join(root, concept)));
    assert.ok(existsSync(path.join(root, renamed)));
    client.run('open', `path=${peer}`);
    await eventually(() => client.run('dev:dom', 'selector=.image-embed img', 'attr=src').includes(encodeURIComponent(token)) || client.run('dev:dom', 'selector=.image-embed img', 'attr=src').includes(token), 'rendered attachment embed');
    const dailyPath = client.run('daily:path');
    assert.match(dailyPath, /^Daily Notes\/\d{4}-\d{2}-\d{2}\.md$/);
    const alreadyExists = existsSync(path.join(root, dailyPath));
    const original = alreadyExists ? readFileSync(path.join(root, dailyPath)) : null;
    if (alreadyExists) {
      existingDailyPreserved = true;
      claim(dailyTemporary);
      client.run('create', `path=${dailyTemporary}`, 'template=Daily');
    } else {
      claim(dailyPath);
      client.run('daily');
    }
    const testedDaily = alreadyExists ? dailyTemporary : dailyPath;
    const dailyData = splitNote(client.run('read', `path=${testedDaily}`)).metadata;
    assert.equal(dailyData.type, 'daily');
    assert.ok(validLocalDate(dailyData.created_at, true));
    if (alreadyExists) assert.deepEqual(readFileSync(path.join(root, dailyPath)), original);
    return { conceptTemplate: 'passed', dailyTemplate: 'passed', dailyDestination: dailyPath, existingDailyPreserved, backlink: 'passed', rename: 'passed', attachmentEmbed: 'passed', clipboard: 'manual check required' };
  } finally {
    try { client.run('open', 'path=index.md'); }
    finally { for (const file of owned) if (existsSync(path.join(root, file))) unlinkSync(path.join(root, file)); }
  }
}

if (isMain(import.meta.url)) {
  try {
    if (process.argv.slice(2).some(arg => !['--', '--fixtures'].includes(arg))) throw new Error('Only --fixtures is supported.');
    const client = localObsidian();
    const initial = readOnlySmoke(client);
    let fixtures = null;
    if (process.argv.includes('--fixtures')) {
      fixtures = await fixtureSmoke(client);
      await eventually(() => {
        const result = unresolvedLinks(client.run('unresolved', 'format=json'));
        return Object.keys(result).length === 0;
      }, 'cache cleanup');
    }
    const afterCleanup = fixtures ? readOnlySmoke(client) : null;
    console.log(JSON.stringify({ initial, fixtures, afterCleanup }, null, 2));
  } catch (error) { console.error(error.stack); process.exitCode = error.exitCode || 1; }
}
