import { preview } from 'vite';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const port = parseInt(process.env.PORT || '8080', 10);

try {
  const server = await preview({
    preview: {
      port,
      host: '0.0.0.0',
      allowedHosts: 'all',
      strictPort: false,
    },
    build: {
      outDir: resolve(__dirname, 'dist'),
    },
  });

  console.log(`Frontend preview server running on port ${port}`);
  console.log(`Local: http://localhost:${port}`);
  console.log(`Network: http://0.0.0.0:${port}`);
} catch (error) {
  console.error('Failed to start preview server:', error);
  process.exit(1);
}

