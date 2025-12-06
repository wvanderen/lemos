/** @type {import('tailwindcss').Config} */
import uiConfig from '@lemos/ui/tailwind.config';

export default {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
  ],
  presets: [uiConfig],
  theme: {
    extend: {
      // App specific extensions if needed, but mostly relying on shared preset
    },
  },
  plugins: [],
}
