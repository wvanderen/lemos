import { useState, useEffect } from 'react';
import type {
  EventBus,
  BaseEvent,
  RitualStartedPayload,
  RitualDefinition
} from '@lemos/core';
import type { RitualOS } from '@lemos/modules-ritual-os';

interface RitualControlProps {
  bus: EventBus;
  ritualOS: RitualOS;
}

export function RitualControl({ bus, ritualOS }: RitualControlProps): JSX.Element {
  const [rituals, setRituals] = useState<RitualDefinition[]>([]);
  const [activeRitual, setActiveRitual] = useState<{
    ritualId: string;
    name: string;
    currentStepIndex: number;
    totalSteps: number;
    currentPrompt: string;
  } | null>(null);

  useEffect(() => {
    // Load available rituals
    setRituals(ritualOS.getRitualDefinitions());

    const handleRitualStarted = (event: BaseEvent<RitualStartedPayload>) => {
      const definition = ritualOS.getRitualDefinition(event.payload.ritualId);
      if (definition) {
        setActiveRitual({
          ritualId: event.payload.ritualId,
          name: definition.name,
          currentStepIndex: 0,
          totalSteps: definition.steps.length,
          currentPrompt: definition.steps[0].prompt,
        });
      }
    };

    const handleStepCompleted = () => {
      const active = ritualOS.getActiveRitual();
      if (active && active.currentStepIndex < active.definition.steps.length) {
        setActiveRitual({
          ritualId: active.ritualId,
          name: active.definition.name,
          currentStepIndex: active.currentStepIndex,
          totalSteps: active.definition.steps.length,
          currentPrompt: active.definition.steps[active.currentStepIndex].prompt,
        });
      }
    };

    const handleRitualCompleted = () => {
      setActiveRitual(null);
    };

    const handleRitualAbandoned = () => {
      setActiveRitual(null);
    };

    bus.on('RitualStarted', handleRitualStarted);
    bus.on('RitualStepCompleted', handleStepCompleted);
    bus.on('RitualCompleted', handleRitualCompleted);
    bus.on('RitualAbandoned', handleRitualAbandoned);
  }, [bus, ritualOS]);

  const handleStartRitual = (ritualId: string) => {
    try {
      ritualOS.startRitual(ritualId);
    } catch (error) {
      console.error('Failed to start ritual:', error);
    }
  };

  const handleCompleteStep = () => {
    try {
      ritualOS.completeStep();
    } catch (error) {
      console.error('Failed to complete step:', error);
    }
  };

  const handleAbandon = () => {
    try {
      ritualOS.abandonRitual();
    } catch (error) {
      console.error('Failed to abandon ritual:', error);
    }
  };

  if (activeRitual) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>
          {activeRitual.name}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontSize: 12, color: '#6b7280' }}>
            Step {activeRitual.currentStepIndex + 1} of {activeRitual.totalSteps}
          </div>

          <div style={{ fontSize: 18, fontWeight: 600, color: '#111827', padding: '16px 0' }}>
            {activeRitual.currentPrompt}
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={handleCompleteStep}
              style={{
                flex: 1,
                padding: '12px 24px',
                fontSize: 16,
                fontWeight: 600,
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
              }}
            >
              {activeRitual.currentStepIndex === activeRitual.totalSteps - 1 ? 'Complete' : 'Next'}
            </button>
            <button
              onClick={handleAbandon}
              style={{
                padding: '12px 16px',
                fontSize: 14,
                fontWeight: 600,
                background: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>
        Rituals
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {rituals.map((ritual) => (
          <div
            key={ritual.id}
            style={{
              border: '1px solid #e5e7eb',
              borderRadius: 8,
              padding: 12,
              background: 'white',
            }}
          >
            <div style={{ fontSize: 16, fontWeight: 600, color: '#111827', marginBottom: 4 }}>
              {ritual.name}
            </div>
            <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 12 }}>
              {ritual.description}
            </div>
            <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 8 }}>
              {ritual.steps.length} steps
            </div>
            <button
              onClick={() => handleStartRitual(ritual.id)}
              style={{
                padding: '8px 16px',
                fontSize: 14,
                fontWeight: 600,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
                width: '100%',
              }}
            >
              Start Ritual
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
