import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import Pages from 'vite-plugin-pages'
import Layouts from 'vite-plugin-vue-layouts'
import path from 'path'

export default defineConfig(({ mode }) => {
  const envDir = path.resolve(__dirname, '..')
  const env = loadEnv(mode, envDir, ['VITE_', 'CONVEX_'])
  const convexUrl =
    env.VITE_CONVEX_URL ||
    env.CONVEX_URL ||
    process.env.VITE_CONVEX_URL ||
    process.env.CONVEX_URL ||
    ''

  if (mode === 'production' && !convexUrl) {
    throw new Error(
      'Missing VITE_CONVEX_URL for production build. Add it in Vercel → Settings → Environment Variables, then redeploy.',
    )
  }

  return {
    envDir,
    envPrefix: ['VITE_', 'CONVEX_'],
    define: convexUrl
      ? {
          'import.meta.env.VITE_CONVEX_URL': JSON.stringify(convexUrl),
          'import.meta.env.CONVEX_URL': JSON.stringify(convexUrl),
        }
      : undefined,
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
  }
})
