import { type Task, TaskStatus } from '../server/common/store'

export const TASK_LIST: Task[] = [
  {
    id: 'mock-1',
    page_url: 'http://localhost:3000',
    element_selector: 'div.cf-bg-white.cf-rounded-lg.cf-p-8:nth-child(1)',
    element_tag: 'div',
    element_html:
      '<div class="cf-bg-white cf-rounded-lg cf-p-8 cf-shadow-lg cf-border cf-border-gray-200">...</div>',
    element_screenshot: '',
    user_prompt: '将标题改为"欢迎使用 Chore Fire"，并调整字体大小为 2.5em',
    status: TaskStatus.CANCEL,
  },
  {
    id: 'mock-2',
    page_url: 'http://localhost:3000',
    element_selector: 'div.cf-bg-gradient-to-r.cf-from-blue-50.cf-to-indigo-50',
    element_tag: 'div',
    element_html: '<div class="cf-bg-gradient-to-r cf-from-blue-50 cf-to-indigo-50">...</div>',
    element_screenshot: '',
    user_prompt: '给所有功能卡片添加悬停动画效果，鼠标悬停时卡片稍微上移并增加阴影',
    status: TaskStatus.DONE,
  },
  {
    id: 'mock-3',
    page_url: 'http://localhost:3000',
    element_selector: 'button.cf-bg-blue-500:nth-child(1)',
    element_tag: 'button',
    element_html:
      '<button type="button" class="cf-bg-blue-500 hover:cf-bg-blue-600">Get Started</button>',
    element_screenshot: '',
    user_prompt: '修改按钮颜色为渐变紫色，保持圆角和阴影效果',
    status: TaskStatus.DOING,
  },
  {
    id: 'mock-4',
    page_url: 'http://localhost:3000',
    element_selector: 'div.cf-grid.cf-grid-cols-1.md\\:cf-grid-cols-2.lg\\:cf-grid-cols-3',
    element_tag: 'div',
    element_html:
      '<div class="cf-grid cf-grid-cols-1 md:cf-grid-cols-2 lg:cf-grid-cols-3">...</div>',
    element_screenshot: '',
    user_prompt: '优化响应式布局，在小屏幕上显示为单列，中等屏幕显示两列',
    status: TaskStatus.TODO,
  },
  {
    id: 'mock-5',
    page_url: 'http://localhost:3000',
    element_selector: 'div.cf-text-4xl.cf-mb-4',
    element_tag: 'div',
    element_html: '<div class="cf-text-4xl cf-mb-4">🎯</div>',
    element_screenshot: '',
    user_prompt: '给所有 emoji 图标添加缩放动画，让页面更有活力',
    status: TaskStatus.TODO,
  },
]
