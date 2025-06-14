import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    minify: 'terser',
    modulePreload: {
      polyfill: false
    },
    terserOptions: {
      compress: {
        drop_console: true
      },
      mangle: {
        eval: true,
        toplevel: true
      }
    }
  },
  plugins: []
})
