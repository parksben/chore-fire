# 🔥 ChoreFire

> 🚀 Let Agent Fire Your Chores!

Vibe Coding 时代的 Web 前端开发神器。使开发者可以直接在网页上标注要修改的内容和功能，并将这些琐碎的的任务（**Chore**）批量交给本地编码助手（如 [GitHub Copilot](https://github.com/features/copilot)）执行（**Fire**）。

## 效果演示（视频）

<video src="./demo.mp4" controls width="1080"></video>

## 功能特性

- **本地化开发**：适用于在本地 IDE 中进行编码和开发 Web 前端应用
- **低成本接入**：同时支持 Vite 和 Webpack 项目，以插件方式接入，无需复杂配置
- **图形化操作**：在网页上直接标记需要修改的内容和功能，录入修改意见
- **一键批量执行**：将多个任务一键提交给本地编码助手并执行
- **多模态任务信息**：任务信息自动包含元素截图和源代码位置，便于编码助手准确理解需求
- **所见即所得**：前端界面实时展示任务执行状态和修改过程，大大提升本地开发体验

## 使用方式

1. 在前端网页中标记元素并创建任务
[TODO: 此处是一个截图]

2. 一键触发 Copilot 执行任务

在 Copilot 的输入框中输入 `#fire` 并发送，Copilot 会自动获取所有待处理任务并逐一执行。
[TODO: 此处是一个截图]

3. 任务开始执行，前端工具面板会实时展示任务的执行状态和进度
[TODO: 此处是一个截图]

## 安装步骤

### 1. 安装 npm 包

```bash
npm install chore-fire --save-dev
# 或使用 yarn
yarn add chore-fire --dev
# 或使用 pnpm
pnpm add chore-fire --save-dev
```

### 2. 开发环境配置

#### For Vite

在 `vite.config.js` 中引入并使用 ChoreFire 插件：

```javascript
import { defineConfig } from 'vite';
import ChoreFirePluginVite from 'chore-fire/plugin/vite';

export default defineConfig({
  plugins: [
    // ...
    ChoreFirePluginVite(),
    // ...
  ],
});
```

#### For Webpack

在 `webpack.config.js` 中引入并使用 ChoreFire 插件：

```javascript
const ChoreFirePluginWebpack = require('chore-fire/plugin/webpack');

module.exports = {
  // ...
  plugins: [
    // ...
    new ChoreFirePluginWebpack(),
    // ...
  ],
};
```

> 注：
> 1. 如果你的项目使用了 React，请确保生产环境运行的是 development 版本，否则 ChoreFire 服务将无法获得元素的源代码位置信息（其他功能不受影响）。
> 2. 如果你的项目使用了其他 UI 框架（如 Vue, Svelte 等），建议再额外安装 [code-inspector](https://github.com/zh-lx/code-inspector)。ChoreFire 可通过此插件获取源代码位置。

### 3. 启动本地 ChoreFire 服务（MCP Server）

#### For GitHub Copilot

* 若 npm 包安装正常，在你的 Copilot 输入框的右下角会出现一个高亮的 ”刷新“ 按钮
  [TODO: 此处是一个截图]
* 点击该按钮，在弹出的确认窗中点击 ”信任“ 以启用 ChoreFire 的本地 MCP 服务
  [TODO: 此处是一个截图]
* 若 Copilot 未出现刷新按钮，请在项目根目录下运行 `npx chore-fire-launch` 后，再次在 Copilot 界面中确认
* 在 Copilot 的输入框中输入 `#chore` 并发送，若 Copilot 正常返回欢迎信息，则表示 ChoreFire 已成功启用
  [TODO: 此处是一个截图]

### For 其他编码助手

拷贝 .vscode/mcp.json 中 ChoreFire 对应的服务配置到你所使用的编码助手中，具体配置方法请参考对应编码助手的文档。

### 4. 启动本地 devServer

正常启动前端开发环境，网页在浏览器正常打开后，页面右下角会出现一个可拖拽的工具面板：

[TODO: 此处是一个截图]

恭喜你，ChoreFire 已经成功启用！尽情开始你的 AI Coding 之旅吧！

## 工作原理

1. 安装 npm 包时，前端工程中会自动注册一个本地的 MCP 服务，用于与本地编码助手（如 Copilot）进行通信。MCP 服务配置可以在 .vscode/mcp.json 中找到（名为 `chore-fire`）。
2. Vite/Webpack 插件会在开发环境的前端页面中注入一个轻量级的工具面板，用于在网页上选中 UI 元素并录入相应的修改意见（User Prompt）。
3. 每当开发者添加一条任务时，ChoreFire 会自动截取该 UI 元素的截图，和源代码位置等关键信息。并将这些信息提交到本地 MCP 服务中，等待编码助手获取处理。
4. 当用户触发任务执行时，编码助手会通过 MCP 服务获取所有待处理任务，逐个执行这些任务并实时更新任务状态。

## 安全声明

ChoreFire 仅在本地开发环境中运行，未接入任何外部服务，不会将任何代码或数据上传到第三方服务器。所有任务信息均保存在本地，确保开发者的隐私和代码安全。

## License

MIT License