function rewriteHtml(html) {
  // 注入 ChoreFire 运行时信息
  const { PROJECT_NAMESPACE } = require('../../server/runtime.js')
  const runtimeScript = `<script>window.CHORE_FIRE_PROJECT_NAMESPACE = ${PROJECT_NAMESPACE};</script>`

  // 注入前端 SDK
  const sdkScript = `<script src="/chore-fire/static/chore-fire-ui.js"></script>`

  const transformedHtml = html.replace('</head>', `${runtimeScript}${sdkScript}</head>`)
  return transformedHtml
}

exports.rewriteHtml = rewriteHtml
module.exports = { rewriteHtml }
