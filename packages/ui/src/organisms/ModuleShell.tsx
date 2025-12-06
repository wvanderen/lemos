import React from 'react';

export interface ModuleShellProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

export const ModuleShell: React.FC<ModuleShellProps> = ({
  title,
  subtitle,
  actions,
  className = '',
  children,
}) => {
  return (
    <div className={`bg-bg-canvas min-h-screen ${className}`}>
      {/* Header */}
      <div className="border-b border-border-default bg-bg-surface">
        <div className="px-6 py-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-2xl font-semibold text-text-primary" style={{ margin: 0 }}>
                {title}
              </h1>
              {subtitle && (
                <p className="text-text-secondary mt-1" style={{ margin: 0 }}>
                  {subtitle}
                </p>
              )}
            </div>
            {actions && (
              <div className="flex items-center gap-3 ml-6">
                {actions}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};
