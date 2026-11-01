import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import dotenv from 'dotenv';
import { handleCompanionRequest } from './server/apiHandler.js';

dotenv.config();

function aiCompanionPlugin() {
  return {
    name: 'ai-companion-backend-middleware',
    configureServer(server: any) {
      server.middlewares.use((req: any, res: any, next: any) => {
        if (req.url && req.url.startsWith('/api/companion')) {
          handleCompanionRequest(req, res);
        } else {
          next();
        }
      });
    },
  };
}

export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/phase-2/' : '/',
  plugins: [react(), aiCompanionPlugin()],
  server: {
    port: Number(process.env.PORT) || 5173,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
