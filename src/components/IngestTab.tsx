import React, { useState } from 'react';
import {
  Copy,
  Download,
  Check,
  Filter,
  Sliders,
  Folder,
  FolderOpen,
  CheckSquare,
  Square,
  ScanEye,
  FileCode,
  Search,
} from 'lucide-react';
import type { IngestOptions, IngestResult, RepoMetadata, RepoTreeItem } from '../types';

interface IngestTabProps {
  metadata: RepoMetadata;
  tree: RepoTreeItem[];
  ingestResult: IngestResult;
  options: IngestOptions;
  setOptions: React.Dispatch<React.SetStateAction<IngestOptions>>;
  onToggleItemSelection: (path: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
}

export const IngestTab: React.FC<IngestTabProps> = ({
  metadata,
  tree,
  ingestResult,
  options,
  setOptions,
  onToggleItemSelection,
  onSelectAll,
  onDeselectAll,
}) => {
  const [copiedDigest, setCopiedDigest] = useState(false);
  const [copiedTree, setCopiedTree] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  const handleCopyDigest = async () => {
    try {
      await navigator.clipboard.writeText(ingestResult.digestText);
      setCopiedDigest(true);
      setTimeout(() => setCopiedDigest(false), 2000);
    } catch {}
  };

  const handleCopyTree = async () => {
    try {
      await navigator.clipboard.writeText(ingestResult.treeText);
      setCopiedTree(true);
      setTimeout(() => setCopiedTree(false), 2000);
    } catch {}
  };

  const handleDownload = () => {
    const blob = new Blob([ingestResult.digestText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${metadata.name}-codelens-digest.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const filteredTree = tree.filter((item) =>
    searchFilter ? item.path.toLowerCase().includes(searchFilter.toLowerCase()) : true
  );

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-8 space-y-6 pb-16">
      {/* CodeLens Header Card */}
      <div className="neo-card p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md border-2 border-black bg-purple-400 flex items-center justify-center text-black shadow-[2px_2px_0_#000]">
              <ScanEye className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  CodeLens Ingestion
                </h2>
                <span className="new-badge">CODELENS</span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-300 font-medium mt-0.5">
                Generate prompt-ready context from <strong className="text-white">{metadata.fullName}</strong> for AI models like Claude, ChatGPT, and Gemini.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCopyDigest}
              className="neo-action-btn-primary py-2 text-xs flex items-center gap-1.5"
            >
              {copiedDigest ? <Check className="w-4 h-4 text-emerald-800" /> : <Copy className="w-4 h-4" />}
              <span>{copiedDigest ? 'Digest Copied!' : 'Copy Full Digest'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="neo-action-btn py-2 text-xs flex items-center gap-1.5 !text-white"
            >
              <Download className="w-4 h-4" />
              <span>Download .txt</span>
            </button>
          </div>
        </div>

        {/* Pattern & Size Options Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
          {/* Pattern Selector */}
          <div className="p-3 rounded-md border-2 border-black bg-[#0c0917] shadow-[2px_2px_0_#000]">
            <label className="block text-[11px] font-bold text-purple-300 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
              <Filter className="w-3 h-3 text-purple-400" />
              Pattern Matching
            </label>
            <div className="flex gap-1.5">
              <select
                value={options.patternType}
                onChange={(e) =>
                  setOptions((prev) => ({
                    ...prev,
                    patternType: e.target.value as 'exclude' | 'include',
                  }))
                }
                className="px-2.5 py-1 rounded border-2 border-black bg-[hsl(var(--neo-panel-muted))] text-xs font-bold text-white focus:outline-none"
              >
                <option value="exclude">Exclude</option>
                <option value="include">Include</option>
              </select>
              <input
                type="text"
                placeholder="*.md, src/, tests/*"
                value={
                  options.patternType === 'exclude'
                    ? options.excludePatterns
                    : options.includePatterns
                }
                onChange={(e) =>
                  setOptions((prev) => ({
                    ...prev,
                    [options.patternType === 'exclude'
                      ? 'excludePatterns'
                      : 'includePatterns']: e.target.value,
                  }))
                }
                className="flex-1 px-2.5 py-1 rounded border-2 border-black bg-[#150f26] text-xs font-medium text-white focus:outline-none placeholder-zinc-500"
              />
            </div>
          </div>

          {/* Max File Size Slider */}
          <div className="p-3 rounded-md border-2 border-black bg-[#0c0917] shadow-[2px_2px_0_#000]">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-bold text-purple-300 uppercase tracking-wide flex items-center gap-1.5">
                <Sliders className="w-3 h-3 text-purple-400" />
                Include files under
              </label>
              <span className="px-1.5 py-0.5 rounded border border-black bg-purple-400 text-black font-mono text-[10px] font-bold">
                {options.maxFileSizeKb} kB
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="500"
              step="5"
              value={options.maxFileSizeKb}
              onChange={(e) =>
                setOptions((prev) => ({
                  ...prev,
                  maxFileSizeKb: Number(e.target.value),
                }))
              }
              className="w-full accent-purple-400 cursor-pointer"
            />
          </div>

          {/* Search Filter */}
          <div className="p-3 rounded-md border-2 border-black bg-[#0c0917] shadow-[2px_2px_0_#000]">
            <label className="block text-[11px] font-bold text-purple-300 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
              <Search className="w-3 h-3 text-purple-400" />
              Filter Tree
            </label>
            <input
              type="text"
              placeholder="Search filename or path..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full px-2.5 py-1 rounded border-2 border-black bg-[#150f26] text-xs font-medium text-white focus:outline-none placeholder-zinc-500"
            />
          </div>
        </div>
      </div>

      {/* Main 2-Column Interface: Tree Explorer (Left) & Digest Output (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive File Tree (5 Cols) */}
        <div className="lg:col-span-5 neo-card p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b-2 border-black">
            <div className="text-xs font-bold text-white">
              Repository Tree ({filteredTree.length} items)
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={onSelectAll}
                className="neo-action-btn !min-h-[28px] !py-0.5 !px-2 text-[10px] !text-white"
              >
                Select All
              </button>
              <button
                onClick={onDeselectAll}
                className="neo-action-btn !min-h-[28px] !py-0.5 !px-2 text-[10px] !text-white"
              >
                Clear
              </button>
            </div>
          </div>

          <div className="h-[460px] overflow-y-auto space-y-1 font-mono text-xs pr-1">
            {filteredTree.map((item) => {
              const isSelected = item.selected !== false;
              const isDir = item.type === 'tree';

              return (
                <div
                  key={item.path}
                  className={`flex items-center justify-between p-1.5 rounded transition-colors ${
                    isSelected
                      ? 'bg-purple-500/15'
                      : 'opacity-40 hover:opacity-75'
                  }`}
                >
                  <button
                    onClick={() => onToggleItemSelection(item.path)}
                    className="flex items-center gap-2 text-left truncate flex-1"
                  >
                    {isSelected ? (
                      <CheckSquare className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    ) : (
                      <Square className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                    )}

                    {isDir ? (
                      <Folder className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    ) : (
                      <FileCode className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    )}

                    <span className="truncate text-zinc-200 font-medium">
                      {item.path}
                    </span>
                  </button>

                  {item.size && (
                    <span className="text-[10px] text-zinc-400 shrink-0 font-mono ml-2">
                      {Math.round(item.size / 1024)}k
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Digest Output Preview (7 Cols) */}
        <div className="lg:col-span-7 neo-card p-4 space-y-3 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b-2 border-black">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">
                  Formatted Prompt Digest
                </span>
                <span className="px-1.5 py-0.5 rounded border border-black bg-purple-400 text-black font-mono text-[10px] font-bold">
                  ~{Math.round(ingestResult.stats.tokenCount / 1000)}k tokens
                </span>
              </div>

              <button
                onClick={handleCopyTree}
                className="neo-action-btn !min-h-[28px] !py-0.5 !px-2 text-[10px] !text-white"
              >
                {copiedTree ? 'Tree Copied!' : 'Copy Tree Only'}
              </button>
            </div>

            {/* Digest Output Container */}
            <div className="p-3.5 rounded-md border-2 border-black bg-[#0c0917] text-purple-200 font-mono text-[11px] h-[400px] overflow-y-auto leading-relaxed select-text shadow-[2px_2px_0_#000]">
              <pre className="whitespace-pre-wrap">{ingestResult.digestText}</pre>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between text-xs text-zinc-300 font-semibold">
            <span>
              {ingestResult.stats.fileCount} files included ({ingestResult.stats.totalSizeKb} kB)
            </span>
            <button
              onClick={handleCopyDigest}
              className="neo-action-btn-primary !min-h-[34px] !py-1 !px-4 text-xs font-bold"
            >
              {copiedDigest ? 'Copied to Clipboard!' : 'Copy Full Digest for LLM'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
