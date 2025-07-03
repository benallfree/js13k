import { cloudflare } from '@cloudflare/vite-plugin'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import { optimizeCssModules } from 'vite-plugin-optimize-css-modules'
import tsconfigPaths from 'vite-tsconfig-paths'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    minify: 'terser',
    modulePreload: {
      polyfill: false,
    },
    terserOptions: {
      compress: {
        // Drop all console statements
        drop_console: true,
        drop_debugger: true,
        // Remove dead code
        dead_code: true,
        // Remove unused functions and variables
        unused: true,
        // Inline simple functions
        inline: 2,
        // More aggressive optimizations
        passes: 3,
        // Remove pure function calls that don't affect anything
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn'],
        // Strip out specific debugging patterns
        global_defs: {
          DEBUG: false,
          'process.env.NODE_ENV': '"production"',
        },
      },
      mangle: {
        eval: true,
        toplevel: true,
        // Also mangle property names for maximum compression
        // properties: true,
      },
      format: {
        // Remove comments
        comments: false,
      },
    },
  },
  plugins: [tailwindcss(), tsconfigPaths(), optimizeCssModules(), cloudflare()],
})
