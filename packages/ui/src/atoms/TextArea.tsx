import React from 'react';

export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    error?: boolean;
    fullWidth?: boolean;
}

export const TextArea: React.FC<TextAreaProps> = ({
    error = false,
    fullWidth = false,
    className = '',
    rows = 4,
    ...props
}) => {
    const baseClasses = 'px-3 py-2 rounded-input bg-bg-surface hover:bg-bg-surface-hover text-text-primary border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-opacity-50 focus:bg-bg-surface focus:border-accent-primary placeholder-text-tertiary resize-y font-body text-sm';
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

    return <textarea className={combinedClasses} rows={rows} {...props} />;
};
