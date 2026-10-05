import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type {
  ActiveTab,
  AppSettings,
  ArchitectureGraph,
  IngestOptions,
  IngestResult,
  RepoMetadata,
  RepoTreeItem,
  ReversePromptResult,
  TargetAgent,
} from './types';
import { DEMO_REPOSITORIES } from './services/demoData';
import {
  fetchFileContent,
  fetchRepoMetadata,
  fetchRepoReadme,
  fetchRepoTree,
  parseRepoInput,
} from './services/github';
import {
  buildAsciiTree,
  buildPromptDigest,
  calculateIngestStats,
  filterTreeItems,
} from './services/ingestEngine';
import { generateArchitectureGraph } from './services/diagramEngine';
import { generateReversePrompt } from './services/reverseEngine';
import {
  generateAiArchitecture,
  generateAiReversePrd,
  DEFAULT_GEMINI_API_KEY,
} from './services/geminiService';

import { Navbar } from './components/Navbar';
import { HeroInput } from './components/HeroInput';
import { StatsBar } from './components/StatsBar';
import { OmniDashboard } from './components/OmniDashboard';
import { IngestTab } from './components/IngestTab';
import { DiagramTab } from './components/DiagramTab';
import { ReverseTab } from './components/ReverseTab';
import { SettingsModal } from './components/SettingsModal';
import PatternWaves from './components/PatternWaves';

export const App: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem('gitometer_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (!parsed.geminiKey) parsed.geminiKey = DEFAULT_GEMINI_API_KEY;
        return parsed;
      }
    } catch {}
    return {
      githubToken: '',
      openAiKey: '',
      anthropicKey: '',
      geminiKey: DEFAULT_GEMINI_API_KEY,
      theme: 'dark',
    };
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [targetAgent, setTargetAgent] = useState<TargetAgent>('cursor');
  const [wavePreset, setWavePreset] = useState<'silk' | 'ocean' | 'lines' | 'terminal' | 'mesh'>('silk');
  const [showWaves, setShowWaves] = useState<boolean>(true);

  // Default featured repository
  const defaultRepo = 'fastapi/fastapi';
  const [repoInput, setRepoInput] = useState<string>(defaultRepo);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [metadata, setMetadata] = useState<RepoMetadata>(
    DEMO_REPOSITORIES[defaultRepo].metadata
  );
  const [rawTree, setRawTree] = useState<RepoTreeItem[]>(
    DEMO_REPOSITORIES[defaultRepo].tree
  );
  const [readme, setReadme] = useState<string>(
    DEMO_REPOSITORIES[defaultRepo].readme
  );
  const [sampleFiles, setSampleFiles] = useState<Record<string, string>>(
    DEMO_REPOSITORIES[defaultRepo].sampleFiles
  );

  // Ingestion options for CodeLens
  const [ingestOptions, setIngestOptions] = useState<IngestOptions>({
    includePatterns: '',
    excludePatterns: '*.png, *.jpg, *.svg, *.lock',
    maxFileSizeKb: 50,
    patternType: 'exclude',
    includeGitignore: false,
  });

  // Dark mode state
  const [isDark, setIsDark] = useState<boolean>(() => {
    return settings.theme !== 'light';
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Handle repository analysis
  const handleAnalyze = useCallback(
    async (inputUrl: string) => {
      const parsed = parseRepoInput(inputUrl);
      if (!parsed) {
        setError('Please enter a valid GitHub URL or owner/repo slug.');
        return;
      }

      const slug = `${parsed.owner.toLowerCase()}/${parsed.repo.toLowerCase()}`;
      setIsLoading(true);
      setError(null);

      try {
        // 1. Fetch metadata
        const meta = await fetchRepoMetadata(
          parsed.owner,
          parsed.repo,
          settings.githubToken
        );
        setMetadata(meta);

        // 2. Fetch tree
        const tree = await fetchRepoTree(
          parsed.owner,
          parsed.repo,
          parsed.branch || meta.defaultBranch,
          settings.githubToken
        );
        setRawTree(tree);

        // 3. Fetch README
        const rm = await fetchRepoReadme(
          parsed.owner,
          parsed.repo,
          settings.githubToken
        );
        setReadme(rm);

        // 4. Sample primary files
        const keyFiles: Record<string, string> = {};
        const importantFiles = tree
          .filter((t) => t.type === 'blob' && !t.path.includes('.git/'))
          .slice(0, 10);

        for (const file of importantFiles) {
          try {
            const content = await fetchFileContent(
              parsed.owner,
              parsed.repo,
              file.path,
              parsed.branch || meta.defaultBranch,
              settings.githubToken
            );
            keyFiles[file.path] = content;
          } catch {}
        }
        setSampleFiles(keyFiles);
        setRepoInput(meta.fullName);
      } catch (err: any) {
        if (DEMO_REPOSITORIES[slug]) {
          const demo = DEMO_REPOSITORIES[slug];
          setMetadata(demo.metadata);
          setRawTree(demo.tree);
          setReadme(demo.readme);
          setSampleFiles(demo.sampleFiles);
          setRepoInput(demo.metadata.fullName);
        } else {
          setError(
            err.message ||
              'Failed to analyze repository. You may have reached GitHub rate limits without a token.'
          );
        }
      } finally {
        setIsLoading(false);
      }
    },
    [settings.githubToken]
  );

  // Toggle item selection in tree
  const handleToggleItemSelection = (path: string) => {
    setRawTree((prev) =>
      prev.map((item) =>
        item.path === path ? { ...item, selected: !item.selected } : item
      )
    );
  };

  const handleSelectAll = () => {
    setRawTree((prev) => prev.map((item) => ({ ...item, selected: true })));
  };

  const handleDeselectAll = () => {
    setRawTree((prev) => prev.map((item) => ({ ...item, selected: false })));
  };

  // Compute filtered tree and Ingestion result (CodeLens)
  const ingestResult: IngestResult = useMemo(() => {
    const filtered = filterTreeItems(rawTree, ingestOptions);
    const selected = filtered.filter((i) => i.selected !== false);
    const asciiTree = buildAsciiTree(selected);
    const stats = calculateIngestStats(selected, sampleFiles, asciiTree);
    const digestText = buildPromptDigest(metadata, asciiTree, sampleFiles, readme);

    return {
      stats,
      treeText: asciiTree,
      digestText,
      selectedPaths: selected.map((s) => s.path),
    };
  }, [rawTree, ingestOptions, sampleFiles, metadata, readme]);

  // Architecture Graph state (CodeMap)
  const [architectureGraph, setArchitectureGraph] = useState<ArchitectureGraph>(() =>
    generateArchitectureGraph(metadata, rawTree)
  );

  // Reverse Prompt & Spec state (PromptForge)
  const [reverseResult, setReverseResult] = useState<ReversePromptResult>(() =>
    generateReversePrompt(metadata, rawTree, readme, targetAgent)
  );

  // Background Gemini AI enrichment effect
  useEffect(() => {
    // 1. Immediately provide clean deterministic baseline
    setArchitectureGraph(generateArchitectureGraph(metadata, rawTree));
    setReverseResult(generateReversePrompt(metadata, rawTree, readme, targetAgent));

    // 2. Perform live Gemini 2.5 Flash AI enrichment in background
    let isCancelled = false;
    const runGeminiEnrichment = async () => {
      try {
        const [aiGraph, aiReverse] = await Promise.all([
          generateAiArchitecture(metadata, rawTree, readme, settings.geminiKey, sampleFiles),
          generateAiReversePrd(metadata, rawTree, readme, targetAgent, settings.geminiKey),
        ]);

        if (!isCancelled) {
          if (aiGraph && aiGraph.nodes && aiGraph.nodes.length > 0) {
            setArchitectureGraph(aiGraph);
          }
          if (aiReverse && aiReverse.vibePrompt) {
            setReverseResult(aiReverse);
          }
        }
      } catch (err) {
        console.warn('Gemini AI live enrichment completed with fallback:', err);
      }
    };

    runGeminiEnrichment();

    return () => {
      isCancelled = true;
    };
  }, [metadata, rawTree, readme, targetAgent, settings.geminiKey]);

  // Save settings callback
  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    localStorage.setItem('gitometer_settings', JSON.stringify(newSettings));
  };

  return (
    <div className="min-h-screen flex flex-col bg-[hsl(var(--background))] text-[hsl(var(--foreground))] selection:bg-purple-500/30 selection:text-purple-200 transition-colors">
      {/* GitDiagram Neo-Brutalist Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openSettings={() => setIsSettingsOpen(true)}
        isDark={isDark}
        setIsDark={setIsDark}
      />

      {/* Main Body */}
      <main className="relative flex-1 pb-16">
        {/* Background Interactive PatternWaves */}
        {showWaves && (
          <div className="absolute top-0 left-0 right-0 h-[640px] overflow-hidden pointer-events-none z-0 select-none">
            <PatternWaves
              preset={wavePreset}
              color={isDark ? '#c49bed' : '#7c3aed'}
              backgroundColor="transparent"
              fade="bottom"
              fadeSize={0.45}
              opacity={isDark ? 0.32 : 0.18}
              interactive
              cursorSize={65}
              cursorStrength={0.55}
              speed={0.25}
            />
          </div>
        )}

        {/* Hero & Repository Input */}
        <HeroInput
          currentUrl={repoInput}
          onAnalyze={handleAnalyze}
          isLoading={isLoading}
          error={error}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          wavePreset={wavePreset}
          setWavePreset={setWavePreset}
          showWaves={showWaves}
          setShowWaves={setShowWaves}
        />

        {/* Global Statistics & Repo Profile Bar */}
        <StatsBar
          metadata={metadata}
          stats={ingestResult.stats}
          graph={architectureGraph}
        />

        {/* Feature Navigation Tabs Content */}
        {activeTab === 'home' && (
          <OmniDashboard
            metadata={metadata}
            tree={rawTree}
            ingestResult={ingestResult}
            graph={architectureGraph}
            reverseResult={reverseResult}
            setActiveTab={setActiveTab}
            isDark={isDark}
          />
        )}

        {activeTab === 'codelens' && (
          <IngestTab
            metadata={metadata}
            tree={rawTree}
            ingestResult={ingestResult}
            options={ingestOptions}
            setOptions={setIngestOptions}
            onToggleItemSelection={handleToggleItemSelection}
            onSelectAll={handleSelectAll}
            onDeselectAll={handleDeselectAll}
          />
        )}

        {activeTab === 'codemap' && (
          <DiagramTab
            metadata={metadata}
            graph={architectureGraph}
            isDark={isDark}
          />
        )}

        {activeTab === 'promptforge' && (
          <ReverseTab
            metadata={metadata}
            reverseResult={reverseResult}
            targetAgent={targetAgent}
            setTargetAgent={setTargetAgent}
          />
        )}
      </main>

      {/* GitDiagram Neo-Brutalist Footer */}
      <footer className="w-full border-t-2 sm:border-t-[3px] border-black bg-[hsl(var(--neo-panel))] py-8 px-4 transition-colors">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-gray-700 dark:text-neutral-300">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse border border-black"></span>
            <span>Gitometer • CodeLens • CodeMap • PromptForge</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="hover:underline hover:text-black dark:hover:text-white"
            >
              API Token Settings
            </button>
            <span>•</span>
            <span>Developer Intelligence Platform</span>
          </div>
        </div>
      </footer>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={handleSaveSettings}
      />
    </div>
  );
};

export default App;
