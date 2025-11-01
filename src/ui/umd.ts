import r2wc from '@r2wc/react-to-web-component'
import ChoreFireUI from './ChoreFireUI'
// @ts-expect-error
import cssText from './components/TaskList/internal.scss?inline'
import './components/TaskList/external.scss'

const WEB_COMPONENT_TAG_NAME = 'chore-fire-ui'

const WebChoreFireUI = r2wc(ChoreFireUI, { shadow: 'open' })
const proto = WebChoreFireUI.prototype
const origConnected = proto.connectedCallback
proto.connectedCallback = function () {
  origConnected?.call(this)
  const sheet = new CSSStyleSheet()
  sheet.replaceSync(cssText)
  // biome-ignore lint/suspicious/noExplicitAny: shadowRoot type
  ;(this.shadowRoot as any).adoptedStyleSheets = [sheet]
}
customElements.define(WEB_COMPONENT_TAG_NAME, WebChoreFireUI)
