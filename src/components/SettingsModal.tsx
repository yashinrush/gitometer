import React, { useState } from 'react';
import { X, Key, ShieldCheck, Check, Sparkles } from 'lucide-react';
import type { AppSettings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSave: (settings: AppSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSave,
}) => {
  const [githubToken, setGithubToken] = useState(settings.githubToken);
  const [openAiKey, setOpenAiKey] = useState(settings.openAiKey);
  const [anthropicKey, setAnthropicKey] = useState(settings.anthropicKey);
  const [geminiKey, setGeminiKey] = useState(settings.geminiKey);
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({
      ...settings,
      githubToken: githubToken.trim(),
      openAiKey: openAiKey.trim(),
      anthropicKey: anthropicKey.trim(),
      geminiKey: geminiKey.trim(),
    });
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg saas-card bg-[#110D27] p-6 border border-purple-500/30 shadow-[0_12px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(168,85,247,0.2)] space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-purple-500/15 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Key className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              Gitometer Settings
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg border border-purple-500/20 bg-white/5 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4 text-xs">
          {/* GitHub Token */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 fill-current text-purple-400" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                </svg>
                GitHub Personal Access Token (PAT)
              </label>
              <a
                href="https://github.com/settings/tokens/new?description=Gitometer&scopes=repo"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-400 hover:text-purple-300 font-semibold"
              >
                Generate Token →
              </a>
            </div>
            <p className="text-[11px] text-zinc-400">
              Increases GitHub rate limits to 5,000 requests/hr and enables analyzing private repositories.
            </p>
            <input
              type="password"
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
              value={githubToken}
              onChange={(e) => setGithubToken(e.target.value)}
              className="saas-input w-full px-3 py-2.5 rounded-xl font-mono text-xs"
            />
          </div>

          {/* Optional LLM Keys */}
          <div className="pt-2 border-t border-purple-500/15 space-y-3">
            <div className="flex items-center gap-1.5 font-semibold uppercase tracking-wider text-zinc-300">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              Custom LLM Keys (Optional)
            </div>
            <p className="text-[11px] text-zinc-400">
              Gitometer works out-of-the-box with built-in inference engines. You can optionally supply your own API keys for live model completions.
            </p>

            <div className="space-y-2">
              <div>
                <label className="font-medium text-zinc-400 block mb-1">
                  OpenAI API Key
                </label>
                <input
                  type="password"
                  placeholder="sk-..."
                  value={openAiKey}
                  onChange={(e) => setOpenAiKey(e.target.value)}
                  className="saas-input w-full px-3 py-2 rounded-lg font-mono text-xs"
                />
              </div>

              <div>
                <label className="font-medium text-zinc-400 block mb-1">
                  Anthropic API Key
                </label>
                <input
                  type="password"
                  placeholder="sk-ant-..."
                  value={anthropicKey}
                  onChange={(e) => setAnthropicKey(e.target.value)}
                  className="saas-input w-full px-3 py-2 rounded-lg font-mono text-xs"
                />
              </div>

              <div>
                <label className="font-medium text-zinc-400 block mb-1">
                  Google Gemini API Key
                </label>
                <input
                  type="password"
                  placeholder="AIzaSy..."
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                  className="saas-input w-full px-3 py-2 rounded-lg font-mono text-xs"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-purple-500/15 flex items-center justify-between">
          <div className="flex items-center gap-1 text-[11px] text-zinc-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Stored locally in your browser</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg border border-purple-500/20 text-xs font-semibold text-zinc-300 hover:text-white hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>

            <button
              onClick={handleSave}
              className="saas-btn-primary px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5"
            >
              {saved ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
