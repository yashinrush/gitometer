import React, { useEffect, useRef, useState, useCallback } from 'react';
import mermaid from 'mermaid';
import {
  ZoomIn, ZoomOut, RotateCcw, Copy, Check, Download, Maximize2,
  Minimize2, MousePointer, Hand, AlertCircle, Minus, Plus, ScanSearch
} from 'lucide-react';

interface MermaidViewerProps {
  mermaidCode: string;
  isDark?: boolean;
  onNodeClick?: (nodeId: string) => void;
}

let mermaidInitialized = false;

export const MermaidViewer: React.FC<MermaidViewerProps> = ({
  mermaidCode,
  isDark = true,
  onNodeClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgWrapperRef = useRef<HTMLDivElement>(null);

  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [panMode, setPanMode] = useState(true);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [svgHtml, setSvgHtml] = useState<string>('');
  const [isRendering, setIsRendering] = useState(false);

  // Initialize Mermaid with GitDiagram Theme Variables
  useEffect(() => {
    if (!mermaidInitialized) {
      mermaid.initialize({
        startOnLoad: false,
        theme: 'dark',
        themeVariables: {
          darkMode: true,
          fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
          fontSize: '13px',
          primaryColor: '#1a1338',
          primaryBorderColor: '#A855F7',
          primaryTextColor: '#F4F4F5',
          lineColor: '#C084FC',
          secondaryColor: '#261b4d',
          tertiaryColor: '#342468',
          background: '#070512',
          edgeLabelBackground: '#0e0b24',
          clusterBkg: '#120d2c',
          clusterBorder: '#6d28d9',
          titleColor: '#e2d9f3',
          nodeBorder: '#7c3aed',
          mainBkg: '#1a1338',
        },
        flowchart: { curve: 'basis', htmlLabels: true, useMaxWidth: false },
        securityLevel: 'loose',
      });
      mermaidInitialized = true;
    }
  }, []);

  // Render diagram
  useEffect(() => {
    if (!mermaidCode) return;
    setIsRendering(true);
    setError(null);

    const doRender = async () => {
      try {
        const id = `mermaid-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        const { svg } = await mermaid.render(id, mermaidCode);
        setSvgHtml(svg);
        // Reset scale on new diagram
        setScale(0.85);
        setPan({ x: 0, y: 0 });
      } catch (err: any) {
        console.error('Mermaid render error:', err);
        setError('Failed to render diagram. Check Mermaid source syntax.');
      } finally {
        setIsRendering(false);
      }
    };
    doRender();
  }, [mermaidCode]);

  // Attach interactive node click listeners and style clickable nodes
  useEffect(() => {
    if (!containerRef.current || !svgHtml || !onNodeClick) return;
    const nodes = containerRef.current.querySelectorAll('.node');
    const handlers: Array<{ el: Element; fn: EventListener }> = [];

    nodes.forEach((node) => {
      const fn: EventListener = (e) => {
        e.stopPropagation();
        const rawId = node.id || (node as HTMLElement).dataset.id || '';
        onNodeClick(rawId);

        // Visual click feedback
        node.classList.add('clicked-node');
        setTimeout(() => node.classList.remove('clicked-node'), 400);
      };
      node.addEventListener('click', fn);
      (node as HTMLElement).style.cursor = 'pointer';
      handlers.push({ el: node, fn });
    });

    return () => {
      handlers.forEach(({ el, fn }) => el.removeEventListener('click', fn));
    };
  }, [svgHtml, onNodeClick]);

  // Zoom controls
  const handleZoomIn = () => setScale((p) => Math.min(p + 0.15, 4));
  const handleZoomOut = () => setScale((p) => Math.max(p - 0.15, 0.2));
  const handleFit = () => {
    if (!containerRef.current || !svgWrapperRef.current) return;
    const container = containerRef.current.getBoundingClientRect();
    const svgEl = svgWrapperRef.current.querySelector('svg');
    if (!svgEl) return;
    const svgW = svgEl.scrollWidth || svgEl.getBoundingClientRect().width;
    const svgH = svgEl.scrollHeight || svgEl.getBoundingClientRect().height;
    const padding = 40;
    const fitScale = Math.min(
      (container.width - padding) / svgW,
      (container.height - padding) / svgH,
      1
    );
    setScale(Math.max(0.3, fitScale));
    setPan({ x: 0, y: 0 });
  };

  // Wheel-to-zoom
  const handleWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    if (!panMode) return;
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.12 : 0.9;
    setScale((p) => Math.min(Math.max(p * factor, 0.2), 4));
  }, [panMode]);

  // Mouse pan / drag
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!panMode || e.button !== 0) return;
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };
  const handleMouseUp = () => setIsDragging(false);

  // Keyboard shortcut (F / Esc for fullscreen)
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) setIsFullscreen(false);
      if (e.key === 'f' || e.key === 'F') {
        const activeTag = (document.activeElement?.tagName || '').toLowerCase();
        if (activeTag !== 'input' && activeTag !== 'textarea') {
          setIsFullscreen((p) => !p);
        }
      }
    };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [isFullscreen]);

  // Copy Mermaid
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(mermaidCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  // Export SVG directly
  const handleExportSvg = () => {
    if (!svgHtml) return;
    const blob = new Blob([svgHtml], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement('a'), { href: url, download: 'architecture-diagram.svg' });
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className={`relative w-full border-2 border-black overflow-hidden flex flex-col transition-all duration-300 ${
        isFullscreen
          ? 'fixed inset-0 z-[100] w-screen h-screen rounded-none border-none'
          : 'rounded-xl min-h-[580px]'
      }`}
      style={{ background: '#070512', boxShadow: '4px 4px 0 #000' }}
    >
      {/* Top Header / Mode Ribbon */}
      <div
        className="border-b-2 border-black px-3.5 py-2.5 flex items-center justify-between gap-3 z-20 shrink-0 bg-[#0e0a24]"
      >
        {/* Left: Mode toggles */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center bg-[#150f38] border border-[#302166] rounded-md overflow-hidden">
            <button
              onClick={() => setPanMode(true)}
              title="Pan / Navigation mode"
              className={`p-1.5 sm:px-2.5 sm:py-1.5 text-xs font-bold flex items-center gap-1.5 transition-colors ${
                panMode ? 'bg-purple-600 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Hand className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Pan</span>
            </button>
            <button
              onClick={() => setPanMode(false)}
              title="Select / Inspect mode"
              className={`p-1.5 sm:px-2.5 sm:py-1.5 text-xs font-bold flex items-center gap-1.5 transition-colors ${
                !panMode ? 'bg-purple-600 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <MousePointer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Inspect</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center text-[10px] font-mono text-zinc-500 pl-2">
            <span>Scroll to zoom • Drag to pan</span>
          </div>
        </div>

        {/* Right: Quick actions */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleCopy}
            title="Copy Mermaid source"
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-md bg-[#150f38] border border-[#302166] text-xs font-bold text-zinc-300 hover:text-white transition-colors flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            onClick={() => setIsFullscreen((p) => !p)}
            title="Toggle fullscreen (F)"
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-md bg-[#150f38] border border-[#302166] text-xs font-bold text-zinc-300 hover:text-white transition-colors flex items-center gap-1"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isFullscreen ? 'Exit' : 'Full'}</span>
          </button>
        </div>
      </div>

      {/* Main Canvas Viewport */}
      <div
        ref={containerRef}
        className={`flex-1 relative overflow-hidden select-none ${
          panMode ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-default'
        }`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        {/* Floating GitDiagram-Style PanZoom Toolbar */}
        <div className="pointer-events-none absolute top-3.5 right-3.5 z-20 flex items-center gap-2">
          <div className="pointer-events-auto flex items-center overflow-hidden rounded-full border border-black/30 bg-[#120d31]/90 shadow-[0_10px_30px_rgba(0,0,0,0.5)] ring-1 ring-white/10 backdrop-blur-md">
            <button
              type="button"
              aria-label="Zoom out"
              onClick={handleZoomOut}
              className="flex h-9 w-9 items-center justify-center text-zinc-200 hover:bg-white/10 active:scale-95 transition-all"
            >
              <Minus size={15} />
            </button>
            <div className="min-w-14 border-x border-white/10 px-2.5 text-center text-[11px] font-mono font-bold tracking-wider text-purple-300">
              {Math.round(scale * 100)}%
            </div>
            <button
              type="button"
              aria-label="Zoom in"
              onClick={handleZoomIn}
              className="flex h-9 w-9 items-center justify-center text-zinc-200 hover:bg-white/10 active:scale-95 transition-all"
            >
              <Plus size={15} />
            </button>
          </div>

          <button
            type="button"
            onClick={handleFit}
            className="pointer-events-auto inline-flex h-9 items-center gap-1.5 rounded-full border border-black/30 bg-[#120d31]/90 px-3 text-[11px] font-bold tracking-wider text-purple-200 uppercase shadow-[0_10px_30px_rgba(0,0,0,0.5)] ring-1 ring-white/10 backdrop-blur-md hover:bg-[#1a1442] active:scale-95 transition-all"
          >
            <ScanSearch size={14} />
            Fit
          </button>
        </div>

        {/* Loading Spinner */}
        {isRendering && (
          <div className="absolute inset-0 flex items-center justify-center z-10 bg-[#070512]/80 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-purple-300 font-mono tracking-wide">Compiling Mermaid vectors...</p>
            </div>
          </div>
        )}

        {/* Error Notification */}
        {error && !isRendering && (
          <div className="absolute inset-0 flex items-center justify-center z-10 p-6">
            <div className="neo-card p-6 bg-[#1a0e1c] border-2 border-rose-500/60 max-w-md text-center space-y-3">
              <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
              <p className="text-sm text-rose-200 font-bold">{error}</p>
              <button
                onClick={() => setSvgHtml('')}
                className="px-3 py-1.5 rounded bg-rose-950 text-rose-300 text-xs font-bold border border-rose-800"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* SVG Container with Pan & Zoom Transform */}
        {svgHtml && !error && (
          <div
            ref={svgWrapperRef}
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
              transformOrigin: 'center center',
              transition: isDragging ? 'none' : 'transform 70ms ease-out',
            }}
            className="absolute inset-0 flex items-center justify-center select-none"
            dangerouslySetInnerHTML={{ __html: svgHtml }}
          />
        )}
      </div>

      {/* Fullscreen exit hint */}
      {isFullscreen && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full border border-purple-500/40 bg-black/75 backdrop-blur text-xs text-purple-200 font-medium pointer-events-none shadow-xl">
          Press <kbd className="font-mono bg-purple-900/60 px-1.5 py-0.5 rounded text-white border border-purple-500/40">F</kbd> or <kbd className="font-mono bg-purple-900/60 px-1.5 py-0.5 rounded text-white border border-purple-500/40">Esc</kbd> to exit fullscreen
        </div>
      )}
    </div>
  );
};
