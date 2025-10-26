import { createRoot } from 'react-dom/client'
import App from './App'

const container = document.getElementById('root')
if (container) {
  // 为样式隔离添加根容器类名
  container.className = 'chore-fire-ui'
  const root = createRoot(container)
  root.render(<App />)
}
