import type { ClientRequest, IncomingMessage } from 'node:http'
import type { Plugin, ProxyOptions, UserConfig } from 'vite'
import { injectSdkIntoHtml } from './common/injectSdkIntoHtml'

export type CommandType = 'serve' | 'build'

export default function ChoreFireVitePlugin(uiDevOpts?: { httpPort: string | number }): Plugin {
  return {
    name: 'chore-fire-vite-plugin',
    enforce: 'pre',
    apply: 'serve',

    transformIndexHtml: {
      order: 'pre',
      handler(html: string) {
        return injectSdkIntoHtml(html, !!uiDevOpts)
      },
    },

    config(config: UserConfig) {
      if (!config.server) config.server = {}
      if (!config.server.proxy) config.server.proxy = {}

      const proxy = config.server.proxy

      try {
        const { HTTP_SERVER_PORT } = require('../server/runtime.json')
        if (HTTP_SERVER_PORT) {
          Object.assign(proxy, getDevServerProxyConfig(uiDevOpts?.httpPort || HTTP_SERVER_PORT))
        }
      } catch {
        console.warn('[ChoreFireVitePlugin] Failed to load runtime config')
      }
    },
  }
}

export function getDevServerProxyConfig(
  port: string | number,
): Record<string, string | ProxyOptions> {
  return {
    '/chore-fire': {
      target: `http://localhost:${port}`,
      changeOrigin: true,
      rewrite: (path: string) => path.replace(/^\/chore-fire/, ''),
      configure: (proxy) => {
        proxy.on('proxyReq', (proxyReq: ClientRequest, req: IncomingMessage) => {
          if (req.url?.startsWith('/chore-fire/sse')) {
            proxyReq.setHeader('accept-encoding', 'identity')
          }
        })
        proxy.on('proxyRes', (proxyRes: IncomingMessage, req: IncomingMessage) => {
          if (req.url?.startsWith('/chore-fire/sse')) {
            delete proxyRes.headers['content-encoding']
          }
        })
      },
    },
  }
}
