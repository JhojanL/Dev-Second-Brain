import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import Ajv from 'ajv';
import MarkdownIt from 'markdown-it';
import { parseDocument } from 'yaml';
import { distributionFiles, isMain, readJSON, repositoryRoot } from './lib/files.mjs';
import { verifySkills } from './sync-skills.mjs';

const markdown = new MarkdownIt({ html: false });
const contentPath = /^(Projects|Knowledge|Categories|Daily Notes)\//;
const templatePath = /^Templates\/[^/]+\.md$/;

/** Test a local calendar value; datetime selects YYYY-MM-DDTHH:mm:ss instead of a date. */
export function validLocalDate(value, datetime = false) {
  if (typeof value !== 'string') return false;
  const pattern = datetime ? /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})$/ : /^(\d{4})-(\d{2})-(\d{2})$/;
  const match = value.match(pattern);
  if (!match) return false;
  const [year, month, day, hour = 0, minute = 0, second = 0] = match.slice(1).map(Number);
  if (year < 1000) return false;
  const date = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
  return [date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds()]
    .every((part, index) => part === [year, month, day, hour, minute, second][index]);
}

/** Parse one YAML document from text, surfacing duplicate keys and other syntax errors. */
export function parseYAML(text) {
  const document = parseDocument(text, { uniqueKeys: true });
  if (document.errors.length) throw new Error(document.errors.map(error => error.message).join('; '));
  return document.toJS({ maxAliasCount: 50 });
}

/** Split initial frontmatter from raw Markdown; absent metadata remains null. */
export function splitNote(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (raw.startsWith('---\n') && !match) throw new Error('Unclosed YAML frontmatter.');
  return match ? { metadata: parseYAML(match[1]), body: raw.slice(match[0].length) } : { metadata: null, body: raw };
}

/** Resolve supported core template variables in raw text using a deterministic title and local timestamp. */
export function renderTemplate(raw, title = 'Template verification', stamp = '2026-10-18T12:34:56') {
  const rendered = raw.replace(/\{\{([^}]+)\}\}/g, (_, variable) => {
    if (variable === 'title') return title;
    if (variable === 'date:YYYY-MM-DD') return stamp.slice(0, 10);
    if (variable === 'time:HH:mm:ss') return stamp.slice(11);
    throw new Error(`Unsupported core template variable: ${variable}`);
  });
  if (rendered.includes('{{') || rendered.includes('}}')) throw new Error('Malformed template variable.');
  return rendered;
}

/** Collect wikilinks from plain text only; callers exclude code using Markdown tokens. */
function wikilinks(text) {
  return [...text.matchAll(/(!?)\[\[([^\]\n[]+)\]\]/g)]
    .map(match => ({ target: match[2].split('|')[0], wiki: true, embedded: match[1] === '!' }));
}

/** Traverse property values to collect strict metadata links from an arbitrary YAML value. */
function metadataLinks(value) {
  if (typeof value === 'string') return wikilinks(value).map(link => ({ ...link, metadata: true }));
  if (Array.isArray(value)) return value.flatMap(metadataLinks);
  if (value && typeof value === 'object') return Object.values(value).flatMap(metadataLinks);
  return [];
}

/** Produce the simple GitHub heading anchor used by this repository from visible text. */
function headingSlug(text) {
  return text.toLowerCase().replace(/[^\p{L}\p{N}_\-\s]/gu, '').replace(/\s/g, '-');
}

/** Extract used links, visible headings, and block IDs from a parsed note body. */
function bodyDetails(body) {
  const tokens = markdown.parse(body, {});
  const links = [];
  const headings = [];
  for (let index = 0; index < tokens.length; index++) {
    const token = tokens[index];
    if (token.type === 'heading_open') headings.push(tokens[index + 1].children.map(child => child.content).join(''));
    for (const child of token.children ?? []) {
      if (child.type === 'text') links.push(...wikilinks(child.content));
      if (child.type === 'link_open') links.push({ target: child.attrGet('href'), wiki: false });
      if (child.type === 'image') links.push({ target: child.attrGet('src'), wiki: false, embedded: true });
    }
  }
  const counts = new Map();
  const anchors = headings.map(heading => {
    const slug = headingSlug(heading);
    const count = counts.get(slug) ?? 0;
    counts.set(slug, count + 1);
    return count ? `${slug}-${count}` : slug;
  });
  return { links, headings, anchors, blocks: [...body.matchAll(/(?:^|\s)\^([\w-]+)(?=\s*$)/gm)].map(match => match[1]) };
}

/** Resolve one link using exact vault paths or an unambiguous basename from the supplied file set. */
function resolveLink(source, link, files) {
  if (/^[a-z][\w+.-]*:/i.test(link.target) || link.target.startsWith('//')) return null;
  const [rawFile, ...parts] = link.target.split('#');
  const fragment = decodeURIComponent(parts.join('#'));
  const file = decodeURIComponent(rawFile);
  let target = file ? path.posix.normalize(link.wiki || file.startsWith('/') ? file.replace(/^\//, '') : path.posix.join(path.posix.dirname(source), file)) : source;
  if (target.startsWith('../') || target === '..' || target.includes('\\')) throw new Error(`Link escapes the vault: ${link.target}`);
  const candidates = [target, `${target}.md`];
  let found = candidates.find(candidate => files.has(candidate));
  if (!found && link.wiki && file && !file.includes('/')) {
    const matches = [...files].filter(candidate => candidates.includes(path.posix.basename(candidate)));
    if (matches.length > 1) throw new Error(`Ambiguous wikilink: ${link.target}; use a full path.`);
    found = matches[0];
  }
  if (!found) throw new Error(`Missing link target: ${link.target}`);
  return { file: found, fragment };
}

/** Validate distributable files at root; checkSkills is disabled only in isolated validator unit fixtures. */
export function validateVault(root = repositoryRoot, { checkSkills = true } = {}) {
  const errors = [];
  const warnings = [];
  const paths = distributionFiles(root);
  const files = new Set(paths);
  const documents = new Map();
  const bases = new Map();
  const ajv = new Ajv({ allErrors: true, strict: true });
  ajv.addFormat('local-date', value => validLocalDate(value));
  ajv.addFormat('local-datetime', value => validLocalDate(value, true));
  const validate = ajv.compile(readJSON(path.join(root, 'schemas/note.schema.json')));
  const folded = new Map();
  const fail = (file, message) => errors.push(`${file}: ${message}`);
  for (const file of paths) {
    if (folded.has(file.toLowerCase())) fail(file, `Case collision with ${folded.get(file.toLowerCase())}`);
    folded.set(file.toLowerCase(), file);
    if (/[<>:"\\|?*]/.test(file) || file.split('/').some(part => /[. ]$/.test(part) || /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(part))) fail(file, 'Filename is not portable to Windows.');
    if (/\.md$/i.test(file) && !file.endsWith('.md')) fail(file, 'Use a lowercase .md extension.');
    if (!existsSync(path.join(root, file))) { fail(file, 'Tracked file is missing; stage its intentional deletion.'); continue; }
    if (file.startsWith('.agents/') || file.startsWith('.claude/skills/')) continue;
    try {
      const raw = /\.(md|json|jsonc|ya?ml|base)$/i.test(file) ? readFileSync(path.join(root, file), 'utf8') : null;
      if (/\.jsonc?$/.test(file)) JSON.parse(raw);
      if (/\.ya?ml$/.test(file)) parseYAML(raw);
      if (file.endsWith('.base')) {
        const base = parseYAML(raw);
        if (!base || !base.filters || !Array.isArray(base.views) || !base.views.length) throw new Error('A Base needs filters and at least one view.');
        const names = new Set();
        for (const view of base.views) {
          if (view.type !== 'table' || typeof view.name !== 'string' || !Array.isArray(view.order)) throw new Error('Expected a named table view with a property order.');
          if (names.has(view.name)) throw new Error(`Duplicate view name: ${view.name}`);
          names.add(view.name);
          for (const property of view.order) if (property.startsWith('formula.') && !base.formulas?.[property.slice(8)]) throw new Error(`Undefined formula: ${property}`);
        }
        bases.set(file, base);
      }
      if (!/\.md$/i.test(file)) continue;
      const template = templatePath.test(file);
      const { metadata, body } = splitNote(template ? renderTemplate(raw) : raw);
      if (metadata?.classification && metadata.classification !== 'public') throw new Error('Public template cannot distribute restricted classification.');
      if (contentPath.test(file) || template) {
        if (!validate(metadata)) throw new Error(ajv.errorsText(validate.errors, { separator: '; ' }));
        if (metadata.updated_at < metadata.created_at) throw new Error('updated_at precedes created_at.');
        if (!template && (raw.includes('{{') || raw.includes('}}'))) throw new Error('Unresolved template variables in a completed note.');
      }
      const details = bodyDetails(body);
      documents.set(file, { metadata, ...details, links: [...metadataLinks(metadata), ...details.links] });
    } catch (error) { fail(file, error.message); }
  }
  let linkCount = 0;
  for (const [file, document] of documents) {
    for (const link of document.links) {
      try {
        const target = resolveLink(file, link, files);
        if (!target) continue;
        linkCount++;
        if (target.fragment) {
          if (target.file.endsWith('.base')) {
            if (!bases.get(target.file)?.views.some(view => view.name === target.fragment)) throw new Error(`Missing Base view: ${link.target}`);
          } else if (target.file.endsWith('.md')) {
            const details = documents.get(target.file);
            const found = target.fragment.startsWith('^') ? details?.blocks.includes(target.fragment.slice(1))
              : link.wiki ? details?.headings.some(heading => heading.toLowerCase() === target.fragment.toLowerCase()) : details?.anchors.includes(target.fragment);
            if (!found) throw new Error(`Missing heading/block: ${link.target}`);
          } else if (!/\.pdf$/i.test(target.file)) throw new Error(`Unsupported attachment fragment: ${link.target}`);
        }
        if (link.metadata && target.file.startsWith('Categories/') && documents.get(target.file)?.metadata?.type !== 'category') throw new Error(`Category target is not a category note: ${link.target}`);
        if (link.metadata && target.file.startsWith('Projects/') && documents.get(target.file)?.metadata?.type !== 'project') throw new Error(`Project target is not a project note: ${link.target}`);
      } catch (error) {
        const ordinaryDraft = /^(Knowledge|Daily Notes)\//.test(file) && document.metadata?.status === 'draft';
        if (ordinaryDraft && !link.metadata && !link.embedded && error.message.startsWith('Missing link target:')) warnings.push(`${file}: future-note link: ${link.target}`);
        else fail(file, error.message);
      }
    }
  }
  if (checkSkills) {
    try { verifySkills(root); } catch (error) { fail('.agents/skills', error.message); }
    const config = path.join(root, '.codex/config.toml');
    if (!existsSync(config) || readFileSync(config, 'utf8') !== 'approval_policy = "on-request"\nsandbox_mode = "workspace-write"\n') fail('.codex/config.toml', 'Expected reviewed conservative project settings.');
    const claude = path.join(root, 'CLAUDE.md');
    if (!existsSync(claude) || !readFileSync(claude, 'utf8').includes('@AGENTS.md')) fail('CLAUDE.md', 'Missing shared instruction import.');
  }
  return { errors, warnings, counts: { files: paths.length, contentNotes: [...documents.keys()].filter(file => contentPath.test(file)).length, templates: [...documents.keys()].filter(file => templatePath.test(file)).length, bases: bases.size, links: linkCount } };
}

if (isMain(import.meta.url)) {
  try {
    const result = validateVault();
    for (const warning of result.warnings) console.warn(`WARN ${warning}`);
    for (const error of result.errors) console.error(`ERROR ${error}`);
    console.log(JSON.stringify(result.counts));
    if (result.errors.length) process.exitCode = 1;
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
