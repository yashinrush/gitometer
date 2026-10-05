import React from 'react';
import { Settings, Moon, Sun } from 'lucide-react';
import type { ActiveTab } from '../types';
import PillNav from './PillNav';
import PixelSwap from './PixelSwap';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  openSettings: () => void;
  isDark: boolean;
  setIsDark: (dark: boolean) => void;
}

const NAV_ITEMS = [
  { label: 'Overview', href: 'home' },
  { label: 'CodeLens', href: 'codelens' },
  { label: 'CodeMap', href: 'codemap' },
  { label: 'PromptForge', href: 'promptforge' },
];

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  openSettings,
  isDark,
  setIsDark,
}) => {
  return (
    <header className="border-black sm:border-b-[3px] dark:border-black bg-[hsl(var(--background))] transition-colors sticky top-0 z-50 backdrop-blur-md bg-opacity-95">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-8">
        {/* Logo matching GitDiagram */}
        <button
          onClick={() => setActiveTab('home')}
          className="flex items-center text-left shrink-0 cursor-pointer"
        >
          <span className="text-[clamp(1.25rem,6vw,1.5rem)] font-bold sm:text-2xl">
            <span className="text-black transition-colors duration-200 hover:text-gray-600 dark:text-white dark:hover:text-[hsl(var(--neo-button-hover))]">
              Git
            </span>
            <span className="text-purple-600 transition-colors duration-200 hover:text-purple-500 dark:text-[hsl(var(--neo-button))] dark:hover:text-[hsl(var(--neo-button-hover))]">
              ometer
            </span>
          </span>
        </button>

        {/* Feature Navigation - Animated PillNav from React Bits */}
        <div className="hidden sm:flex items-center justify-center">
          <PillNav
            items={NAV_ITEMS}
            activeHref={activeTab}
            onItemClick={(href) => setActiveTab(href as ActiveTab)}
            hideLogo={true}
            baseColor={isDark ? '#c084fc' : '#7c3aed'}
            pillColor={isDark ? '#120e24' : '#f4f4f5'}
            hoveredPillTextColor={isDark ? '#120e24' : '#ffffff'}
            pillTextColor={isDark ? '#f4f4f5' : '#18181b'}
            ease="power2.easeOut"
            initialLoadAnimation={false}
          />
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-2 shrink-0">
          {/* React Bits: PixelSwap Theme Transition */}
          <div
            title="Toggle theme (PixelSwap animation)"
            className="w-9 h-9 rounded-md border-2 border-black overflow-hidden bg-[hsl(var(--neo-panel-muted))] flex items-center justify-center shadow-[2px_2px_0_#000] cursor-pointer hover:scale-105 active:translate-x-[1px] active:translate-y-[1px] transition-all"
          >
            <PixelSwap
              firstContent={
                <div className="w-full h-full flex items-center justify-center bg-amber-100 text-amber-600">
                  <Sun className="w-4 h-4 text-amber-500 fill-amber-400" />
                </div>
              }
              secondContent={
                <div className="w-full h-full flex items-center justify-center bg-[#100c22] text-purple-300">
                  <Moon className="w-4 h-4 text-purple-300 fill-purple-400" />
                </div>
              }
              active={isDark}
              trigger="click"
              onActiveChange={(next) => setIsDark(next)}
              pixelSize={6}
              gap={0}
              pixelRadius={10}
              duration={400}
              pixelDuration={200}
              pattern="spiral"
              aspectRatio="1 / 1"
            />
          </div>

          <button
            onClick={openSettings}
            title="API Settings"
            className="browse-muted-button inline-flex h-9 w-9 items-center justify-center rounded-md text-sm font-semibold"
          >
            <Settings className="w-4 h-4" />
          </button>

          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            title="GitHub"
            className="browse-muted-button inline-flex h-9 items-center gap-1.5 rounded-md px-2.5 text-sm font-semibold"
          >
            <span className="text-amber-500 font-black">★</span>
            <span className="text-xs">Gitometer</span>
          </a>
        </div>
      </div>

      {/* Mobile Bar */}
      <div className="sm:hidden border-t-2 border-black flex items-center justify-around p-2 bg-[hsl(var(--neo-panel))]">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.href}
            onClick={() => setActiveTab(item.href as ActiveTab)}
            className={`px-2.5 py-1 text-xs font-bold rounded transition-colors ${
              activeTab === item.href
                ? 'bg-purple-400 text-black dark:bg-[hsl(var(--neo-button))] dark:text-black'
                : 'text-zinc-300'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </header>
  );
};
