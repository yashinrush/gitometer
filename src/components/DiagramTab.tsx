import React, { useState } from 'react';
import {
  ExternalLink,
  Code,
  Network,
  RotateCcw,
  Scan,
  Download,
  ChevronDown,
  Layers,
  FileCode,
  ArrowRight,
  Info,
  Check,
  Copy,
} from 'lucide-react';
import type { ArchitectureGraph, ArchitectureNode, RepoMetadata } from '../types';
import { MermaidViewer } from './MermaidViewer';

interface DiagramTabProps {
  metadata: RepoMetadata;
  graph: ArchitectureGraph;
  isDark: boolean;
}

export const DiagramTab: React.FC<DiagramTabProps> = ({
  metadata,
  graph,
  isDark,
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(
    graph.nodes[0]?.id || null
  );
  const [showSourceCode, setShowSourceCode] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [isZooming, setIsZooming] = useState(true);
  const [copiedMermaid, setCopiedMermaid] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const selectedNode: ArchitectureNode | undefined = graph.nodes.find(
    (n) =>
      n.id === selectedNodeId ||
      `node_${n.id}` === selectedNodeId ||
      n.id === selectedNodeId?.replace(/^node_/, '') ||
      (selectedNodeId && n.id.includes(selectedNodeId))
  );

  const incomingEdges = graph.edges.filter((e) => e.to === selectedNodeId);
  const outgoingEdges = graph.edges.filter((e) => e.from === selectedNodeId);

  const handleCopyMermaid = async () => {
    try {
      await navigator.clipboard.writeText(graph.mermaidSource);
      setCopiedMermaid(true);
      setTimeout(() => setCopiedMermaid(false), 2000);
    } catch {}
  };

  const handleExportSvg = () => {
    const svgElem = document.querySelector('.mermaid svg');
    if (!svgElem) return;
    const svgData = new XMLSerializer().serializeToString(svgElem);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${metadata.name}-codemap.svg`;
    link.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-8 space-y-6 pb-16">
      {/* GitDiagram Exact Toolbar */}
      <div className="neo-card p-4 flex flex-wrap items-center justify-between gap-3">
        {/* Repo title link with GitHub Icon */}
        <h1 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
          <a
            href={`https://github.com/${metadata.fullName}`}
            target="_blank"
            rel="noopener noreferrer"
            className="neo-action-btn !min-h-[38px] !py-1 !px-3 flex items-center gap-2 !text-white"
          >
            <span className="font-black text-white">{metadata.fullName}</span>
            <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
          </a>
        </h1>

        {/* Action Buttons Toolbar matching GitDiagram */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Info toggle */}
          <button
            type="button"
            onClick={() => setShowInfo(!showInfo)}
            className={`neo-action-btn !min-h-[38px] !py-1 !px-3 !text-white ${
              showInfo ? '!bg-[hsl(var(--neo-panel-muted))]' : ''
            }`}
          >
            <Info className="w-3.5 h-3.5" />
            <span>Info</span>
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform ${showInfo ? 'rotate-180' : ''}`}
            />
          </button>

          {/* Zoom toggle */}
          <button
            type="button"
            onClick={() => setIsZooming(!isZooming)}
            className={`neo-action-btn !min-h-[38px] !py-1 !px-3 !text-white ${
              isZooming ? '!bg-[hsl(var(--neo-panel-muted))]' : ''
            }`}
          >
            <Scan className="w-3.5 h-3.5" />
            <span>{isZooming ? 'Interactive Zoom' : 'Fit Diagram'}</span>
          </button>

          {/* Export Menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="neo-action-btn !min-h-[38px] !py-1 !px-3 flex items-center gap-1.5 !text-white"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
              <ChevronDown className="w-3 h-3" />
            </button>

            {showExportMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 neo-card p-2 z-30 space-y-1 shadow-[4px_4px_0_#000]">
                <button
                  onClick={handleExportSvg}
                  className="w-full text-left px-3 py-1.5 rounded text-xs font-bold text-white hover:bg-[hsl(var(--neo-panel-muted))]"
                >
                  Download SVG
                </button>
                <button
                  onClick={handleCopyMermaid}
                  className="w-full text-left px-3 py-1.5 rounded text-xs font-bold text-white hover:bg-[hsl(var(--neo-panel-muted))]"
                >
                  {copiedMermaid ? 'Mermaid Copied!' : 'Copy Mermaid Source'}
                </button>
              </div>
            )}
          </div>

          {/* Regenerate Button */}
          <button
            type="button"
            onClick={() => {
              setSelectedNodeId(graph.nodes[0]?.id || null);
            }}
            className="neo-action-btn-primary !min-h-[38px] !py-1 !px-3 flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Center</span>
          </button>
        </div>
      </div>

      {/* Collapsible Info Panel */}
      {showInfo && (
        <div className="neo-card p-5 space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b-2 border-black pb-2">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              Subsystems & Architecture Breakdown
            </h3>
            <span className="text-xs text-zinc-400 font-mono">
              {graph.nodes.length} components • {graph.edges.length} connections
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            {graph.subsystems.map((sub) => (
              <div
                key={sub.id}
                className="p-3 rounded-md border-2 border-black bg-[#0c0917] shadow-[2px_2px_0_#000]"
              >
                <div className="font-bold text-xs text-white mb-1">
                  {sub.name}
                </div>
                <div className="text-[11px] text-zinc-300">
                  {sub.nodeIds.length} connected components
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Diagram Area with Interactive Node Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Diagram Viewport (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col space-y-3">
          <div className="neo-card p-4 overflow-hidden relative">
            <MermaidViewer
              mermaidCode={graph.mermaidSource}
              isDark={isDark}
              onNodeClick={(id) => {
                const cleanedId = id.replace(/^flowchart-/, '').split('-')[0];
                setSelectedNodeId(cleanedId || id);
              }}
            />
          </div>

          {/* Toggle Mermaid source */}
          <div className="flex items-center justify-between text-xs font-semibold text-zinc-300">
            <button
              onClick={() => setShowSourceCode(!showSourceCode)}
              className="hover:underline flex items-center gap-1.5"
            >
              <Code className="w-3.5 h-3.5 text-purple-400" />
              <span>{showSourceCode ? 'Hide Mermaid Code' : 'View Raw Mermaid Code'}</span>
            </button>
            <span className="text-zinc-400">Tip: Click any component node to inspect details</span>
          </div>

          {showSourceCode && (
            <div className="neo-card p-4 font-mono text-xs overflow-x-auto text-purple-200 bg-[#0c0917]">
              <div className="flex justify-between items-center mb-2 pb-2 border-b border-black">
                <span className="font-bold text-white">Raw Mermaid Source</span>
                <button
                  onClick={handleCopyMermaid}
                  className="neo-action-btn !min-h-[26px] !py-0.5 !px-2 text-[10px] !text-white"
                >
                  {copiedMermaid ? 'Copied' : 'Copy'}
                </button>
              </div>
              <pre>{graph.mermaidSource}</pre>
            </div>
          )}
        </div>

        {/* Right: Component Inspector Drawer (4 Cols) */}
        <div className="lg:col-span-4 neo-card p-5 space-y-4">
          <div className="flex items-center justify-between border-b-2 border-black pb-2">
            <h3 className="font-black text-sm text-white flex items-center gap-2">
              <Network className="w-4 h-4 text-purple-400" />
              Component Inspector
            </h3>
            <span className="new-badge">NODE</span>
          </div>

          {selectedNode ? (
            <div className="space-y-4">
              <div>
                <div className="text-[10px] font-bold text-purple-300 uppercase tracking-wide">
                  Component Name
                </div>
                <div className="text-base font-black text-white tracking-tight mt-0.5">
                  {selectedNode.label}
                </div>
                <div className="inline-block mt-1 px-2 py-0.5 rounded border border-black bg-purple-400 text-black font-bold text-[10px]">
                  {selectedNode.type.toUpperCase()}
                </div>
              </div>

              <div>
                <div className="text-[10px] font-bold text-purple-300 uppercase tracking-wide">
                  Subsystem Layer
                </div>
                <div className="text-xs font-semibold text-zinc-200 mt-0.5">
                  {selectedNode.subsystem || 'Core Architecture'}
                </div>
              </div>

              <div>
                <div className="text-[10px] font-bold text-purple-300 uppercase tracking-wide">
                  Estimated Source Path
                </div>
                <div className="text-xs font-mono font-medium text-purple-200 break-all p-2.5 rounded border border-black bg-[#0c0917] mt-1 shadow-[2px_2px_0_#000]">
                  {selectedNode.path || `src/${selectedNode.id.toLowerCase()}`}
                </div>
              </div>

              {/* GitHub Code Link Button */}
              <a
                href={`https://github.com/${metadata.fullName}/blob/${metadata.defaultBranch}/${selectedNode.path || ''}`}
                target="_blank"
                rel="noopener noreferrer"
                className="neo-action-btn-primary w-full py-2 text-xs flex items-center justify-center gap-2"
              >
                <span>View on GitHub</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              {/* Dependency connections */}
              <div className="space-y-2 pt-2 border-t-2 border-black">
                <div className="text-[11px] font-bold text-zinc-200">
                  Outgoing Connections ({outgoingEdges.length})
                </div>
                {outgoingEdges.length > 0 ? (
                  <div className="space-y-1">
                    {outgoingEdges.map((e, idx) => (
                      <div
                        key={idx}
                        className="text-xs flex items-center justify-between p-2 rounded border border-black bg-[#0c0917]"
                      >
                        <span className="font-bold text-white">
                          {e.to}
                        </span>
                        <span className="text-[10px] text-zinc-400">{e.label}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-zinc-400 italic">No outgoing connections</div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-xs text-zinc-400 py-8 text-center italic">
              Select any component node in the flowchart to inspect its architecture details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
