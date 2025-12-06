/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'bg-canvas': 'var(--color-bg-canvas)',
        'bg-surface': 'var(--color-bg-surface)',
        'bg-surface-hover': 'var(--color-bg-surface-hover)',
        'bg-surface-active': 'var(--color-bg-surface-active)',
        'bg-overlay': 'var(--color-bg-overlay)',
        'text-primary': 'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)',
        'text-tertiary': 'var(--color-text-tertiary)',
        'text-inverse': 'var(--color-text-inverse)',
        'accent-primary': 'var(--color-accent-primary)',
        'accent-primary-hover': 'var(--color-accent-primary-hover)',
        'accent-success': 'var(--color-accent-success)',
        'accent-warning': 'var(--color-accent-warning)',
        'accent-danger': 'var(--color-accent-danger)',
        'border-default': 'var(--color-border-default)',
        'border-subtle': 'var(--color-border-subtle)',
        'border-emphasis': 'var(--color-border-emphasis)',
      },
      fontFamily: {
        display: 'var(--font-family-display)',
        body: 'var(--font-family-body)',
        mono: 'var(--font-family-mono)',
      },
      borderRadius: {
        panel: 'var(--radius-panel)',
        card: 'var(--radius-card)',
        button: 'var(--radius-button)',
        input: 'var(--radius-input)',
      },
      boxShadow: {
        panel: 'var(--shadow-panel)',
        card: 'var(--shadow-card)',
        overlay: 'var(--shadow-overlay)',
        glow: 'var(--shadow-glow)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
