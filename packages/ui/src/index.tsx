import type { PropsWithChildren } from 'react';

export function Panel({ children }: PropsWithChildren): JSX.Element {
  return (
    <div
      style={{
        border: '1px solid #d0d0d0',
        padding: '12px 16px',
        borderRadius: 8,
        fontFamily: 'Inter, system-ui, sans-serif',
        background: 'linear-gradient(145deg, #f9fafb, #eef1f4)',
      }}
    >
      {children}
    </div>
  );
}

export { SessionControl } from './SessionControl.js';
export { EnergyDisplay } from './EnergyDisplay.js';
export { RitualControl } from './RitualControl.js';
export { ConstellationPicker } from './ConstellationPicker.js';
export { ConstellationBadge } from './ConstellationBadge.js';
export { ConstellationList } from './ConstellationList.js';
export { ConstellationStats } from './ConstellationStats.js';
export { ContextControl } from './ContextControl.js';
export { JournalEntry } from './JournalEntry.js';
export { LogViewer } from './LogViewer.js';
