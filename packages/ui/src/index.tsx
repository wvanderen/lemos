import type { PropsWithChildren } from 'react';

export function Panel({ children }: PropsWithChildren): JSX.Element {
  return (
    <div
      style={{
        border: '1px solid #374151',
        padding: '16px 20px',
        borderRadius: 12,
        fontFamily: 'Inter, system-ui, sans-serif',
        background: '#1f2937', // Dark gray background
        color: '#f3f4f6', // Light text
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
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
export { RitualLibrary } from './RitualLibrary.js';
export { RitualEditor } from './RitualEditor.js';
export { RitualStep } from './RitualStep.js';
