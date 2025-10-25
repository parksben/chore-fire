const { rewriteHtml } = require('./common/html')
const { jsxCoordinates } = require('./common/jsx')

class ChoreFireWebpackReactPlugin {
  apply(compiler) {
    const isDevelopment = compiler.options.mode === 'development' || compiler.options.devServer
    if (!isDevelopment) {
      return
    }

    compiler.hooks.compilation.tap('ChoreFireWebpackReactPlugin', (compilation) => {
      compilation.hooks.optimizeModules.tapPromise(
        'ChoreFireWebpackReactPlugin',
        async (modules) => {
          for (const module of modules) {
            if ((module.resource || '').endsWith('.html')) {
              const originalSource = module.originalSource().source()
              const transformed = rewriteHtml(originalSource)
              if (transformed) {
                module._source._value = transformed
              }
              continue
            }

            if (module.resource && /\.(t|j)sx$/.test(module.resource)) {
              const originalSource = module.originalSource().source()
              const transformed = await jsxCoordinates(originalSource, module.resource)
              if (transformed) {
                module._source._value = transformed.code
                module._source._sourceMap = transformed.map
              }
            }
          }
        },
      )
    })
  }
}

exports.default = ChoreFireWebpackReactPlugin
module.exports = ChoreFireWebpackReactPlugin

// Usage: In your webpack.config.js:

// const webpack = require('webpack');
// const ChoreFireWebpackReactPlugin = require('chore-fire/plugin/webpack-react-plugin');

// module.exports = {
//     // ... 其他 webpack 配置 ...
//     plugins: [
//         new ChoreFireWebpackReactPlugin(),
//     ],
// };
