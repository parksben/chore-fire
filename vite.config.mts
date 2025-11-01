import { copyFileSync, mkdirSync, readFileSync, rmSync } from 'node:fs'
import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { HTTP_SERVER_PORT } from './cjs/server/runtime.json'
import { getDevServerProxyConfig } from './src/plugin/vite'
import { rewriteHtml } from './src/plugin/common/rewriteHtml'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'rewrite-html',
      apply: 'serve',
      transformIndexHtml: {
        order: 'pre',
        handler(html: string) {
          return rewriteHtml(html, true)
        },
      },
    },
    {
      name: 'copy-umd-files',
      writeBundle() {
        mkdirSync('cjs/ui', { recursive: true })
        mkdirSync('esm/ui', { recursive: true })

        try {
          copyFileSync('dist/index.umd.js', 'cjs/ui/ui.umd.js')
          copyFileSync('dist/index.umd.js', 'esm/ui/ui.umd.js')
          copyFileSync('dist/style.css', 'cjs/ui/ui.css')
          copyFileSync('dist/style.css', 'esm/ui/ui.css')

          rmSync('dist', { recursive: true, force: true })
          console.log('✅ UMD files copied to cjs/ui and esm/ui')
        } catch (error) {
          console.error('❌ Error copying UMD files:', error)
        }
      },
    },
  ],
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
      },
    },
  },
  root: './src/ui',
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
  build: {
    outDir: '../../dist',
    emptyOutDir: true,
    lib: {
      entry: resolve(__dirname, 'src/ui/umd.ts'),
      name: 'ChoreFireUI',
      fileName: 'index',
      formats: ['umd'],
    },
    rollupOptions: {
      output: {
        globals: {},
      },
    },
    sourcemap: true,
  },
  server: {
    port: 3000,
    open: true,
    https: {
      key: readFileSync(resolve(__dirname, 'localhost-key.pem')),
      cert: readFileSync(resolve(__dirname, 'localhost-cert.pem')),
    },
    proxy: getDevServerProxyConfig(HTTP_SERVER_PORT)
  },
})
