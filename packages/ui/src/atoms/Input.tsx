import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  fullWidth?: boolean;
}

export const Input: React.FC<InputProps> = ({
  error = false,
  fullWidth = false,
  className = '',
  ...props
}) => {
  const baseClasses = 'px-3 py-2 rounded-input bg-bg-surface hover:bg-bg-surface-hover text-text-primary border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-opacity-50 focus:bg-bg-surface focus:border-accent-primary placeholder-text-tertiary';
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

  return <input className={combinedClasses} {...props} />;
};
