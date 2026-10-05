import { IngestOptions, IngestResult, IngestStats, RepoMetadata, RepoTreeItem } from '../types';

/**
 * Checks whether a path matches a wildcard pattern like `*.md` or `src/*`
 */
function matchesPattern(path: string, pattern: string): boolean {
  let p = pattern.trim();
  if (!p) return false;

  // Convert glob pattern to RegExp
  // Replace ** with a placeholder, then * with [^/]*, then restore ** as .*
  const regexStr = p
    .replace(/\./g, '\\.')
    .replace(/\*\*/g, '___DOUBLE_STAR___')
    .replace(/\*/g, '[^/]*')
    .replace(/___DOUBLE_STAR___/g, '.*');

  const regex = new RegExp(`^${regexStr}$`, 'i');
  return regex.test(path) || path.includes(p.replace(/\*/g, ''));
}

/**
 * Filter tree items based on user IngestOptions
 */
export function filterTreeItems(
  items: RepoTreeItem[],
  options: IngestOptions
): RepoTreeItem[] {
  const { patternType, includePatterns, excludePatterns, maxFileSizeKb, includeGitignore } = options;

  const defaultIgnored = [
    '.git/',
    'node_modules/',
    '__pycache__/',
    '.venv/',
    'venv/',
    'dist/',
    'build/',
    '.next/',
    '.nuxt/',
    'package-lock.json',
    'pnpm-lock.yaml',
    'yarn.lock',
    'bun.lock',
    'poetry.lock',
  ];

  const includes = includePatterns
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const excludes = excludePatterns
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  return items.filter((item) => {
    // Check gitignore / common build artifacts
    if (!includeGitignore) {
      if (defaultIgnored.some((ign) => item.path.includes(ign) || item.path.startsWith(ign))) {
        return false;
      }
    }

    // Size limit for blobs
    if (item.type === 'blob' && item.size) {
      if (item.size > maxFileSizeKb * 1024) {
        return false;
      }
    }

    // Pattern filtering
    if (patternType === 'include' && includes.length > 0) {
      const matched = includes.some((p) => matchesPattern(item.path, p));
      if (!matched) return false;
    }

    if (patternType === 'exclude' && excludes.length > 0) {
      const matched = excludes.some((p) => matchesPattern(item.path, p));
      if (matched) return false;
    }

    return true;
  });
}

/**
 * Builds a visual ASCII directory tree representation (like tree command)
 */
export function buildAsciiTree(items: RepoTreeItem[]): string {
  if (items.length === 0) return '(empty)';

  interface TreeNode {
    name: string;
    path: string;
    isDir: boolean;
    children: Record<string, TreeNode>;
  }

  const root: TreeNode = { name: '', path: '', isDir: true, children: {} };

  for (const item of items) {
    const parts = item.path.split('/');
    let curr = root;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isLast = i === parts.length - 1;
      const isDir = !isLast || item.type === 'tree';

      if (!curr.children[part]) {
        curr.children[part] = {
          name: part,
          path: parts.slice(0, i + 1).join('/'),
          isDir,
          children: {},
        };
      }
      curr = curr.children[part];
    }
  }

  const lines: string[] = [];

  function printNode(node: TreeNode, prefix: string) {
    const childKeys = Object.keys(node.children).sort((a, b) => {
      const nodeA = node.children[a];
      const nodeB = node.children[b];
      if (nodeA.isDir && !nodeB.isDir) return -1;
      if (!nodeA.isDir && nodeB.isDir) return 1;
      return a.localeCompare(b);
    });

    for (let i = 0; i < childKeys.length; i++) {
      const key = childKeys[i];
      const child = node.children[key];
      const isLastChild = i === childKeys.length - 1;
      const pointer = isLastChild ? '└── ' : '├── ';
      const line = `${prefix}${pointer}${child.name}${child.isDir ? '/' : ''}`;
      lines.push(line);

      const nextPrefix = prefix + (isLastChild ? '    ' : '│   ');
      printNode(child, nextPrefix);
    }
  }

  printNode(root, '');
  return lines.join('\n');
}

/**
 * Computes statistical metrics: tokens, chars, size, file counts
 */
export function calculateIngestStats(
  items: RepoTreeItem[],
  fileContents: Record<string, string>,
  treeText: string
): IngestStats {
  const blobs = items.filter((i) => i.type === 'blob');
  const dirs = items.filter((i) => i.type === 'tree');

  let totalSizeKb = 0;
  for (const b of blobs) {
    totalSizeKb += (b.size || 0) / 1024;
  }

  let charCount = treeText.length;
  for (const content of Object.values(fileContents)) {
    charCount += content.length + 100; // include headers
  }

  // Common LLM token estimation heuristic: ~4 characters per token
  const tokenCount = Math.ceil(charCount / 3.8);

  return {
    fileCount: blobs.length,
    dirCount: dirs.length,
    totalSizeKb: Math.round(totalSizeKb * 10) / 10,
    tokenCount,
    charCount,
  };
}

/**
 * Builds the full LLM-optimized prompt digest string
 */
export function buildPromptDigest(
  metadata: RepoMetadata,
  treeText: string,
  fileContents: Record<string, string>,
  readmeContent?: string
): string {
  const parts: string[] = [];

  parts.push(`================================================================`);
  parts.push(`Repository: ${metadata.fullName}`);
  parts.push(`URL: ${metadata.htmlUrl}`);
  parts.push(`Description: ${metadata.description}`);
  parts.push(`Primary Language: ${metadata.language}`);
  parts.push(`================================================================\n`);

  parts.push(`Directory Structure:`);
  parts.push(treeText);
  parts.push(`\n================================================================`);
  parts.push(`File Contents:`);
  parts.push(`================================================================\n`);

  if (readmeContent && !fileContents['README.md']) {
    parts.push(`================================================`);
    parts.push(`File: README.md`);
    parts.push(`================================================`);
    parts.push(readmeContent);
    parts.push(``);
  }

  for (const [path, content] of Object.entries(fileContents)) {
    parts.push(`================================================`);
    parts.push(`File: ${path}`);
    parts.push(`================================================`);
    parts.push(content);
    parts.push(``);
  }

  return parts.join('\n');
}
