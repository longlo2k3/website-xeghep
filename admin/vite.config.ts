/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

const proxyConfig = {
  '/api': {
    target: 'http://localhost:3001',
    changeOrigin: true,
    timeout: 120000,
    rewrite: (path: string) =>
      path
        .replace(/^\/api\/airport-pricing(\b|\/|\?)/, '/api/airport_pricing$1')
        .replace(/^\/api\/distance-rates(\b|\/|\?)/, '/api/distance_rates$1')
        .replace(/^\/api\/globals\/company-settings(\b|\/|\?)/, '/api/globals/company_settings$1')
        .replace(/^\/api\/globals\/pricing-settings(\b|\/|\?)/, '/api/globals/pricing_settings$1'),
  },
  '/media': {
    target: 'http://localhost:3001',
    changeOrigin: true,
    timeout: 120000,
    bypass: (req: any) => {
      const url = req.url || '';
      const pathname = url.split('?')[0];
      // Trả về index.html cho trang /media của Admin SPA (trực tiếp hoặc F5)
      if (pathname === '/media' || pathname === '/media/') {
        return '/index.html';
      }
      // Nếu là request điều hướng trang của trình duyệt và không phải tệp ảnh/tài nguyên tĩnh
      const accept = req.headers?.accept || '';
      const hasFileExtension = /\.[a-zA-Z0-9]+$/.test(pathname);
      if (accept.includes('text/html') && !hasFileExtension) {
        return '/index.html';
      }
    },
  },
};

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    proxy: proxyConfig,
  },
  preview: {
    port: 5173,
    proxy: proxyConfig,
  },
  test: {
    globals: true,
    environment: 'jsdom',
  },
});
