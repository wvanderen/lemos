import React from 'react';

export interface BadgeProps {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  children: React.ReactNode;
  className?: string;
}

const variantClasses = {
  default: 'bg-bg-surface text-text-secondary border border-border-default',
  primary: 'bg-accent-primary text-text-inverse',
  success: 'bg-accent-success text-text-inverse',
  warning: 'bg-accent-warning text-text-inverse',
  danger: 'bg-accent-danger text-text-inverse',
};

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  children,
  className = '',
}) => {
  const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-button text-xs font-medium';

  const combinedClasses = [
    baseClasses,
    variantClasses[variant],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return <span className={combinedClasses}>{children}</span>;
};
