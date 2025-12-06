import { useState, useEffect, useCallback } from 'react';
import type { EventBus, RitualTemplate, RitualTemplateStep, PlanetaryMode } from '@lemos/core';
import { type RitualEditor as RitualEditorDomain } from '@lemos/modules-ritual-editor';
import { Button, Input, Select } from '../atoms';
import { RitualStep } from './RitualStep';

interface RitualEditorProps {
  bus: EventBus;
  ritualEditor: RitualEditorDomain;
  ritualId: string | null;
  onBack: () => void;
}

export function RitualEditor({ ritualEditor, ritualId, onBack }: RitualEditorProps): JSX.Element {
  const [ritual, setRitual] = useState<RitualTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const loadRitual = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      const loadedRitual = await ritualEditor.getRitual(id);
      setRitual(loadedRitual);
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Failed to load ritual:', error);
      alert('Failed to load ritual: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, [ritualEditor]);

  // Load ritual when ID changes
  useEffect(() => {
    if (ritualId) {
      loadRitual(ritualId);
    } else {
      setRitual(null);
    }
  }, [ritualId, loadRitual]);

  const saveRitual = async () => {
    if (!ritual) return;

    setIsSaving(true);
    try {
      await ritualEditor.updateRitual(ritual.id, {
        name: ritual.name,
        description: ritual.description,
        tags: ritual.tags,
        steps: ritual.steps,
        meta: {
          ...ritual.meta,
          planet: ritual.meta.planet,
          intensity: ritual.meta.intensity,
        },
      });
      setHasUnsavedChanges(false);
      // Reload to get the updated version
      await loadRitual(ritual.id);
    } catch (error) {
      console.error('Failed to save ritual:', error);
      alert('Failed to save ritual: ' + (error as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  const updateRitual = (changes: Partial<RitualTemplate>) => {
    if (!ritual) return;
    setRitual({ ...ritual, ...changes });
    setHasUnsavedChanges(true);
  };

  const addStep = async () => {
    if (!ritual) return;

    const newStep: Omit<RitualTemplateStep, 'id'> = {
      type: 'prompt',
      content: '',
      duration: 60,
    };

    try {
      await ritualEditor.addStep(ritual.id, newStep);
      await loadRitual(ritual.id); // Reload to get the updated ritual
    } catch (error) {
      console.error('Failed to add step:', error);
      alert('Failed to add step: ' + (error as Error).message);
    }
  };

  const updateStep = async (stepId: string, changes: Partial<RitualTemplateStep>) => {
    if (!ritual) return;

    try {
      await ritualEditor.updateStep(ritual.id, stepId, changes);
      // Update local state optimistically
      const updatedSteps = ritual.steps.map(step =>
        step.id === stepId ? { ...step, ...changes, id: stepId } : step
      );
      updateRitual({ steps: updatedSteps });
    } catch (error) {
      console.error('Failed to update step:', error);
      alert('Failed to update step: ' + (error as Error).message);
      // Reload to revert the optimistic update
      await loadRitual(ritual.id);
    }
  };

  const removeStep = async (stepId: string) => {
    if (!ritual) return;

    if (!confirm('Are you sure you want to remove this step?')) return;

    try {
      await ritualEditor.removeStep(ritual.id, stepId);
      await loadRitual(ritual.id); // Reload to get the updated ritual
    } catch (error) {
      console.error('Failed to remove step:', error);
      alert('Failed to remove step: ' + (error as Error).message);
    }
  };

  const moveStep = async (stepId: string, direction: 'up' | 'down') => {
    if (!ritual) return;

    const currentIndex = ritual.steps.findIndex(s => s.id === stepId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= ritual.steps.length) return;

    const newSteps = [...ritual.steps];
    const [movedStep] = newSteps.splice(currentIndex, 1);
    newSteps.splice(newIndex, 0, movedStep);

    // Optimistic update
    updateRitual({ steps: newSteps });

    try {
      await ritualEditor.reorderSteps(ritual.id, newSteps.map(s => s.id));
    } catch (error) {
      console.error('Failed to reorder steps:', error);
      alert('Failed to reorder steps: ' + (error as Error).message);
      await loadRitual(ritual.id); // Revert
    }
  };

  const handleTagInput = (input: string) => {
    const tags = input
      .split(',')
      .map(tag => tag.trim())
      .filter(Boolean);
    updateRitual({ tags });
  };

  if (isLoading) {
    return (
      <div className="p-10 text-center text-text-secondary animate-pulse">
        <div>Loading ritual...</div>
      </div>
    );
  }

  if (!ritual) {
    return (
      <div className="p-10 text-center">
        <div className="text-text-secondary mb-4">Ritual not found</div>
        <Button onClick={onBack} variant="secondary">
          Back to Library
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Button onClick={onBack} variant="ghost" size="sm" className="flex items-center gap-2">
            <span>←</span> Back
          </Button>
          <h1 className="text-2xl font-display font-medium text-text-primary tracking-tight">Edit Ritual</h1>
        </div>
        <div className="flex items-center gap-4">
          {hasUnsavedChanges && (
            <span className="text-accent-warning text-sm font-medium animate-pulse">● Unsaved changes</span>
          )}
          <Button
            onClick={saveRitual}
            disabled={!hasUnsavedChanges || isSaving}
            variant={hasUnsavedChanges ? 'primary' : 'secondary'}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Basic Info */}
      <section className="bg-bg-surface rounded-panel shadow-panel border border-border-default p-6 mb-6">
        <h2 className="text-lg font-medium text-text-primary mb-6">Basic Information</h2>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Name *</label>
            <Input
              value={ritual.name}
              onChange={(e) => updateRitual({ name: e.target.value })}
              placeholder="Enter ritual name..."
              fullWidth
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Description</label>
            <textarea
              value={ritual.description || ''}
              onChange={(e) => updateRitual({ description: e.target.value })}
              placeholder="Describe your ritual..."
              className="w-full min-h-[100px] px-3 py-2 rounded-input bg-bg-surface hover:bg-bg-surface-hover text-text-primary border border-border-default hover:border-border-emphasis transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-opacity-50 focus:bg-bg-surface resize-y box-border placeholder-text-tertiary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Tags (comma-separated)</label>
            <Input
              value={ritual.tags?.join(', ') || ''}
              onChange={(e) => handleTagInput(e.target.value)}
              placeholder="e.g., morning, meditation, energy"
              fullWidth
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Planet</label>
              <Select
                value={ritual.meta.planet || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  updateRitual({ meta: { ...ritual.meta, planet: value ? (value as PlanetaryMode) : undefined } });
                }}
                options={[
                  { value: '', label: 'Select a planet' },
                  { value: 'sun', label: '☀️ Sun' },
                  { value: 'moon', label: '🌙 Moon' },
                  { value: 'void', label: '⚫ Void' },
                ]}
                fullWidth
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Intensity</label>
              <Select
                value={ritual.meta.intensity || ''}
                onChange={(e) => updateRitual({
                  meta: {
                    ...ritual.meta,
                    intensity: (e.target.value as 'low' | 'medium' | 'high') || undefined
                  }
                })}
                options={[
                  { value: '', label: 'Select intensity' },
                  { value: 'low', label: '🟢 Low' },
                  { value: 'medium', label: '🟡 Medium' },
                  { value: 'high', label: '🔴 High' },
                ]}
                fullWidth
              />
            </div>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="bg-bg-surface rounded-panel shadow-panel border border-border-default p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-medium text-text-primary">
            Steps ({ritual.steps.length})
          </h2>
          <Button onClick={addStep} variant="primary" size="sm">
            + Add Step
          </Button>
        </div>

        {ritual.steps.length === 0 ? (
          <div className="text-center py-10 text-text-secondary bg-bg-canvas/50 rounded-card border border-border-subtle border-dashed">
            No steps yet. Add your first step to get started!
          </div>
        ) : (
          <div className="space-y-4">
            {ritual.steps.map((step, index) => (
              <RitualStep
                key={step.id}
                step={step}
                stepNumber={index + 1}
                onUpdate={(changes) => updateStep(step.id, changes)}
                onRemove={() => removeStep(step.id)}
                onMoveUp={() => moveStep(step.id, 'up')}
                onMoveDown={() => moveStep(step.id, 'down')}
                isFirst={index === 0}
                isLast={index === ritual.steps.length - 1}
              />
            ))}
          </div>
        )}
      </section>

      {/* Metadata */}
      <div className="mt-8 text-xs text-text-tertiary text-center font-mono opacity-60">
        Created: {new Date(ritual.meta.createdAt).toLocaleString()} |
        Updated: {new Date(ritual.meta.updatedAt).toLocaleString()}
      </div>
    </div>
  );
}