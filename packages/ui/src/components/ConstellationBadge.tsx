import { useState, useEffect } from 'react';
import type { ConstellationDefinition } from '@lemos/core';
import type { ConstellationOS } from '@lemos/modules-constellation-os';

interface ConstellationBadgeProps {
  constellationOS: ConstellationOS;
  constellationId: string | null;
  size?: 'small' | 'medium';
}

export function ConstellationBadge({
  constellationOS,
  constellationId,
  size = 'medium'
}: ConstellationBadgeProps): JSX.Element | null {
  const [constellation, setConstellation] = useState<ConstellationDefinition | null>(null);

  useEffect(() => {
    if (!constellationId) {
      setConstellation(null);
      return;
    }

    const loadConstellation = async () => {
      try {
        const item = await constellationOS.getConstellation(constellationId);
        setConstellation(item);
      } catch (error) {
        console.error('Failed to load constellation:', error);
      }
    };

    loadConstellation();
  }, [constellationOS, constellationId]);

  if (!constellation) {
    return null;
  }

  const isSmall = size === 'small';

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: isSmall ? 4 : 6,
        padding: isSmall ? '2px 8px' : '4px 12px',
        background: constellation.color + '20', // 20% opacity
        border: `1px solid ${constellation.color}`,
        borderRadius: isSmall ? 4 : 6,
        fontSize: isSmall ? 11 : 13,
        fontWeight: 600,
        color: constellation.color,
      }}
    >
      <span>{constellation.icon}</span>
      <span>{constellation.name}</span>
    </div>
  );
}
