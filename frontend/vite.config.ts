import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Pages from 'vite-plugin-pages'
import Layouts from 'vite-plugin-vue-layouts'
import path from 'path'

export default defineConfig({
  envDir: path.resolve(__dirname, '..'),
  envPrefix: ['VITE_', 'CONVEX_'],
  plugins: [
    vue(),
    Pages({ dirs: 'src/pages', extensions: ['vue'] }),
    Layouts({ layoutsDirs: 'src/layouts', defaultLayout: 'default' }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
