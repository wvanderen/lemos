import { useState, useEffect, useCallback } from 'react';
import type { EventBus, RitualTemplate, RitualTemplateStep } from '@lemos/core';
import type { RitualEditor as RitualEditorDomain } from '@lemos/modules-ritual-editor';
import { RitualStep } from './RitualStep';

interface RitualEditorProps {
  interface RitualEditorProps {
  ritualEditor: RitualEditorDomain;
  ritualId: string | null;
  onBack: () => void;
}
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
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div>Loading ritual...</div>
      </div>
    );
  }

  if (!ritual) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div>Ritual not found</div>
        <button
          onClick={onBack}
          style={{
            marginTop: '16px',
            padding: '8px 16px',
            backgroundColor: '#374151',
            color: '#ffffff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Back to Library
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={onBack}
            style={{
              padding: '8px 16px',
              backgroundColor: '#374151',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '14px',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4b5563'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#374151'}
          >
            ← Back
          </button>
          <h1 style={{ margin: 0, color: '#f3f4f6', fontSize: '24px', letterSpacing: '-0.02em' }}>Edit Ritual</h1>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {hasUnsavedChanges && (
            <span style={{ color: '#fbbf24', fontSize: '13px', fontWeight: 500 }}>● Unsaved changes</span>
          )}
          <button
            onClick={saveRitual}
            disabled={!hasUnsavedChanges || isSaving}
            style={{
              padding: '8px 20px',
              backgroundColor: hasUnsavedChanges ? '#10b981' : '#1f2937',
              color: hasUnsavedChanges ? '#ffffff' : '#6b7280',
              border: hasUnsavedChanges ? 'none' : '1px solid #374151',
              borderRadius: '8px',
              cursor: hasUnsavedChanges ? 'pointer' : 'default',
              fontWeight: 600,
              fontSize: '14px',
              transition: 'all 0.2s',
            }}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Basic Info */}
      <div style={{ backgroundColor: '#111827', padding: '24px', borderRadius: '12px', border: '1px solid #374151', marginBottom: '24px' }}>
        <h2 style={{ margin: '0 0 20px 0', color: '#f3f4f6', fontSize: '18px', fontWeight: 600 }}>Basic Information</h2>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', color: '#9ca3af', fontSize: '13px', fontWeight: 500, marginBottom: '8px' }}>
            Name *
          </label>
          <input
            type="text"
            value={ritual.name}
            onChange={(e) => updateRitual({ name: e.target.value })}
            placeholder="Enter ritual name..."
            style={{
              width: '100%',
              padding: '10px 14px',
              backgroundColor: '#1f2937',
              color: '#f3f4f6',
              border: '1px solid #4b5563',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', color: '#9ca3af', fontSize: '13px', fontWeight: 500, marginBottom: '8px' }}>
            Description
          </label>
          <textarea
            value={ritual.description || ''}
            onChange={(e) => updateRitual({ description: e.target.value })}
            placeholder="Describe your ritual..."
            style={{
              width: '100%',
              minHeight: '100px',
              padding: '10px 14px',
              backgroundColor: '#1f2937',
              color: '#f3f4f6',
              border: '1px solid #4b5563',
              borderRadius: '8px',
              fontSize: '14px',
              resize: 'vertical',
              fontFamily: 'inherit',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', color: '#9ca3af', fontSize: '13px', fontWeight: 500, marginBottom: '8px' }}>
            Tags (comma-separated)
          </label>
          <input
            type="text"
            value={ritual.tags?.join(', ') || ''}
            onChange={(e) => handleTagInput(e.target.value)}
            placeholder="e.g., morning, meditation, energy"
            style={{
              width: '100%',
              padding: '10px 14px',
              backgroundColor: '#1f2937',
              color: '#f3f4f6',
              border: '1px solid #4b5563',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '24px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', color: '#9ca3af', fontSize: '13px', fontWeight: 500, marginBottom: '8px' }}>
              Planet
            </label>
            <select
              value={ritual.meta.planet || ''}
              onChange={(e) => updateRitual({ meta: { ...ritual.meta, planet: e.target.value || undefined } })}
              style={{
                width: '100%',
                padding: '10px 14px',
                backgroundColor: '#1f2937',
                color: '#f3f4f6',
                border: '1px solid #4b5563',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
              }}
            >
              <option value="">Select a planet</option>
              <option value="Earth">🌍 Earth</option>
              <option value="Mars">🔴 Mars</option>
              <option value="Jupiter">🟠 Jupiter</option>
              <option value="Saturn">🪐 Saturn</option>
              <option value="Neptune">🔵 Neptune</option>
              <option value="Venus">🟡 Venus</option>
            </select>
          </div>

          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', color: '#9ca3af', fontSize: '13px', fontWeight: 500, marginBottom: '8px' }}>
              Intensity
            </label>
            <select
              value={ritual.meta.intensity || ''}
              onChange={(e) => updateRitual({
                meta: {
                  ...ritual.meta,
                  intensity: (e.target.value as 'low' | 'medium' | 'high') || undefined
                }
              })}
              style={{
                width: '100%',
                padding: '10px 14px',
                backgroundColor: '#1f2937',
                color: '#f3f4f6',
                border: '1px solid #4b5563',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
              }}
            >
              <option value="">Select intensity</option>
              <option value="low">🟢 Low</option>
              <option value="medium">🟡 Medium</option>
              <option value="high">🔴 High</option>
            </select>
          </div>
        </div>
      </div>

      {/* Steps */}
      <div style={{ backgroundColor: '#111827', padding: '24px', borderRadius: '12px', border: '1px solid #374151', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, color: '#f3f4f6', fontSize: '18px', fontWeight: 600 }}>
            Steps ({ritual.steps.length})
          </h2>
          <button
            onClick={addStep}
            style={{
              padding: '8px 16px',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: '14px',
              transition: 'background 0.2s',
            }}
          >
            + Add Step
          </button>
        </div>

        {ritual.steps.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
            No steps yet. Add your first step to get started!
          </div>
        ) : (
          <div>
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
      </div>

      {/* Metadata */}
      <div style={{ fontSize: '12px', color: '#6b7280', textAlign: 'center' }}>
        Created: {new Date(ritual.meta.createdAt).toLocaleString()} |
        Updated: {new Date(ritual.meta.updatedAt).toLocaleString()}
      </div>
    </div>
  );
}