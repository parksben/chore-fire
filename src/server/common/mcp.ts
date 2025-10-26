import { McpServer } from '@modelcontextprotocol/sdk/server/mcp'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio'
import { z } from 'zod'
import type { TaskStatus, TaskStore } from './store'

export interface McpServerParams {
  store: TaskStore
  project_namespace: string
}

export function createMcpServer({
  store,
  project_namespace: namespace,
}: McpServerParams): McpServer {
  const server = new McpServer({
    name: `mcp-server-${namespace}`,
    version: '1.0.0',
  })

  server.registerTool(
    'fire',
    {
      title: '获取任务列表',
      description:
        '获取用户标注的所有待执行任务，编码助手根据此列表逐个执行 coding 任务。执行时注意先分析任务间的相互关系，对于不合理或者有冲突的任务，需进一步询问用户意图，分析后再决定是否执行。多个任务的执行顺序也需合理安排，以确保代码修改的连贯性和正确性。',
      inputSchema: {},
      outputSchema: {
        tasks: z.array(
          z.object({
            id: z.string(),
            page_url: z.string(),
            element_selector: z.string(),
            element_tag: z.string(),
            element_html: z.string(),
            element_screenshot_base64: z.string(),
            user_prompt: z.string(),
            status: z.enum(['todo', 'doing', 'done', 'cancel']),
          }),
        ),
      },
    },
    async () => {
      const tasks = store.list()
      return {
        content: [{ type: 'text', text: `共有 ${tasks.length} 个任务待执行` }],
        structuredContent: { tasks },
      }
    },
  )

  server.registerTool(
    'change_status',
    {
      title: '更新单个任务的状态',
      description:
        '编码助手根据任务执行情况，实时更新任务的状态。已经决策不执行的任务，请及时更新状态为 cancel。',
      inputSchema: {
        id: z.string().describe('任务ID'),
        status: z.enum(['todo', 'doing', 'done', 'cancel']).describe('新的任务状态'),
      },
      outputSchema: {
        success: z.boolean(),
        message: z.string(),
      },
    },
    async ({ id, status }: { id: string; status: 'todo' | 'doing' | 'done' | 'cancel' }) => {
      store.status({ id, status: status as TaskStatus })
      return {
        content: [{ type: 'text', text: `任务 ${id} 状态已更新为：${status}` }],
        structuredContent: { success: true, message: '任务状态已更新' },
      }
    },
  )

  server.registerTool(
    'clear_store',
    {
      title: '清空所有任务',
      description:
        '所有任务执行结束（状态走到 done 或 cancel）后，及时清空存储中的任务以释放空间。',
      inputSchema: {},
      outputSchema: {
        success: z.boolean(),
        message: z.string(),
      },
    },
    async () => {
      store.clear()
      return {
        content: [{ type: 'text', text: '任务列表已清空' }],
        structuredContent: { success: true, message: '任务列表已清空' },
      }
    },
  )

  const transport = new StdioServerTransport()
  server.connect(transport)

  return server
}
