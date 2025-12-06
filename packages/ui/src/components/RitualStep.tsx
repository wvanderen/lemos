import { useState } from 'react';
import type { RitualTemplateStep, RitualStepType } from '@lemos/core';
import { Button, Input, Select } from '../atoms';

interface RitualStepProps {
  step: RitualTemplateStep;
  onUpdate: (changes: Partial<RitualTemplateStep>) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  stepNumber: number;
  isFirst: boolean;
  isLast: boolean;
}

const STEP_TYPES: { value: RitualStepType; label: string; icon: string }[] = [
  { value: 'prompt', label: 'Prompt', icon: '💭' },
  { value: 'text', label: 'Text', icon: '📝' },
  { value: 'movement', label: 'Movement', icon: '🏃' },
  { value: 'sound', label: 'Sound', icon: '🔊' },
  { value: 'agent', label: 'Agent', icon: '🤖' },
  { value: 'custom', label: 'Custom', icon: '⚙️' },
];

export function RitualStep({
  step,
  onUpdate,
  onRemove,
  onMoveUp,
  onMoveDown,
  stepNumber,
  isFirst,
  isLast
}: RitualStepProps): JSX.Element {
  const [isExpanded, setIsExpanded] = useState(true);

  const handleFieldChange = (field: keyof RitualTemplateStep, value: RitualTemplateStep[keyof RitualTemplateStep]) => {
    onUpdate({ [field]: value });
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'No duration';
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  };

  const getTypeInfo = STEP_TYPES.find(type => type.value === step.type);

  return (
    <div className="border border-border-default rounded-card bg-bg-surface overflow-hidden shadow-card hover:shadow-glow transition-shadow duration-300">
      {/* Header */}
      <div
        className={`px-4 py-3 flex justify-between items-center cursor-pointer bg-bg-surface hover:bg-bg-surface-hover transition-colors duration-200 ${isExpanded ? 'border-b border-border-default' : ''}`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-full bg-bg-overlay flex items-center justify-center text-xs text-text-primary font-mono border border-border-default">
            {stepNumber}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">{getTypeInfo?.icon}</span>
            <span className="text-text-primary font-medium">{getTypeInfo?.label}</span>
          </div>
          {step.duration && (
            <span className="text-text-tertiary text-sm font-mono ml-2">
              ⏱️ {formatDuration(step.duration)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <Button
            onClick={onMoveUp}
            disabled={isFirst}
            variant="ghost"
            size="sm"
            className="!p-1.5 min-w-0"
            title="Move up"
          >
            ↑
          </Button>
          <Button
            onClick={onMoveDown}
            disabled={isLast}
            variant="ghost"
            size="sm"
            className="!p-1.5 min-w-0"
            title="Move down"
          >
            ↓
          </Button>
          <Button
            onClick={onRemove}
            variant="ghost"
            size="sm"
            className="!p-1.5 min-w-0 text-accent-danger hover:text-accent-danger hover:bg-accent-danger/10"
            title="Delete step"
          >
            🗑️
          </Button>
        </div>
      </div>

      {/* Content */}
      {
        isExpanded && (
          <div className="p-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Step Type
              </label>
              <Select
                value={step.type}
                onChange={(e) => handleFieldChange('type', e.target.value as RitualStepType)}
                options={STEP_TYPES.map(type => ({
                  value: type.value,
                  label: `${type.icon} ${type.label}`
                }))}
                fullWidth
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Content
              </label>
              <textarea
                value={step.content}
                onChange={(e) => handleFieldChange('content', e.target.value)}
                placeholder="Enter step content..."
                className="w-full min-h-[100px] px-3 py-2 rounded-input bg-bg-surface hover:bg-bg-surface-hover text-text-primary border border-border-default hover:border-border-emphasis transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-opacity-50 focus:bg-bg-surface resize-y box-border placeholder-text-tertiary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Duration (seconds, optional)
              </label>
              <Input
                type="number"
                value={step.duration || ''}
                onChange={(e) => handleFieldChange('duration', e.target.value ? parseInt(e.target.value, 10) : undefined)}
                placeholder="e.g., 60"
                fullWidth
                min={1}
              />
            </div>

            {/* Preview */}
            {step.content && (
              <div className="mt-2 pt-4 border-t border-border-subtle">
                <label className="block text-xs font-medium text-text-tertiary uppercase tracking-wider mb-2">
                  Preview
                </label>
                <div className="p-3 bg-bg-canvas rounded-md border border-border-subtle text-sm text-text-secondary">
                  <div className="flex items-center gap-2 mb-2 text-text-primary font-medium">
                    <span>{getTypeInfo?.icon}</span>
                    <span>{getTypeInfo?.label}:</span>
                    {step.duration && (
                      <span className="text-text-tertiary font-normal">
                        ({formatDuration(step.duration)})
                      </span>
                    )}
                  </div>
                  <div className="whitespace-pre-wrap">{step.content}</div>
                </div>
              </div>
            )}
          </div>
        )
      }
    </div>
  );
}