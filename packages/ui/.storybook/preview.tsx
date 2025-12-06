import type { Preview } from '@storybook/react';
import '../src/styles/globals.css';
import '../src/styles/themes.css';

const preview: Preview = {
  parameters: {
    controls: { expanded: true },
    backgrounds: {
      disable: true,
    },
  },
  globalTypes: {
    theme: {
      description: 'Planetary Mode',
      defaultValue: 'sun',
      toolbar: {
        title: 'Theme',
        icon: 'circlehollow',
        items: [
          { value: 'sun', title: '☀️ Sun', icon: 'circlehollow' },
          { value: 'moon', title: '🌙 Moon', icon: 'circle' },
          { value: 'void', title: '⚫ Void', icon: 'circle' },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (Story, context) => {
      const theme = context.globals.theme || 'sun';

      // Apply theme to document root
      if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('data-theme', theme);
      }

      return <Story />;
    },
  ],
};

export default preview;
