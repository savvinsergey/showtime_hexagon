import { existsSync, readdirSync, readFileSync, realpathSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Tag prefixes every visible project must carry at least once.
 */
const REQUIRED_TAG_PREFIXES = ['type:', 'scope:'];

/**
 * Root folders that are scanned for `project.json` files.
 */
const SCANNED_ROOTS = ['apps', 'libs'];

/**
 * @typedef {object} IgnoreRule
 * @property {RegExp} regex Matches a root-relative POSIX path.
 * @property {boolean} negated True for `!pattern` rules.
 * @property {boolean} directoryOnly True when the pattern ended with `/`.
 */

/**
 * @typedef {object} TagOffender
 * @property {string} name Project name (`name` in project.json, else its directory).
 * @property {string} file Root-relative POSIX path of the offending project.json.
 * @property {string[]} missing Missing tag prefixes, e.g. `['scope:']`.
 */

/**
 * @typedef {object} TagCheckResult
 * @property {number} checked Number of visible projects that were checked.
 * @property {number} skipped Number of project.json files skipped because `.nxignore` hides them.
 * @property {TagOffender[]} offenders Projects lacking a required tag.
 */

/**
 * Converts one glob (gitignore flavour) to a regular expression source.
 * Supports `**`, `*` and `?`; character classes (`[abc]`) are not supported.
 *
 * @param {string} glob Glob without leading `/`, trailing `/` or `!`.
 * @returns {string} Regular expression source.
 */
function globToRegexSource(glob) {
  let source = '';
  for (let index = 0; index < glob.length; index += 1) {
    const char = glob[index];
    if (char === '*' && glob[index + 1] === '*') {
      const isSegmentStart = index === 0 || glob[index - 1] === '/';
      if (isSegmentStart && glob[index + 2] === '/') {
        source += '(?:.*/)?';
        index += 2;
      } else {
        source += '.*';
        index += 1;
      }
    } else if (char === '*') {
      source += '[^/]*';
    } else if (char === '?') {
      source += '[^/]';
    } else if (char === '\\' && index + 1 < glob.length) {
      index += 1;
      source += glob[index].replaceAll(/[$()*+.?[\\\]^{|}]/g, String.raw`\$&`);
    } else {
      source += char.replaceAll(/[$()*+.?[\\\]^{|}]/g, String.raw`\$&`);
    }
  }
  return source;
}

/**
 * Parses `.nxignore` content into rules.
 *
 * @param {string} content File content (gitignore syntax).
 * @returns {IgnoreRule[]} Rules in file order.
 */
function parseIgnoreRules(content) {
  /**
   * @type {IgnoreRule[]}
   */
  const rules = [];
  for (const rawLine of content.split(/\r?\n/)) {
    let line = rawLine.trimEnd();
    if (line === '' || line.startsWith('#')) continue;

    const negated = line.startsWith('!');
    if (negated) line = line.slice(1);

    const directoryOnly = line.endsWith('/');
    if (directoryOnly) line = line.slice(0, -1);

    // A slash at the beginning or in the middle anchors the pattern to the root.
    const anchored = line.includes('/');
    line = line.replace(/^\//, '');
    if (line === '') continue;

    const prefix = anchored ? '^' : '^(?:.*/)?';
    rules.push({
      regex: new RegExp(`${prefix}${globToRegexSource(line)}$`),
      negated,
      directoryOnly,
    });
  }
  return rules;
}

/**
 * Creates a predicate telling whether a path is hidden by `.nxignore`.
 *
 * Implements the subset of gitignore semantics used by this repository: comments,
 * directory patterns (`name/`), anchoring by `/`, `*`, `?`, `**` and `!` negation
 * (the last matching rule wins). As in git, a path is ignored when any of its parent
 * directories is ignored (a file cannot be re-included below an ignored directory).
 * Not supported: character classes (`[abc]`) and trailing-space escapes.
 *
 * @param {string} content Content of `.nxignore`.
 * @returns {(relativePath: string) => boolean} Predicate over root-relative POSIX file paths.
 */
export function createNxIgnore(content) {
  const rules = parseIgnoreRules(content);

  /**
   * @param {string} candidate Root-relative POSIX path.
   * @param {boolean} isDirectory Whether the candidate is a directory.
   * @returns {boolean} Whether the last matching rule ignores the candidate.
   */
  const isIgnoredExactly = (candidate, isDirectory) => {
    let isIgnored = false;
    for (const rule of rules) {
      const appliesToCandidate = !rule.directoryOnly || isDirectory;
      if (appliesToCandidate && rule.regex.test(candidate)) isIgnored = !rule.negated;
    }
    return isIgnored;
  };

  return relativePath => {
    const segments = relativePath.split('/');
    for (let length = 1; length <= segments.length; length += 1) {
      const isDirectory = length < segments.length;
      if (isIgnoredExactly(segments.slice(0, length).join('/'), isDirectory)) return true;
    }
    return false;
  };
}

/**
 * Collects root-relative POSIX paths of every `project.json` below the scanned roots.
 * Directories hidden by `.nxignore` are still listed (so they can be counted as skipped)
 * but `node_modules` is never entered.
 *
 * @param {string} root Absolute repository root.
 * @returns {string[]} Sorted project.json paths.
 */
function findProjectFiles(root) {
  /**
   * @type {string[]}
   */
  const found = [];

  /**
   * @param {string} relativeDirectory Root-relative POSIX directory.
   */
  const walk = relativeDirectory => {
    const entries = readdirSync(path.join(root, relativeDirectory), { withFileTypes: true });
    for (const entry of entries) {
      const relativePath = `${relativeDirectory}/${entry.name}`;
      if (entry.isDirectory()) {
        if (entry.name !== 'node_modules') walk(relativePath);
      } else if (entry.name === 'project.json') {
        found.push(relativePath);
      }
    }
  };

  for (const scannedRoot of SCANNED_ROOTS) {
    if (existsSync(path.join(root, scannedRoot))) walk(scannedRoot);
  }
  return found.toSorted((a, b) => a.localeCompare(b));
}

/**
 * Checks that every visible project under `apps/` and `libs/` carries at least one
 * `type:*` and one `scope:*` tag. Projects whose `project.json` is hidden by the
 * given `.nxignore` content are skipped (Nx does not see them either).
 *
 * @param {object} options Check options.
 * @param {string} options.root Absolute directory containing `apps/` and `libs/`.
 * @param {string} [options.nxIgnore] Content of the root `.nxignore` (empty when omitted).
 * @returns {TagCheckResult} Counts and the list of offending projects.
 * @throws {Error} When a visible project.json is not valid JSON (message names the file).
 */
export function checkTags({ root, nxIgnore = '' }) {
  const isIgnored = createNxIgnore(nxIgnore);
  /**
   * @type {TagOffender[]}
   */
  const offenders = [];
  let checked = 0;
  let skipped = 0;

  for (const file of findProjectFiles(root)) {
    if (isIgnored(file)) {
      skipped += 1;
      continue;
    }
    checked += 1;

    /**
     * @type {{ name?: string, tags?: unknown }}
     */
    let project;
    try {
      project = JSON.parse(readFileSync(path.join(root, file), 'utf8'));
    } catch (error) {
      throw new Error(`Cannot parse ${file}: ${error instanceof Error ? error.message : error}`, {
        cause: error,
      });
    }

    const tags = Array.isArray(project.tags)
      ? project.tags.filter(tag => typeof tag === 'string')
      : [];
    const missing = REQUIRED_TAG_PREFIXES.filter(prefix =>
      tags.every(tag => !tag.startsWith(prefix)),
    );
    if (missing.length > 0) {
      offenders.push({ name: project.name ?? path.posix.dirname(file), file, missing });
    }
  }

  return { checked, skipped, offenders };
}

/**
 * CLI entry: checks the repository this file lives in, prints offending projects
 * and sets exit code 1 on failure.
 *
 * @returns {void}
 */
function main() {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
  const nxIgnorePath = path.join(root, '.nxignore');
  const nxIgnore = existsSync(nxIgnorePath) ? readFileSync(nxIgnorePath, 'utf8') : '';

  const { checked, skipped, offenders } = checkTags({ root, nxIgnore });
  if (offenders.length > 0) {
    console.error('Projects without required tags (type:* and scope:*):');
    for (const { name, file, missing } of offenders) {
      const missingTags = missing.map(prefix => prefix + '*').join(', ');
      console.error(`  ${name} (${file}): missing ${missingTags}`);
    }
    process.exitCode = 1;
    return;
  }
  console.log(`check-tags: ${checked} projects tagged, ${skipped} hidden by .nxignore skipped`);
}

/**
 * Tells whether this module is the process entry point. Node resolves symlinks in
 * `import.meta.url`, so `argv[1]` must be resolved too; otherwise a symlinked
 * invocation would silently skip the check.
 *
 * @returns {boolean} True when the script was started directly (not imported).
 */
function isEntryPoint() {
  const entry = process.argv[1];
  if (!entry) return false;
  try {
    return realpathSync(entry) === fileURLToPath(import.meta.url);
  } catch {
    return false;
  }
}

if (isEntryPoint()) {
  main();
}
