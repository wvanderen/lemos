import React from 'react';

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  label,
  disabled = false,
  className = '',
}) => {
  const handleClick = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  const toggleClasses = [
    'relative inline-flex h-6 w-11 items-center rounded-button transition-colors duration-200 cursor-pointer',
    checked ? 'bg-accent-primary' : 'bg-border-default',
    disabled && 'opacity-50 cursor-not-allowed',
  ]
    .filter(Boolean)
    .join(' ');

  const switchClasses = [
    'inline-block h-4 w-4 transform rounded-button bg-white transition-transform duration-200',
    checked ? 'translate-x-6' : 'translate-x-1',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <label className={`flex items-center gap-2 ${className}`}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={handleClick}
        className={toggleClasses}
      >
        <span className={switchClasses} />
      </button>
      {label && (
        <span className="text-text-primary text-sm font-medium">{label}</span>
      )}
    </label>
  );
};
