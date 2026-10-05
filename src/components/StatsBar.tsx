import React from 'react';
import {
  Star,
  GitFork,
  ExternalLink,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import type { ArchitectureGraph, IngestStats, RepoMetadata } from '../types';

interface StatsBarProps {
  metadata: RepoMetadata;
  stats: IngestStats;
  graph: ArchitectureGraph;
}

export const StatsBar: React.FC<StatsBarProps> = ({ metadata, stats, graph }) => {
  const formattedTokens =
    stats.tokenCount > 1000
      ? `${(stats.tokenCount / 1000).toFixed(1)}k`
      : stats.tokenCount.toString();

  const formattedSize =
    stats.totalSizeKb > 1024
      ? `${(stats.totalSizeKb / 1024).toFixed(1)} MB`
      : `${stats.totalSizeKb} KB`;

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-8 mb-8">
      {/* Repo Identity Header Card in Neo-panel style */}
      <div className="neo-panel rounded-lg p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-xl sm:text-2xl font-black tracking-tight text-neutral-900 dark:text-white">
              {metadata.fullName}
            </span>
            <span className="h-6 border-2 border-black bg-purple-400 px-2.5 text-xs font-bold text-black rounded flex items-center shadow-[1px_1px_0_#000]">
              {metadata.language}
            </span>
            <span className="h-6 border-2 border-black bg-gradient-to-r from-purple-400 to-pink-400 text-black px-2.5 text-xs font-bold rounded flex items-center gap-1 shadow-[1px_1px_0_#000]">
              <Sparkles className="w-3 h-3 text-black" />
              <span>Gemini 2.5 Flash</span>
            </span>
            {metadata.license && (
              <span className="h-6 border-2 border-black bg-[hsl(var(--neo-panel-muted))] px-2.5 text-xs font-bold text-neutral-900 dark:text-white rounded flex items-center gap-1 shadow-[1px_1px_0_#000]">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                {metadata.license}
              </span>
            )}
          </div>
          <p className="text-sm text-neutral-700 dark:text-zinc-300 font-medium max-w-2xl line-clamp-2">
            {metadata.description}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="h-9 border-2 border-black bg-[hsl(var(--neo-panel-muted))] text-white px-3 text-xs font-bold rounded flex items-center gap-1.5 shadow-[2px_2px_0_#000]">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>{metadata.stars.toLocaleString()}</span>
          </div>

          <div className="h-9 border-2 border-black bg-[hsl(var(--neo-panel-muted))] text-white px-3 text-xs font-bold rounded flex items-center gap-1.5 shadow-[2px_2px_0_#000]">
            <GitFork className="w-3.5 h-3.5 text-sky-400" />
            <span>{metadata.forks.toLocaleString()}</span>
          </div>

          <a
            href={metadata.htmlUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="browse-muted-button inline-flex h-9 items-center gap-1.5 rounded-md px-3 text-xs font-bold !text-white"
          >
            <span>GitHub</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Metrics Row in Neo Style */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
        <div className="neo-panel rounded-md p-3 text-center">
          <div className="text-[11px] font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wide">
            Est. Tokens
          </div>
          <div className="text-base sm:text-lg font-black font-mono text-neutral-900 dark:text-white mt-0.5">
            ~{formattedTokens}
          </div>
        </div>

        <div className="neo-panel rounded-md p-3 text-center">
          <div className="text-[11px] font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wide">
            Files
          </div>
          <div className="text-base sm:text-lg font-black font-mono text-neutral-900 dark:text-white mt-0.5">
            {stats.fileCount}
          </div>
        </div>

        <div className="neo-panel rounded-md p-3 text-center">
          <div className="text-[11px] font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wide">
            Directories
          </div>
          <div className="text-base sm:text-lg font-black font-mono text-neutral-900 dark:text-white mt-0.5">
            {stats.dirCount}
          </div>
        </div>

        <div className="neo-panel rounded-md p-3 text-center">
          <div className="text-[11px] font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wide">
            Components
          </div>
          <div className="text-base sm:text-lg font-black font-mono text-neutral-900 dark:text-white mt-0.5">
            {graph.nodes.length}
          </div>
        </div>
      </div>
    </div>
  );
};
