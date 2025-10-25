import type { IncomingMessage, ServerResponse } from 'node:http'
import { rewriteHtml } from './common/rewriteHtml'

export interface ProxyRequest {
  setHeader: (name: string, value: string) => void
  getHeader: (name: string) => string | undefined
  removeHeader: (name: string) => void
}

export interface ProxyResponse {
  headers: { [key: string]: string | string[] | undefined }
}

export interface WebpackProxyConfig {
  target: string
  changeOrigin?: boolean
  pathRewrite?: { [key: string]: string }
  on?: {
    proxyReq?: (proxyReq: ProxyRequest, req: IncomingMessage, res: ServerResponse) => void
    proxyRes?: (proxyRes: ProxyResponse, req: IncomingMessage, res: ServerResponse) => void
  }
}

export interface WebpackCompiler {
  options: {
    mode?: string
    devServer?: {
      proxy?: { [key: string]: WebpackProxyConfig | string }
    }
  }
  hooks: {
    compilation: {
      tap: (name: string, callback: (compilation: WebpackCompilation) => void) => void
    }
    environment: {
      tap: (name: string, callback: () => void) => void
    }
  }
}

export interface WebpackModule {
  resource?: string
  originalSource?: () => { source: () => string }
  _source?: { _value: string }
}

export interface WebpackCompilation {
  hooks: {
    optimizeModules: {
      tapPromise: (name: string, callback: (modules: WebpackModule[]) => Promise<void>) => void
    }
  }
}

export default class ChoreFireWebpackPlugin {
  apply(compiler: WebpackCompiler): void {
    const isDevelopment = compiler.options.mode === 'development' || compiler.options.devServer
    if (!isDevelopment) {
      return
    }

    compiler.hooks.compilation.tap('ChoreFireWebpackPlugin', (compilation: WebpackCompilation) => {
      compilation.hooks.optimizeModules.tapPromise(
        'ChoreFireWebpackPlugin',
        async (modules: WebpackModule[]) => {
          try {
            for (const module of modules) {
              if ((module.resource || '').endsWith('.html')) {
                const originalSource = module.originalSource?.()?.source()
                if (originalSource) {
                  const transformed = rewriteHtml(originalSource)
                  if (transformed && module._source) {
                    module._source._value = transformed
                  }
                }
              }
            }
          } catch (error) {
            console.warn('[ChoreFireWebpackPlugin] Failed to transform HTML modules:', error)
          }
        },
      )
    })

    compiler.hooks.environment.tap('ChoreFireWebpackPlugin', () => {
      if (!compiler.options.devServer) {
        compiler.options.devServer = {}
      }
      if (!compiler.options.devServer.proxy) {
        compiler.options.devServer.proxy = {}
      }

      const proxy = compiler.options.devServer.proxy as {
        [key: string]: WebpackProxyConfig | string
      }

      try {
        const { HTTP_SERVER_PORT } = require('../server/runtime.json')
        if (HTTP_SERVER_PORT) {
          proxy['/chore-fire'] = {
            target: `http://localhost:${HTTP_SERVER_PORT}`,
            changeOrigin: true,
            pathRewrite: { '^/chore-fire': '' },
            on: {
              proxyReq: (proxyReq, req) => {
                if (req.url?.startsWith('/chore-fire/sse')) {
                  proxyReq.setHeader('accept-encoding', 'identity')
                }
              },
              proxyRes: (proxyRes, req) => {
                if (req.url?.startsWith('/chore-fire/sse')) {
                  delete proxyRes.headers['content-encoding']
                }
              },
            },
          }
        }
      } catch {
        console.warn('[ChoreFireWebpackPlugin] Failed to load runtime config')
      }
    })
  }
}
