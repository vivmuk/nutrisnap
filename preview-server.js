import { preview } from 'vite';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const port = parseInt(process.env.PORT || '8080', 10);
const distDir = resolve(__dirname, 'dist');

// Check if dist folder exists
if (!existsSync(distDir)) {
  console.error(`❌ Error: dist folder not found at ${distDir}`);
  console.error('Please run "npm run build" first');
  process.exit(1);
}

// Keep process alive
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

try {
  const server = await preview({
    configFile: resolve(__dirname, 'vite.config.ts'),
    preview: {
      port,
      host: '0.0.0.0',
      allowedHosts: [
        'all',
        '.railway.app',
        '.up.railway.app',
        'nutriviv.up.railway.app',
        'gracious-creation-production.up.railway.app',
      ],
      strictPort: false,
    },
    build: {
      outDir: resolve(__dirname, 'dist'),
    },
  });

  console.log(`✅ Frontend preview server running on port ${port}`);
  console.log(`Local: http://localhost:${port}`);
  console.log(`Network: http://0.0.0.0:${port}`);
  
  // Keep the process alive
  server.httpServer.on('listening', () => {
    console.log('Server is ready to accept connections');
  });
  
} catch (error) {
  console.error('❌ Failed to start preview server:', error);
  process.exit(1);
}

