const { rewriteHtml } = require('./common/rewriteHtml')

function viteReactPlugin() {
  return {
    name: 'chore-fire-vite-plugin',
    enforce: 'pre',

    configResolved(config) {
      this.isDevServer = config.command === 'serve'
    },

    transform(code, id) {
      if (this.isDevServer && id.endsWith('.html')) {
        return rewriteHtml(code)
      }
    },
  }
}

exports.default = viteReactPlugin
module.exports = viteReactPlugin

// Usage: In your vite.config.js:

// const { defineConfig } = require('vite');
// const react = require('@vitejs/plugin-react');
// const viteReactPlugin = require('chore-fire/plugin/vite');

// module.exports = defineConfig({
//     plugins: [react(), viteReactPlugin()],
// });
