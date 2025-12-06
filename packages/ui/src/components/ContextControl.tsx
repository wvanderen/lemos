import { useState, useEffect } from 'react';
import type { EventBus, GlobalContext, RitualDefinition } from '@lemos/core';
import type { ConstellationDefinition } from '@lemos/core';
import type { ContextManager } from '@lemos/modules-context';
import type { ConstellationOS } from '@lemos/modules-constellation-os';
import type { RitualOS } from '@lemos/modules-ritual-os';
import { Button, Select } from '../atoms';

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
          ritualOS.getRitualDefinitions()
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
      bus.off('ConstellationSelected', updateContext);
      bus.off('RitualStarted', updateContext);
      bus.off('RitualEnded', updateContext);
      bus.off('SceneChanged', updateContext);
      bus.off('PlanetaryModeChanged', updateContext);
    };
  }, [bus, contextManager]);

  const handleConstellationChange = (id: string) => {
    constellationOS.selectConstellation(id || null);
  };

  const handleClearContext = () => {
    contextManager.clearContext();
  };

  const selectedConstellation = constellations.find(c => c.id === context.activeConstellationId);
  const selectedRitual = rituals.find(r => r.id === context.activeRitualId);

  const constellationOptions = [
    { value: '', label: 'None' },
    ...constellations.map(c => ({ value: c.id, label: `${c.icon} ${c.name}` }))
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text-primary">
          Active Context
        </h3>
        <Button
          onClick={handleClearContext}
          variant="danger"
          size="sm"
          className="h-8 text-xs"
        >
          Clear Context
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="context-constellation" className="text-xs font-semibold text-text-secondary">
          Constellation
        </label>
        <Select
          id="context-constellation"
          value={context.activeConstellationId ?? ''}
          onChange={(e) => handleConstellationChange(e.target.value)}
          disabled={loading}
          options={constellationOptions}
          fullWidth
        />
      </div>

      <div className="p-3 bg-bg-canvas rounded-lg border border-border-default">
        <div className="text-xs font-semibold text-text-secondary mb-2">
          Current State
        </div>
        <div className="flex flex-col gap-1.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-text-tertiary">Constellation:</span>
            {context.activeConstellationId ? (
              <span className="font-medium text-text-primary flex items-center gap-1.5">
                <span>{selectedConstellation?.icon}</span>
                <span>{selectedConstellation?.name || context.activeConstellationId}</span>
              </span>
            ) : (
              <span className="italic text-text-tertiary">None</span>
            )}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-text-tertiary">Ritual:</span>
            {context.activeRitualId ? (
              <span className="font-medium text-text-primary">
                {selectedRitual?.name || context.activeRitualId}
              </span>
            ) : (
              <span className="italic text-text-tertiary">None</span>
            )}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-text-tertiary">Scene:</span>
            <span className={context.activeSceneId ? 'text-text-primary' : 'italic text-text-tertiary'}>
              {context.activeSceneId || 'None'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-text-tertiary">Mode:</span>
            <span className="text-text-primary capitalize">
              {context.planetaryMode}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
