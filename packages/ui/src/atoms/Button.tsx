import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  children: React.ReactNode;
}

const variantClasses = {
  primary: 'bg-accent-primary text-text-inverse hover:bg-accent-primary-hover shadow-lg hover:shadow-glow hover:-translate-y-0.5',
  secondary: 'bg-bg-surface text-text-primary border border-border-default hover:bg-bg-surface-hover shadow-sm',
  success: 'bg-accent-success text-text-inverse hover:opacity-90 shadow-sm',
  warning: 'bg-accent-warning text-text-inverse hover:opacity-90 shadow-sm',
  danger: 'bg-accent-danger text-text-inverse hover:opacity-90 shadow-sm',
  ghost: 'bg-transparent text-text-primary hover:bg-bg-surface-hover hover:text-accent-primary',
};

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  disabled,
  children,
  ...props
}) => {
  const baseClasses = 'font-medium rounded-button transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95';
  const widthClass = fullWidth ? 'w-full' : '';

  const combinedClasses = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    widthClass,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      className={combinedClasses}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};
