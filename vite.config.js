import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * vite.config.js — STRATA build configuration
 *
 * Bundle split strategy:
 *   vendor-react   → react, react-dom, react-router-dom  (~140 KB gz)
 *   vendor-supabase → @supabase/supabase-js               (~45 KB gz)
 *   vendor-charts  → recharts + dependencies              (~60 KB gz)
 *   vendor-ui      → lucide-react                         (~20 KB gz, tree-shaken)
 *
 * All page-level components are already lazy-loaded via React.lazy in App.jsx,
 * so each route becomes its own async chunk automatically.
 */
export default defineConfig({
  plugins: [react()],

  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // React core — highest-priority stable chunk
          if (
            id.includes('node_modules/react/') ||
            id.includes('node_modules/react-dom/') ||
            id.includes('node_modules/react-router-dom/') ||
            id.includes('node_modules/scheduler/')
          ) {
            return 'vendor-react';
          }

          // Supabase client — isolated so it doesn't bloat the React chunk
          if (id.includes('node_modules/@supabase/')) {
            return 'vendor-supabase';
          }

          // Charting libraries — heavy, loaded only on Analytics page
          if (
            id.includes('node_modules/recharts/') ||
            id.includes('node_modules/d3-') ||
            id.includes('node_modules/victory-')
          ) {
            return 'vendor-charts';
          }

          // Icon library — tree-shaken at build time, small residual chunk
          if (id.includes('node_modules/lucide-react/')) {
            return 'vendor-ui';
          }
        },
      },
    },

    // Raise the warning threshold slightly — supabase chunk is intentionally ~45 KB
    chunkSizeWarningLimit: 600,
  },
});
