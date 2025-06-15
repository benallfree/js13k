import { cloudflare } from '@cloudflare/vite-plugin'
import { resolve } from 'path'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  css: {
    transformer: 'lightningcss',
  },
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
        properties: {
          regex: /^_/,
        },
      },
      format: {
        // Remove comments
        comments: false,
      },
    },
  },
  plugins: [cloudflare()],
})
