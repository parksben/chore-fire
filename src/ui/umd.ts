import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

// 样式隔离的渲染函数
export const renderApp = (container: HTMLElement) => {
  // 确保容器具有样式隔离类名
  if (!container.classList.contains('chore-fire-ui')) {
    container.classList.add('chore-fire-ui')
  }

  const root = createRoot(container)
  root.render(React.createElement(App))
  return root
}

// UMD 模块导出
export { React, createRoot, App }

// 全局挂载（可选）
if (typeof window !== 'undefined') {
  // biome-ignore lint/suspicious/noExplicitAny: UMD 模块需要挂载到全局对象
  ;(window as any).ChoreFireUI = {
    React,
    createRoot,
    App,
    renderApp,
  }
}
