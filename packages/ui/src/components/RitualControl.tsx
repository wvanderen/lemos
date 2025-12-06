import { useState, useEffect } from 'react';
import type {
  EventBus,
  BaseEvent,
  RitualStartedPayload,
  RitualDefinition,
  RitualTemplate
} from '@lemos/core';
import type { RitualOS } from '@lemos/modules-ritual-os';
import type { RitualEditor } from '@lemos/modules-ritual-editor';
import { Button } from '../atoms';

interface RitualControlProps {
  bus: EventBus;
  ritualOS: RitualOS;
  ritualEditor?: RitualEditor;
}

export function RitualControl({ bus, ritualOS, ritualEditor }: RitualControlProps): JSX.Element {
  const [rituals, setRituals] = useState<RitualDefinition[]>([]);
  const [customRituals, setCustomRituals] = useState<RitualTemplate[]>([]);
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

    // Load custom rituals
    if (ritualEditor) {
      ritualEditor.getRituals().then(setCustomRituals).catch(console.error);
    }

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

    // Listen for ritual editor events
    const handleRitualChange = () => {
      if (ritualEditor) {
        ritualEditor.getRituals().then(setCustomRituals).catch(console.error);
      }
    };

    if (ritualEditor) {
      bus.on('RitualCreated', handleRitualChange);
      bus.on('RitualUpdated', handleRitualChange);
      bus.on('RitualDeleted', handleRitualChange);
    }

    return () => {
      bus.off('RitualStarted', handleRitualStarted);
      bus.off('RitualStepCompleted', handleStepCompleted);
      bus.off('RitualCompleted', handleRitualCompleted);
      bus.off('RitualAbandoned', handleRitualAbandoned);

      if (ritualEditor) {
        bus.off('RitualCreated', handleRitualChange);
        bus.off('RitualUpdated', handleRitualChange);
        bus.off('RitualDeleted', handleRitualChange);
      }
    };
  }, [bus, ritualOS, ritualEditor]);

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

  // Convert RitualTemplate to RitualDefinition format
  const templateToDefinition = (template: RitualTemplate): RitualDefinition => ({
    id: template.id,
    name: template.name,
    description: template.description || '',
    steps: template.steps.map(step => ({
      id: step.id,
      prompt: step.content,
      durationHint: step.duration || 60,
    })),
  });

  // Start custom ritual by converting template to definition
  const handleStartCustomRitual = (template: RitualTemplate) => {
    const definition = templateToDefinition(template);

    // Load the custom ritual definition into RitualOS
    try {
      ritualOS.loadRitualDefinition(definition);
      ritualOS.startRitual(definition.id);
    } catch (error) {
      console.error('Failed to start custom ritual:', error);
    }
  };

  if (activeRitual) {
    return (
      <div className="flex flex-col gap-4 animate-in fade-in duration-300">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-text-primary">
            {activeRitual.name}
          </div>
          <div className="text-xs text-text-secondary">
            Step {activeRitual.currentStepIndex + 1} of {activeRitual.totalSteps}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="text-lg font-semibold text-text-primary py-4 text-center bg-bg-canvas rounded-lg border border-border-default">
            {activeRitual.currentPrompt}
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleCompleteStep}
              variant="success"
              fullWidth
            >
              {activeRitual.currentStepIndex === activeRitual.totalSteps - 1 ? 'Complete Ritual' : 'Next Step'}
            </Button>
            <Button
              onClick={handleAbandon}
              variant="secondary"
              className="flex-shrink-0"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="text-sm font-semibold text-text-primary">
        Rituals
      </div>

      <div className="flex flex-col gap-3">
        {/* Built-in Rituals */}
        {rituals.length > 0 && (
          <div className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">
            Built-in Rituals
          </div>
        )}
        {rituals.map((ritual) => (
          <div
            key={ritual.id}
            className="border border-border-default rounded-lg p-3 bg-bg-surface hover:border-text-tertiary transition-colors"
          >
            <div className="text-base font-medium text-text-primary mb-1">
              {ritual.name}
            </div>
            <div className="text-xs text-text-secondary mb-3">
              {ritual.description}
            </div>
            <div className="text-xs text-text-tertiary mb-2">
              {ritual.steps.length} steps
            </div>
            <Button
              onClick={() => handleStartRitual(ritual.id)}
              variant="primary"
              fullWidth
              size="sm"
            >
              Start Ritual
            </Button>
          </div>
        ))}

        {/* Custom Rituals */}
        {customRituals.length > 0 && (
          <>
            <div className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mt-2">
              Custom Rituals
            </div>
            {customRituals.map((ritual) => (
              <div
                key={ritual.id}
                className="relative border border-border-default rounded-lg p-3 bg-bg-surface hover:border-text-tertiary transition-colors"
              >
                {ritual.meta.intensity && (
                  <div className={`absolute top-2 right-2 text-[10px] px-1.5 py-0.5 rounded uppercase font-semibold
                    ${ritual.meta.intensity === 'high' ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' :
                      ritual.meta.intensity === 'medium' ? 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400' :
                        'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400'
                    }`}
                  >
                    {ritual.meta.intensity}
                  </div>
                )}
                <div className="text-base font-medium text-text-primary mb-1 flex items-center">
                  {ritual.name}
                  {ritual.meta.planet && (
                    <span className="ml-2 text-xs opacity-75">🪐 {ritual.meta.planet}</span>
                  )}
                </div>
                <div className="text-xs text-text-secondary mb-2">
                  {ritual.description || 'No description'}
                </div>
                {ritual.tags && ritual.tags.length > 0 && (
                  <div className="flex gap-1 mb-2 flex-wrap">
                    {ritual.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="text-[10px] px-1.5 py-0.5 bg-bg-canvas text-text-secondary rounded border border-border-default"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <div className="text-xs text-text-tertiary mb-2">
                  {ritual.steps.length} steps
                </div>
                <Button
                  onClick={() => handleStartCustomRitual(ritual)}
                  variant="primary"
                  fullWidth
                  size="sm"
                >
                  Start Custom Ritual
                </Button>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
