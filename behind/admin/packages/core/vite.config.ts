import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'Core',
      fileName: (format) => `index.${format}.js`
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        javascriptEnabled: true,
        api: 'modern',
        silenceDeprecations: ['import'],
      }
    },
    postcss: {
      plugins: []
    }
  },
  rollupOptions: {
    external: ['vue'],
    output: {
      globals: {
        vue: 'Vue'
      }
    }
  }
})
