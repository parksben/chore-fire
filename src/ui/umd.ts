import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

// UMD 模块导出
export { React, createRoot, App }

// 全局挂载（可选）
if (typeof window !== 'undefined') {
  // biome-ignore lint/suspicious/noExplicitAny: UMD 模块需要挂载到全局对象
  ;(window as any).ChoreFireUI = {
    React,
    createRoot,
    App,
  }
}
