/// <reference types="vitest/config" />
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// Pages sirve el proyecto bajo /Habit-Tracker/. Ver docs/stack.md.
export default defineConfig({
  base: '/Habit-Tracker/',
  plugins: [
    react(),
    VitePWA({
      /**
       * Aviso y no recarga automatica: con autoUpdate el service worker puede
       * recargar la pagina a media entrada del dia, y perder lo que estabas
       * escribiendo por una actualizacion silenciosa es justo el detalle que
       * hace que se abandone una app de habitos. Ver docs/tecnica/pwa.md.
       */
      registerType: 'prompt',
      includeAssets: ['favicon.svg', 'favicon.ico', 'apple-touch-icon.png'],
      manifest: {
        name: 'Track Your Way',
        short_name: 'Track',
        description: 'Hábitos y estado de ánimo, a tu manera.',
        // Con el base del despliegue: sin esto, la app instalada abre un 404.
        start_url: '/Habit-Tracker/',
        scope: '/Habit-Tracker/',
        display: 'standalone',
        orientation: 'portrait',
        lang: 'es',
        background_color: '#162330',
        theme_color: '#162330',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
        // La API de GitHub jamas se cachea: una respuesta de sincronizacion
        // servida desde cache es una forma elegante de corromper datos.
        runtimeCaching: [],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
});
