import React from 'react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  options: SelectOption[];
  error?: boolean;
  fullWidth?: boolean;
}

export const Select: React.FC<SelectProps> = ({
  options,
  error = false,
  fullWidth = false,
  className = '',
  ...props
}) => {
  const baseClasses = 'px-3 py-2 rounded-input bg-bg-surface text-text-primary border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-opacity-50 cursor-pointer';
  const errorClasses = error
    ? 'border-accent-danger focus:ring-accent-danger'
    : 'border-border-default focus:border-accent-primary';
  const widthClass = fullWidth ? 'w-full' : '';

  const combinedClasses = [
    baseClasses,
    errorClasses,
    widthClass,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <select className={combinedClasses} {...props}>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};
