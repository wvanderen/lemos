import React from 'react';

export interface PanelProps {
  children: React.ReactNode;
  noPadding?: boolean;
  className?: string;
}

export const Panel: React.FC<PanelProps> = ({
  children,
  noPadding = false,
  className = '',
}) => {
  const paddingClass = noPadding ? '' : 'p-6';
  const baseClasses = 'bg-bg-surface border border-border-default rounded-panel shadow-panel';

  const combinedClasses = [
    baseClasses,
    paddingClass,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return <div className={combinedClasses}>{children}</div>;
};
