import { useState, useEffect } from 'react';
import type { ConstellationDefinition } from '@lemos/core';
import type { ConstellationOS } from '@lemos/modules-constellation-os';

interface ConstellationPickerProps {
  constellationOS: ConstellationOS;
  value: string | null;
  onChange: (constellationId: string | null) => void;
}

export function ConstellationPicker({
  constellationOS,
  value,
  onChange
}: ConstellationPickerProps): JSX.Element {
  const [constellations, setConstellations] = useState<ConstellationDefinition[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadConstellations = async () => {
      try {
        const items = await constellationOS.listConstellations(false);
        setConstellations(items);
      } catch (error) {
        console.error('Failed to load constellations:', error);
      } finally {
        setLoading(false);
      }
    };

    loadConstellations();
  }, [constellationOS]);

  const selectedConstellation = constellations.find(c => c.id === value);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <label
        htmlFor="constellation-picker"
        style={{ fontSize: 12, fontWeight: 600, color: '#6b7280' }}
      >
        Project / Goal (Optional)
      </label>

      <select
        id="constellation-picker"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value || null)}
        disabled={loading}
        style={{
          padding: '8px 12px',
          fontSize: 14,
          background: 'white',
          border: '1px solid #d1d5db',
          borderRadius: 6,
          cursor: 'pointer',
          color: selectedConstellation ? selectedConstellation.color : '#111827',
        }}
      >
        <option value="">No Project</option>
        {constellations.map((constellation) => (
          <option key={constellation.id} value={constellation.id}>
            {constellation.icon} {constellation.name}
          </option>
        ))}
      </select>

      {selectedConstellation && (
        <div
          style={{
            fontSize: 12,
            color: '#6b7280',
            fontStyle: 'italic',
          }}
        >
          {selectedConstellation.description}
        </div>
      )}
    </div>
  );
}
