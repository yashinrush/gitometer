import React, { useState } from 'react';
import {
  ScanEye,
  Network,
  Sparkles,
  ArrowRight,
  Copy,
  Check,
  ExternalLink,
  Layers,
  Cpu,
  FileCode,
  ShieldCheck,
  CheckCircle2,
  Terminal,
  Zap,
} from 'lucide-react';
import type {
  ActiveTab,
  ArchitectureGraph,
  IngestResult,
  RepoMetadata,
  RepoTreeItem,
  ReversePromptResult,
} from '../types';
import { MermaidViewer } from './MermaidViewer';
import TechText from './TechText';
import TextLoop from './TextLoop';
import BranchedMenu, { type BranchedMenuItem } from './BranchedMenu';
import {
  Download04Icon,
  Rocket01Icon,
  Settings02Icon,
  Layers01Icon,
  PaintBoardIcon,
  CursorPointer01Icon,
  TextFontIcon,
  Notification03Icon,
} from '@hugeicons/core-free-icons';

interface OmniDashboardProps {
  metadata: RepoMetadata;
  tree: RepoTreeItem[];
  ingestResult: IngestResult;
  graph: ArchitectureGraph;
  reverseResult: ReversePromptResult;
  setActiveTab: (tab: ActiveTab) => void;
  isDark: boolean;
}

export const OmniDashboard: React.FC<OmniDashboardProps> = ({
  metadata,
  ingestResult,
  graph,
  reverseResult,
  setActiveTab,
  isDark,
}) => {
  const [copiedDigest, setCopiedDigest] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [activeWordmark, setActiveWordmark] = useState<string>(
    metadata.name ? metadata.name.toUpperCase().slice(0, 12) : 'GITOMETER'
  );
  const [selectedBranch, setSelectedBranch] = useState<string>('codelens_digest');

  const architectureMenuItems: BranchedMenuItem[] = [
    {
      label: 'Context Ingestion (CodeLens)',
      children: [
        { value: 'codelens_digest', label: 'LLM Prompt Digest', icon: Download04Icon },
        { value: 'codelens_ast', label: `Token Telemetry (~${Math.round(ingestResult.stats.tokenCount / 1000)}k)`, icon: Layers01Icon },
        { value: 'codelens_filter', label: 'File Inclusion & Exclusion', icon: Settings02Icon },
      ],
    },
    {
      label: 'Visual System Map (CodeMap)',
      children: [
        { value: 'codemap_flow', label: 'Mermaid Flowchart Engine', icon: Rocket01Icon },
        { value: 'codemap_subsystems', label: `${graph.subsystems.length} Subsystems Detected`, icon: PaintBoardIcon },
        { value: 'codemap_nodes', label: `${graph.nodes.length} Components & Entrypoints`, icon: CursorPointer01Icon },
      ],
    },
    {
      label: 'Prompt Synthesis (PromptForge)',
      children: [
        { value: 'promptforge_prd', label: 'Agentic PRD & Architecture Spec', icon: TextFontIcon },
        { value: 'promptforge_vibe', label: 'Cursor & Claude Vibe Prompts', icon: Notification03Icon },
      ],
    },
  ];

  const handleCopyDigest = async () => {
    try {
      await navigator.clipboard.writeText(ingestResult.digestText);
      setCopiedDigest(true);
      setTimeout(() => setCopiedDigest(false), 2000);
    } catch {}
  };

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(reverseResult.vibePrompt);
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2000);
    } catch {}
  };

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-8 space-y-16 pb-16">
      {/* 1. Landing Page Section Header */}
      <div className="text-center space-y-3 pt-2">
        <div className="inline-flex items-center gap-2">
          <span className="new-badge">PLATFORM</span>
          <span className="text-xs font-bold tracking-wider text-purple-300 uppercase">
            3 Unified Developer Intelligence Engines
          </span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
          Everything you need to master <span className="text-purple-400">{metadata.name}</span>
        </h2>
        <p className="text-sm sm:text-base text-zinc-300 font-medium max-w-2xl mx-auto leading-relaxed">
          Explore the repository from three specialized angles: prompt-ready context dumps for LLMs, interactive visual architecture flowcharts, and reverse-engineered vibe-coding prompts.
        </p>
      </div>

      {/* React Bits: TextLoop Ribbon Wave */}
      <div className="w-full overflow-hidden -my-8 py-2">
        <TextLoop
          text="CODELENS ✦ CODEMAP ✦ PROMPTFORGE ✦ AI CODEBASE INTELLIGENCE ✦ LIVE ARCHITECTURE ✦ REVERSE PRD"
          shape="wave"
          speed={85}
          direction="forward"
          separator="✦"
          curviness={50}
          fontSize={26}
          fontWeight={900}
          letterSpacing={2}
          uppercase
          color="#ffffff"
          ribbon
          ribbonColor={isDark ? '#581c87' : '#7c3aed'}
          ribbonWidth={56}
          pauseOnHover
        />
      </div>

      {/* 2. The 3 Primary Engine Cards (Prominent 3-Column Spotlight) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tool 1: CodeLens */}
        <div className="neo-card p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-md border-2 border-black bg-purple-400 flex items-center justify-center text-black shadow-[2px_2px_0_#000]">
                  <ScanEye className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white tracking-tight">CodeLens</h3>
                  <span className="text-xs font-bold text-purple-300">Context Ingestion</span>
                </div>
              </div>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded border border-black bg-[hsl(var(--neo-panel-muted))] text-purple-200 shadow-[1px_1px_0_#000]">
                ~{Math.round(ingestResult.stats.tokenCount / 1000)}k tokens
              </span>
            </div>

            <p className="text-xs text-zinc-300 font-medium leading-relaxed">
              Transforms the repository into a clean, LLM-optimized prompt digest with selective file filtering and accurate token telemetry.
            </p>

            {/* Tree Preview Box */}
            <div className="p-3 rounded-md border-2 border-black bg-[#0c0917] text-purple-200 font-mono text-[11px] h-44 overflow-y-auto leading-relaxed select-text shadow-[2px_2px_0_#000]">
              <pre>{ingestResult.treeText}</pre>
            </div>

            <div className="flex items-center justify-between text-xs font-semibold text-zinc-300">
              <span>{ingestResult.stats.fileCount} files included</span>
              <span>{ingestResult.stats.totalSizeKb} kB extracted</span>
            </div>
          </div>

          <div className="pt-3 border-t-2 border-black flex items-center gap-2">
            <button
              onClick={handleCopyDigest}
              className="neo-action-btn flex-1 py-2 text-xs flex items-center justify-center gap-1.5 !text-white"
            >
              {copiedDigest ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copiedDigest ? 'Copied' : 'Quick Copy'}</span>
            </button>

            <button
              onClick={() => setActiveTab('codelens')}
              className="neo-action-btn-primary flex-1 py-2 text-xs flex items-center justify-center gap-1.5"
            >
              <span>Explore</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tool 2: CodeMap */}
        <div className="neo-card p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-md border-2 border-black bg-sky-400 flex items-center justify-center text-black shadow-[2px_2px_0_#000]">
                  <Network className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white tracking-tight">CodeMap</h3>
                  <span className="text-xs font-bold text-sky-300">Architecture Diagram</span>
                </div>
              </div>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded border border-black bg-[hsl(var(--neo-panel-muted))] text-sky-200 shadow-[1px_1px_0_#000]">
                {graph.nodes.length} nodes
              </span>
            </div>

            <p className="text-xs text-zinc-300 font-medium leading-relaxed">
              Turns the codebase into an interactive Mermaid architecture flowchart. Click components to inspect dependencies and open GitHub code.
            </p>

            {/* Diagram Preview */}
            <div className="h-44 rounded-md border-2 border-black bg-[#0c0917] overflow-hidden relative shadow-[2px_2px_0_#000]">
              <div className="absolute inset-0 pointer-events-none scale-75 origin-top-left p-2">
                <MermaidViewer
                  mermaidCode={graph.mermaidSource}
                  isDark={isDark}
                />
              </div>
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0c0917] via-[#0c0917]/80 to-transparent h-12 flex items-end justify-center pb-2">
                <span className="text-[11px] font-bold text-purple-300">Interactive Canvas</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs font-semibold text-zinc-300">
              <span>{graph.subsystems.length} subsystems</span>
              <span>{graph.edges.length} connections</span>
            </div>
          </div>

          <div className="pt-3 border-t-2 border-black flex items-center gap-2">
            <a
              href={`https://github.com/${metadata.fullName}`}
              target="_blank"
              rel="noopener noreferrer"
              className="neo-action-btn flex-1 py-2 text-xs flex items-center justify-center gap-1.5 !text-white"
            >
              <ExternalLink className="w-4 h-4" />
              <span>GitHub</span>
            </a>

            <button
              onClick={() => setActiveTab('codemap')}
              className="neo-action-btn-primary flex-1 py-2 text-xs flex items-center justify-center gap-1.5"
            >
              <span>Explore</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tool 3: PromptForge */}
        <div className="neo-card p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-md border-2 border-black bg-pink-400 flex items-center justify-center text-black shadow-[2px_2px_0_#000]">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white tracking-tight">PromptForge</h3>
                  <span className="text-xs font-bold text-pink-300">Prompt Synthesizer</span>
                </div>
              </div>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded border border-black bg-[hsl(var(--neo-panel-muted))] text-pink-200 shadow-[1px_1px_0_#000]">
                {reverseResult.inferredStack.length} techs
              </span>
            </div>

            <p className="text-xs text-zinc-300 font-medium leading-relaxed">
              Synthesizes production PRDs, architecture specifications, and copy-paste vibe-coding instructions tailored for Cursor, Claude Code, and Windsurf.
            </p>

            {/* Prompt Preview */}
            <div className="p-3 rounded-md border-2 border-black bg-[#0c0917] text-purple-200 font-mono text-[11px] h-44 overflow-y-auto leading-relaxed select-text shadow-[2px_2px_0_#000]">
              <pre className="whitespace-pre-wrap">{reverseResult.vibePrompt.slice(0, 480)}...</pre>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold text-zinc-300">
              {reverseResult.inferredStack.slice(0, 3).map((tech: string) => (
                <span key={tech} className="px-2 py-0.5 rounded border border-black bg-[hsl(var(--neo-panel-muted))] text-[10px] text-white">
                  {tech}
                </span>
              ))}
              {reverseResult.inferredStack.length > 3 && (
                <span className="text-[10px] text-zinc-400">+{reverseResult.inferredStack.length - 3}</span>
              )}
            </div>
          </div>

          <div className="pt-3 border-t-2 border-black flex items-center gap-2">
            <button
              onClick={handleCopyPrompt}
              className="neo-action-btn flex-1 py-2 text-xs flex items-center justify-center gap-1.5 !text-white"
            >
              {copiedPrompt ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copiedPrompt ? 'Copied' : 'Quick Copy'}</span>
            </button>

            <button
              onClick={() => setActiveTab('promptforge')}
              className="neo-action-btn-primary flex-1 py-2 text-xs flex items-center justify-center gap-1.5"
            >
              <span>Explore</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* React Bits: TechText Interactive Vector Canvas Showcase */}
      <div className="neo-card p-6 sm:p-8 space-y-4 text-center overflow-hidden border-2 border-black bg-gradient-to-b from-[#130f26] to-[#0c0917] shadow-[6px_6px_0_#000]">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-purple-900/40 pb-3">
          <div className="flex items-center gap-2">
            <span className="new-badge">INTERACTIVE VECTOR CANVAS</span>
            <span className="text-xs font-mono text-purple-300 font-bold">
              TechText Engine • Hover or drag glyphs to reveal wireframes
            </span>
          </div>

          {/* Quick Wordmark Switcher */}
          <div className="flex items-center gap-1.5 text-xs font-mono">
            {['GITOMETER', metadata.name ? metadata.name.toUpperCase().slice(0, 10) : 'FASTAPI', 'CODELENS', 'CODEMAP'].map((word) => (
              <button
                key={word}
                onClick={() => setActiveWordmark(word)}
                className={`px-2 py-0.5 rounded border border-black text-[11px] font-bold transition-all ${
                  activeWordmark === word
                    ? 'bg-purple-400 text-black shadow-[1px_1px_0_#000]'
                    : 'bg-[#1e1738] text-purple-200 hover:bg-purple-900/40'
                }`}
              >
                {word}
              </button>
            ))}
          </div>
        </div>

        <div className="w-full h-44 sm:h-56 relative flex items-center justify-center">
          <TechText
            key={activeWordmark}
            text={activeWordmark}
            fontWeight={900}
            fontSize={120}
            color="#ffffff"
            accentColor="#c084fc"
            reveal="letter"
            dashLength={4}
            dashGap={2}
            specks={16}
            draggable={true}
            sweep={true}
            speed={1.2}
          />
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-zinc-300 pt-1 border-t border-purple-900/30">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            Interactive Vector Outlines Under Pointer
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-pink-400" />
            Quantum Specks & Frame Coordinates
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-sky-400" />
            Physics-Based Drag & Release
          </span>
        </div>
      </div>

      {/* React Bits: BranchedMenu Interactive Architecture Blueprint */}
      <div className="neo-card p-6 sm:p-8 space-y-6 border-2 border-black bg-gradient-to-b from-[#100d20] to-[#0c0917] shadow-[6px_6px_0_#000]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-purple-900/40 pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2">
              <span className="new-badge">BRANCHED RAIL NAVIGATOR</span>
              <span className="text-xs font-bold text-purple-300">Interactive Blueprint</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Modular Architecture & Telemetry Tree
            </h3>
          </div>
          <span className="text-xs font-mono text-zinc-400">
            Select any node to view real-time engine telemetry
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Left Column: BranchedMenu */}
          <div className="md:col-span-5 p-4 rounded-lg border-2 border-black bg-[#08060f] shadow-[3px_3px_0_#000] overflow-x-auto">
            <span className="block text-[11px] font-mono text-purple-400 font-bold uppercase tracking-wider mb-2">
              Subsystems & Modules
            </span>
            <BranchedMenu
              items={architectureMenuItems}
              defaultOpen={[0, 1, 2]}
              defaultActive={selectedBranch}
              onSelect={(val) => {
                setSelectedBranch(val);
                if (val.startsWith('codelens')) setActiveTab('codelens');
                else if (val.startsWith('codemap')) setActiveTab('codemap');
                else if (val.startsWith('promptforge')) setActiveTab('promptforge');
              }}
              color="#e4e4e7"
              accentColor="#c084fc"
              lineColor="#3b2d54"
              width={340}
              rowHeight={36}
              indent={36}
              trunk={14}
              fontSize={13}
            />
          </div>

          {/* Right Column: Node Details & Actions */}
          <div className="md:col-span-7 space-y-4">
            <div className="p-5 rounded-lg border-2 border-black bg-[#08060f] shadow-[3px_3px_0_#000] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-purple-300 uppercase tracking-wider">
                  Target Component
                </span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-purple-950/80 border border-purple-800 text-purple-200">
                  {selectedBranch}
                </span>
              </div>

              {selectedBranch.startsWith('codelens') && (
                <div className="space-y-3">
                  <h4 className="text-lg font-black text-white">CodeLens Context Ingestion</h4>
                  <p className="text-xs text-zinc-300 leading-relaxed font-medium">
                    Prepares high-density, noise-free context digests formatted specifically for LLM system prompts. Strips out binaries, lockfiles, and auto-generated assets.
                  </p>
                  <div className="flex items-center gap-4 text-xs font-mono text-zinc-300 pt-2 border-t border-purple-900/30">
                    <div>Tokens: <strong className="text-white">~{Math.round(ingestResult.stats.tokenCount / 1000)}k</strong></div>
                    <div>Files: <strong className="text-white">{ingestResult.stats.fileCount}</strong></div>
                    <div>Size: <strong className="text-white">{ingestResult.stats.totalSizeKb} kB</strong></div>
                  </div>
                  <button
                    onClick={() => setActiveTab('codelens')}
                    className="neo-action-btn-primary py-2 px-4 text-xs flex items-center gap-2 mt-2"
                  >
                    <span>Open CodeLens Workbench</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {selectedBranch.startsWith('codemap') && (
                <div className="space-y-3">
                  <h4 className="text-lg font-black text-white">CodeMap Architectural Flow</h4>
                  <p className="text-xs text-zinc-300 leading-relaxed font-medium">
                    Synthesizes static AST calls, entrypoints, and file relationships into an interactive Mermaid flowchart with clickable nodes leading to GitHub source lines.
                  </p>
                  <div className="flex items-center gap-4 text-xs font-mono text-zinc-300 pt-2 border-t border-purple-900/30">
                    <div>Nodes: <strong className="text-white">{graph.nodes.length}</strong></div>
                    <div>Subsystems: <strong className="text-white">{graph.subsystems.length}</strong></div>
                    <div>Edges: <strong className="text-white">{graph.edges.length}</strong></div>
                  </div>
                  <button
                    onClick={() => setActiveTab('codemap')}
                    className="neo-action-btn-primary py-2 px-4 text-xs flex items-center gap-2 mt-2 !bg-sky-400 hover:!bg-sky-300 text-black"
                  >
                    <span>Open CodeMap Visualizer</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {selectedBranch.startsWith('promptforge') && (
                <div className="space-y-3">
                  <h4 className="text-lg font-black text-white">PromptForge PRD & Vibe Prompts</h4>
                  <p className="text-xs text-zinc-300 leading-relaxed font-medium">
                    Reverse-engineers complete software architecture contracts, tech stacks, and step-by-step vibe-coding agent prompts for Cursor, Claude Code, and Windsurf.
                  </p>
                  <div className="flex items-center gap-4 text-xs font-mono text-zinc-300 pt-2 border-t border-purple-900/30">
                    <div>Stack: <strong className="text-white">{reverseResult.inferredStack.slice(0, 3).join(', ')}</strong></div>
                    <div>Target: <strong className="text-white">Autonomous Agents</strong></div>
                  </div>
                  <button
                    onClick={() => setActiveTab('promptforge')}
                    className="neo-action-btn-primary py-2 px-4 text-xs flex items-center gap-2 mt-2 !bg-pink-400 hover:!bg-pink-300 text-black"
                  >
                    <span>Open PromptForge Studio</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Deep-Dive Landing Page Showcase (Aligned One After Another) */}
      <div className="space-y-10 pt-4">
        <div className="text-center space-y-2">
          <span className="new-badge">WORKFLOW SHOWCASE</span>
          <h3 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
            Deep-Dive Into Each Dimension
          </h3>
          <p className="text-xs sm:text-sm text-zinc-300 max-w-xl mx-auto">
            See how Gitometer equips developers with complete codebase comprehension from Day 1.
          </p>
        </div>

        {/* Feature 1: CodeLens Showcase */}
        <div className="neo-card p-6 sm:p-8 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1 space-y-4">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded border border-black bg-purple-400/20 text-purple-300 font-bold text-xs">
              <ScanEye className="w-4 h-4 text-purple-400" />
              <span>DIMENSION 1 • CODELENS</span>
            </div>
            <h4 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              AI-Ready Context Ingestion Without Token Overflow
            </h4>
            <p className="text-sm text-zinc-300 leading-relaxed font-medium">
              Feeding entire GitHub repos into ChatGPT, Claude, or Gemini often fails due to binary files, dependency bloat, and context window limits. CodeLens strips the noise, filters paths by wildcard, and creates an optimized prompt dump with exact token telemetry.
            </p>
            <div className="space-y-2 text-xs text-zinc-200 font-semibold pt-1">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                <span>Granular file tree inclusion and exclusion with live checkbox controls</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                <span>Real-time token estimation with automated file size threshold filters</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                <span>One-click copy or .txt export formatted for ChatGPT, Claude, and Gemini</span>
              </div>
            </div>
            <div className="pt-2">
              <button
                onClick={() => setActiveTab('codelens')}
                className="neo-action-btn-primary py-2.5 px-5 text-xs flex items-center gap-2"
              >
                <span>Launch CodeLens Engine</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="w-full md:w-96 rounded-lg border-2 border-black bg-[#0c0917] p-4 shadow-[4px_4px_0_#000] text-purple-200 font-mono text-xs space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-800 text-[11px] text-zinc-400">
              <span className="font-bold text-purple-300">CodeLens Context Dump</span>
              <span>~{Math.round(ingestResult.stats.tokenCount / 1000)}k tokens</span>
            </div>
            <div className="h-48 overflow-y-auto leading-relaxed select-text text-[11px]">
              <pre>{ingestResult.digestText.slice(0, 600)}...</pre>
            </div>
            <div className="pt-2 text-[10px] text-zinc-400 text-right">
              {ingestResult.stats.fileCount} files • {ingestResult.stats.totalSizeKb} kB
            </div>
          </div>
        </div>

        {/* Feature 2: CodeMap Showcase */}
        <div className="neo-card p-6 sm:p-8 flex flex-col md:flex-row-reverse items-center gap-8">
          <div className="flex-1 space-y-4">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded border border-black bg-sky-400/20 text-sky-300 font-bold text-xs">
              <Network className="w-4 h-4 text-sky-400" />
              <span>DIMENSION 2 • CODEMAP</span>
            </div>
            <h4 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Interactive System Architecture & Source Jumps
            </h4>
            <p className="text-sm text-zinc-300 leading-relaxed font-medium">
              Understand how data and control flow through {metadata.fullName}. CodeMap identifies entrypoints, controllers, data models, and services, rendering them as an interactive Mermaid diagram where every node links directly to the GitHub source line.
            </p>
            <div className="space-y-2 text-xs text-zinc-200 font-semibold pt-1">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                <span>Interactive Mermaid flowchart with fluid pan, zoom, and reset controls</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                <span>Component inspector with subsystem breakdown and dependency counts</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                <span>Direct jump to GitHub source file lines and export to PNG, SVG, or Mermaid</span>
              </div>
            </div>
            <div className="pt-2">
              <button
                onClick={() => setActiveTab('codemap')}
                className="neo-action-btn-primary py-2.5 px-5 text-xs flex items-center gap-2"
              >
                <span>Launch CodeMap Visualizer</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="w-full md:w-96 rounded-lg border-2 border-black bg-[#0c0917] p-3 shadow-[4px_4px_0_#000] relative overflow-hidden">
            <div className="h-56 overflow-hidden relative">
              <div className="absolute inset-0 pointer-events-none scale-90 origin-top-left">
                <MermaidViewer
                  mermaidCode={graph.mermaidSource}
                  isDark={isDark}
                />
              </div>
            </div>
            <div className="pt-2 border-t border-neutral-800 flex justify-between text-[11px] font-bold text-zinc-400">
              <span>{graph.nodes.length} Component Nodes</span>
              <span>{graph.subsystems.length} Subsystems</span>
            </div>
          </div>
        </div>

        {/* Feature 3: PromptForge Showcase */}
        <div className="neo-card p-6 sm:p-8 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1 space-y-4">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded border border-black bg-pink-400/20 text-pink-300 font-bold text-xs">
              <Sparkles className="w-4 h-4 text-pink-400" />
              <span>DIMENSION 3 • PROMPTFORGE</span>
            </div>
            <h4 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Reverse-Engineered PRDs & Vibe-Coding Prompts
            </h4>
            <p className="text-sm text-zinc-300 leading-relaxed font-medium">
              Want to replicate or extend features from {metadata.fullName}? PromptForge synthesizes a complete product requirements document (PRD), architectural contracts, and tailored instructions ready to paste into Cursor Composer, Claude Code, Windsurf, or Copilot.
            </p>
            <div className="space-y-2 text-xs text-zinc-200 font-semibold pt-1">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-pink-400 shrink-0" />
                <span>Tailored agent configurations for Cursor, Claude Code, Windsurf, and v0</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-pink-400 shrink-0" />
                <span>Complete PRD breakdown: Value proposition, data schemas, API contracts</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-pink-400 shrink-0" />
                <span>Phase-by-phase implementation roadmap for autonomous coding agents</span>
              </div>
            </div>
            <div className="pt-2">
              <button
                onClick={() => setActiveTab('promptforge')}
                className="neo-action-btn-primary py-2.5 px-5 text-xs flex items-center gap-2"
              >
                <span>Launch PromptForge Studio</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="w-full md:w-96 rounded-lg border-2 border-black bg-[#0c0917] p-4 shadow-[4px_4px_0_#000] text-purple-200 font-mono text-xs space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-800 text-[11px] text-zinc-400">
              <span className="font-bold text-pink-300">Reverse PRD Spec</span>
              <span>{reverseResult.inferredStack.join(', ')}</span>
            </div>
            <div className="h-48 overflow-y-auto leading-relaxed select-text text-[11px]">
              <pre className="whitespace-pre-wrap">{reverseResult.prdSpec.slice(0, 600)}...</pre>
            </div>
            <div className="pt-2 text-[10px] text-zinc-400 text-right">
              Ready for Agentic Scaffolding
            </div>
          </div>
        </div>
      </div>

      {/* 4. How It Works in 3 Steps (Clean, High-Contrast Neo Cards) */}
      <div className="space-y-6 pt-4">
        <div className="text-center space-y-2">
          <span className="new-badge">WORKFLOW</span>
          <h3 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
            How Gitometer Works
          </h3>
          <p className="text-xs sm:text-sm text-zinc-300 font-medium">
            From raw repository link to multi-dimensional developer intelligence in seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="neo-card p-6 space-y-3">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full border-2 border-black bg-purple-400 text-black font-black text-sm flex items-center justify-center shadow-[1px_1px_0_#000]">
                1
              </span>
              <h4 className="font-black text-base text-white">Input Any Repository</h4>
            </div>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-medium">
              Paste any GitHub repository URL or slug (e.g. <code>fastapi/fastapi</code>). Or choose from one-click presets like Tailwind, React, or FastAPI.
            </p>
          </div>

          <div className="neo-card p-6 space-y-3">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full border-2 border-black bg-sky-400 text-black font-black text-sm flex items-center justify-center shadow-[1px_1px_0_#000]">
                2
              </span>
              <h4 className="font-black text-base text-white">Deep Engine Analysis</h4>
            </div>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-medium">
              Our engines parse the file tree, calculate LLM token budgets, extract architectural subsystems, and infer frameworks and technologies.
            </p>
          </div>

          <div className="neo-card p-6 space-y-3">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full border-2 border-black bg-pink-400 text-black font-black text-sm flex items-center justify-center shadow-[1px_1px_0_#000]">
                3
              </span>
              <h4 className="font-black text-base text-white">Actionable Output</h4>
            </div>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-medium">
              Switch seamlessly between context dumps for chat LLMs, interactive diagrams for mental models, and vibe prompts for Cursor or Claude.
            </p>
          </div>
        </div>
      </div>

      {/* 5. Bottom Call to Action Banner */}
      <div className="neo-panel rounded-xl p-8 text-center space-y-4">
        <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Ready to decode your next codebase?
        </h3>
        <p className="text-sm text-zinc-300 font-medium max-w-xl mx-auto">
          Start exploring {metadata.fullName} right now or enter any public or private GitHub repository above.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={() => setActiveTab('codelens')}
            className="neo-action-btn-primary py-2.5 px-5 text-xs font-bold"
          >
            Open CodeLens (Ingest)
          </button>
          <button
            onClick={() => setActiveTab('codemap')}
            className="neo-action-btn-primary py-2.5 px-5 text-xs font-bold !bg-sky-400 hover:!bg-sky-300"
          >
            Open CodeMap (Diagram)
          </button>
          <button
            onClick={() => setActiveTab('promptforge')}
            className="neo-action-btn-primary py-2.5 px-5 text-xs font-bold !bg-pink-400 hover:!bg-pink-300"
          >
            Open PromptForge (PRD)
          </button>
        </div>
      </div>
    </div>
  );
};
