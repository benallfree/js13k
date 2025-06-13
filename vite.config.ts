import { resolve } from 'path'
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
  plugins: [],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      $util: resolve(__dirname, './src/util'),
      $components: resolve(__dirname, './src/components'),
      $constants: resolve(__dirname, './src/constants'),
      $store: resolve(__dirname, './src/store')
    }
  }
})
