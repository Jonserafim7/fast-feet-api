import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  test: {
    globals: true,
    root: './',
    include: ['src/**/*.spec.ts'],
    exclude: ['node_modules', 'dist', '**/*.spec.js'],
  },
  plugins: [tsconfigPaths()],
});
