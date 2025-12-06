import React from 'react';

export interface FormFieldProps {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  hint,
  required = false,
  className = '',
  children,
}) => {
  return (
    <div className={`mb-4 ${className}`}>
      <label className="block text-sm font-medium text-text-primary mb-2">
        {label}
        {required && <span className="text-accent-danger ml-1">*</span>}
      </label>
      {children}
      {hint && !error && (
        <p className="mt-1 text-xs text-text-tertiary">{hint}</p>
      )}
      {error && (
        <p className="mt-1 text-xs text-accent-danger">{error}</p>
      )}
    </div>
  );
};
