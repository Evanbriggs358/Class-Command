import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/Class-Command/',
  plugins: [react()],
  test: {
    environment: 'node',
    include: ['src/test/**/*.test.ts'],
  },
});
