import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/save-viewer/',
  plugins: [react()],
  resolve: {
    dedupe: [
      'react',
      'react-dom',
      '@mantine/core',
      '@mantine/hooks',
      '@mantine/dropzone',
      '@tabler/icons-react',
    ],
  },
});
