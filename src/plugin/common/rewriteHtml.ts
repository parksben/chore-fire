const RUNTIME_INFO_URL = '/chore-fire/const.js'
const FE_SDK_URL = '/chore-fire/static/js/ui.umd.js'

export function rewriteHtml(html: string): string {
  const constScript = html.includes(RUNTIME_INFO_URL)
    ? ''
    : `<script src="${RUNTIME_INFO_URL}"></script>`
  const sdkScript = html.includes(FE_SDK_URL) ? '' : `<script src="${FE_SDK_URL}"></script>`
  return html.replace('</head>', `${constScript}${sdkScript}</head>`)
}
