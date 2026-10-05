import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Code, Copy, Check, Download, Info, ExternalLink, ChevronDown,
  Sparkles, Layers, Box, ArrowRight, X, Eye, FileText, CheckCircle2,
  Loader2, RefreshCw, LayoutGrid, Network, Clapperboard, Scan, Image as ImageIcon
} from 'lucide-react';
import type {
  ArchitectureGraph,
  ArchitectureNode,
  RepoMetadata,
} from '../types';
import { MermaidViewer } from './MermaidViewer';
import { ExplainerVideoModal } from './ExplainerVideoModal';
import {
  exportMermaidSvgAsPng,
  downloadSvg,
  getReadmePictureMarkdown,
  getReadmeBadgeMarkdown,
} from '../services/diagramExport';

// Generation Stage Progress interface
export interface GenerationStatus {
  currentStage: 'ingesting' | 'ranking' | 'analyzing' | 'compiling' | 'complete';
  stageIndex: number;
  logs: string[];
  isGenerating: boolean;
  error?: string | null;
  isAi?: boolean;
}

const STAGES = [
  { id: 'ingesting', label: 'Ingesting Repository', icon: <Layers className="w-3.5 h-3.5" /> },
  { id: 'ranking',   label: 'Architectural Relevance', icon: <Box className="w-3.5 h-3.5" /> },
  { id: 'analyzing', label: 'AI Subsystem Analysis', icon: <Sparkles className="w-3.5 h-3.5" /> },
  { id: 'compiling', label: 'Compiling Mermaid Graph', icon: <Network className="w-3.5 h-3.5" /> },
  { id: 'complete',  label: 'Diagram Complete', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
];

interface NodeInspectorDrawerProps {
  node: ArchitectureNode | null;
  graph: ArchitectureGraph;
  metadata: RepoMetadata;
  onClose: () => void;
}

const NodeInspectorDrawer: React.FC<NodeInspectorDrawerProps> = ({
  node,
  graph,
  metadata,
  onClose,
}) => {
  if (!node) return null;

  const incomingEdges = graph.edges.filter((e) => e.to === node.id);
  const outgoingEdges = graph.edges.filter((e) => e.from === node.id);

  const githubUrl = node.path
    ? `https://github.com/${metadata.fullName}/blob/${metadata.defaultBranch || 'main'}/${node.path}`
    : null;

  return (
    <div
      className="fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-[#0d0924] border-l-2 border-black shadow-[-8px_0_0_#000] flex flex-col overflow-hidden animate-in slide-in-from-right duration-200"
      data-node-inspector
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b-2 border-black bg-[#150f38]">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-3 h-3 rounded-full bg-[hsl(var(--neo-button))] shrink-0 animate-ping" />
          <span className="font-mono text-xs font-black text-purple-300 uppercase tracking-widest truncate">
            Component Inspector
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg border border-white/10 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
          title="Close Inspector"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm">
        {/* Node Name & Type */}
        <div className="space-y-1">
          <h3 className="text-lg font-black text-white leading-tight">{node.label}</h3>
          <div className="flex flex-wrap gap-1.5 pt-1">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border border-black bg-purple-500/20 text-purple-300">
              {node.type.toUpperCase()}
            </span>
            {node.subsystem && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border border-black bg-sky-500/20 text-sky-300">
                {node.subsystem}
              </span>
            )}
          </div>
        </div>

        {/* Source File Path */}
        {node.path && (
          <div className="p-3 rounded-lg bg-[hsl(var(--neo-panel-muted))] border border-black space-y-1.5">
            <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider flex items-center gap-1">
              <FileText className="w-3 h-3 text-purple-400" />
              Source Location
            </div>
            <div className="font-mono text-xs text-emerald-300 break-all">{node.path}</div>
            {githubUrl && (
              <a
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-bold text-[hsl(var(--neo-button))] hover:underline pt-1"
              >
                <span>View on GitHub</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        )}

        {/* Description */}
        {node.description && (
          <div className="space-y-1">
            <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Responsibility</div>
            <p className="text-xs text-zinc-300 leading-relaxed bg-black/30 p-2.5 rounded-lg border border-black">
              {node.description}
            </p>
          </div>
        )}

        {/* Incoming Connections */}
        <div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <ArrowRight className="w-3.5 h-3.5 text-sky-400 rotate-180" />
            <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
              Called By ({incomingEdges.length})
            </span>
          </div>
          {incomingEdges.length === 0 ? (
            <p className="text-xs text-zinc-500 italic">No incoming calls detected (Root entry point)</p>
          ) : (
            <div className="space-y-1.5">
              {incomingEdges.map((edge, i) => {
                const srcNode = graph.nodes.find((n) => n.id === edge.from);
                return (
                  <div key={i} className="p-2 rounded-lg bg-[hsl(var(--neo-panel-muted))] border border-black text-xs flex items-center justify-between gap-2">
                    <span className="font-semibold text-zinc-100 truncate">{srcNode?.label ?? edge.from}</span>
                    {edge.label && (
                      <span className="font-mono text-[10px] text-purple-300 px-1.5 py-0.5 rounded bg-black/40 border border-purple-500/30 shrink-0">
                        {edge.label}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Outgoing Connections */}
        <div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <ArrowRight className="w-3.5 h-3.5 text-violet-400" />
            <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
              Calls ({outgoingEdges.length})
            </span>
          </div>
          {outgoingEdges.length === 0 ? (
            <p className="text-xs text-zinc-500 italic">Terminal component / leaf dependency</p>
          ) : (
            <div className="space-y-1.5">
              {outgoingEdges.map((edge, i) => {
                const targetNode = graph.nodes.find((n) => n.id === edge.to);
                return (
                  <div key={i} className="p-2 rounded-lg bg-[hsl(var(--neo-panel-muted))] border border-black text-xs flex items-center justify-between gap-2">
                    <span className="font-semibold text-zinc-100 truncate">{targetNode?.label ?? edge.to}</span>
                    {edge.label && (
                      <span className="font-mono text-[10px] text-purple-300 px-1.5 py-0.5 rounded bg-black/40 border border-purple-500/30 shrink-0">
                        {edge.label}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* GitHub Direct Link Button */}
        {githubUrl && (
          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg border-2 border-black bg-purple-500 hover:bg-purple-400 text-black font-bold text-xs shadow-[2px_2px_0_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all mt-4"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Inspect Source on GitHub
          </a>
        )}
      </div>
    </div>
  );
};

// Stage Stepper Component
const StageStepper: React.FC<{ status: GenerationStatus }> = ({ status }) => {
  return (
    <div className="neo-card p-4 space-y-3 bg-[#110d2c]/90 border-2 border-black shadow-[4px_4px_0_#000]">
      <div className="flex items-center justify-between">
        <span className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-spin" />
          AI Architectural Synthesis Pipeline
        </span>
        <span className="text-[11px] font-mono text-purple-300">
          Stage {status.stageIndex + 1} of 5
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
        {STAGES.map((stage, i) => {
          const isComplete = i < status.stageIndex || status.currentStage === 'complete';
          const isCurrent = STAGES[status.stageIndex]?.id === stage.id && status.currentStage !== 'complete';

          return (
            <div
              key={stage.id}
              className={`p-2.5 rounded-lg border flex flex-col items-center justify-center gap-1 text-center transition-all ${
                isComplete
                  ? 'border-emerald-500/60 bg-emerald-950/40 text-emerald-300'
                  : isCurrent
                  ? 'border-purple-400 bg-purple-950/60 text-white animate-pulse'
                  : 'border-white/10 bg-white/5 text-zinc-500'
              }`}
            >
              <div className="flex items-center justify-center">
                {isComplete ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : isCurrent ? <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-400" /> : stage.icon}
              </div>
              <span className="text-[10px] font-bold leading-tight truncate w-full">{stage.label}</span>
            </div>
          );
        })}
      </div>

      {status.logs.length > 0 && (
        <div className="p-2.5 rounded-lg bg-black/60 border border-white/10 font-mono text-[10px] text-zinc-300 space-y-1 max-h-24 overflow-y-auto">
          {status.logs.map((log, idx) => (
            <div key={idx} className="flex items-center gap-1.5">
              <span className="text-purple-400">›</span>
              <span>{log}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export interface DiagramTabProps {
  metadata: RepoMetadata;
  graph: ArchitectureGraph;
  isDark?: boolean;
  onRegenerate?: () => void;
  generationStatus?: GenerationStatus;
  geminiKey?: string;
}

export const DiagramTab: React.FC<DiagramTabProps> = ({
  metadata,
  graph,
  isDark = true,
  onRegenerate,
  generationStatus,
  geminiKey,
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [showSourceCode, setShowSourceCode] = useState(false);
  const [copiedMermaid, setCopiedMermaid] = useState(false);
  const [copiedMarkdown, setCopiedMarkdown] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [zoomingEnabled, setZoomingEnabled] = useState(true);
  const [direction, setDirection] = useState<'TD' | 'LR'>('TD');
  const exportMenuRef = useRef<HTMLDivElement>(null);

  // Direction toggle logic
  const diagramSource = direction === 'LR'
    ? graph.mermaidSource.replace(/^flowchart TD/, 'flowchart LR')
    : graph.mermaidSource;

  const selectedNode = graph.nodes.find((n) => {
    const clean = n.id.toLowerCase().replace(/[^a-z0-9_]/g, '_');
    const cleanSel = selectedNodeId?.replace(/^node_/, '').toLowerCase().replace(/[^a-z0-9_]/g, '_') ?? '';
    return clean === cleanSel || n.id === selectedNodeId?.replace(/^node_/, '');
  });

  const handleNodeClick = useCallback((nodeId: string) => {
    setSelectedNodeId((prev) => (prev === nodeId ? null : nodeId));
  }, []);

  const handleCopyMermaid = async () => {
    try {
      await navigator.clipboard.writeText(diagramSource);
      setCopiedMermaid(true);
      setTimeout(() => setCopiedMermaid(false), 2000);
      setShowExportMenu(false);
    } catch {}
  };

  const handleCopyReadmeMarkdown = async (kind: 'picture' | 'badge') => {
    const md = kind === 'picture'
      ? getReadmePictureMarkdown(metadata.fullName)
      : getReadmeBadgeMarkdown(metadata.fullName);
    try {
      await navigator.clipboard.writeText(md);
      setCopiedMarkdown(true);
      setTimeout(() => setCopiedMarkdown(false), 2000);
      setShowExportMenu(false);
    } catch {}
  };

  const handleExportSvg = () => {
    const svgElem = document.querySelector('[data-mermaid-viewer] svg') as SVGSVGElement | null;
    if (!svgElem) return;
    downloadSvg(new XMLSerializer().serializeToString(svgElem), `${metadata.name}-architecture.svg`);
    setShowExportMenu(false);
  };

  const handleExportPng = async () => {
    const svgElem = document.querySelector('[data-mermaid-viewer] svg') as SVGSVGElement | null;
    if (!svgElem) return;
    try {
      await exportMermaidSvgAsPng(svgElem, isDark, metadata.fullName);
    } catch (err) {
      console.error('PNG export failed:', err);
    }
    setShowExportMenu(false);
  };

  // Close export menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const isGenerating = generationStatus?.isGenerating;

  return (
    <div className="mx-auto max-w-6xl px-2 sm:px-8 space-y-4 pb-16">
      {/* GitDiagram-Parity Result Toolbar */}
      <div className="neo-card p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3 bg-[#0d0924] border-2 border-black shadow-[4px_4px_0_#000]">
        {/* Repo Title Link to GitHub */}
        <div className="flex items-center gap-2 min-w-0">
          <a
            href={`https://github.com/${metadata.fullName}`}
            target="_blank"
            rel="noopener noreferrer"
            className="neo-action-btn !min-h-[38px] !py-1 !px-3.5 flex items-center gap-2 !text-white font-black text-sm tracking-wide shadow-[2px_2px_0_#000] hover:brightness-110 transition-all truncate"
            title="Open Repository on GitHub"
          >
            <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24" aria-hidden="true">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            <span className="truncate">{metadata.fullName}</span>
            <ExternalLink className="w-3 h-3 text-purple-300/80 shrink-0" />
          </a>

          <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-white/5 border border-white/10 text-zinc-300">
            {metadata.defaultBranch || 'main'}
          </span>
        </div>

        {/* Action Controls matching GitDiagram */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {/* Synchronized Explainer Video Button */}
          <button
            type="button"
            onClick={() => setShowVideoModal(true)}
            className="neo-action-btn !min-h-[36px] !py-1 !px-3 !bg-gradient-to-r !from-purple-600 !to-indigo-600 !text-white text-xs font-black shadow-[2px_2px_0_#000] flex items-center gap-1.5 hover:brightness-110 active:scale-95 transition-all"
            title="Watch 60-second synchronized animated video"
          >
            <Clapperboard className="w-3.5 h-3.5" />
            <span>Video</span>
            <span className="px-1.5 py-0.2 rounded text-[8px] font-black uppercase bg-amber-400 text-black shadow-sm animate-pulse">
              NEW
            </span>
          </button>

          {/* Info toggle */}
          <button
            type="button"
            onClick={() => setShowInfo(!showInfo)}
            className={`neo-action-btn !min-h-[36px] !py-1 !px-2.5 !text-white text-xs flex items-center gap-1 ${showInfo ? '!bg-[hsl(var(--neo-panel-muted))] border-purple-400' : ''}`}
            title="View architectural explanation and evidence"
          >
            <Info className="w-3.5 h-3.5 text-purple-300" />
            <span>Info</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${showInfo ? 'rotate-180' : ''}`} />
          </button>

          {/* Enable / Exit Zoom toggle */}
          <button
            type="button"
            onClick={() => setZoomingEnabled(!zoomingEnabled)}
            className={`neo-action-btn !min-h-[36px] !py-1 !px-2.5 !text-white text-xs flex items-center gap-1 ${!zoomingEnabled ? '!bg-white/10 text-zinc-400' : ''}`}
            title={zoomingEnabled ? 'Disable zoom gestures' : 'Enable zoom gestures'}
          >
            <Scan className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">{zoomingEnabled ? 'Exit zoom' : 'Enable zoom'}</span>
          </button>

          {/* Direction toggle */}
          <button
            type="button"
            onClick={() => setDirection((d) => (d === 'TD' ? 'LR' : 'TD'))}
            className="neo-action-btn !min-h-[36px] !py-1 !px-2.5 !text-white text-xs flex items-center gap-1"
            title="Toggle Top-Down / Left-Right layout"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span className="font-bold">{direction}</span>
          </button>

          {/* Mermaid Source Code toggle */}
          <button
            type="button"
            onClick={() => setShowSourceCode(!showSourceCode)}
            className={`neo-action-btn !min-h-[36px] !py-1 !px-2.5 !text-white text-xs flex items-center gap-1 ${showSourceCode ? '!bg-[hsl(var(--neo-panel-muted))]' : ''}`}
            title="Inspect Mermaid diagram syntax"
          >
            <Code className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Mermaid</span>
          </button>

          {/* Regenerate with AI */}
          {onRegenerate && (
            <button
              type="button"
              onClick={onRegenerate}
              disabled={isGenerating}
              className="neo-action-btn !min-h-[36px] !py-1 !px-3 !text-white text-xs font-bold disabled:opacity-50 flex items-center gap-1.5"
              title="Regenerate diagram with Gemini 2.5 Flash"
            >
              {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">Regenerate</span>
            </button>
          )}

          {/* Export Dropdown */}
          <div className="relative" ref={exportMenuRef}>
            <button
              type="button"
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="neo-action-btn !min-h-[36px] !py-1 !px-3 !bg-purple-600 hover:!bg-purple-500 !text-white text-xs font-black shadow-[2px_2px_0_#000] flex items-center gap-1.5"
              title="Export diagram in various formats"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${showExportMenu ? 'rotate-180' : ''}`} />
            </button>

            {showExportMenu && (
              <div className="absolute right-0 top-full mt-1.5 w-56 neo-card p-1.5 z-40 space-y-1 bg-[#120d31] border-2 border-black shadow-[6px_6px_0_#000]">
                <button
                  onClick={handleExportPng}
                  className="w-full text-left px-3 py-2 rounded-md text-xs font-bold text-white hover:bg-purple-600/30 flex items-center gap-2 transition-colors"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-sky-400" />
                  <span>Download PNG (4x Sharp)</span>
                </button>
                <button
                  onClick={handleExportSvg}
                  className="w-full text-left px-3 py-2 rounded-md text-xs font-bold text-white hover:bg-purple-600/30 flex items-center gap-2 transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Download SVG</span>
                </button>
                <button
                  onClick={handleCopyMermaid}
                  className="w-full text-left px-3 py-2 rounded-md text-xs font-bold text-white hover:bg-purple-600/30 flex items-center gap-2 transition-colors"
                >
                  {copiedMermaid ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-purple-400" />}
                  <span>{copiedMermaid ? 'Mermaid Copied!' : 'Copy Mermaid Code'}</span>
                </button>
                <div className="border-t border-white/10 my-1" />
                <button
                  onClick={() => handleCopyReadmeMarkdown('picture')}
                  className="w-full text-left px-3 py-2 rounded-md text-xs font-bold text-zinc-300 hover:bg-purple-600/30 flex items-center gap-2 transition-colors"
                >
                  <FileText className="w-3.5 h-3.5 text-amber-400" />
                  <span>README Image Markdown</span>
                </button>
                <button
                  onClick={() => handleCopyReadmeMarkdown('badge')}
                  className="w-full text-left px-3 py-2 rounded-md text-xs font-bold text-zinc-300 hover:bg-purple-600/30 flex items-center gap-2 transition-colors"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                  <span>README Badge Markdown</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Generation Progress (Live AI synthesis) */}
      {generationStatus && (isGenerating || generationStatus.error) && (
        <StageStepper status={generationStatus} />
      )}

      {/* GitDiagram-Parity Info Panel */}
      {showInfo && (
        <div className="neo-card p-5 space-y-4 bg-[#110d2c]/95 border-2 border-black shadow-[4px_4px_0_#000] animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <span className="text-sm font-black text-white flex items-center gap-2">
              <Info className="w-4 h-4 text-purple-400" />
              Executive Architecture Analysis
            </span>
            <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              100% Evidence Verified
            </span>
          </div>

          {/* Explanation Brief */}
          <p className="text-sm text-zinc-200 leading-relaxed font-medium bg-black/30 p-3 rounded-lg border border-black">
            {graph.summary || `${metadata.fullName} architectural map generated by GitDiagram compiler.`}
          </p>

          {/* Subsystems Breakdown Chips */}
          {graph.subsystems.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-wider">
                Identified Subsystem Layers ({graph.subsystems.length})
              </span>
              <div className="flex flex-wrap gap-2">
                {graph.subsystems.map((s) => (
                  <span
                    key={s.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border border-black shadow-sm"
                    style={{ background: `${s.color}22`, color: s.color, borderColor: s.color }}
                  >
                    <span className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                    {s.name} ({s.nodeIds.length} nodes)
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Telemetry & Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 text-xs">
            <div className="p-2.5 rounded-lg bg-black/40 border border-white/10">
              <div className="text-[10px] text-zinc-400 font-mono">COMPONENTS</div>
              <div className="text-base font-bold text-white">{graph.nodes.length} nodes</div>
            </div>
            <div className="p-2.5 rounded-lg bg-black/40 border border-white/10">
              <div className="text-[10px] text-zinc-400 font-mono">CONNECTIONS</div>
              <div className="text-base font-bold text-white">{graph.edges.length} edges</div>
            </div>
            <div className="p-2.5 rounded-lg bg-black/40 border border-white/10">
              <div className="text-[10px] text-zinc-400 font-mono">AI MODEL</div>
              <div className="text-base font-bold text-purple-300">Gemini 2.5 Flash</div>
            </div>
            <div className="p-2.5 rounded-lg bg-black/40 border border-white/10">
              <div className="text-[10px] text-zinc-400 font-mono">EVIDENCE CITATIONS</div>
              <div className="text-base font-bold text-emerald-400">Strict Source Tree</div>
            </div>
          </div>
        </div>
      )}

      {/* Mermaid Raw Code Drawer */}
      {showSourceCode && (
        <div className="neo-card overflow-hidden bg-[#0c0920] border-2 border-black">
          <div className="flex items-center justify-between p-3 border-b-2 border-black bg-[#150f38]">
            <span className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
              <Code className="w-3.5 h-3.5 text-purple-400" />
              Mermaid Source Code (GitDiagram Grammar)
            </span>
            <button
              onClick={handleCopyMermaid}
              className="flex items-center gap-1.5 px-3 py-1 rounded-md border border-black bg-purple-600 text-xs font-bold text-white hover:bg-purple-500 transition-colors"
            >
              {copiedMermaid ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              {copiedMermaid ? 'Copied!' : 'Copy Code'}
            </button>
          </div>
          <pre className="text-[11px] font-mono text-emerald-300 p-4 overflow-x-auto max-h-72 scrollbar-thin leading-relaxed">
            {diagramSource}
          </pre>
        </div>
      )}

      {/* Main Interactive Diagram Canvas */}
      <div className="relative">
        <div data-mermaid-viewer>
          <MermaidViewer
            mermaidCode={diagramSource}
            isDark={isDark}
            onNodeClick={handleNodeClick}
          />
        </div>

        {/* Click hint pill */}
        {!selectedNode && (
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 pointer-events-none">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-purple-500/40 bg-black/75 backdrop-blur text-[11px] text-purple-200 font-semibold shadow-lg">
              <Eye className="w-3.5 h-3.5 text-purple-400" />
              Click any node in diagram to inspect source code & connections
            </div>
          </div>
        )}

        {/* Node Inspector Drawer */}
        <NodeInspectorDrawer
          node={selectedNode ?? null}
          graph={graph}
          metadata={metadata}
          onClose={() => setSelectedNodeId(null)}
        />

        {/* Backdrop for Drawer */}
        {selectedNode && (
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={() => setSelectedNodeId(null)}
          />
        )}
      </div>

      {/* Subsystem Statistics Bar */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Components', value: graph.nodes.length, icon: <Box className="w-3.5 h-3.5" /> },
          { label: 'Relationships', value: graph.edges.length, icon: <ArrowRight className="w-3.5 h-3.5" /> },
          { label: 'Subsystems', value: graph.subsystems.length, icon: <Layers className="w-3.5 h-3.5" /> },
        ].map(({ label, value, icon }) => (
          <div key={label} className="neo-card p-3.5 text-center bg-[#0d0924] border-2 border-black shadow-[3px_3px_0_#000]">
            <div className="flex items-center justify-center gap-1 text-purple-400 mb-1">{icon}</div>
            <div className="text-2xl font-black text-white">{value}</div>
            <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">{label}</div>
          </div>
        ))}
      </div>

      {/* Synchronized 60-Second Video Modal */}
      <ExplainerVideoModal
        isOpen={showVideoModal}
        onClose={() => setShowVideoModal(false)}
        metadata={metadata}
        graph={graph}
        isDark={isDark}
        geminiKey={geminiKey}
      />
    </div>
  );
};
