import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5174,
    proxy: {
      '/api/modal/loras': {
        target: 'https://marcf--acestep-acestepinference-api-list-loras.modal.run',
        changeOrigin: true,
        rewrite: () => '/',
        secure: true,
      },
      '/api/modal': {
        target: 'https://marcf--acestep-acestepinference-api-generate.modal.run',
        changeOrigin: true,
        rewrite: () => '/',
        secure: true,
      },
      '/api': {
        target: 'http://localhost:8001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
