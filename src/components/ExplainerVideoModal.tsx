import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play, Pause, RotateCcw, Volume2, VolumeX, Captions,
  Maximize2, Minimize2, X, Sparkles, Clapperboard, CheckCircle2,
  ChevronRight, FastForward, Terminal, Bot, Cpu, ShieldCheck, GitCommit
} from 'lucide-react';
import type { RepoMetadata, ArchitectureGraph } from '../types';
import { generateAiVideoScript } from '../services/geminiService';

interface ExplainerVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  metadata: RepoMetadata;
  graph: ArchitectureGraph;
  isDark?: boolean;
  geminiKey?: string;
}

interface Scene {
  id: number;
  title: string;
  startSec: number;
  endSec: number;
  icon: React.ReactNode;
  headline: string;
  narration: string;
  highlightNodes: string[];
  toneColor: string;
}

export const ExplainerVideoModal: React.FC<ExplainerVideoModalProps> = ({
  isOpen,
  onClose,
  metadata,
  graph,
  isDark = true,
  geminiKey,
}) => {
  const isRushClaw = metadata.fullName.toLowerCase().includes('rushclaw') || metadata.name.toLowerCase().includes('rushclaw');

  // Build repository-tailored 60-second scenes
  const scenes: Scene[] = [
    {
      id: 1,
      title: '1. Entrypoint',
      startSec: 0,
      endSec: 12,
      icon: <Terminal className="w-3.5 h-3.5" />,
      headline: isRushClaw
        ? 'Developer Entry: Interactive CLI Launcher & Remote Telegram'
        : `${metadata.name}: Client & Runtime Entrypoint`,
      narration: isRushClaw
        ? 'The workflow begins at the CLI launcher and startup menu, or alternatively through remote Telegram bot commands sent by the verified repository owner.'
        : `Requests and user interactions initiate at the front-facing entry layer, dispatching commands through the core runtime engine.`,
      highlightNodes: isRushClaw
        ? ['node_developer', 'node_owner', 'node_wakeup', 'node_cli', 'node_telegram']
        : [graph.nodes[0]?.id || 'node_entry'],
      toneColor: '#3b82f6',
    },
    {
      id: 2,
      title: '2. AI Engine',
      startSec: 12,
      endSec: 24,
      icon: <Cpu className="w-3.5 h-3.5" />,
      headline: isRushClaw
        ? 'Dual AI Engine: Google Gemini Flash & OpenRouter Routing'
        : 'Cognitive Engine & Model Reasoning',
      narration: isRushClaw
        ? 'RushClaw connects to Google Gemini on AI Studio or OpenRouter, providing high-speed multimodal reasoning and tool invocation without API bottlenecks.'
        : 'The core subsystem queries language and vision models to analyze source context, formulate plans, and reason over codebase structure.',
      highlightNodes: isRushClaw
        ? ['node_model', 'node_agent', 'node_plan']
        : graph.nodes.slice(1, 3).map((n) => n.id),
      toneColor: '#f43f5e',
    },
    {
      id: 3,
      title: '3. Modes',
      startSec: 24,
      endSec: 36,
      icon: <Bot className="w-3.5 h-3.5" />,
      headline: isRushClaw
        ? 'Tri-Mode Orchestration: Autonomous Agent, Deep Plan, & Ask'
        : 'Domain Orchestration & Pipeline Stages',
      narration: isRushClaw
        ? 'Three distinct workflows activate: Agent Mode executes iterative reasoning, Deep Plan Mode generates structured step hierarchies, and Ask Mode performs read-only exploration.'
        : 'Pipelines orchestrate distinct domain steps, coordinating between input ingestion, transformation engines, and background tasks.',
      highlightNodes: isRushClaw
        ? ['node_agent', 'node_plan', 'node_planner', 'node_selection', 'node_ask']
        : graph.nodes.slice(2, 5).map((n) => n.id),
      toneColor: '#f59e0b',
    },
    {
      id: 4,
      title: '4. Staging',
      startSec: 36,
      endSec: 48,
      icon: <GitCommit className="w-3.5 h-3.5" />,
      headline: isRushClaw
        ? 'Non-Destructive Staging: In-Memory Action Tracking & Visual Diffs'
        : 'State Mutation & Data Transformation',
      narration: isRushClaw
        ? 'Code modifications are never written directly to disk. ToolExecutor stages all file additions and edits in-memory, while diff-view renders colorized unified diffs.'
        : 'Intermediate mutations and persistent records are staged and transformed through dedicated storage adapters and validation layers.',
      highlightNodes: isRushClaw
        ? ['node_agenttools', 'node_executor', 'node_tracker', 'node_diff']
        : graph.nodes.slice(4, 7).map((n) => n.id),
      toneColor: '#10b981',
    },
    {
      id: 5,
      title: '5. Safety Gate',
      startSec: 48,
      endSec: 60,
      icon: <ShieldCheck className="w-3.5 h-3.5" />,
      headline: isRushClaw
        ? 'Zero Unapproved Mutations: Human-in-the-Loop Approval Gating'
        : 'Commit Verification & Response Delivery',
      narration: isRushClaw
        ? 'Finally, the approval engine requires explicit human consent via the terminal or Telegram inline keyboard before committing any changes to the physical repository.'
        : 'All synthesized outputs undergo final safety verifications, ensuring validated responses and complete traceability before delivery.',
      highlightNodes: isRushClaw
        ? ['node_approval', 'node_disk', 'node_tgapproval']
        : graph.nodes.slice(-3).map((n) => n.id),
      toneColor: '#8b5cf6',
    },
  ];

  const [customScenes, setCustomScenes] = useState<Scene[] | null>(null);
  const [isAiScript, setIsAiScript] = useState(false);
  const [isGeneratingAiScript, setIsGeneratingAiScript] = useState(false);

  const activeScenesList = customScenes && customScenes.length >= 5 ? customScenes : scenes;

  const handleGenerateAiScript = async () => {
    setIsGeneratingAiScript(true);
    try {
      const generated = await generateAiVideoScript(metadata, graph, metadata.description || '', geminiKey);
      if (generated && generated.length >= 5) {
        const icons = [
          <Terminal className="w-3.5 h-3.5" key="1" />,
          <Cpu className="w-3.5 h-3.5" key="2" />,
          <Bot className="w-3.5 h-3.5" key="3" />,
          <GitCommit className="w-3.5 h-3.5" key="4" />,
          <ShieldCheck className="w-3.5 h-3.5" key="5" />,
        ];
        const colors = ['#3b82f6', '#f43f5e', '#f59e0b', '#10b981', '#8b5cf6'];
        const mapped: Scene[] = generated.slice(0, 5).map((g: any, i: number) => ({
          id: i + 1,
          title: g.title || `${i + 1}. Stage`,
          startSec: i * 12,
          endSec: (i + 1) * 12,
          icon: icons[i],
          headline: g.headline || `Architectural Stage ${i + 1}`,
          narration: g.narration || '',
          highlightNodes: Array.isArray(g.highlightNodes) ? g.highlightNodes : [],
          toneColor: g.toneColor || colors[i],
        }));
        setCustomScenes(mapped);
        setIsAiScript(true);
      }
    } catch (err) {
      console.warn('AI video script generation failed:', err);
    } finally {
      setIsGeneratingAiScript(false);
    }
  };

  const totalDuration = 60; // 60 seconds
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showCaptions, setShowCaptions] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Determine active scene
  const activeSceneIndex = Math.min(
    activeScenesList.length - 1,
    Math.max(0, activeScenesList.findIndex((s) => currentTime >= s.startSec && currentTime < s.endSec))
  );
  const currentScene = activeScenesList[activeSceneIndex] || activeScenesList[0];

  // Web Audio SFX generator (Subtle tech UI chimes and scene transitions)
  const playSfx = useCallback((type: 'beep' | 'whoosh' | 'click') => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!audioCtxRef.current && AudioCtx) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (!ctx || ctx.state === 'suspended') {
        ctx?.resume();
      }
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;
      if (type === 'beep') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        osc.start(now);
        osc.stop(now + 0.18);
      } else if (type === 'whoosh') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(440, now + 0.2);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      } else {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        gain.gain.setValueAtTime(0.03, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
      }
    } catch {}
  }, [soundEnabled]);

  // Timer loop
  useEffect(() => {
    if (!isOpen || !isPlaying) return;

    const interval = setInterval(() => {
      setCurrentTime((prev) => {
        const next = prev + 0.1 * playbackSpeed;
        if (next >= totalDuration) {
          setIsPlaying(false);
          return totalDuration;
        }
        return next;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isOpen, isPlaying, playbackSpeed, totalDuration]);

  // Trigger sound when scene changes
  const lastSceneRef = useRef(activeSceneIndex);
  useEffect(() => {
    if (lastSceneRef.current !== activeSceneIndex) {
      playSfx('whoosh');
      lastSceneRef.current = activeSceneIndex;
    }
  }, [activeSceneIndex, playSfx]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        setIsPlaying((p) => !p);
        playSfx('click');
      } else if (e.key === 'Escape') {
        if (isFullscreen) setIsFullscreen(false);
        else onClose();
      } else if (e.key === 'ArrowRight') {
        setCurrentTime((t) => Math.min(totalDuration, t + 5));
        playSfx('click');
      } else if (e.key === 'ArrowLeft') {
        setCurrentTime((t) => Math.max(0, t - 5));
        playSfx('click');
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, isFullscreen, onClose, playSfx]);

  if (!isOpen) return null;

  const formatSec = (sec: number) => {
    const s = Math.floor(sec);
    const m = Math.floor(s / 60);
    const rem = s % 60;
    return `${m}:${rem.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentTime(parseFloat(e.target.value));
  };

  const toggleSpeed = () => {
    const speeds = [1, 1.25, 1.5, 2];
    const idx = speeds.indexOf(playbackSpeed);
    const nextSpeed = speeds[(idx + 1) % speeds.length];
    setPlaybackSpeed(nextSpeed);
    playSfx('click');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md transition-all">
      <div
        ref={modalRef}
        className={`w-full max-w-4xl bg-[#0a071a] border-2 border-black rounded-xl overflow-hidden flex flex-col shadow-[8px_8px_0_#000] transition-all duration-300 ${
          isFullscreen ? '!fixed !inset-0 !max-w-none !rounded-none z-[60]' : 'max-h-[90vh]'
        }`}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b-2 border-black bg-[#100b2b]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg border border-purple-500/40 bg-purple-500/20 flex items-center justify-center text-purple-300">
              <Clapperboard className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-white tracking-wide">60s Architecture Explainer</span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase bg-purple-500 text-black">
                  Synced Video
                </span>
                <button
                  onClick={handleGenerateAiScript}
                  disabled={isGeneratingAiScript}
                  className="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase bg-violet-600/40 hover:bg-violet-600 text-violet-200 border border-violet-500/50 flex items-center gap-1 transition-all"
                  title="Generate live AI narration using Gemini Flash"
                >
                  <Sparkles className={`w-2.5 h-2.5 ${isGeneratingAiScript ? 'animate-spin' : ''}`} />
                  {isGeneratingAiScript ? 'Synthesizing...' : isAiScript ? 'AI Script Active' : 'Gemini AI Script'}
                </button>
              </div>
              <p className="text-[11px] font-mono text-purple-300/80 truncate max-w-xs sm:max-w-md">
                {metadata.fullName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 rounded-md border border-white/10 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-md border border-white/10 hover:bg-rose-500/20 text-zinc-400 hover:text-rose-300 transition-colors"
              title="Close Explainer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scene Navigation Pill Bar */}
        <div className="flex items-center gap-1.5 px-3 py-2 border-b border-black/60 bg-[#0e0a26] overflow-x-auto scrollbar-none">
          {activeScenesList.map((s, idx) => {
            const isActive = idx === activeSceneIndex;
            const isPassed = currentTime > s.endSec;
            return (
              <button
                key={s.id}
                onClick={() => {
                  setCurrentTime(s.startSec);
                  setIsPlaying(true);
                  playSfx('click');
                }}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all shrink-0 border ${
                  isActive
                    ? 'border-purple-400 bg-purple-600/30 text-white shadow-[0_0_12px_rgba(168,85,247,0.4)]'
                    : isPassed
                    ? 'border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10'
                    : 'border-transparent text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <span style={{ color: s.toneColor }}>{s.icon}</span>
                <span>{s.title}</span>
                {isPassed && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
              </button>
            );
          })}
        </div>

        {/* Video Canvas Stage */}
        <div className="flex-1 relative min-h-[320px] sm:min-h-[400px] bg-[#070512] overflow-hidden flex flex-col items-center justify-center p-4">
          {/* Animated Background Mesh & Waves */}
          <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#8b5cf6_1px,transparent_1px)] [background-size:24px_24px] animate-pulse" />

          {/* Active Scene Card */}
          <div className="relative z-10 w-full max-w-xl mx-auto neo-card p-6 bg-[#120d31]/90 backdrop-blur-md border-2 border-black space-y-4 shadow-[6px_6px_0_#000]">
            <div className="flex items-center justify-between">
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-black uppercase tracking-wider border border-black shadow-[2px_2px_0_#000]"
                style={{ backgroundColor: `${currentScene.toneColor}33`, color: currentScene.toneColor, borderColor: currentScene.toneColor }}
              >
                {currentScene.icon}
                {currentScene.title}
              </span>
              <span className="text-xs font-mono font-bold text-zinc-400">
                Stage {activeSceneIndex + 1} of 5
              </span>
            </div>

            <h3 className="text-lg sm:text-xl font-black text-white leading-tight">
              {currentScene.headline}
            </h3>

            {/* Subsystem Flow Visualization */}
            <div className="p-3 rounded-lg border border-black bg-black/40 space-y-2">
              <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest flex items-center justify-between">
                <span>Active Subsystem Nodes</span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Live Sync
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {currentScene.highlightNodes.map((nodeId) => {
                  const nodeObj = graph.nodes.find((n) => n.id === nodeId);
                  const label = nodeObj?.label || nodeId.replace(/^node_/, '');
                  return (
                    <span
                      key={nodeId}
                      className="px-2.5 py-1 rounded-md text-xs font-mono font-bold text-white border border-purple-500/50 bg-purple-950/60 shadow-[0_0_8px_rgba(168,85,247,0.3)] animate-pulse"
                    >
                      {label}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Subtitle Caption Box */}
            {showCaptions && (
              <div className="p-3 rounded-lg border border-purple-900/50 bg-[#191142]/80 text-xs sm:text-sm text-purple-200 leading-relaxed font-medium">
                💬 <span className="font-semibold text-white">"{currentScene.narration}"</span>
              </div>
            )}
          </div>
        </div>

        {/* Video Scrub Timeline & Controls */}
        <div className="p-3 sm:p-4 border-t-2 border-black bg-[#100b2b] space-y-3">
          {/* Progress Slider */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] font-mono font-bold text-zinc-400">
              <span className="text-purple-300">{formatSec(currentTime)}</span>
              <span>{formatSec(totalDuration)}</span>
            </div>
            <div className="relative w-full">
              <input
                type="range"
                min={0}
                max={totalDuration}
                step={0.1}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-2 bg-black rounded-lg appearance-none cursor-pointer accent-purple-500 focus:outline-none"
              />
              <div
                className="absolute top-0 left-0 h-2 bg-gradient-to-r from-purple-500 to-sky-400 rounded-lg pointer-events-none"
                style={{ width: `${(currentTime / totalDuration) * 100}%` }}
              />
            </div>
          </div>

          {/* Action Button Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {/* Play / Pause */}
              <button
                onClick={() => {
                  if (currentTime >= totalDuration) setCurrentTime(0);
                  setIsPlaying(!isPlaying);
                  playSfx('click');
                }}
                className="w-10 h-10 rounded-lg border-2 border-black bg-purple-500 hover:bg-purple-400 text-black flex items-center justify-center font-black shadow-[2px_2px_0_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all"
                title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
              >
                {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
              </button>

              {/* Rewind */}
              <button
                onClick={() => {
                  setCurrentTime(0);
                  setIsPlaying(true);
                  playSfx('click');
                }}
                className="p-2.5 rounded-lg border border-black bg-[#1e1547] text-zinc-300 hover:text-white transition-colors"
                title="Restart"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Speed Multiplier */}
              <button
                onClick={toggleSpeed}
                className="px-2.5 py-1.5 rounded-lg border border-black bg-[#1e1547] text-xs font-mono font-bold text-purple-300 hover:text-white transition-colors"
                title="Change speed"
              >
                {playbackSpeed}x
              </button>
            </div>

            {/* Right toggles */}
            <div className="flex items-center gap-2">
              {/* Captions Toggle */}
              <button
                onClick={() => {
                  setShowCaptions(!showCaptions);
                  playSfx('click');
                }}
                className={`p-2.5 rounded-lg border border-black text-xs font-bold flex items-center gap-1.5 transition-all ${
                  showCaptions ? 'bg-purple-900/60 text-white border-purple-400' : 'bg-[#1e1547] text-zinc-400'
                }`}
                title="Toggle Captions"
              >
                <Captions className="w-4 h-4" />
                <span className="hidden sm:inline">CC</span>
              </button>

              {/* Sound SFX Toggle */}
              <button
                onClick={() => {
                  setSoundEnabled(!soundEnabled);
                  playSfx('click');
                }}
                className={`p-2.5 rounded-lg border border-black text-xs font-bold flex items-center gap-1.5 transition-all ${
                  soundEnabled ? 'bg-purple-900/60 text-white border-purple-400' : 'bg-[#1e1547] text-zinc-400'
                }`}
                title="Toggle Sound Effects"
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                <span className="hidden sm:inline">SFX</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
