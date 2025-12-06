import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
  },
  resolve: {
    alias: {
      '@lemos/core': resolve(__dirname, '../../../packages/core/src'),
      '@lemos/modules-ritual-editor': resolve(__dirname, '../src'),
    },
  },
});