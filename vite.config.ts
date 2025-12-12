import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // The third argument '' ensures we load all variables, not just those prefixed with VITE_
  const env = loadEnv(mode, process.cwd(), '');
  
  // Prioritize the system env var (Vercel), then the loaded env file
  const apiKey = process.env.API_KEY || env.API_KEY;

  // Log for debugging (will appear in Vercel build logs)
  if (!apiKey) {
    console.warn("WARNING: API_KEY is not defined in the build environment!");
  } else {
    console.log("Success: API_KEY found in build environment.");
  }

  return {
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
        manifest: {
          name: 'MediLens AI Companion',
          short_name: 'MediLens',
          description: 'A patient companion that uses AI to explain medical documents.',
          theme_color: '#f8fafc',
          background_color: '#f8fafc',
          display: 'standalone',
          orientation: 'portrait',
          start_url: '/',
          scope: '/',
          icons: [
            {
              src: 'pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png'
            }
          ]
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/cdn\.tailwindcss\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'tailwindcss-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            }
          ]
        }
      })
    ],
    define: {
      // Safely inject the API key. If it's undefined, we inject an empty string
      // so the code doesn't crash on 'process is not defined', but we can check for empty string later.
      'process.env.API_KEY': JSON.stringify(apiKey || '')
    }
  };
});