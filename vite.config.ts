import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import svgLoader from 'vite-svg-loader'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: true
  },
  build: {
    target: 'esnext'
  },
  esbuild: {
    target: 'esnext'
  },
  plugins: [vue(), svgLoader()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler'
      }
    }
  }
})
