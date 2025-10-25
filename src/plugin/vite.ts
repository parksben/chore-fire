import type { IncomingMessage, ServerResponse } from 'node:http'
import { rewriteHtml } from './common/rewriteHtml'

export type CommandType = 'serve' | 'build'

export interface ProxyRequest {
  setHeader: (name: string, value: string) => void
  getHeader: (name: string) => string | undefined
  removeHeader: (name: string) => void
}

export interface ProxyResponse {
  headers: { [key: string]: string | string[] | undefined }
}

export interface ProxyServer {
  on(
    event: 'proxyReq',
    listener: (proxyReq: ProxyRequest, req: IncomingMessage, res: ServerResponse) => void,
  ): void
  on(
    event: 'proxyRes',
    listener: (proxyRes: ProxyResponse, req: IncomingMessage, res: ServerResponse) => void,
  ): void
  on(
    event: 'error',
    listener: (err: Error, req: IncomingMessage, res: ServerResponse) => void,
  ): void
  on(event: 'open' | 'close', listener: (...args: unknown[]) => void): void
  off(
    event: 'proxyReq',
    listener: (proxyReq: ProxyRequest, req: IncomingMessage, res: ServerResponse) => void,
  ): void
  off(
    event: 'proxyRes',
    listener: (proxyRes: ProxyResponse, req: IncomingMessage, res: ServerResponse) => void,
  ): void
  off(
    event: 'error',
    listener: (err: Error, req: IncomingMessage, res: ServerResponse) => void,
  ): void
  off(event: 'open' | 'close', listener: (...args: unknown[]) => void): void
}

export interface ProxyOptions {
  target: string
  changeOrigin?: boolean
  rewrite?: (path: string) => string
  configure?: (proxy: ProxyServer, options: ProxyOptions) => void
  ws?: boolean
  secure?: boolean
  headers?: Record<string, string>
  timeout?: number
  proxyTimeout?: number
  followRedirects?: boolean
  selfHandleResponse?: boolean
}

export interface ViteConfig {
  command: CommandType
  server?: {
    proxy?: {
      [key: string]: string | ProxyOptions
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
            configure: (proxy: ProxyServer) => {
              proxy.on('proxyReq', (proxyReq: ProxyRequest, req: IncomingMessage) => {
                if (req.url?.startsWith('/chore-fire/sse')) {
                  proxyReq.setHeader('accept-encoding', 'identity')
                }
              })
              proxy.on('proxyRes', (proxyRes: ProxyResponse, req: IncomingMessage) => {
                if (req.url?.startsWith('/chore-fire/sse')) {
                  delete proxyRes.headers['content-encoding']
                }
              })
            },
          }
        }
      } catch {
        console.warn('[ChoreFireVitePlugin] Failed to load runtime config')
      }
    },
  }
}
