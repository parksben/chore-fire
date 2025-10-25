const { rewriteHtml } = require('./common/html')
const { jsxCoordinates } = require('./common/jsx')

function viteReactPlugin() {
  return {
    name: 'chore-fire-vite-react-plugin',
    enforce: 'pre',

    configResolved(config) {
      this.isProduction = config.command === 'build'
    },

    async transform(code, id) {
      if (this.isProduction) {
        return
      }
      if (id.endsWith('.html')) {
        return rewriteHtml(code)
      }
      return await jsxCoordinates(code, id)
    },
  }
}

exports.default = viteReactPlugin
module.exports = viteReactPlugin

// Usage: In your vite.config.js:

// const { defineConfig } = require('vite');
// const react = require('@vitejs/plugin-react');
// const viteReactPlugin = require('chore-fire/plugin/vite-react-plugin');

// module.exports = defineConfig({
//     plugins: [react(), viteReactPlugin()],
// });
