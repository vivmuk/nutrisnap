import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      preview: {
        port: process.env.PORT ? parseInt(process.env.PORT) : 8080,
        host: '0.0.0.0',
        allowedHosts: 'all', // Allow all hosts for Railway deployment
        strictPort: false, // Don't fail if port is already in use
      },
      build: {
        outDir: 'dist',
        assetsDir: 'assets',
      },
      plugins: [react()],
      define: {
        'import.meta.env.VITE_API_BASE_URL': JSON.stringify(env.VITE_API_BASE_URL || 'http://localhost:3001'),
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
