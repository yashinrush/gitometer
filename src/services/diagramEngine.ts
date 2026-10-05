import {
  ArchitectureEdge,
  ArchitectureGraph,
  ArchitectureNode,
  ArchitectureSubsystem,
  RepoMetadata,
  RepoTreeItem,
} from '../types';

export interface DiagramGraphGroup {
  id: string;
  label: string;
  description?: string | null;
}

export interface DiagramGraphNode {
  id: string;
  label: string;
  type: string;
  groupId: string | null;
  path: string | null;
  shape?: 'box' | 'database' | 'queue' | 'circle' | 'hexagon' | null;
  description?: string | null;
}

export interface DiagramGraphEdge {
  from: string;
  to: string;
  label?: string | null;
  style?: 'solid' | 'dashed' | null;
  evidencePath?: string | null;
}

export interface DiagramGraphSchema {
  explanation?: string;
  groups: DiagramGraphGroup[];
  nodes: DiagramGraphNode[];
  edges: DiagramGraphEdge[];
}

/**
 * Filter files to only architecture-relevant sources (excludes tests, docs, build, fixtures)
 * Ported from GitDiagram (src/server/generate/repository-context.ts)
 */
const EXCLUDED_PATTERNS =
  /(^|\/)(?:\.[^/]+|tests?|__tests__|__mocks__|mocks?|testdata|fixtures?|e2e|cypress|examples?(?:_src)?|samples?|demos?|stories|storybook|docs?(?:_src)?|tutorials?(?:_src)?|documentation|bench|benchmarks?|vendor|third_party|node_modules|dist|build|generated|migrations?|alembic|assets|locales?|translations?)(\/|$)|(?:\.test(?:-d)?|\.spec|\.generated|\.min|\.stories|\.designer)\.|(?:_pb2(?:_grpc)?\.py|\.pb(?:\.gw)?\.go|\.g\.cs)$|(?:^|\/)(?:test\.[^/]+|bench(?:mark|marker)?\.[^/]+|test_[^/]+|[^/]+_test\.[^/]+)$/i;

const SOURCE_PATTERNS =
  /\.(?:[cm]?[jt]sx?|py|go|rs|java|kt|kts|swift|cs|cpp|cc|c|h|hpp|rb|php|ex|exs|scala|clj|vue|svelte|proto|graphql)$/i;

const MANIFEST_PATTERNS =
  /(?:^|\/)(?:package\.json|Cargo\.toml|go\.mod|pyproject\.toml|requirements\.txt|build\.gradle(?:\.kts)?|mix\.exs|composer\.json|Gemfile|CMakeLists\.txt)$/i;

export function isArchitectureSource(path: string): boolean {
  return (
    !EXCLUDED_PATTERNS.test(path) &&
    (SOURCE_PATTERNS.test(path) || MANIFEST_PATTERNS.test(path))
  );
}

/**
 * Score source files by architectural importance.
 * Ported from GitDiagram (src/server/generate/repository-context.ts)
 */
function scoreSourcePath(path: string): number {
  const name = path.split('/').at(-1) ?? path;
  let value = 20 - path.split('/').length;
  if (MANIFEST_PATTERNS.test(path)) value += path.includes('/') ? 5 : 45;
  if (/^(?:main|apps?|server|applications?|Program)\./i.test(name)) value += 30;
  if (/^(?:route|\+server|\+page\.server)\.[cm]?[jt]sx?$/i.test(name)) value += 32;
  if (/^page\.[jt]sx$/i.test(name)) value += 20;
  if (/^(?:index|lib|mod)\./i.test(name)) value += path.split('/').length <= 3 ? 20 : 2;
  if (
    /(?:webhook|router|routes|routing|handler|controller|tasks|worker|pipeline|engine|manager|repository|storage|database|client|service|ingest|clone|parser)/i.test(
      name
    )
  ) {
    value += 24;
  }
  if (/(?:config|types|constants|utils|helpers|schema|models)/i.test(name)) value -= 4;
  if (/(?:analytics|telemetry|logger|logging)/i.test(name)) value -= 20;
  return value;
}

/**
 * Rank repository source files by architectural relevance
 */
export function rankSourcePaths(tree: RepoTreeItem[], limit: number = 30): string[] {
  const candidates: Array<{ path: string; score: number }> = [];

  for (const item of tree) {
    if (item.type !== 'blob') continue;
    if (!isArchitectureSource(item.path)) continue;

    candidates.push({
      path: item.path,
      score: scoreSourcePath(item.path),
    });
  }

  // Sort descending by score
  candidates.sort((a, b) => b.score - a.score);

  return candidates.slice(0, limit).map((c) => c.path);
}

/**
 * Safe string normalization and escaping for Mermaid labels.
 * Ported from GitDiagram (src/server/generate/graph.ts)
 */
export function escapeMermaidText(value: string): string {
  const escaped = (value || '')
    .normalize('NFC')
    .replace(/[\u0000-\u001f\u007f-\u009f\u2028\u2029]+/gu, ' ')
    .replace(/\s+/gu, ' ')
    .trim()
    .replace(/&/g, '&amp;')
    .replace(/#/g, '&#35;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/`/g, '&#96;')
    .replace(/\\/g, '&#92;')
    .replace(/\|/g, '&#124;')
    .replace(/\[/g, '&#91;')
    .replace(/\]/g, '&#93;')
    .replace(/\{/g, '&#123;')
    .replace(/\}/g, '&#125;')
    .replace(/\(/g, '&#40;')
    .replace(/\)/g, '&#41;')
    .trim();

  return escaped || 'Unnamed';
}

function sanitizeId(str: string): string {
  const sanitized = str.toLowerCase().replace(/[^a-z0-9_]/g, '_');
  return sanitized.startsWith('_') ? `node${sanitized}` : sanitized;
}

function mermaidNodeId(nodeId: string): string {
  const clean = sanitizeId(nodeId);
  return clean.startsWith('node_') ? clean : `node_${clean}`;
}

function mermaidGroupId(groupId: string): string {
  const clean = sanitizeId(groupId);
  return clean.startsWith('group_') ? clean : `group_${clean}`;
}

const MAX_NODE_FILE_HINT_LENGTH = 20;

function fileHintForNode(node: DiagramGraphNode): string | null {
  const path = node.path?.trim();
  if (!path || path.endsWith('/') || !path.includes('.')) return null;

  const fileName = path.split('/').pop()?.trim();
  if (!fileName || fileName.length > MAX_NODE_FILE_HINT_LENGTH) return null;

  return `[${escapeMermaidText(fileName)}]`;
}

function labelForNode(node: DiagramGraphNode): string {
  const primaryLabel = escapeMermaidText(node.label);
  const fileHint = fileHintForNode(node);

  return [primaryLabel, fileHint].filter(Boolean).join('<br/>');
}

function renderNode(node: DiagramGraphNode): string {
  const label = labelForNode(node);
  const shape = node.shape ?? 'box';
  const nodeId = mermaidNodeId(node.id);

  switch (shape) {
    case 'database':
      return `${nodeId}[("${label}")]`;
    case 'circle':
      return `${nodeId}(("${label}"))`;
    case 'hexagon':
      return `${nodeId}{{"${label}"}}`;
    case 'queue':
      return `${nodeId}(["${label}"])`;
    case 'box':
    default:
      return `${nodeId}["${label}"]`;
  }
}

function renderEdge(edge: DiagramGraphEdge): string {
  const connector = edge.style === 'dashed' ? '-.->' : '-->';
  const from = mermaidNodeId(edge.from);
  const to = mermaidNodeId(edge.to);

  if (!edge.label) {
    return `${from} ${connector} ${to}`;
  }

  return `${from} ${connector}|"${escapeMermaidText(edge.label)}"| ${to}`;
}

const toneClassNames = [
  'toneBlue',
  'toneAmber',
  'toneMint',
  'toneRose',
  'toneIndigo',
  'toneTeal',
] as const;

export function toneClassForNode(
  node: DiagramGraphNode,
  groupOrder: Map<string, number>
): string {
  const groupIndex = node.groupId ? groupOrder.get(node.groupId) : undefined;
  if (groupIndex !== undefined) {
    return toneClassNames[groupIndex % toneClassNames.length];
  }

  const words = `${node.label} ${node.type} ${node.path || ''}`.toLowerCase();
  if (node.shape === 'database' || /database|storage|cache|postgres|sqlite|redis|store|model/.test(words)) {
    return 'toneAmber';
  }
  if (/queue|worker|background|scheduler|task|cron/.test(words)) {
    return 'toneRose';
  }
  if (/client|browser|user|frontend|view|screen|ui\b|page|template/.test(words)) {
    return 'toneBlue';
  }
  if (/api|server|route|request|handler|webhook|endpoint/.test(words)) {
    return 'toneMint';
  }
  if (!node.path || /model|inference|provider|integration|llm|ai|gemini/.test(words)) {
    return 'toneIndigo';
  }
  return 'toneTeal';
}

function buildGitHubUrl(
  path: string,
  username: string,
  repo: string,
  branch: string
): string {
  const type = path.includes('.') && !path.endsWith('/') ? 'blob' : 'tree';
  const encodedPath = path.split('/').map(encodeURIComponent).join('/');
  return `https://github.com/${encodeURIComponent(username)}/${encodeURIComponent(repo)}/${type}/${encodeURIComponent(branch)}/${encodedPath}`;
}

/**
 * GitDiagram Graph Compiler: Translates structured graph JSON into clean, valid Mermaid.js
 * Ported and enhanced from GitDiagram (src/server/generate/graph.ts)
 */
export function compileDiagramGraph(params: {
  graph: DiagramGraphSchema;
  username: string;
  repo: string;
  branch: string;
}): string {
  const { graph, username, repo, branch } = params;
  const lines: string[] = ['flowchart TD'];
  const groupedNodeIds = new Set<string>();
  const classAssignments = new Map<string, string[]>();
  const groupOrder = new Map(
    graph.groups.map((group, index) => [group.id, index])
  );

  const pushNode = (node: DiagramGraphNode, indent = '  ') => {
    lines.push(`${indent}${renderNode(node)}`);
    const className = toneClassForNode(node, groupOrder);
    classAssignments.set(className, [
      ...(classAssignments.get(className) ?? []),
      node.id,
    ]);
  };

  // 1. Render Subgraphs
  for (const group of graph.groups) {
    lines.push('');
    lines.push(`subgraph ${mermaidGroupId(group.id)}["${escapeMermaidText(group.label)}"]`);
    const groupNodes = graph.nodes.filter((n) => n.groupId === group.id);
    for (const node of groupNodes) {
      pushNode(node, '  ');
      groupedNodeIds.add(node.id);
    }
    lines.push('end');
  }

  // 2. Render Ungrouped Nodes (e.g. External User, Client actors)
  const ungroupedNodes = graph.nodes.filter((n) => !groupedNodeIds.has(n.id));
  if (ungroupedNodes.length > 0) {
    lines.push('');
    for (const node of ungroupedNodes) {
      pushNode(node, '');
    }
  }

  // 3. Render Directed Edges
  if (graph.edges.length > 0) {
    lines.push('');
    for (const edge of graph.edges) {
      lines.push(renderEdge(edge));
    }
  }

  // 4. Clickable Node Links (open directly on GitHub)
  const nodesWithPaths = graph.nodes.filter((node) => node.path);
  if (nodesWithPaths.length > 0 && username && repo) {
    lines.push('');
    for (const node of nodesWithPaths) {
      lines.push(
        `click ${mermaidNodeId(node.id)} "${buildGitHubUrl(node.path!, username, repo, branch)}"`
      );
    }
  }

  // 5. GitDiagram Tone Class Definitions (Neo-brutalist / vibrant styling)
  lines.push('');
  lines.push('classDef toneNeutral fill:#f8fafc,stroke:#334155,stroke-width:1.5px,color:#0f172a');
  lines.push('classDef toneBlue fill:#dbeafe,stroke:#2563eb,stroke-width:1.5px,color:#172554');
  lines.push('classDef toneAmber fill:#fef3c7,stroke:#d97706,stroke-width:1.5px,color:#78350f');
  lines.push('classDef toneMint fill:#dcfce7,stroke:#16a34a,stroke-width:1.5px,color:#14532d');
  lines.push('classDef toneRose fill:#ffe4e6,stroke:#e11d48,stroke-width:1.5px,color:#881337');
  lines.push('classDef toneIndigo fill:#e0e7ff,stroke:#4f46e5,stroke-width:1.5px,color:#312e81');
  lines.push('classDef toneTeal fill:#ccfbf1,stroke:#0f766e,stroke-width:1.5px,color:#134e4a');

  for (const [className, nodeIds] of classAssignments) {
    if (!nodeIds.length) continue;
    lines.push(`class ${nodeIds.map(mermaidNodeId).join(',')} ${className}`);
  }

  return lines.join('\n').trim();
}

/**
 * Strips hallucinated/unknown paths from LLM graph before compilation.
 */
export function stripUnknownGraphPaths(
  graph: DiagramGraphSchema,
  fileTreeLookup: Set<string>
): DiagramGraphSchema {
  const nodes = graph.nodes.map((node) => {
    if (node.path && !fileTreeLookup.has(node.path)) {
      // Check without leading slash or ./
      const norm = node.path.replace(/^\.\//, '').replace(/\/+$/, '');
      if (fileTreeLookup.has(norm)) {
        return { ...node, path: norm };
      }
      return { ...node, path: null };
    }
    return node;
  });

  const edges = graph.edges.map((edge) => {
    if (edge.evidencePath && !fileTreeLookup.has(edge.evidencePath)) {
      return { ...edge, evidencePath: null };
    }
    return edge;
  });

  return { ...graph, nodes, edges };
}

/**
 * Filter invalid edge endpoints so Mermaid never fails to render
 */
export function validateAndCleanGraph(graph: DiagramGraphSchema): DiagramGraphSchema {
  const nodeIds = new Set(graph.nodes.map((n) => n.id));
  const validEdges = graph.edges.filter(
    (e) => nodeIds.has(e.from) && nodeIds.has(e.to) && e.from !== e.to
  );

  return {
    ...graph,
    edges: validEdges,
  };
}

/**
 * Smart Deterministic Architecture Engine:
 * Analyzes repository tree to build an accurate, repo-specific graph even when offline.
 */
export function generateArchitectureGraph(
  metadata: RepoMetadata,
  tree: RepoTreeItem[]
): ArchitectureGraph {
  const rankedPaths = rankSourcePaths(tree, 24);
  const fileLookup = new Set(tree.map((t) => t.path));

  // Partition real files into domain subsystems based on path segments
  const subsystemCategories: Record<string, { label: string; paths: string[] }> = {
    client: { label: 'Client & UI Layer', paths: [] },
    api: { label: 'API & Routing', paths: [] },
    core: { label: 'Core Domain Engine', paths: [] },
    data: { label: 'State & Persistence', paths: [] },
    infra: { label: 'Infrastructure & Config', paths: [] },
  };

  for (const path of rankedPaths) {
    const lower = path.toLowerCase();
    if (
      lower.includes('page') ||
      lower.includes('component') ||
      lower.includes('view') ||
      lower.includes('template') ||
      lower.includes('ui/') ||
      lower.includes('jinja') ||
      lower.endsWith('.tsx') ||
      lower.endsWith('.jsx') ||
      lower.endsWith('.vue') ||
      lower.endsWith('.svelte')
    ) {
      subsystemCategories.client.paths.push(path);
    } else if (
      lower.includes('api') ||
      lower.includes('route') ||
      lower.includes('router') ||
      lower.includes('controller') ||
      lower.includes('server/main') ||
      lower.includes('server.ts') ||
      lower.includes('app.py') ||
      lower.includes('main.py')
    ) {
      subsystemCategories.api.paths.push(path);
    } else if (
      lower.includes('db') ||
      lower.includes('model') ||
      lower.includes('schema') ||
      lower.includes('store') ||
      lower.includes('storage') ||
      lower.includes('redis') ||
      lower.includes('postgres') ||
      lower.includes('repository')
    ) {
      subsystemCategories.data.paths.push(path);
    } else if (
      lower.includes('config') ||
      lower.includes('util') ||
      lower.includes('helper') ||
      lower.includes('manifest') ||
      lower.endsWith('.toml') ||
      lower.endsWith('.json')
    ) {
      subsystemCategories.infra.paths.push(path);
    } else {
      subsystemCategories.core.paths.push(path);
    }
  }

  // Build Groups and Nodes
  const groups: DiagramGraphGroup[] = [];
  const nodes: DiagramGraphNode[] = [];
  const architectureNodes: ArchitectureNode[] = [];

  // External Actor (e.g. Web User / Client)
  const actorNodeId = 'actor_user';
  nodes.push({
    id: actorNodeId,
    label: 'User / Client',
    type: 'actor',
    groupId: null,
    path: null,
    shape: 'circle',
    description: 'External caller or developer initiating workflows',
  });

  architectureNodes.push({
    id: actorNodeId,
    label: 'User / Client',
    path: null,
    type: 'external',
    subsystem: 'External Initiators',
    description: 'External caller or developer initiating workflows',
  });

  const categoryEntries = Object.entries(subsystemCategories).filter(
    ([_, cat]) => cat.paths.length > 0
  );

  for (const [catKey, cat] of categoryEntries) {
    const groupId = `group_${catKey}`;
    groups.push({
      id: groupId,
      label: cat.label,
    });

    for (const path of cat.paths.slice(0, 4)) {
      const fileName = path.split('/').pop() || path;
      const cleanName = fileName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      const titleLabel = cleanName
        .split(' ')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');

      const nodeId = sanitizeId(`node_${path}`);
      const isData = catKey === 'data';

      nodes.push({
        id: nodeId,
        label: titleLabel,
        type: catKey,
        groupId,
        path,
        shape: isData ? 'database' : 'box',
        description: `Source file ${path}`,
      });

      architectureNodes.push({
        id: nodeId,
        label: titleLabel,
        path,
        type:
          catKey === 'client'
            ? 'ui'
            : catKey === 'api'
            ? 'api'
            : catKey === 'data'
            ? 'data'
            : catKey === 'core'
            ? 'service'
            : 'config',
        subsystem: cat.label,
        description: `Architectural component located at ${path}`,
      });
    }
  }

  // If no source files matched (rare bare repo), provide realistic core nodes
  if (nodes.length <= 1) {
    const defaultNodeId = 'node_entry';
    nodes.push({
      id: defaultNodeId,
      label: `${metadata.name} Core Entry`,
      type: 'service',
      groupId: null,
      path: rankedPaths[0] || 'src/index',
      shape: 'box',
      description: 'Primary application entrypoint',
    });
    architectureNodes.push({
      id: defaultNodeId,
      label: `${metadata.name} Core Entry`,
      path: rankedPaths[0] || 'src/index',
      type: 'service',
      subsystem: 'Core Application',
      description: 'Primary application entrypoint',
    });
  }

  // Wire genuine realistic edges between actual detected nodes
  const edges: DiagramGraphEdge[] = [];
  const architectureEdges: ArchitectureEdge[] = [];

  const clientNodes = nodes.filter((n) => n.groupId === 'group_client');
  const apiNodes = nodes.filter((n) => n.groupId === 'group_api');
  const coreNodes = nodes.filter((n) => n.groupId === 'group_core');
  const dataNodes = nodes.filter((n) => n.groupId === 'group_data');
  const infraNodes = nodes.filter((n) => n.groupId === 'group_infra');

  // Actor -> Client or API
  if (clientNodes.length > 0) {
    edges.push({
      from: actorNodeId,
      to: clientNodes[0].id,
      label: 'Interacts with',
      style: 'solid',
    });
  } else if (apiNodes.length > 0) {
    edges.push({
      from: actorNodeId,
      to: apiNodes[0].id,
      label: 'Invokes API',
      style: 'solid',
    });
  } else if (coreNodes.length > 0) {
    edges.push({
      from: actorNodeId,
      to: coreNodes[0].id,
      label: 'Executes',
      style: 'solid',
    });
  }

  // Client -> API
  if (clientNodes.length > 0 && apiNodes.length > 0) {
    edges.push({
      from: clientNodes[0].id,
      to: apiNodes[0].id,
      label: 'HTTP Requests',
      style: 'solid',
    });
  }

  // API -> Core Engine
  if (apiNodes.length > 0 && coreNodes.length > 0) {
    edges.push({
      from: apiNodes[0].id,
      to: coreNodes[0].id,
      label: 'Routes to',
      style: 'solid',
    });
  }

  // Core internal relationships
  if (coreNodes.length > 1) {
    for (let i = 0; i < Math.min(coreNodes.length - 1, 3); i++) {
      edges.push({
        from: coreNodes[i].id,
        to: coreNodes[i + 1].id,
        label: 'Processes',
        style: 'solid',
      });
    }
  }

  // Core -> Data Stores
  if (coreNodes.length > 0 && dataNodes.length > 0) {
    edges.push({
      from: coreNodes[0].id,
      to: dataNodes[0].id,
      label: 'Reads / Writes',
      style: 'solid',
    });
  }

  // Core -> Infra / Config
  if (coreNodes.length > 0 && infraNodes.length > 0) {
    edges.push({
      from: coreNodes[0].id,
      to: infraNodes[0].id,
      label: 'Loads config',
      style: 'dashed',
    });
  }

  for (const edge of edges) {
    architectureEdges.push({
      from: edge.from,
      to: edge.to,
      label: edge.label || undefined,
      isDashed: edge.style === 'dashed',
    });
  }

  const rawGraph: DiagramGraphSchema = {
    explanation: `Architecture map of ${metadata.fullName} featuring ${nodes.length - 1} extracted repository components.`,
    groups,
    nodes,
    edges,
  };

  const cleanGraph = stripUnknownGraphPaths(validateAndCleanGraph(rawGraph), fileLookup);

  const parts = metadata.fullName.split('/');
  const username = parts[0] || metadata.owner;
  const repo = parts[1] || metadata.name;
  const branch = metadata.defaultBranch || 'main';

  const mermaidSource = compileDiagramGraph({
    graph: cleanGraph,
    username,
    repo,
    branch,
  });

  const palette = ['#dbeafe', '#fef3c7', '#dcfce7', '#ffe4e6', '#e0e7ff', '#ccfbf1'];
  const subsystems: ArchitectureSubsystem[] = groups.map((g, idx) => ({
    id: g.id,
    name: g.label,
    color: palette[idx % palette.length],
    nodeIds: nodes.filter((n) => n.groupId === g.id).map((n) => n.id),
  }));

  return {
    title: `${metadata.name} Architecture Diagram`,
    summary: `Interactive architectural breakdown of ${metadata.fullName} based on repository structure.`,
    nodes: architectureNodes,
    edges: architectureEdges,
    subsystems,
    mermaidSource,
  };
}
