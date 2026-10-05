import { RepoMetadata, RepoTreeItem, ReversePromptResult, TargetAgent } from '../types';

/**
 * Infer technology stack from file extensions, filenames, and metadata
 */
export function inferTechStack(metadata: RepoMetadata, tree: RepoTreeItem[]): string[] {
  const stack = new Set<string>();

  if (metadata.language && metadata.language !== 'Unknown') {
    stack.add(metadata.language);
  }

  const paths = tree.map((t) => t.path.toLowerCase());

  if (paths.some((p) => p.includes('next.config') || p.includes('app/page.'))) {
    stack.add('Next.js');
    stack.add('React');
  } else if (paths.some((p) => p.includes('vite.config'))) {
    stack.add('Vite');
  }

  if (paths.some((p) => p.includes('tailwind.config') || p.includes('postcss'))) {
    stack.add('Tailwind CSS');
  }

  if (paths.some((p) => p.endsWith('.ts') || p.endsWith('.tsx'))) {
    stack.add('TypeScript');
  }

  if (paths.some((p) => p.includes('fastapi') || p.includes('requirements.txt'))) {
    stack.add('Python');
    if (paths.some((p) => p.includes('fastapi') || p.includes('uvicorn'))) {
      stack.add('FastAPI');
    }
  }

  if (paths.some((p) => p.includes('dockerfile') || p.includes('compose.yml'))) {
    stack.add('Docker');
  }

  if (paths.some((p) => p.includes('mermaid'))) {
    stack.add('Mermaid.js');
  }

  if (paths.some((p) => p.includes('redis') || p.includes('upstash'))) {
    stack.add('Redis');
  }

  if (paths.some((p) => p.includes('supabase'))) {
    stack.add('Supabase');
  }

  if (stack.size === 0) {
    stack.add('JavaScript');
    stack.add('Modern Web');
  }

  return Array.from(stack);
}

/**
 * Generate reverse engineered prompts and specifications
 */
export function generateReversePrompt(
  metadata: RepoMetadata,
  tree: RepoTreeItem[],
  readmeContent?: string,
  targetAgent: TargetAgent = 'cursor'
): ReversePromptResult {
  const stack = inferTechStack(metadata, tree);
  const stackStr = stack.join(', ');

  // Extract key bullet capabilities from README or generate from name
  const capabilities: string[] = [];
  if (readmeContent) {
    const lines = readmeContent.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (
        (trimmed.startsWith('- ') || trimmed.startsWith('* ')) &&
        trimmed.length > 10 &&
        trimmed.length < 140 &&
        !trimmed.includes('http') &&
        !trimmed.includes('badge')
      ) {
        capabilities.push(trimmed.replace(/^[-*]\s+/, '').replace(/\*\*/g, ''));
        if (capabilities.length >= 5) break;
      }
    }
  }

  if (capabilities.length === 0) {
    capabilities.push(`Core workflow automation and processing engine for ${metadata.name}`);
    capabilities.push(`Responsive, high-contrast user interface with interactive feedback`);
    capabilities.push(`Configurable options, robust error handling, and export capabilities`);
    capabilities.push(`Lightweight client and modular backend service architecture`);
  }

  // 1. Vibe Coding Prompt (Casual, outcome-focused, natural speech)
  const agentPrefix = {
    cursor: 'Hey Cursor, I want you to build me',
    claude: 'I need you to build a full-featured application from scratch:',
    windsurf: 'Windsurf, let’s build a complete project together:',
    copilot: 'Generate a production-ready application that works as follows:',
    chatgpt: 'Act as a principal software engineer and build this project step-by-step:',
  }[targetAgent];

  const vibePrompt = `${agentPrefix} ${metadata.name}, a clean and fast tool that ${metadata.description.toLowerCase().replace(/\.$/, '')}.

The stack should be built with ${stackStr}. Make sure the UI feels snappy and modern with clear visual feedback, bold neo-brutalist styling with high-contrast borders and subtle shadows, and responsive design.

The key features it needs to have:
${capabilities.map((c) => `• ${c}`).join('\n')}

Keep the architecture modular and well-structured, provide clear error states, and allow users to run it locally or deploy easily. Make sure all imports and dependencies are properly configured, and write clean, self-documenting code.`;

  // 2. PRD & Technical Architecture Spec
  const prdSpec = `# Technical Specification: ${metadata.name} Rebuild

## 1. Product Summary
${metadata.description}

## 2. Inferred Technology Stack
${stack.map((s) => `- **${s}**`).join('\n')}

## 3. Core Functional Requirements
${capabilities.map((c, i) => `${i + 1}. **${c.split(':')[0] || 'Feature'}**: ${c}`).join('\n')}

## 4. Suggested Folder Structure
\`\`\`text
${metadata.name}/
├── src/
│   ├── components/       # Reusable UI components & layouts
│   ├── services/         # Core business logic & API integration
│   ├── types/            # TypeScript interfaces & domain types
│   ├── styles/           # Tailwind CSS & theme tokens
│   └── main.tsx          # Application entrypoint
├── public/               # Static assets & icons
├── package.json          # Dependencies and build scripts
└── README.md             # Project documentation & run guide
\`\`\`

## 5. Non-Functional Requirements
- **Performance**: Sub-100ms render response, lazy-loaded components
- **Aesthetics**: Neo-brutalist developer-first UI (warm canvas, hard shadows, monospace accents)
- **Reliability**: Graceful offline handling, validation on all user inputs
- **Security**: Sanitized inputs, no hardcoded API secrets`;

  // 3. Phased Implementation Roadmap
  const roadmap = `# Phased Implementation Roadmap for ${metadata.name}

### Phase 1: Project Scaffolding & Design Foundation
- Initialize project with ${stack.slice(0, 2).join(' + ')}
- Setup styling configuration and neo-brutalist design tokens (borders, shadows, custom palette)
- Define core domain TypeScript interfaces in \`src/types/index.ts\`

### Phase 2: Core Domain Logic & State Management
- Implement primary computational engine and input validator
- Build caching mechanisms and error boundary wrappers
- Create mock datasets for instant local development and testing

### Phase 3: Interactive UI & Component Assembly
- Build main input hero section with repository URL parsing
- Implement interactive visualization panels and export triggers
- Add dark/light mode toggle with theme persistence

### Phase 4: Polish, Optimization & Verification
- Add micro-animations, copy-to-clipboard toast notifications
- Validate responsive layouts across mobile, tablet, and widescreen
- Write smoke tests and automated build verification`;

  return {
    vibePrompt,
    prdSpec,
    roadmap,
    inferredStack: stack,
    keyCapabilities: capabilities,
  };
}
