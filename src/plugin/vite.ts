import { rewriteHtml } from './common/rewriteHtml'

export type CommandType = 'serve' | 'build'

export interface ViteConfig {
  command: CommandType
  server?: {
    proxy?: {
      [key: string]: {
        target: string
        changeOrigin?: boolean
        rewrite?: (path: string) => string
      }
    }
  }
}

export interface VitePlugin {
  name: string
  enforce?: 'pre' | 'post'
  apply?: CommandType | ((config: ViteConfig) => boolean)
  transformIndexHtml?: {
    order?: 'pre' | 'post'
    handler: (html: string, ctx: { path: string }) => string | Promise<string>
  }
  config?: (config: ViteConfig, options: { command: CommandType }) => void
}

export default function ChoreFireVitePlugin(): VitePlugin {
  return {
    name: 'chore-fire-vite-plugin',
    enforce: 'pre',
    apply: 'serve',

    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        return rewriteHtml(html)
      },
    },

    config(config) {
      if (!config.server) config.server = {}
      if (!config.server.proxy) config.server.proxy = {}

      const proxy = config.server.proxy

      try {
        const { HTTP_SERVER_PORT } = require('../server/runtime.json')
        if (HTTP_SERVER_PORT) {
          proxy['/chore-fire'] = {
            target: `http://localhost:${HTTP_SERVER_PORT}`,
            changeOrigin: true,
            rewrite: (path: string) => path.replace(/^\/chore-fire/, ''),
          }
        }
      } catch {
        console.warn('[ChoreFireVitePlugin] Failed to load runtime config')
      }
    },
  }
}
