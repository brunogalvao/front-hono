import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    open: true,
    proxy: {
      '/api': {
        target: 'https://api-hono-jet.vercel.app',
        changeOrigin: true,
        secure: true,
        configure: (proxy) => {
          proxy.on('error', (err) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req) => {
            console.log(
              'Received Response from the Target:',
              proxyRes.statusCode,
              req.url
            );
          });
        },
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Core React libraries
          if (
            id.includes('node_modules/react') ||
            id.includes('node_modules/react-dom') ||
            id.includes('node_modules/react-router-dom')
          ) {
            return 'react-vendor';
          }

          // UI Libraries
          if (id.includes('node_modules/@radix-ui')) {
            return 'ui-vendor';
          }

          // Animation libraries
          if (
            id.includes('node_modules/framer-motion') ||
            id.includes('node_modules/motion') ||
            id.includes('node_modules/animate-ui')
          ) {
            return 'animation-vendor';
          }

          // Icons
          if (
            id.includes('node_modules/lucide-react') ||
            id.includes('node_modules/react-icons')
          ) {
            return 'icons-vendor';
          }

          // Database and auth
          if (id.includes('node_modules/@supabase')) {
            return 'data-vendor';
          }

          // Utilities
          if (
            id.includes('node_modules/date-fns') ||
            id.includes('node_modules/react-number-format') ||
            id.includes('node_modules/react-use-measure') ||
            id.includes('node_modules/sonner') ||
            id.includes('node_modules/zod') ||
            id.includes('node_modules/class-variance-authority') ||
            id.includes('node_modules/clsx') ||
            id.includes('node_modules/tailwind-merge')
          ) {
            return 'utils-vendor';
          }

          // UI Components (shadcn)
          if (id.includes('/components/ui/')) {
            return 'shadcn';
          }

          // Animate UI components
          if (id.includes('/components/animate-ui/')) {
            return 'animate-ui';
          }

          return null;
        },
      },
    },
    chunkSizeWarningLimit: 1000, // Increase limit to 1MB
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@supabase/supabase-js',
      'framer-motion',
    ],
  },
});
