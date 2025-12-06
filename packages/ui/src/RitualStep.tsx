import { useState } from 'react';
import type { RitualTemplateStep, RitualStepType } from '@lemos/core';

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
    <div
      style={{
        border: '1px solid #374151',
        borderRadius: '8px',
        backgroundColor: '#1f2937',
        marginBottom: '12px',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '12px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          backgroundColor: '#1f2937', // Slightly lighter than container for contrast
          borderBottom: isExpanded ? '1px solid #374151' : 'none',
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              backgroundColor: '#374151',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              color: '#ffffff',
            }}
          >
            {stepNumber}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>{getTypeInfo?.icon}</span>
            <span style={{ color: '#ffffff', fontWeight: 'bold' }}>{getTypeInfo?.label}</span>
          </div>
          {step.duration && (
            <span style={{ color: '#9ca3af', fontSize: '14px' }}>
              ⏱️ {formatDuration(step.duration)}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMoveUp();
            }}
            disabled={isFirst}
            style={{
              padding: '6px',
              backgroundColor: 'transparent',
              color: isFirst ? '#4b5563' : '#9ca3af',
              border: '1px solid',
              borderColor: isFirst ? 'transparent' : '#4b5563',
              borderRadius: '6px',
              cursor: isFirst ? 'default' : 'pointer',
              fontSize: '14px',
              lineHeight: 1,
              transition: 'all 0.2s',
            }}
            title="Move up"
          >
            ↑
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMoveDown();
            }}
            disabled={isLast}
            style={{
              padding: '6px',
              backgroundColor: 'transparent',
              color: isLast ? '#4b5563' : '#9ca3af',
              border: '1px solid',
              borderColor: isLast ? 'transparent' : '#4b5563',
              borderRadius: '6px',
              cursor: isLast ? 'default' : 'pointer',
              fontSize: '14px',
              lineHeight: 1,
              transition: 'all 0.2s',
            }}
            title="Move down"
          >
            ↓
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            style={{
              padding: '6px',
              marginLeft: '8px',
              backgroundColor: 'rgba(220, 38, 38, 0.1)',
              color: '#ef4444',
              border: '1px solid transparent',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              lineHeight: 1,
              transition: 'all 0.2s',
            }}
            title="Delete step"
          >
            🗑️
          </button>
        </div>
      </div>

      {/* Content */}
      {
        isExpanded && (
          <div style={{ padding: '16px' }}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', color: '#9ca3af', fontSize: '14px', marginBottom: '8px' }}>
                Step Type
              </label>
              <select
                value={step.type}
                onChange={(e) => handleFieldChange('type', e.target.value as RitualStepType)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  backgroundColor: '#374151',
                  color: '#ffffff',
                  border: '1px solid #4b5563',
                  borderRadius: '4px',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                }}
              >
                {STEP_TYPES.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.icon} {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', color: '#9ca3af', fontSize: '14px', marginBottom: '8px' }}>
                Content
              </label>
              <textarea
                value={step.content}
                onChange={(e) => handleFieldChange('content', e.target.value)}
                placeholder="Enter step content..."
                style={{
                  width: '100%',
                  minHeight: '100px',
                  padding: '10px 14px',
                  backgroundColor: '#1f2937',
                  color: '#f3f4f6',
                  border: '1px solid #4b5563',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', color: '#9ca3af', fontSize: '14px', marginBottom: '8px' }}>
                Duration (seconds, optional)
              </label>
              <input
                type="number"
                value={step.duration || ''}
                onChange={(e) => handleFieldChange('duration', e.target.value ? parseInt(e.target.value, 10) : undefined)}
                placeholder="e.g., 60"
                min="1"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  backgroundColor: '#374151',
                  color: '#ffffff',
                  border: '1px solid #4b5563',
                  borderRadius: '4px',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Preview */}
            {step.content && (
              <div>
                <label style={{ display: 'block', color: '#9ca3af', fontSize: '14px', marginBottom: '8px' }}>
                  Preview
                </label>
                <div
                  style={{
                    padding: '12px',
                    backgroundColor: '#111827',
                    border: '1px solid #4b5563',
                    borderRadius: '4px',
                    fontSize: '14px',
                    color: '#d1d5db',
                    lineHeight: '1.5',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span>{getTypeInfo?.icon}</span>
                    <strong>{getTypeInfo?.label}:</strong>
                    {step.duration && (
                      <span style={{ color: '#9ca3af' }}>
                        ({formatDuration(step.duration)})
                      </span>
                    )}
                  </div>
                  <div>{step.content}</div>
                </div>
              </div>
            )}
          </div>
        )
      }
    </div >
  );
}