import React from 'react';

export interface CardProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  noPadding?: boolean;
  className?: string;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  actions,
  noPadding = false,
  className = '',
  children,
}) => {
    const baseClasses = 'bg-bg-surface border border-border-default rounded-card shadow-card';

  const combinedClasses = [
    baseClasses,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const headerContent = title || subtitle || actions;

  return (
    <div className={combinedClasses}>
        <div className={`${noPadding ? '' : 'p-6'} pb-4 border-b border-border-subtle flex items-start justify-between`}>
        <div className={`${noPadding ? 'p-6 pb-4' : 'pb-4'} border-b border-border-subtle flex items-start justify-between`}>
          <div>
            {title && (
              <h3 className="text-lg font-semibold text-text-primary" style={{ margin: 0 }}>
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-sm text-text-secondary mt-1" style={{ margin: 0 }}>
                {subtitle}
              </p>
            )}
          </div>
          {actions && (
            <div className="flex items-center gap-2 ml-4">
              {actions}
            </div>
          )}
        </div>
      )}
      <div className={noPadding ? '' : 'pt-4'}>
        {children}
      </div>
    </div>
  );
};
