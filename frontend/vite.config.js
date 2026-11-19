import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // autoUpdate: silently installs new service worker versions in the background
      registerType: 'autoUpdate',

      // Precache all static assets produced by the build (JS, CSS, HTML, icons)
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        // Never cache API calls — only the app shell
        navigateFallbackDenylist: [/^\/api/],
      },

      manifest: {
        name: 'Shopping List',
        short_name: 'Shopping List',
        description: 'Your personal shopping list app',
        theme_color: '#5b6af0',
        background_color: '#f0f2f8',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: 'pwa-64x64.png',
            sizes: '64x64',
            type: 'image/png',
          },
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
    }),
  ],
})
