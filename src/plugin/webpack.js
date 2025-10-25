const { rewriteHtml } = require('./common/rewriteHtml')

class ChoreFireWebpackPlugin {
  apply(compiler) {
    const isDevelopment = compiler.options.mode === 'development' || compiler.options.devServer
    if (!isDevelopment) {
      return
    }

    compiler.hooks.compilation.tap('ChoreFireWebpackPlugin', (compilation) => {
      compilation.hooks.optimizeModules.tapPromise('ChoreFireWebpackPlugin', async (modules) => {
        for (const module of modules) {
          if ((module.resource || '').endsWith('.html')) {
            const originalSource = module.originalSource().source()
            const transformed = rewriteHtml(originalSource)
            if (transformed) {
              module._source._value = transformed
            }
          }
        }
      })
    })
  }
}

exports.default = ChoreFireWebpackPlugin
module.exports = ChoreFireWebpackPlugin

// Usage: In your webpack.config.js:

// const webpack = require('webpack');
// const ChoreFireWebpackPlugin = require('chore-fire/plugin/webpack');

// module.exports = {
//     // ... 其他 webpack 配置 ...
//     plugins: [
//         new ChoreFireWebpackPlugin(),
//     ],
// };
