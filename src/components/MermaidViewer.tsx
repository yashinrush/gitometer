import React, { useEffect, useRef, useState, useCallback } from 'react';
import mermaid from 'mermaid';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Copy,
  Check,
  Download,
  AlertCircle,
  Maximize2,
  Minimize2,
  Hand,
  MousePointer,
} from 'lucide-react';

interface MermaidViewerProps {
  mermaidCode: string;
  isDark?: boolean;
  onNodeClick?: (nodeId: string) => void;
}

export const MermaidViewer: React.FC<MermaidViewerProps> = ({
  mermaidCode,
  isDark = true,
  onNodeClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [svgHtml, setSvgHtml] = useState<string>('');

  // Initialize Mermaid with high-contrast, modern developer theme
  useEffect(() => {
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
      },
      flowchart: {
        curve: 'basis',
        htmlLabels: true,
        useMaxWidth: false,
      },
      securityLevel: 'loose',
    });

    const renderChart = async () => {
      try {
        setError(null);
        const uniqueId = `mermaid-${Date.now()}`;
        const { svg } = await mermaid.render(uniqueId, mermaidCode);
        setSvgHtml(svg);
      } catch (err: any) {
        console.error('Mermaid render error:', err);
        setError('Failed to render diagram. Check Mermaid syntax.');
      }
    };

    renderChart();
  }, [mermaidCode, isDark]);

  // Clickable node handler
  useEffect(() => {
    if (!containerRef.current || !onNodeClick) return;

    const nodes = containerRef.current.querySelectorAll('.node');
    nodes.forEach((node) => {
      const clickHandler = (e: Event) => {
        e.stopPropagation();
        const id = node.id || '';
        onNodeClick(id);
      };
      node.addEventListener('click', clickHandler);
      (node as HTMLElement).style.cursor = 'pointer';
    });

    return () => {
      nodes.forEach((node) => {
        node.replaceWith(node.cloneNode(true));
      });
    };
  }, [svgHtml, onNodeClick]);

  // Zoom handlers
  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.15, 3.5));
  const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.15, 0.25));
  const handleReset = () => {
    setScale(1);
    setPan({ x: 0, y: 0 });
  };

  // Wheel to zoom in / zoom out (Hover zoom)
  const handleWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const zoomFactor = e.deltaY < 0 ? 1.12 : 0.88;
    setScale((prev) => Math.min(Math.max(prev * zoomFactor, 0.25), 3.5));
  }, []);

  // Pan / Grab Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only drag with primary mouse button
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Toggle Fullscreen Mode
  const toggleFullscreen = () => {
    setIsFullscreen((prev) => !prev);
  };

  // Escape key to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(mermaidCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleExportSvg = () => {
    if (!svgHtml) return;
    const blob = new Blob([svgHtml], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'codemap-architecture.svg';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPng = () => {
    if (!containerRef.current) return;
    const svgElement = containerRef.current.querySelector('svg');
    if (!svgElement) return;

    const svgString = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      canvas.width = img.width * 2;
      canvas.height = img.height * 2;
      if (ctx) {
        ctx.fillStyle = '#070512';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const pngUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = pngUrl;
        link.download = 'codemap-architecture.png';
        link.click();
      }
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  return (
    <div
      className={`relative w-full rounded-xl border-2 border-black bg-[#070512] shadow-[4px_4px_0_#000] overflow-hidden flex flex-col transition-all ${
        isFullscreen
          ? 'fixed inset-0 z-[100] w-screen h-screen rounded-none border-none p-4'
          : 'min-h-[520px]'
      }`}
    >
      {/* Floating Toolbar Controls */}
      <div className="border-b-2 border-black p-3 flex flex-wrap items-center justify-between gap-3 bg-[#0c0920] z-20 shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
        {/* Left: Zoom & Pan Indicator Controls */}
        <div className="flex items-center gap-2">
          {/* Zoom Buttons */}
          <div className="flex items-center gap-1 p-1 rounded-md bg-[#161033] border border-black shadow-[1px_1px_0_#000]">
            <button
              onClick={handleZoomIn}
              title="Zoom In (or use Mouse Wheel)"
              className="p-1.5 rounded hover:bg-purple-900/50 text-zinc-200 hover:text-white transition-colors cursor-pointer"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono font-bold px-2 text-purple-300 select-none">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={handleZoomOut}
              title="Zoom Out (or use Mouse Wheel)"
              className="p-1.5 rounded hover:bg-purple-900/50 text-zinc-200 hover:text-white transition-colors cursor-pointer"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={handleReset}
              title="Reset Zoom & Pan (Center)"
              className="p-1.5 rounded hover:bg-purple-900/50 text-zinc-200 hover:text-white transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Grab / Pan Status Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-black bg-[#161033] text-[11px] font-mono text-zinc-300 shadow-[1px_1px_0_#000]">
            <Hand className="w-3.5 h-3.5 text-purple-400" />
            <span>Click & Drag to Grab / Pan</span>
          </div>
        </div>

        {/* Right: Fullscreen & Export Controls */}
        <div className="flex items-center gap-2">
          {/* Full Screen Toggle Button */}
          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit Full Screen (Esc)' : 'Enter Full Screen'}
            className="neo-action-btn py-1.5 px-3 text-xs flex items-center gap-1.5 !text-white cursor-pointer"
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="w-4 h-4 text-purple-400" />
                <span>Exit Fullscreen</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-4 h-4 text-purple-400" />
                <span>Full Screen</span>
              </>
            )}
          </button>

          <button
            onClick={handleCopyCode}
            className="neo-action-btn py-1.5 px-3 text-xs flex items-center gap-1.5 !text-white cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-zinc-300" />
                <span>Copy Code</span>
              </>
            )}
          </button>

          <button
            onClick={handleExportSvg}
            className="neo-action-btn py-1.5 px-3 text-xs flex items-center gap-1.5 !text-white cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-zinc-300" />
            <span>SVG</span>
          </button>

          <button
            onClick={handleExportPng}
            className="neo-action-btn-primary py-1.5 px-3 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>PNG</span>
          </button>
        </div>
      </div>

      {/* Interactive Diagram Canvas Viewport (Wheel zoom + Click & Drag Grab Pan) */}
      <div
        ref={viewportRef}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
        className="relative flex-1 overflow-hidden p-8 flex items-center justify-center min-h-[440px] bg-[#070512] select-none"
      >
        {error ? (
          <div className="p-4 rounded-xl bg-red-500/10 border-2 border-black text-red-400 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        ) : (
          <div
            ref={containerRef}
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
              transformOrigin: 'center center',
              transition: isDragging ? 'none' : 'transform 0.08s ease-out',
            }}
            className="mermaid-container select-none will-change-transform"
            dangerouslySetInnerHTML={{ __html: svgHtml }}
          />
        )}

        {/* Ambient Subtle Instructions HUD in bottom-left */}
        <div className="absolute bottom-3 left-3 pointer-events-none flex items-center gap-3 text-[11px] font-mono text-zinc-400 bg-[#0c0920]/80 backdrop-blur-sm px-3 py-1.5 rounded-md border border-purple-900/40">
          <span>Scroll wheel: Zoom</span>
          <span>•</span>
          <span>Click & drag: Pan</span>
          <span>•</span>
          <span>Click node: Inspect code</span>
        </div>
      </div>

      {/* Footer Banner */}
      <div className="py-2 px-4 text-center text-xs font-medium bg-[#0c0920] border-t-2 border-black text-purple-300 flex items-center justify-center gap-2">
        <MousePointer className="w-3.5 h-3.5 text-purple-400" />
        <span>Click on any component node in the flowchart to inspect its exact source lines & dependencies on GitHub.</span>
      </div>
    </div>
  );
};
