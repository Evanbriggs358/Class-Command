import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/class-command/',
  plugins: [react()],
  test: {
    environment: 'node',
    include: ['src/test/**/*.test.ts'],
  },
});
