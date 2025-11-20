import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: [],
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
  },
  resolve: {
    alias: {
      '~': path.resolve(__dirname, './'),
      '@kit/ui': path.resolve(__dirname, '../../packages/ui/src'),
      '@kit/shared': path.resolve(__dirname, '../../packages/shared/src'),
    },
  },
});
