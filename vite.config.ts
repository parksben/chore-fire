import { copyFileSync, mkdirSync, rmSync } from 'node:fs'
import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    react(),
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
  // 配置 PostCSS 处理
  css: {
    postcss: './postcss.config.js',
  },
  root: './src/ui',
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
  },
})
