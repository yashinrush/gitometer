import React, { useState } from 'react';
import {
  Sparkles,
  Copy,
  Check,
  Layers,
  ListOrdered,
  Bot,
  Terminal,
  Download,
  Sliders,
  Send,
} from 'lucide-react';
import type { RepoMetadata, ReverseMode, ReversePromptResult, TargetAgent } from '../types';

interface ReverseTabProps {
  metadata: RepoMetadata;
  reverseResult: ReversePromptResult;
  targetAgent: TargetAgent;
  setTargetAgent: (agent: TargetAgent) => void;
}

const AGENTS: { id: TargetAgent; name: string; icon: string; desc: string }[] = [
  { id: 'cursor', name: 'Cursor Composer', icon: '⚡', desc: 'Optimized for Cursor agentic vibe coding' },
  { id: 'claude', name: 'Claude Code', icon: '🤖', desc: 'Formatted for Anthropic Claude Code terminal' },
  { id: 'windsurf', name: 'Windsurf Cascade', icon: '🏄', desc: 'Direct instructions for Cascade AI' },
  { id: 'copilot', name: 'GitHub Copilot', icon: '🐙', desc: 'Production scaffolding prompt' },
  { id: 'chatgpt', name: 'ChatGPT 4o', icon: '💬', desc: 'Step-by-step reasoning prompt' },
];

export const ReverseTab: React.FC<ReverseTabProps> = ({
  metadata,
  reverseResult,
  targetAgent,
  setTargetAgent,
}) => {
  const [mode, setMode] = useState<ReverseMode>('vibe');
  const [copied, setCopied] = useState(false);
  const [customInstruction, setCustomInstruction] = useState('');
  const [userPromptModifier, setUserPromptModifier] = useState('');

  const baseContent =
    mode === 'vibe'
      ? reverseResult.vibePrompt
      : mode === 'prd'
      ? reverseResult.prdSpec
      : reverseResult.roadmap;

  const displayContent = userPromptModifier
    ? `${baseContent}\n\n# User Custom Instructions:\n${userPromptModifier}`
    : baseContent;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(displayContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleDownload = () => {
    const blob = new Blob([displayContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${metadata.name}-${mode}-specification.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleApplyCustomInstruction = (e: React.FormEvent) => {
    e.preventDefault();
    if (customInstruction.trim()) {
      setUserPromptModifier(customInstruction.trim());
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-8 space-y-6 pb-16">
      {/* PromptForge Header */}
      <div className="neo-card p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md border-2 border-black bg-pink-400 flex items-center justify-center text-black shadow-[2px_2px_0_#000]">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  PromptForge Generator
                </h2>
                <span className="new-badge">REVERSE</span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-300 font-medium mt-0.5">
                Reverse engineer <strong className="text-white">{metadata.fullName}</strong> into production PRDs and vibe-coding prompts.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCopy}
              className="neo-action-btn-primary py-2 text-xs flex items-center gap-2"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-800" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Prompt Copied!' : `Copy for ${AGENTS.find((a) => a.id === targetAgent)?.name.split(' ')[0]}`}</span>
            </button>

            <button
              onClick={handleDownload}
              className="neo-action-btn py-2 text-xs flex items-center gap-1.5 !text-white"
            >
              <Download className="w-4 h-4" />
              <span>Download .md</span>
            </button>
          </div>
        </div>

        {/* Target Agent Selector Chips */}
        <div className="pt-2 border-t-2 border-black space-y-2">
          <label className="text-[11px] font-bold text-purple-300 uppercase tracking-wide">
            Target AI Agent Platform:
          </label>
          <div className="flex flex-wrap gap-2">
            {AGENTS.map((agent) => {
              const isSelected = targetAgent === agent.id;
              return (
                <button
                  key={agent.id}
                  type="button"
                  onClick={() => setTargetAgent(agent.id)}
                  className={`h-9 border-2 border-black px-3.5 text-xs font-bold rounded-md flex items-center gap-1.5 transition-all shadow-[2px_2px_0_#000] cursor-pointer ${
                    isSelected
                      ? 'bg-purple-400 text-black shadow-[3px_3px_0_#000]'
                      : 'bg-[hsl(var(--neo-panel-muted))] text-white hover:bg-[hsl(var(--neo-button))] hover:text-black'
                  }`}
                >
                  <span>{agent.icon}</span>
                  <span>{agent.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Inferred Tech Stack Badges */}
        <div className="pt-2 flex flex-wrap items-center gap-1.5 text-xs text-zinc-300 font-semibold">
          <span className="text-[11px] uppercase tracking-wide text-purple-300 font-bold mr-1">Inferred Stack:</span>
          {reverseResult.inferredStack.map((tech: string) => (
            <span
              key={tech}
              className="px-2 py-0.5 rounded border border-black bg-[#0c0917] text-[11px] font-bold text-white shadow-[1px_1px_0_#000]"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>

      {/* Mode Switcher & Custom Instruction Bar */}
      <div className="neo-card p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Mode Tabs */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMode('vibe')}
              className={`neo-action-btn !min-h-[34px] !py-1 !px-3 text-xs !text-white ${
                mode === 'vibe' ? '!bg-purple-400 !text-black' : ''
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Vibe Coding Prompt</span>
            </button>

            <button
              onClick={() => setMode('prd')}
              className={`neo-action-btn !min-h-[34px] !py-1 !px-3 text-xs !text-white ${
                mode === 'prd' ? '!bg-purple-400 !text-black' : ''
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>PRD Specification</span>
            </button>

            <button
              onClick={() => setMode('roadmap')}
              className={`neo-action-btn !min-h-[34px] !py-1 !px-3 text-xs !text-white ${
                mode === 'roadmap' ? '!bg-purple-400 !text-black' : ''
              }`}
            >
              <ListOrdered className="w-3.5 h-3.5" />
              <span>Implementation Roadmap</span>
            </button>
          </div>

          <div className="text-xs font-mono text-zinc-400">
            {displayContent.length.toLocaleString()} characters • ~{Math.round(displayContent.split(/\s+/).length)} words
          </div>
        </div>

        {/* Custom steering instructions form */}
        <form onSubmit={handleApplyCustomInstruction} className="flex gap-2 pt-1">
          <input
            type="text"
            placeholder="Add custom steering instruction (e.g. 'Build in Next.js App Router with TypeScript')..."
            value={customInstruction}
            onChange={(e) => setCustomInstruction(e.target.value)}
            className="flex-1 px-3 py-1.5 rounded border-2 border-black bg-[#0c0917] text-xs font-medium text-white focus:outline-none placeholder-zinc-500 shadow-[2px_2px_0_#000]"
          />
          <button
            type="submit"
            className="neo-action-btn !min-h-[34px] !py-1 !px-3 text-xs flex items-center gap-1.5 !text-white"
          >
            <Send className="w-3 h-3" />
            <span>Apply</span>
          </button>
        </form>
      </div>

      {/* Main Prompt Viewer in Neo Panel */}
      <div className="neo-card p-5 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b-2 border-black">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-white">
              {mode === 'vibe'
                ? `Vibe Coding Prompt (${AGENTS.find((a) => a.id === targetAgent)?.name})`
                : mode === 'prd'
                ? 'Comprehensive Product Requirements Document'
                : 'Step-by-Step Implementation Roadmap'}
            </span>
          </div>

          <button
            onClick={handleCopy}
            className="neo-action-btn !min-h-[28px] !py-0.5 !px-2.5 text-xs flex items-center gap-1 !text-white"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        <div className="p-4 rounded-md border-2 border-black bg-[#0c0917] text-purple-200 font-mono text-xs h-[480px] overflow-y-auto leading-relaxed select-text shadow-[2px_2px_0_#000]">
          <pre className="whitespace-pre-wrap">{displayContent}</pre>
        </div>
      </div>
    </div>
  );
};
