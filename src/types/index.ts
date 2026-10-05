export interface RepoMetadata {
  owner: string;
  name: string;
  fullName: string;
  description: string;
  stars: number;
  forks: number;
  openIssues: number;
  defaultBranch: string;
  language: string;
  license?: string;
  topics: string[];
  htmlUrl: string;
  updatedAt: string;
  sizeKb: number;
}

export interface RepoTreeItem {
  path: string;
  mode: string;
  type: 'blob' | 'tree';
  sha: string;
  size?: number;
  url?: string;
  selected?: boolean;
}

export interface IngestOptions {
  includePatterns: string;
  excludePatterns: string;
  maxFileSizeKb: number;
  patternType: 'exclude' | 'include';
  includeGitignore: boolean;
}

export interface IngestStats {
  fileCount: number;
  dirCount: number;
  totalSizeKb: number;
  tokenCount: number;
  charCount: number;
}

export interface IngestResult {
  stats: IngestStats;
  treeText: string;
  digestText: string;
  selectedPaths: string[];
}

export interface ArchitectureNode {
  id: string;
  label: string;
  path: string | null;
  type: 'ui' | 'api' | 'service' | 'data' | 'worker' | 'external' | 'config';
  subsystem: string;
  description: string;
}

export interface ArchitectureEdge {
  from: string;
  to: string;
  label?: string;
  isDashed?: boolean;
  evidencePath?: string | null;
}

export interface ArchitectureSubsystem {
  id: string;
  name: string;
  color: string;
  nodeIds: string[];
}

export interface ArchitectureGraph {
  title: string;
  summary: string;
  nodes: ArchitectureNode[];
  edges: ArchitectureEdge[];
  subsystems: ArchitectureSubsystem[];
  mermaidSource: string;
}

export type TargetAgent = 'cursor' | 'claude' | 'windsurf' | 'copilot' | 'chatgpt';

export type ReverseMode = 'vibe' | 'prd' | 'roadmap';

export interface ReversePromptResult {
  vibePrompt: string;
  prdSpec: string;
  roadmap: string;
  inferredStack: string[];
  keyCapabilities: string[];
}

export type ActiveTab = 'home' | 'codelens' | 'codemap' | 'promptforge';

export interface AppSettings {
  githubToken: string;
  openAiKey: string;
  anthropicKey: string;
  geminiKey: string;
  theme: 'dark' | 'light';
}
