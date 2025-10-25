const { McpServer } = require('@modelcontextprotocol/sdk/server/mcp.js')
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js')
const { nanoid } = require('nanoid')
const { z } = require('zod')

// 创建一个 MCP 服务器，提供以下工具：
// 1. iii 创建一个任务，返回任务ID
// 2. iii.poll 轮询任务状态，返回 { status: "pending" | "completed", result: any }
function createMcpServer({ repo, project_namespace: namespace }) {
  const server = new McpServer({
    name: `mcp-server-${namespace}`,
    version: '1.0.0',
  })

  // 注册 iii 工具
  server.registerTool(
    'iii',
    {
      title: 'Interactive Inspector Interface',
      description: '开始等待用户操作。此工具会创建一个任务ID，用于后续轮询',
      inputSchema: {},
      outputSchema: { taskId: z.string() },
    },
    async () => {
      const taskId = `${namespace}_${nanoid()}`
      repo.set(taskId, { status: 'pending', result: null })

      return {
        content: [{ type: 'text', text: `任务已创建：${taskId}` }],
        structuredContent: { taskId },
      }
    },
  )

  // 注册 iii.poll 工具
  server.registerTool(
    'iii.poll',
    {
      title: 'Poll Interactive Task',
      description:
        '轮询用户操作结果。当 status 为 "pending" 时，表示用户尚未完成输入；当 status 为 "completed" 时，表示用户已完成输入，此时应停止轮询；用户输入的信息在 result 字段中。',
      inputSchema: {
        taskId: z.string().describe('任务ID'),
      },
      outputSchema: {
        status: z.enum(['pending', 'completed']),
        result: z.any().optional(),
      },
    },
    async ({ taskId }) => {
      const task = repo.get(taskId)
      if (!task) {
        throw new Error('task not found')
      }

      if (task.status === 'completed') {
        setTimeout(() => {
          repo.delete(taskId)
        }, 300)
      }

      return {
        content: [{ type: 'text', text: `任务状态：${task.status}` }],
        structuredContent: task,
      }
    },
  )

  const transport = new StdioServerTransport()
  server.connect(transport)

  return server
}

exports.createMcpServer = createMcpServer
module.exports = { createMcpServer }
