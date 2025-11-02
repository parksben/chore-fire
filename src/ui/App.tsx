import type { FC } from 'react'
import './App.scss'
import ChoreFireUI from './ChoreFireUI'
import './components/TaskList/internal.scss'
import './components/TaskList/external.scss'

const App: FC = () => {
  return (
    <>
      <ChoreFireUI />

      <div className="app-container">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-content">
            <div className="hero-icon">🔥</div>
            <h1 className="hero-title">ChoreFire</h1>
            <p className="hero-subtitle">在网页中标注要调整的内容，一键提交给编码助手进行处理</p>
            <div className="hero-badges">
              <span className="badge">⚡ 高性能</span>
              <span className="badge">🎨 美观设计</span>
              <span className="badge">🚀 易于使用</span>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="features-section">
          <h2 className="section-title">✨ 核心特性</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📝</div>
              <h3>任务管理</h3>
              <p>轻松创建、编辑和组织你的任务列表，支持拖拽排序和优先级设置</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⚙️</div>
              <h3>自动化工作流</h3>
              <p>配置自动化脚本，让重复性工作自动完成，提升工作效率</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>数据可视化</h3>
              <p>直观的数据展示，实时追踪任务进度和完成情况</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔔</div>
              <h3>智能提醒</h3>
              <p>设置任务提醒，永远不会错过重要的截止日期和待办事项</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3>目标追踪</h3>
              <p>设定长期目标，分解为可执行的小任务，逐步实现你的梦想</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🌈</div>
              <h3>主题定制</h3>
              <p>多种主题选择，自定义界面外观，打造专属的工作空间</p>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="how-it-works-section">
          <h2 className="section-title">🎯 工作原理</h2>
          <div className="workflow-container">
            <div className="workflow-step">
              <div className="step-number">01</div>
              <div className="step-content">
                <div className="step-icon">🖱️</div>
                <h3>选择元素</h3>
                <p>在网页中直接点击或悬停需要修改的元素，系统会自动识别并高亮显示</p>
              </div>
            </div>
            <div className="workflow-arrow">→</div>
            <div className="workflow-step">
              <div className="step-number">02</div>
              <div className="step-content">
                <div className="step-icon">✍️</div>
                <h3>添加注释</h3>
                <p>描述你想要做的修改，可以是样式调整、内容更改或功能优化</p>
              </div>
            </div>
            <div className="workflow-arrow">→</div>
            <div className="workflow-step">
              <div className="step-number">03</div>
              <div className="step-content">
                <div className="step-icon">🚀</div>
                <h3>一键提交</h3>
                <p>点击提交按钮，任务将自动发送给编码助手进行处理</p>
              </div>
            </div>
            <div className="workflow-arrow">→</div>
            <div className="workflow-step">
              <div className="step-number">04</div>
              <div className="step-content">
                <div className="step-icon">✨</div>
                <h3>自动完成</h3>
                <p>编码助手智能分析并执行修改，实时查看进度和结果</p>
              </div>
            </div>
          </div>
        </section>

        {/* Use Cases Section */}
        <section className="use-cases-section">
          <h2 className="section-title">💼 应用场景</h2>
          <div className="use-cases-grid">
            <div className="use-case-card">
              <div className="use-case-image">
                <div className="image-placeholder">🎨</div>
              </div>
              <div className="use-case-content">
                <h3>UI/UX 设计调整</h3>
                <p>快速标注界面元素的样式修改需求，包括颜色、布局、动画效果等，让设计迭代更高效</p>
                <ul>
                  <li>调整组件样式和布局</li>
                  <li>优化响应式设计</li>
                  <li>添加动画和交互效果</li>
                </ul>
              </div>
            </div>
            <div className="use-case-card">
              <div className="use-case-image">
                <div className="image-placeholder">🔧</div>
              </div>
              <div className="use-case-content">
                <h3>功能需求开发</h3>
                <p>直接在页面上标注新功能需求，AI 助手理解上下文后自动生成代码实现</p>
                <ul>
                  <li>添加新的交互功能</li>
                  <li>集成第三方服务</li>
                  <li>实现数据处理逻辑</li>
                </ul>
              </div>
            </div>
            <div className="use-case-card">
              <div className="use-case-image">
                <div className="image-placeholder">🐛</div>
              </div>
              <div className="use-case-content">
                <h3>Bug 修复与优化</h3>
                <p>发现问题立即标注，描述异常行为，让 AI 助手快速定位并修复 Bug</p>
                <ul>
                  <li>修复界面显示问题</li>
                  <li>优化性能瓶颈</li>
                  <li>改进用户体验</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="stats-section">
          <h2 className="section-title">📈 统计信息</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">5</div>
              <div className="stat-label">总任务数</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">1</div>
              <div className="stat-label">已完成</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">1</div>
              <div className="stat-label">进行中</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">3</div>
              <div className="stat-label">待开始</div>
            </div>
          </div>
        </section>

        {/* Tips Section */}
        <section className="tips-section">
          <h2 className="section-title">💡 使用技巧</h2>
          <div className="tips-list">
            <div className="tip-item">
              <span className="tip-number">1</span>
              <div className="tip-content">
                <h4>快速添加任务</h4>
                <p>使用快捷键 Ctrl+N (Mac: Cmd+N) 快速创建新任务</p>
              </div>
            </div>
            <div className="tip-item">
              <span className="tip-number">2</span>
              <div className="tip-content">
                <h4>拖拽排序</h4>
                <p>直接拖动任务卡片即可调整任务的优先级顺序</p>
              </div>
            </div>
            <div className="tip-item">
              <span className="tip-number">3</span>
              <div className="tip-content">
                <h4>批量操作</h4>
                <p>按住 Shift 键可以选择多个任务进行批量操作</p>
              </div>
            </div>
            <div className="tip-item">
              <span className="tip-number">4</span>
              <div className="tip-content">
                <h4>标签分类</h4>
                <p>为任务添加标签，便于快速筛选和查找相关任务</p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="app-footer">
          <p>ChoreFire - 助力本地 Agent 实现 Vibe Coding 能力</p>
          <p className="footer-links">
            <a href="#docs">📚 文档</a>
            <span className="separator">•</span>
            <a href="#github">💻 GitHub</a>
            <span className="separator">•</span>
            <a href="#support">💬 支持</a>
          </p>
        </footer>
      </div>
    </>
  )
}

export default App
