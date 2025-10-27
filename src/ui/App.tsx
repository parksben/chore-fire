import React, { useRef } from 'react'
import './App.css'
import Draggable from './components/Draggable'
import HighlightBorder from './components/HighlightBorder'

const App: React.FC = () => {
  const elementRef = useRef<HTMLDivElement | null>(null)

  return (
    <>
      <div className="chore-fire-ui cf-text-center cf-max-w-4xl cf-mx-auto cf-p-5">
        <header className="cf-bg-gray-800 cf-p-5 cf-text-white cf-rounded-lg cf-mb-5">
          <h1 className="cf-text-4xl cf-font-bold cf-mb-2">Chore Fire UI</h1>
          <p className="cf-text-xl cf-opacity-80">React + TypeScript UI for Chore Fire</p>
        </header>
        <main className="cf-py-5 cf-space-y-8">
          {/* Hero Section */}
          <div className="cf-bg-white cf-rounded-lg cf-p-8 cf-shadow-lg cf-border cf-border-gray-200">
            <h2 className="cf-text-3xl cf-font-semibold cf-text-gray-800 cf-mb-5">
              Welcome to Chore Fire
            </h2>
            <p className="cf-text-gray-600 cf-leading-relaxed cf-text-lg">
              A powerful graphical tool for web developers that quickly submits large amounts of
              modification requirements in web UI to your AI coding assistant.
            </p>
            <div className="cf-mt-6 cf-flex cf-gap-4 cf-justify-center">
              <button
                type="button"
                className="cf-bg-blue-500 hover:cf-bg-blue-600 cf-text-white cf-px-6 cf-py-2 cf-rounded-md cf-font-medium cf-transition-colors"
              >
                Get Started
              </button>
              <button
                type="button"
                className="cf-bg-gray-200 hover:cf-bg-gray-300 cf-text-gray-800 cf-px-6 cf-py-2 cf-rounded-md cf-font-medium cf-transition-colors"
              >
                Learn More
              </button>
            </div>
          </div>

          {/* Features Section */}
          <div
            className="cf-bg-gradient-to-r cf-from-blue-50 cf-to-indigo-50 cf-rounded-lg cf-p-8 cf-shadow-lg"
            ref={elementRef}
          >
            <h2 className="cf-text-3xl cf-font-bold cf-text-gray-800 cf-mb-8 cf-text-center">
              🚀 核心功能特性
            </h2>
            <div className="cf-grid cf-grid-cols-1 md:cf-grid-cols-2 lg:cf-grid-cols-3 cf-gap-6">
              <div className="cf-bg-white cf-p-6 cf-rounded-lg cf-shadow-md cf-border">
                <div className="cf-text-4xl cf-mb-4">🎯</div>
                <h3 className="cf-text-xl cf-font-semibold cf-mb-3 cf-text-gray-800">精准定位</h3>
                <p className="cf-text-gray-600">
                  通过可视化界面精确定位需要修改的 UI 元素，提高开发效率
                </p>
              </div>
              <div className="cf-bg-white cf-p-6 cf-rounded-lg cf-shadow-md cf-border">
                <div className="cf-text-4xl cf-mb-4">⚡</div>
                <h3 className="cf-text-xl cf-font-semibold cf-mb-3 cf-text-gray-800">快速提交</h3>
                <p className="cf-text-gray-600">批量提交大量修改需求，节省重复性工作时间</p>
              </div>
              <div className="cf-bg-white cf-p-6 cf-rounded-lg cf-shadow-md cf-border">
                <div className="cf-text-4xl cf-mb-4">🤖</div>
                <h3 className="cf-text-xl cf-font-semibold cf-mb-3 cf-text-gray-800">AI 助手</h3>
                <p className="cf-text-gray-600">与 AI 编程助手深度集成，智能理解修改意图</p>
              </div>
              <div className="cf-bg-white cf-p-6 cf-rounded-lg cf-shadow-md cf-border">
                <div className="cf-text-4xl cf-mb-4">🎨</div>
                <h3 className="cf-text-xl cf-font-semibold cf-mb-3 cf-text-gray-800">可视化操作</h3>
                <p className="cf-text-gray-600">直观的图形界面，所见即所得的编辑体验</p>
              </div>
              <div className="cf-bg-white cf-p-6 cf-rounded-lg cf-shadow-md cf-border">
                <div className="cf-text-4xl cf-mb-4">🔧</div>
                <h3 className="cf-text-xl cf-font-semibold cf-mb-3 cf-text-gray-800">易于集成</h3>
                <p className="cf-text-gray-600">支持多种前端框架，快速集成到现有项目中</p>
              </div>
              <div className="cf-bg-white cf-p-6 cf-rounded-lg cf-shadow-md cf-border">
                <div className="cf-text-4xl cf-mb-4">📱</div>
                <h3 className="cf-text-xl cf-font-semibold cf-mb-3 cf-text-gray-800">响应式设计</h3>
                <p className="cf-text-gray-600">适配各种屏幕尺寸，在不同设备上都有良好体验</p>
              </div>
            </div>
          </div>

          {/* How it Works */}
          <div className="cf-bg-white cf-rounded-lg cf-p-8 cf-shadow-lg cf-border cf-border-gray-200">
            <h2 className="cf-text-3xl cf-font-bold cf-text-gray-800 cf-mb-8 cf-text-center">
              📋 使用步骤
            </h2>
            <div className="cf-space-y-6">
              <div className="cf-flex cf-items-start cf-space-x-4">
                <div className="cf-flex-shrink-0 cf-w-10 cf-h-10 cf-bg-blue-500 cf-text-white cf-rounded-full cf-flex cf-items-center cf-justify-center cf-font-bold">
                  1
                </div>
                <div>
                  <h3 className="cf-text-xl cf-font-semibold cf-text-gray-800 cf-mb-2">安装配置</h3>
                  <p className="cf-text-gray-600">
                    将 Chore Fire 插件集成到您的项目中，只需几行代码即可完成配置
                  </p>
                </div>
              </div>
              <div className="cf-flex cf-items-start cf-space-x-4">
                <div className="cf-flex-shrink-0 cf-w-10 cf-h-10 cf-bg-blue-500 cf-text-white cf-rounded-full cf-flex cf-items-center cf-justify-center cf-font-bold">
                  2
                </div>
                <div>
                  <h3 className="cf-text-xl cf-font-semibold cf-text-gray-800 cf-mb-2">
                    可视化选择
                  </h3>
                  <p className="cf-text-gray-600">
                    在浏览器中打开您的应用，通过点击直接选择需要修改的 UI 元素
                  </p>
                </div>
              </div>
              <div className="cf-flex cf-items-start cf-space-x-4">
                <div className="cf-flex-shrink-0 cf-w-10 cf-h-10 cf-bg-blue-500 cf-text-white cf-rounded-full cf-flex cf-items-center cf-justify-center cf-font-bold">
                  3
                </div>
                <div>
                  <h3 className="cf-text-xl cf-font-semibold cf-text-gray-800 cf-mb-2">描述需求</h3>
                  <p className="cf-text-gray-600">
                    为每个选中的元素添加修改描述，支持自然语言描述修改需求
                  </p>
                </div>
              </div>
              <div className="cf-flex cf-items-start cf-space-x-4">
                <div className="cf-flex-shrink-0 cf-w-10 cf-h-10 cf-bg-blue-500 cf-text-white cf-rounded-full cf-flex cf-items-center cf-justify-center cf-font-bold">
                  4
                </div>
                <div>
                  <h3 className="cf-text-xl cf-font-semibold cf-text-gray-800 cf-mb-2">批量提交</h3>
                  <p className="cf-text-gray-600">
                    一键提交所有修改需求给 AI 助手，获得精确的代码修改建议
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="cf-bg-gradient-to-r cf-from-green-50 cf-to-emerald-50 cf-rounded-lg cf-p-8 cf-shadow-lg">
            <h2 className="cf-text-3xl cf-font-bold cf-text-gray-800 cf-mb-8 cf-text-center">
              📊 效率提升数据
            </h2>
            <div className="cf-grid cf-grid-cols-1 md:cf-grid-cols-4 cf-gap-6">
              <div className="cf-text-center cf-bg-white cf-p-6 cf-rounded-lg cf-shadow-md">
                <div className="cf-text-4xl cf-font-bold cf-text-green-600 cf-mb-2">85%</div>
                <p className="cf-text-gray-600">开发时间节省</p>
              </div>
              <div className="cf-text-center cf-bg-white cf-p-6 cf-rounded-lg cf-shadow-md">
                <div className="cf-text-4xl cf-font-bold cf-text-blue-600 cf-mb-2">10x</div>
                <p className="cf-text-gray-600">修改效率提升</p>
              </div>
              <div className="cf-text-center cf-bg-white cf-p-6 cf-rounded-lg cf-shadow-md">
                <div className="cf-text-4xl cf-font-bold cf-text-purple-600 cf-mb-2">1000+</div>
                <p className="cf-text-gray-600">开发者使用</p>
              </div>
              <div className="cf-text-center cf-bg-white cf-p-6 cf-rounded-lg cf-shadow-md">
                <div className="cf-text-4xl cf-font-bold cf-text-orange-600 cf-mb-2">99%</div>
                <p className="cf-text-gray-600">用户满意度</p>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="cf-bg-white cf-rounded-lg cf-p-8 cf-shadow-lg cf-border cf-border-gray-200">
            <h2 className="cf-text-3xl cf-font-bold cf-text-gray-800 cf-mb-8 cf-text-center">
              ❓ 常见问题
            </h2>
            <div className="cf-space-y-6">
              <div className="cf-border-b cf-border-gray-200 cf-pb-6">
                <h3 className="cf-text-xl cf-font-semibold cf-text-gray-800 cf-mb-3">
                  Chore Fire 支持哪些前端框架？
                </h3>
                <p className="cf-text-gray-600">
                  Chore Fire 支持 React、Vue、Angular 等主流前端框架，也可以在原生 HTML/CSS/JS
                  项目中使用。
                </p>
              </div>
              <div className="cf-border-b cf-border-gray-200 cf-pb-6">
                <h3 className="cf-text-xl cf-font-semibold cf-text-gray-800 cf-mb-3">
                  如何与 AI 编程助手集成？
                </h3>
                <p className="cf-text-gray-600">
                  Chore Fire 提供了标准的 API 接口，可以轻松与 GitHub Copilot、ChatGPT、Claude 等 AI
                  助手集成。
                </p>
              </div>
              <div className="cf-border-b cf-border-gray-200 cf-pb-6">
                <h3 className="cf-text-xl cf-font-semibold cf-text-gray-800 cf-mb-3">
                  工具的学习成本高吗？
                </h3>
                <p className="cf-text-gray-600">
                  不高！Chore Fire 设计简洁直观，大多数开发者可以在 5 分钟内上手使用。
                </p>
              </div>
              <div className="cf-border-b cf-border-gray-200 cf-pb-6">
                <h3 className="cf-text-xl cf-font-semibold cf-text-gray-800 cf-mb-3">
                  是否支持团队协作？
                </h3>
                <p className="cf-text-gray-600">
                  是的，Chore Fire 支持导出修改需求配置文件，可以在团队成员间共享和协作。
                </p>
              </div>
              <div>
                <h3 className="cf-text-xl cf-font-semibold cf-text-gray-800 cf-mb-3">
                  工具是否免费使用？
                </h3>
                <p className="cf-text-gray-600">
                  Chore Fire 提供免费的社区版本，包含基础功能。专业版提供更多高级特性和技术支持。
                </p>
              </div>
            </div>
          </div>

          {/* Testimonials */}
          <div className="cf-bg-gradient-to-r cf-from-purple-50 cf-to-pink-50 cf-rounded-lg cf-p-8 cf-shadow-lg">
            <h2 className="cf-text-3xl cf-font-bold cf-text-gray-800 cf-mb-8 cf-text-center">
              💬 用户评价
            </h2>
            <div className="cf-grid cf-grid-cols-1 md:cf-grid-cols-2 cf-gap-6">
              <div className="cf-bg-white cf-p-6 cf-rounded-lg cf-shadow-md">
                <div className="cf-flex cf-items-center cf-mb-4">
                  <div className="cf-w-12 cf-h-12 cf-bg-blue-500 cf-rounded-full cf-flex cf-items-center cf-justify-center cf-text-white cf-font-bold cf-mr-4">
                    张
                  </div>
                  <div>
                    <h4 className="cf-font-semibold cf-text-gray-800">张三</h4>
                    <p className="cf-text-sm cf-text-gray-600">前端开发工程师</p>
                  </div>
                </div>
                <p className="cf-text-gray-600 cf-italic">
                  "Chore Fire
                  彻底改变了我的开发工作流程，以前需要花费大量时间描述修改需求，现在只需要点击和描述即可，效率提升了数倍！"
                </p>
              </div>
              <div className="cf-bg-white cf-p-6 cf-rounded-lg cf-shadow-md">
                <div className="cf-flex cf-items-center cf-mb-4">
                  <div className="cf-w-12 cf-h-12 cf-bg-green-500 cf-rounded-full cf-flex cf-items-center cf-justify-center cf-text-white cf-font-bold cf-mr-4">
                    李
                  </div>
                  <div>
                    <h4 className="cf-font-semibold cf-text-gray-800">李四</h4>
                    <p className="cf-text-sm cf-text-gray-600">技术主管</p>
                  </div>
                </div>
                <p className="cf-text-gray-600 cf-italic">
                  "团队使用 Chore Fire 后，UI
                  修改的沟通成本大大降低，设计师和开发者之间的协作更加高效了。"
                </p>
              </div>
              <div className="cf-bg-white cf-p-6 cf-rounded-lg cf-shadow-md">
                <div className="cf-flex cf-items-center cf-mb-4">
                  <div className="cf-w-12 cf-h-12 cf-bg-purple-500 cf-rounded-full cf-flex cf-items-center cf-justify-center cf-text-white cf-font-bold cf-mr-4">
                    王
                  </div>
                  <div>
                    <h4 className="cf-font-semibold cf-text-gray-800">王五</h4>
                    <p className="cf-text-sm cf-text-gray-600">全栈开发者</p>
                  </div>
                </div>
                <p className="cf-text-gray-600 cf-italic">
                  "作为一个独立开发者，Chore Fire 让我能够更专注于核心功能开发，UI
                  调整变得轻松愉快。"
                </p>
              </div>
              <div className="cf-bg-white cf-p-6 cf-rounded-lg cf-shadow-md">
                <div className="cf-flex cf-items-center cf-mb-4">
                  <div className="cf-w-12 cf-h-12 cf-bg-orange-500 cf-rounded-full cf-flex cf-items-center cf-justify-center cf-text-white cf-font-bold cf-mr-4">
                    赵
                  </div>
                  <div>
                    <h4 className="cf-font-semibold cf-text-gray-800">赵六</h4>
                    <p className="cf-text-sm cf-text-gray-600">产品经理</p>
                  </div>
                </div>
                <p className="cf-text-gray-600 cf-italic">
                  "终于有了一个工具可以让我直观地表达产品需求，不再需要写长篇大论的需求文档了！"
                </p>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="cf-bg-gradient-to-r cf-from-blue-600 cf-to-purple-600 cf-text-white cf-rounded-lg cf-p-8 cf-shadow-lg cf-text-center">
            <h2 className="cf-text-3xl cf-font-bold cf-mb-4">🚀 准备好提升开发效率了吗？</h2>
            <p className="cf-text-xl cf-mb-6 cf-opacity-90">
              立即开始使用 Chore Fire，体验前所未有的 UI 开发体验
            </p>
            <div className="cf-flex cf-gap-4 cf-justify-center cf-flex-wrap">
              <button
                type="button"
                className="cf-bg-white cf-text-blue-600 cf-px-8 cf-py-3 cf-rounded-md cf-font-bold cf-text-lg hover:cf-bg-gray-100 cf-transition-colors"
              >
                免费试用
              </button>
              <button
                type="button"
                className="cf-border-2 cf-border-white cf-text-white cf-px-8 cf-py-3 cf-rounded-md cf-font-bold cf-text-lg hover:cf-bg-white hover:cf-text-blue-600 cf-transition-colors"
              >
                查看文档
              </button>
            </div>
          </div>

          {/* Footer Info */}
          <div className="cf-bg-gray-100 cf-rounded-lg cf-p-8 cf-text-center">
            <div className="cf-grid cf-grid-cols-1 md:cf-grid-cols-3 cf-gap-6 cf-mb-6">
              <div>
                <h3 className="cf-text-lg cf-font-semibold cf-text-gray-800 cf-mb-3">快速链接</h3>
                <ul className="cf-space-y-2 cf-text-gray-600">
                  <li>
                    <button
                      type="button"
                      className="hover:cf-text-blue-600 cf-transition-colors cf-bg-transparent cf-border-none cf-p-0 cf-cursor-pointer"
                    >
                      使用指南
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      className="hover:cf-text-blue-600 cf-transition-colors cf-bg-transparent cf-border-none cf-p-0 cf-cursor-pointer"
                    >
                      API 文档
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      className="hover:cf-text-blue-600 cf-transition-colors cf-bg-transparent cf-border-none cf-p-0 cf-cursor-pointer"
                    >
                      示例项目
                    </button>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="cf-text-lg cf-font-semibold cf-text-gray-800 cf-mb-3">社区</h3>
                <ul className="cf-space-y-2 cf-text-gray-600">
                  <li>
                    <button
                      type="button"
                      className="hover:cf-text-blue-600 cf-transition-colors cf-bg-transparent cf-border-none cf-p-0 cf-cursor-pointer"
                    >
                      GitHub
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      className="hover:cf-text-blue-600 cf-transition-colors cf-bg-transparent cf-border-none cf-p-0 cf-cursor-pointer"
                    >
                      讨论区
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      className="hover:cf-text-blue-600 cf-transition-colors cf-bg-transparent cf-border-none cf-p-0 cf-cursor-pointer"
                    >
                      问题反馈
                    </button>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="cf-text-lg cf-font-semibold cf-text-gray-800 cf-mb-3">支持</h3>
                <ul className="cf-space-y-2 cf-text-gray-600">
                  <li>
                    <button
                      type="button"
                      className="hover:cf-text-blue-600 cf-transition-colors cf-bg-transparent cf-border-none cf-p-0 cf-cursor-pointer"
                    >
                      联系我们
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      className="hover:cf-text-blue-600 cf-transition-colors cf-bg-transparent cf-border-none cf-p-0 cf-cursor-pointer"
                    >
                      技术支持
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      className="hover:cf-text-blue-600 cf-transition-colors cf-bg-transparent cf-border-none cf-p-0 cf-cursor-pointer"
                    >
                      更新日志
                    </button>
                  </li>
                </ul>
              </div>
            </div>
            <div className="cf-border-t cf-border-gray-300 cf-pt-6">
              <p className="cf-text-gray-600">
                © 2024 Chore Fire. All rights reserved. | 让 UI 开发更简单、更高效
              </p>
            </div>
          </div>
        </main>
      </div>

      <Draggable className="cf-absolute cf-right-10 cf-bottom-10 cf-bg-white cf-shadow-lg cf-rounded-lg cf-border cf-border-gray-200">
        <div className="cf-text-center cf-p-4">
          <div className="cf-text-2xl cf-mb-2">🎯</div>
          <div className="cf-text-sm cf-font-semibold cf-text-gray-800">快速工具</div>
        </div>
      </Draggable>

      <Draggable className="cf-absolute cf-right-10 cf-top-32 cf-bg-blue-500 cf-text-white cf-shadow-lg cf-rounded-lg cf-text-sm cf-max-w-48">
        <div className="cf-p-4">
          <div className="cf-font-semibold cf-mb-1">💡 小贴士</div>
          <div className="cf-text-xs cf-opacity-90">
            拖拽这些浮动元素来体验 Chore Fire 的交互功能！
          </div>
        </div>
      </Draggable>

      <HighlightBorder element={() => elementRef.current} />
    </>
  )
}

export default App
