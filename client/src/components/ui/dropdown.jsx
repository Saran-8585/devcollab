import { useState, useRef, useEffect } from 'react';
import { cn } from '../../utils/constants';

export default function Dropdown({ trigger, items, align = 'right' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative inline-block">
      <div onClick={() => setOpen(!open)}>{trigger}</div>
      {open && (
        <div className={cn(
          'absolute z-50 mt-2 min-w-[12rem] rounded-lg border border-border bg-card py-1 shadow-lg',
          align === 'right' ? 'right-0' : 'left-0'
        )}>
          {items.map((item, i) => (
            item.separator ? (
              <div key={i} className="h-px bg-border my-1" />
            ) : (
              <button
                key={i}
                className="w-full px-3 py-2 text-sm text-left hover:bg-accent text-foreground flex items-center gap-2"
                onClick={() => { setOpen(false); item.onClick?.(); }}
              >
                {item.icon && <span className="w-4 h-4">{item.icon}</span>}
                {item.label}
              </button>
            )
          ))}
        </div>
      )}
    </div>
  );
}
