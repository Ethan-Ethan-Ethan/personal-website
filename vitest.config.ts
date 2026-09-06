import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'node',
    restoreMocks: true,
    exclude: ['verification/e2e/**', 'node_modules/**', 'dist/**'],
  },
});
