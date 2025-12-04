import type { PropsWithChildren } from 'react';

export function Panel({ children }: PropsWithChildren): JSX.Element {
  return (
    <div
      style={{
        border: '1px solid #d0d0d0',
        padding: '12px 16px',
        borderRadius: 8,
        fontFamily: 'Inter, system-ui, sans-serif',
        background: 'linear-gradient(145deg, #f9fafb, #eef1f4)',
      }}
    >
      {children}
    </div>
  );
}
