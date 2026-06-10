import { useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Info } from 'lucide-react';

interface InfoTooltipProps {
  text: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  width?: number;
  className?: string;
}

export function InfoTooltip({ text, position = 'top', width = 240, className = '' }: InfoTooltipProps) {
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const GAP = 8;

  const show = useCallback(() => {
    if (!btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();
    let top: number, left: number;
    switch (position) {
      case 'top':    top = r.top - GAP;           left = r.left + r.width / 2; break;
      case 'bottom': top = r.bottom + GAP;         left = r.left + r.width / 2; break;
      case 'left':   top = r.top + r.height / 2;  left = r.left - GAP;         break;
      case 'right':  top = r.top + r.height / 2;  left = r.right + GAP;        break;
      default:       top = r.top - GAP;            left = r.left + r.width / 2;
    }
    setCoords({ top, left });
  }, [position]);

  const transformMap: Record<string, string> = {
    top:    'translateX(-50%) translateY(-100%)',
    bottom: 'translateX(-50%)',
    left:   'translateX(-100%) translateY(-50%)',
    right:  'translateY(-50%)',
  };

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <button
        ref={btnRef}
        type="button"
        onMouseEnter={show}
        onMouseLeave={() => setCoords(null)}
        onFocus={show}
        onBlur={() => setCoords(null)}
        className="text-[#8E8E93]/60 hover:text-[#8E8E93] transition-colors cursor-help focus:outline-none flex-shrink-0"
        aria-label="Más información"
      >
        <Info className="w-3.5 h-3.5" />
      </button>

      {coords && createPortal(
        <div
          style={{
            position: 'fixed',
            top: coords.top,
            left: coords.left,
            transform: transformMap[position],
            width,
            zIndex: 9999,
          }}
          className="bg-[#1C1C1E] border border-white/20 rounded-lg p-3 shadow-2xl pointer-events-none"
        >
          <p className="text-xs text-[#ADADB8] leading-relaxed">{text}</p>
        </div>,
        document.body
      )}
    </div>
  );
}
