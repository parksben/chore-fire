const RUNTIME_INFO_URL = '/chore-fire/const.js'
const FE_SDK_URL = '/chore-fire/static/ui.umd.js'
const FE_SDK_CSS_URL = '/chore-fire/static/ui.css'

export function injectSdkIntoHtml(html: string, forUIDevelopment = false): string {
  const constScript = html.includes(RUNTIME_INFO_URL)
    ? ''
    : `<script src="${RUNTIME_INFO_URL}"></script>`

  if (forUIDevelopment) {
    return html.replace('</head>', `${constScript}</head>`)
  }

  const sdkScript = html.includes(FE_SDK_URL) ? '' : `<script src="${FE_SDK_URL}"></script>`
  const sdkCss = html.includes(FE_SDK_CSS_URL)
    ? ''
    : `<link rel="stylesheet" href="${FE_SDK_CSS_URL}">`

  return html
    .replace('</head>', `${constScript}${sdkScript}${sdkCss}</head>`)
    .replace('</body>', `<chore-fire-ui></chore-fire-ui></body>`)
}
