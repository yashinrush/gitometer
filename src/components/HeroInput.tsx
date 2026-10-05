import React, { useState } from 'react';
import { ArrowRight, Loader2 } from 'lucide-react';
import ThoughtLine from './ThoughtLine';
import FolderFloat from './FolderFloat';
import type { ActiveTab } from '../types';

const VioletSparkle = ({ className, color }: { className?: string; color?: string }) => (
  <svg
    className={className}
    viewBox="0 0 91 98"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
  >
    <path
      d="m35.878 14.162 1.333-5.369 1.933 5.183c4.47 11.982 14.036 21.085 25.828 24.467l5.42 1.555-5.209 2.16c-11.332 4.697-19.806 14.826-22.888 27.237l-1.333 5.369-1.933-5.183C34.56 57.599 24.993 48.496 13.201 45.114l-5.42-1.555 5.21-2.16c11.331-4.697 19.805-14.826 22.887-27.237Z"
      className={color ? `${color} stroke-black dark:stroke-black` : "fill-violet-500 stroke-black dark:fill-[hsl(var(--neo-button))] dark:stroke-black"}
      strokeWidth="3.445"
    />
    <path
      d="M79.653 5.729c-2.436 5.323-9.515 15.25-18.341 12.374m9.197 16.336c2.6-5.851 10.008-16.834 18.842-13.956m-9.738-15.07c-.374 3.787 1.076 12.078 9.869 14.943M70.61 34.6c.503-4.21-.69-13.346-9.49-16.214M14.922 65.967c1.338 5.677 6.372 16.756 15.808 15.659M18.21 95.832c-1.392-6.226-6.54-18.404-15.984-17.305m12.85-12.892c-.41 3.771-3.576 11.588-12.968 12.681M18.025 96c.367-4.21 3.453-12.905 12.854-14"
      className="stroke-black dark:stroke-[hsl(var(--foreground))]"
      strokeWidth="2.548"
      strokeLinecap="round"
    />
  </svg>
);

const SkySparkle = ({ className, color }: { className?: string; color?: string }) => (
  <svg
    className={className}
    viewBox="0 0 92 80"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
  >
    <path
      d="m35.213 16.953.595-5.261 2.644 4.587a35.056 35.056 0 0 0 26.432 17.33l5.261.594-4.587 2.644A35.056 35.056 0 0 0 48.23 63.28l-.595 5.26-2.644-4.587a35.056 35.056 0 0 0-26.432-17.328l-5.261-.595 4.587-2.644a35.056 35.056 0 0 0 17.329-26.433Z"
      className={color ? `${color} stroke-black dark:stroke-black` : "fill-sky-400 stroke-black dark:fill-[hsl(var(--neo-button-hover))] dark:stroke-black"}
      strokeWidth="2.868"
    />
    <path
      d="M75.062 40.108c1.07 5.255 1.072 16.52-7.472 19.54m7.422-19.682c1.836 2.965 7.643 8.14 16.187 5.121-8.544 3.02-8.207 15.23-6.971 20.957-1.97-3.343-8.044-9.274-16.588-6.254M12.054 28.012c1.34-5.22 6.126-15.4 14.554-14.369M12.035 28.162c-.274-3.487-2.93-10.719-11.358-11.75C9.104 17.443 14.013 6.262 15.414.542c.226 3.888 2.784 11.92 11.212 12.95"
      className="stroke-black dark:stroke-[hsl(var(--foreground))]"
      strokeWidth="2.319"
      strokeLinecap="round"
    />
  </svg>
);

const FlankSparkle = ({
  className,
  fillClassName,
}: {
  className?: string;
  fillClassName: string;
}) => (
  <svg
    className={className}
    viewBox="10.8 10.2 61.4 60"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
  >
    <path
      d="m35.213 16.953.595-5.261 2.644 4.587a35.056 35.056 0 0 0 26.432 17.33l5.261.594-4.587 2.644A35.056 35.056 0 0 0 48.23 63.28l-.595 5.26-2.644-4.587a35.056 35.056 0 0 0-26.432-17.328l-5.261-.595 4.587-2.644a35.056 35.056 0 0 0 17.329-26.433Z"
      className={`${fillClassName} stroke-black dark:stroke-black`}
      strokeWidth="2.868"
    />
  </svg>
);

interface HeroInputProps {
  currentUrl: string;
  onAnalyze: (url: string) => void;
  isLoading: boolean;
  error?: string | null;
  activeTab?: ActiveTab;
  setActiveTab?: (tab: ActiveTab) => void;
  wavePreset?: 'silk' | 'ocean' | 'lines' | 'terminal' | 'mesh';
  setWavePreset?: (preset: 'silk' | 'ocean' | 'lines' | 'terminal' | 'mesh') => void;
  showWaves?: boolean;
  setShowWaves?: (show: boolean) => void;
}

const CHIP_CLASS =
  "h-9 border-2 border-black bg-purple-400 px-3 text-sm font-semibold text-black hover:bg-purple-300 sm:h-10 sm:px-4 sm:text-base sm:font-medium dark:border-black dark:bg-[hsl(var(--neo-panel-muted))] dark:text-[hsl(var(--foreground))] dark:hover:bg-[hsl(var(--neo-button))] dark:hover:text-[#0d0a19] shadow-[3px_3px_0_#000] cursor-pointer rounded-md transition-all";

const EXAMPLE_REPOS = [
  { name: 'RushClaw.AI', path: 'yashinrush/RushClaw.AI' },
  { name: 'gitdiagram', path: 'ahmedkhaleel2004/gitdiagram' },
  { name: 'fastapi', path: 'fastapi/fastapi' },
  { name: 'shadcn/ui', path: 'shadcn-ui/ui' },
  { name: 'gitingest', path: 'coderamp-labs/gitingest' },
  { name: 'tailwindcss', path: 'tailwindlabs/tailwindcss' },
  { name: 'react', path: 'facebook/react' },
];

const WAVE_PRESETS: { id: 'silk' | 'ocean' | 'lines' | 'terminal' | 'mesh'; label: string }[] = [
  { id: 'silk', label: 'Silk' },
  { id: 'terminal', label: 'Terminal Glyph' },
  { id: 'lines', label: 'Contour Lines' },
  { id: 'mesh', label: 'Mesh' },
  { id: 'ocean', label: 'Ocean Swell' },
];

interface TabHeroConfig {
  badge: string;
  badgeSubtext: string;
  titleLine1: string;
  titleLine2: string;
  sparkleLeftClass: string;
  sparkleRightClass: string;
  description: React.ReactNode;
  placeholder: string;
  buttonText: string;
  telemetryLabel: string;
  telemetrySteps: string[];
}

const TAB_HERO_CONFIG: Record<ActiveTab, TabHeroConfig> = {
  home: {
    badge: 'SUITE',
    badgeSubtext: 'Understand your codebase from every angle',
    titleLine1: 'Repository to',
    titleLine2: 'intelligence',
    sparkleLeftClass: 'fill-violet-500 dark:fill-[hsl(var(--neo-button))]',
    sparkleRightClass: 'fill-sky-400 dark:fill-[hsl(var(--neo-button-hover))]',
    description: (
      <>
        Turn any GitHub repository into an AI-ready digest (
        <strong className="text-black dark:text-white">CodeLens</strong>), an
        interactive architecture diagram (
        <strong className="text-black dark:text-white">CodeMap</strong>), or
        vibe-coding prompts (
        <strong className="text-black dark:text-white">PromptForge</strong>).
      </>
    ),
    placeholder: 'owner/repo or GitHub URL',
    buttonText: 'Analyze',
    telemetryLabel: 'Telemetry pipeline running across 3 unified engines…',
    telemetrySteps: [
      'Querying GitHub REST & GraphQL API…',
      'Parsing recursive repository tree & default branch…',
      'Calculating token budgets & size thresholds…',
      'Extracting AST subsystem topology…',
      'Synthesizing architecture flowchart & reverse PRD…',
    ],
  },
  codelens: {
    badge: 'CODELENS',
    badgeSubtext: 'AI Context Ingestion & Prompt Digest Engine',
    titleLine1: 'Repository to',
    titleLine2: 'AI digest',
    sparkleLeftClass: 'fill-emerald-400 dark:fill-emerald-300',
    sparkleRightClass: 'fill-violet-500 dark:fill-[hsl(var(--neo-button))]',
    description: (
      <>
        Pack and condense entire codebases into structured, token-efficient
        digests and clean ASCII trees. Filter noise, calculate token budgets,
        and copy instant AI-ready context for Claude Code, Cursor, and LLMs.
      </>
    ),
    placeholder: 'owner/repo to ingest into AI context',
    buttonText: 'Ingest',
    telemetryLabel: 'CodeLens context ingestion pipeline running…',
    telemetrySteps: [
      'Querying repository tree & default branch…',
      'Filtering binary assets, media & lockfiles…',
      'Calculating file token budgets & char counts…',
      'Generating formatted ASCII hierarchy tree…',
      'Synthesizing LLM-ready prompt digest…',
    ],
  },
  codemap: {
    badge: 'CODEMAP',
    badgeSubtext: 'Interactive Architecture & Subsystem Visualizer',
    titleLine1: 'Repository to',
    titleLine2: 'architecture',
    sparkleLeftClass: 'fill-sky-400 dark:fill-sky-300',
    sparkleRightClass: 'fill-cyan-400 dark:fill-cyan-300',
    description: (
      <>
        Visualize codebase architecture with dynamic subsystem topologies,
        component relationship graphs, and live Mermaid flowcharts to understand
        system designs and dependencies at a single glance.
      </>
    ),
    placeholder: 'owner/repo to map architecture',
    buttonText: 'Visualize',
    telemetryLabel: 'CodeMap architecture mapping pipeline running…',
    telemetrySteps: [
      'Analyzing repository directory layout…',
      'Detecting frontend, backend & service subsystems…',
      'Mapping entry points and directional flow…',
      'Synthesizing interactive Mermaid architecture…',
      'Rendering dynamic node relationship graph…',
    ],
  },
  promptforge: {
    badge: 'PROMPTFORGE',
    badgeSubtext: 'Reverse PRD & Vibe-Coding Prompt Generator',
    titleLine1: 'Repository to',
    titleLine2: 'vibe prompts',
    sparkleLeftClass: 'fill-amber-400 dark:fill-amber-300',
    sparkleRightClass: 'fill-purple-500 dark:fill-[hsl(var(--neo-button))]',
    description: (
      <>
        Reverse-engineer comprehensive product requirement documents (PRDs),
        architectural blueprints, and precision prompts tailored for Cursor Composer,
        Claude Code, Windsurf, & Copilot to clone or extend any app.
      </>
    ),
    placeholder: 'owner/repo to generate vibe prompts',
    buttonText: 'Synthesize',
    telemetryLabel: 'PromptForge reverse synthesis pipeline running…',
    telemetrySteps: [
      'Parsing README, package specs & project stack…',
      'Extracting core capabilities & API endpoints…',
      'Generating reverse PRD and feature roadmap…',
      'Scaffolding agent instructions for Cursor & Claude…',
      'Finalizing vibe-coding copy-paste prompts…',
    ],
  },
};

export const HeroInput: React.FC<HeroInputProps> = ({
  currentUrl,
  onAnalyze,
  isLoading,
  error,
  activeTab = 'home',
  setActiveTab,
  wavePreset = 'silk',
  setWavePreset,
  showWaves = true,
  setShowWaves,
}) => {
  const [inputVal, setInputVal] = useState(currentUrl);

  const currentTab = activeTab || 'home';
  const heroConfig = TAB_HERO_CONFIG[currentTab] || TAB_HERO_CONFIG.home;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputVal.trim()) {
      onAnalyze(inputVal.trim());
    }
  };

  const handleChipClick = (slug: string) => {
    setInputVal(slug);
    onAnalyze(slug);
  };

  return (
    <div className="relative z-10 mx-auto max-w-4xl px-4 pt-6 pb-4 sm:px-8">
      {/* Dynamic Hero Head & Banner per Active Feature */}
      <div key={currentTab} className="hero-fade-in">
        {/* Promo Banner with Breathing Glow */}
        <div className="mb-6 flex justify-center">
          <div
            onClick={() => {
              if (setActiveTab) {
                if (currentTab === 'home') setActiveTab('codelens');
                else if (currentTab === 'codelens') setActiveTab('codemap');
                else if (currentTab === 'codemap') setActiveTab('promptforge');
                else setActiveTab('home');
              }
            }}
            className={`promo-banner relative isolate ${setActiveTab ? 'cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-transform' : ''}`}
            title={setActiveTab ? 'Click to cycle features' : undefined}
          >
            <span aria-hidden="true" className="promo-banner-glow" />
            <div className="browse-muted-button inline-flex min-h-[40px] max-w-full items-center gap-2.5 rounded-full py-1.5 pr-4 pl-2 text-sm font-semibold whitespace-nowrap">
              <span className="new-badge">{heroConfig.badge}</span>
              <span>{heroConfig.badgeSubtext}</span>
              <span aria-hidden="true" className="promo-banner-arrow">→</span>
            </div>
          </div>
        </div>

        {/* Hero Headline with Animated Floating Sparkles */}
        <div className="mb-8">
          <div className="mx-auto w-fit sm:hidden">
            <h1 className="text-center text-[clamp(2.5rem,11.5vw,3.3rem)] leading-[0.95] font-bold tracking-tight text-black dark:text-white">
              {heroConfig.titleLine1} <br />
              <span className="relative inline-block">
                {heroConfig.titleLine2}
                <FlankSparkle
                  className="flank-sparkle-left pointer-events-none absolute top-[57%] -left-[1.18em] h-auto w-[0.8em] -translate-y-1/2 -rotate-10"
                  fillClassName={heroConfig.sparkleLeftClass}
                />
                <FlankSparkle
                  className="flank-sparkle-right pointer-events-none absolute top-[57%] -right-[1.18em] h-auto w-[0.8em] -translate-y-1/2 rotate-10"
                  fillClassName={heroConfig.sparkleRightClass}
                />
              </span>
            </h1>
          </div>

          <div className="relative mx-auto hidden w-full flex-row items-center justify-center sm:flex">
            <VioletSparkle
              className="absolute left-0 h-auto w-20 flex-shrink-0 -translate-y-16 p-2 md:relative md:ml-0 md:w-24 md:translate-x-10 md:-translate-y-0 lg:absolute lg:ml-32 lg:-translate-x-full lg:-translate-y-10"
              color={heroConfig.sparkleLeftClass}
            />
            <h1 className="relative inline-block w-full text-center text-5xl font-extrabold tracking-tighter md:text-6xl lg:pt-3 lg:text-7xl text-neutral-900 dark:text-white">
              {heroConfig.titleLine1} <br />
              {heroConfig.titleLine2}&nbsp;
            </h1>
            <SkySparkle
              className="right-0 bottom-0 hidden h-auto w-16 flex-shrink-0 -translate-x-10 translate-y-20 md:block lg:absolute lg:w-20 lg:-translate-x-12 lg:translate-y-4"
              color={heroConfig.sparkleRightClass}
            />
          </div>

          <p className="mt-4 text-center text-sm sm:text-base text-neutral-700 dark:text-zinc-300 font-medium max-w-xl mx-auto">
            {heroConfig.description}
          </p>
        </div>
      </div>

      {/* GitDiagram Main Card */}
      <div className="neo-panel home-main-card relative mx-auto w-full max-w-3xl rounded-lg !bg-[hsl(var(--neo-panel))] p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div className="flex gap-2.5 sm:gap-4">
            <input
              type="text"
              placeholder={heroConfig.placeholder}
              className="neo-input h-14 min-w-0 flex-1 rounded-md px-4 py-0 text-base font-bold placeholder:text-base placeholder:font-normal placeholder:text-gray-700 sm:h-10 sm:px-4 sm:py-6 sm:text-lg sm:placeholder:text-lg dark:placeholder:text-neutral-400"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              disabled={isLoading}
              required
            />
            <button
              type="submit"
              disabled={isLoading || !inputVal.trim()}
              className="neo-button size-14 shrink-0 p-0 text-base sm:h-10 sm:w-auto sm:p-6 sm:px-6 sm:text-lg"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <ArrowRight className="sm:hidden w-5 h-5" strokeWidth={2.75} />
                  <span className="hidden sm:inline">{heroConfig.buttonText}</span>
                </>
              )}
            </button>
          </div>

          {/* React Bits: ThoughtLine Codebase Analysis Telemetry */}
          <div className="pt-2 pb-1 border-t border-purple-900/40">
            <ThoughtLine
              working={isLoading}
              steps={heroConfig.telemetrySteps}
              label={heroConfig.telemetryLabel}
              doneLabel="Telemetry pipeline ready in"
              glyph="sparkle"
              glyphColor="#c084fc"
              fontSize={13}
              breathPeriod={1.5}
              shimmer
              showTimer
              collapsible
              collapseOnSettle={false}
            />
          </div>

          {error && (
            <p className="status-message text-sm text-red-600 dark:text-red-400 font-bold" role="alert">
              {error}
            </p>
          )}

          {/* Example Repositories */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 sm:block sm:space-y-3">
              <div className="shrink-0 text-sm font-semibold text-neutral-700 dark:text-zinc-300 sm:text-base">
                <span className="sm:hidden">Try:</span>
                <span className="hidden sm:inline">
                  Try these example repositories:
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {EXAMPLE_REPOS.map((ex) => (
                  <button
                    key={ex.path}
                    type="button"
                    onClick={() => handleChipClick(ex.path)}
                    className={CHIP_CLASS}
                  >
                    {ex.name}
                  </button>
                ))}
              </div>
            </div>

            {/* React Bits: FolderFloat Zero-Gravity Demo Vault */}
            <div className="pt-4 border-t-2 border-black flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="block text-xs font-bold text-neutral-800 dark:text-purple-300 uppercase tracking-wider">
                  Zero-Gravity Demo Vault:
                </span>
                <span className="text-[11px] text-zinc-400 font-medium">
                  Hover or click folder to release floating starter pills with Matter.js physics. Drag, fling, or click to analyze.
                </span>
              </div>

              <div className="relative z-20 shrink-0">
                <FolderFloat
                  items={[
                    'fastapi/fastapi',
                    'facebook/react',
                    'tailwindlabs/tailwindcss',
                    'shadcn-ui/ui',
                    'vercel/next.js',
                    'astral-sh/uv'
                  ]}
                  label="Demo Vault"
                  sublabel="6 floating starters"
                  trigger="hover"
                  physics={true}
                  drift={0.6}
                  onSelect={(val) => handleChipClick(val)}
                  folderColor="#1f1833"
                  frontColor="#4c1d95"
                  paperColor="#f5f5f5"
                  itemColor="#c084fc"
                  itemTextColor="#0d0a19"
                  labelColor="#ffffff"
                  width={180}
                  height={110}
                  radius={12}
                  spread={150}
                  lift={22}
                />
              </div>
            </div>

            {/* Ambient Wave Physics Switcher */}
            {setWavePreset && (
              <div className="pt-2 border-t-2 border-black flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1.5 text-neutral-700 dark:text-purple-300 font-bold">
                  <span>Wave Physics:</span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  {WAVE_PRESETS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setShowWaves?.(true);
                        setWavePreset(p.id);
                      }}
                      className={`px-2 py-0.5 rounded text-[11px] font-bold border border-black transition-all ${
                        showWaves && wavePreset === p.id
                          ? 'bg-purple-400 text-black shadow-[1px_1px_0_#000]'
                          : 'bg-[hsl(var(--neo-panel-muted))] text-neutral-700 dark:text-neutral-300 hover:text-white'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                  {setShowWaves && (
                    <button
                      type="button"
                      onClick={() => setShowWaves(!showWaves)}
                      className={`px-2 py-0.5 rounded text-[11px] font-bold border border-black transition-all ${
                        !showWaves
                          ? 'bg-zinc-700 text-white'
                          : 'bg-[hsl(var(--neo-panel-muted))] text-neutral-700 dark:text-neutral-400'
                      }`}
                    >
                      {showWaves ? 'Hide' : 'Show'}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
