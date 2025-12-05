import { useState, useEffect } from 'react';
import type { EventBus, GlobalContext, RitualDefinition } from '@lemos/core';
import type { ConstellationDefinition } from '@lemos/core';
import type { ContextManager } from '@lemos/modules-context';
import type { ConstellationOS } from '@lemos/modules-constellation-os';
import type { RitualOS } from '@lemos/modules-ritual-os';

interface ContextControlProps {
  bus: EventBus;
  contextManager: ContextManager;
  constellationOS: ConstellationOS;
  ritualOS: RitualOS;
}

export function ContextControl({
  bus,
  contextManager,
  constellationOS,
  ritualOS
}: ContextControlProps): JSX.Element {
  const [context, setContext] = useState<GlobalContext>(contextManager.getSnapshot());
  const [constellations, setConstellations] = useState<ConstellationDefinition[]>([]);
  const [rituals, setRituals] = useState<RitualDefinition[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [constellationItems, ritualItems] = await Promise.all([
          constellationOS.listConstellations(false),
          Promise.resolve(ritualOS.getRitualDefinitions())
        ]);
        setConstellations(constellationItems);
        setRituals(ritualItems);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [constellationOS, ritualOS]);

  useEffect(() => {
    const updateContext = () => {
      setContext(contextManager.getSnapshot());
    };

    // Listen to all context events
    bus.on('ConstellationSelected', updateContext);
    bus.on('RitualStarted', updateContext);
    bus.on('RitualEnded', updateContext);
    bus.on('SceneChanged', updateContext);
    bus.on('PlanetaryModeChanged', updateContext);

    return () => {
      // Note: EventBus doesn't have an off method, so cleanup is limited
      // In production, we'd want to add an unsubscribe mechanism
    };
  }, [bus, contextManager]);

  const handleConstellationChange = (id: string | null) => {
    constellationOS.selectConstellation(id);
  };

  const handleClearContext = () => {
    contextManager.clearContext();
  };

  const selectedConstellation = constellations.find(c => c.id === context.activeConstellationId);
  const selectedRitual = rituals.find(r => r.id === context.activeRitualId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#111827' }}>
        Active Context
      </h3>

      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label
            htmlFor="context-constellation"
            style={{ fontSize: 12, fontWeight: 600, color: '#6b7280' }}
          >
            Constellation
          </label>
          <select
            id="context-constellation"
            value={context.activeConstellationId ?? ''}
            onChange={(e) => handleConstellationChange(e.target.value || null)}
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
            <option value="">None</option>
            {constellations.map((constellation) => (
              <option key={constellation.id} value={constellation.id}>
                {constellation.icon} {constellation.name}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleClearContext}
          style={{
            padding: '8px 12px',
            fontSize: 13,
            background: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
            fontWeight: 500,
          }}
        >
          Clear
        </button>
      </div>

      <div
        style={{
          marginTop: 4,
          padding: 12,
          background: '#f9fafb',
          borderRadius: 6,
          border: '1px solid #e5e7eb',
        }}
      >
        <div style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', marginBottom: 8 }}>
          Current State:
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: '#374151' }}>
          <div>
            <span style={{ color: '#6b7280' }}>• Constellation:</span>{' '}
            {context.activeConstellationId ? (
              <span style={{ color: selectedConstellation?.color || '#111827', fontWeight: 500 }}>
                {selectedConstellation?.icon} {selectedConstellation?.name || context.activeConstellationId}
              </span>
            ) : (
              <span style={{ fontStyle: 'italic', color: '#9ca3af' }}>None</span>
            )}
          </div>
          <div>
            <span style={{ color: '#6b7280' }}>• Ritual:</span>{' '}
            {context.activeRitualId ? (
              <span style={{ fontWeight: 500 }}>
                {selectedRitual?.name || context.activeRitualId}
              </span>
            ) : (
              <span style={{ fontStyle: 'italic', color: '#9ca3af' }}>None</span>
            )}
          </div>
          <div>
            <span style={{ color: '#6b7280' }}>• Scene:</span>{' '}
            {context.activeSceneId || <span style={{ fontStyle: 'italic', color: '#9ca3af' }}>None</span>}
          </div>
          <div>
            <span style={{ color: '#6b7280' }}>• Mode:</span>{' '}
            <span style={{ textTransform: 'capitalize' }}>{context.planetaryMode}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
