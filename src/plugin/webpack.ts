import type { ClientRequest, IncomingMessage } from 'node:http'
import type { Compiler, Module } from 'webpack'
import { injectSdkIntoHtml } from './common/injectSdkIntoHtml'

type WebpackModule = Module & {
  resource?: string
  originalSource?: () => { source: () => string | Buffer }
  _source?: { _value: string | Buffer }
}

type ProxyConfigMap = Record<
  string,
  | string
  | {
      target: string
      changeOrigin?: boolean
      pathRewrite?: Record<string, string>
      on?: {
        proxyReq?: (proxyReq: ClientRequest, req: IncomingMessage) => void
        proxyRes?: (proxyRes: IncomingMessage, req: IncomingMessage) => void
      }
    }
>

export default class ChoreFireWebpackPlugin {
  apply(compiler: Compiler): void {
    const isDevelopment = compiler.options.mode === 'development' || compiler.options.devServer
    if (!isDevelopment) {
      return
    }

    compiler.hooks.compilation.tap('ChoreFireWebpackPlugin', (compilation) => {
      compilation.hooks.optimizeModules.tap(
        'ChoreFireWebpackPlugin',
        (modules: Iterable<Module>) => {
          try {
            for (const module of modules) {
              const webpackModule = module as WebpackModule
              if ((webpackModule.resource || '').endsWith('.html')) {
                const originalSource = webpackModule.originalSource?.()?.source()
                if (originalSource) {
                  const sourceString =
                    typeof originalSource === 'string' ? originalSource : originalSource.toString()
                  const transformed = injectSdkIntoHtml(sourceString)
                  if (transformed && webpackModule._source) {
                    webpackModule._source._value = transformed
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

      const proxy = compiler.options.devServer.proxy as ProxyConfigMap

      try {
        const { HTTP_SERVER_PORT } = require('../server/runtime.json')
        if (HTTP_SERVER_PORT) {
          proxy['/chore-fire'] = {
            target: `http://localhost:${HTTP_SERVER_PORT}`,
            changeOrigin: true,
            pathRewrite: { '^/chore-fire': '' },
            on: {
              proxyReq: (proxyReq: ClientRequest, req: IncomingMessage) => {
                if (req.url?.startsWith('/chore-fire/sse')) {
                  proxyReq.setHeader('accept-encoding', 'identity')
                }
              },
              proxyRes: (proxyRes: IncomingMessage, req: IncomingMessage) => {
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
