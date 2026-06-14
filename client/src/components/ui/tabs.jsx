import { useState } from 'react';
import { cn } from '../../utils/constants';

export default function Tabs({ tabs, active, onChange, className }) {
  return (
    <div className={cn('flex border-b border-border', className)}>
      {tabs.map(tab => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={cn(
            'px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-[1px]',
            active === tab
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
