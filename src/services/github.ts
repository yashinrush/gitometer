import { RepoMetadata, RepoTreeItem } from '../types';
import { DEMO_REPOSITORIES } from './demoData';

export interface ParsedRepoInput {
  owner: string;
  repo: string;
  branch?: string;
  subpath?: string;
}

export function parseRepoInput(input: string): ParsedRepoInput | null {
  if (!input) return null;
  let cleaned = input.trim();

  // Strip git:// or git@
  cleaned = cleaned.replace(/^git@github\.com:/, 'https://github.com/');
  cleaned = cleaned.replace(/^git:\/\//, 'https://');

  // Handle URL or slug
  try {
    if (cleaned.startsWith('http://') || cleaned.startsWith('https://')) {
      const url = new URL(cleaned);
      const parts = url.pathname.replace(/^\/+|\/+$/g, '').split('/');
      if (parts.length >= 2) {
        const owner = parts[0];
        const repo = parts[1].replace(/\.git$/, '');
        let branch: string | undefined;
        let subpath: string | undefined;

        if (parts[2] === 'tree' && parts[3]) {
          branch = parts[3];
          if (parts.length > 4) {
            subpath = parts.slice(4).join('/');
          }
        }
        return { owner, repo, branch, subpath };
      }
    } else {
      // Slug format: owner/repo or owner/repo/tree/branch
      const parts = cleaned.replace(/^\/+|\/+$/g, '').split('/');
      if (parts.length >= 2) {
        const owner = parts[0];
        const repo = parts[1].replace(/\.git$/, '');
        let branch: string | undefined;
        let subpath: string | undefined;

        if (parts[2] === 'tree' && parts[3]) {
          branch = parts[3];
          if (parts.length > 4) {
            subpath = parts.slice(4).join('/');
          }
        }
        return { owner, repo, branch, subpath };
      }
    }
  } catch {
    return null;
  }
  return null;
}

export async function fetchRepoMetadata(
  owner: string,
  repo: string,
  token?: string
): Promise<RepoMetadata> {
  const slug = `${owner.toLowerCase()}/${repo.toLowerCase()}`;
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
  };
  if (token) {
    headers['Authorization'] = `token ${token}`;
  }

  try {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
    if (!res.ok) {
      if (DEMO_REPOSITORIES[slug]) {
        return DEMO_REPOSITORIES[slug].metadata;
      }
      throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    return {
      owner: data.owner.login,
      name: data.name,
      fullName: data.full_name,
      description: data.description || 'No description provided.',
      stars: data.stargazers_count,
      forks: data.forks_count,
      openIssues: data.open_issues_count,
      defaultBranch: data.default_branch || 'main',
      language: data.language || 'Unknown',
      license: data.license?.spdx_id || data.license?.name,
      topics: data.topics || [],
      htmlUrl: data.html_url,
      updatedAt: data.updated_at,
      sizeKb: data.size,
    };
  } catch (err) {
    if (DEMO_REPOSITORIES[slug]) {
      return DEMO_REPOSITORIES[slug].metadata;
    }
    throw err;
  }
}

export async function fetchRepoTree(
  owner: string,
  repo: string,
  branch = 'main',
  token?: string
): Promise<RepoTreeItem[]> {
  const slug = `${owner.toLowerCase()}/${repo.toLowerCase()}`;
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
  };
  if (token) {
    headers['Authorization'] = `token ${token}`;
  }

  try {
    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`,
      { headers }
    );
    if (!res.ok) {
      if (DEMO_REPOSITORIES[slug]) {
        return DEMO_REPOSITORIES[slug].tree;
      }
      throw new Error(`Failed to fetch tree: ${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    if (!data.tree || !Array.isArray(data.tree)) {
      if (DEMO_REPOSITORIES[slug]) {
        return DEMO_REPOSITORIES[slug].tree;
      }
      return [];
    }
    return data.tree.map((item: any) => ({
      path: item.path,
      mode: item.mode,
      type: item.type === 'tree' ? 'tree' : 'blob',
      sha: item.sha,
      size: item.size || 0,
      url: item.url,
      selected: true,
    }));
  } catch (err) {
    if (DEMO_REPOSITORIES[slug]) {
      return DEMO_REPOSITORIES[slug].tree;
    }
    throw err;
  }
}

export async function fetchRepoReadme(
  owner: string,
  repo: string,
  token?: string
): Promise<string> {
  const slug = `${owner.toLowerCase()}/${repo.toLowerCase()}`;
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3.raw',
  };
  if (token) {
    headers['Authorization'] = `token ${token}`;
  }

  try {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, { headers });
    if (!res.ok) {
      if (DEMO_REPOSITORIES[slug]) {
        return DEMO_REPOSITORIES[slug].readme;
      }
      return '# ' + repo + '\nNo README found.';
    }
    return await res.text();
  } catch (err) {
    if (DEMO_REPOSITORIES[slug]) {
      return DEMO_REPOSITORIES[slug].readme;
    }
    return '# ' + repo;
  }
}

export async function fetchFileContent(
  owner: string,
  repo: string,
  path: string,
  branch = 'main',
  token?: string
): Promise<string> {
  const slug = `${owner.toLowerCase()}/${repo.toLowerCase()}`;
  if (DEMO_REPOSITORIES[slug]?.sampleFiles?.[path]) {
    return DEMO_REPOSITORIES[slug].sampleFiles[path];
  }

  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `token ${token}`;
  }

  try {
    const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`;
    const res = await fetch(rawUrl, { headers });
    if (res.ok) {
      return await res.text();
    }
  } catch {
    // fallback
  }

  return `// File: ${path} (preview content)`;
}
