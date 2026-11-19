import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const frontendDirectory = dirname(fileURLToPath(import.meta.url));
const backendDirectory = resolve(frontendDirectory, '../backend');

export default defineConfig(({ mode }) => {
  const frontendEnv = loadEnv(mode, frontendDirectory, 'VITE_');
  const backendEnv = loadEnv(mode, backendDirectory, '');
  const backendPort = process.env.W2V_BACKEND_PORT || process.env.PORT || backendEnv.PORT || '5000';
  const backendTarget = process.env.VITE_BACKEND_URL || frontendEnv.VITE_BACKEND_URL || `http://127.0.0.1:${backendPort}`;

  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: backendTarget,
          changeOrigin: true,
        },
      },
    },
  };
});
