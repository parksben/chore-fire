import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'
import type { Task, TaskStatus, TaskStore } from './store'
import { imageUrlToBase64 } from './utils'

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
    'chore',
    {
      title: 'Health Check',
      description: 'Check if the ChoreFire MCP server is running properly.',
      inputSchema: {},
      outputSchema: {
        message: z.string(),
      },
    },
    async () => {
      return {
        content: [{ type: 'text', text: 'Hello from ChoreFire!' }],
        structuredContent: { message: 'Hello from ChoreFire!' },
      }
    },
  )

  server.registerTool(
    'fire',
    {
      title: 'Get all tasks to be executed',
      description:
        "Get all user-annotated tasks to be executed. The coding assistant executes these coding tasks one by one. When executing, pay attention to analyzing the interrelationships between tasks. For unreasonable or conflicting tasks, further inquire about the user's intent, analyze, and then decide whether to execute. The execution order of multiple tasks should also be reasonably arranged to ensure the coherence and correctness of code modifications.",
      inputSchema: {},
      outputSchema: {
        tasks: z.array(
          z.object({
            id: z.string(),
            page_url: z.string(),
            element_selector: z.string(),
            element_tag: z.string(),
            element_html: z.string(),
            element_screenshot: z.string(),
            user_prompt: z.string(),
            status: z.enum(['todo', 'doing', 'done', 'cancel']),
          }),
        ),
      },
    },
    async () => {
      const tasks = store.list()

      // construct response content and structuredContent
      const content: Array<
        { type: 'text'; text: string } | { type: 'image'; data: string; mimeType: string }
      > = [{ type: 'text', text: `There are a total of ${tasks.length} tasks to be executed.\n\n` }]

      // attach element_screenshot as base64 in structuredContent
      const tasksWithBase64: Array<Task & { element_screenshot_base64?: string }> =
        await Promise.all(
          tasks.map(async (task) => {
            if (task.element_screenshot) {
              const base64Data = await imageUrlToBase64(task.element_screenshot)
              return {
                ...task,
                element_screenshot_base64: base64Data || undefined,
              }
            }
            return task
          }),
        )

      // attach images to content
      for (const task of tasksWithBase64) {
        if (task.element_screenshot_base64) {
          content.push({
            type: 'text',
            text: `\nScreenshot of the element of task ${task.id}:`,
          })
          content.push({
            type: 'image',
            data: task.element_screenshot_base64,
            mimeType: 'image/png',
          })
        }
      }

      return {
        content,
        structuredContent: { tasks: tasksWithBase64 },
      }
    },
  )

  server.registerTool(
    'change_status',
    {
      title: 'Update task status',
      description:
        'The coding assistant updates the status of tasks in real-time based on their execution. For tasks that have been decided not to be executed, please update the status to cancel in a timely manner.',
      inputSchema: {
        id: z.string().describe('The task ID to be updated'),
        status: z.enum(['todo', 'doing', 'done', 'cancel']).describe('New status of the task'),
      },
      outputSchema: {
        success: z.boolean(),
        message: z.string(),
      },
    },
    async ({ id, status }: { id: string; status: 'todo' | 'doing' | 'done' | 'cancel' }) => {
      store.status({ id, status: status as TaskStatus })
      return {
        content: [{ type: 'text', text: `Task \`${id}\` status has been updated to: ${status}` }],
        structuredContent: { success: true, message: 'Task status has been updated' },
      }
    },
  )

  server.registerTool(
    'clear_store',
    {
      title: 'Clear all tasks',
      description:
        'After all tasks have been executed (status changed to done or cancel), promptly clear the tasks stored to free up space.',
      inputSchema: {},
      outputSchema: {
        success: z.boolean(),
        message: z.string(),
      },
    },
    async () => {
      store.clear()
      return {
        content: [{ type: 'text', text: 'All tasks have been cleared.' }],
        structuredContent: { success: true, message: 'All tasks have been cleared.' },
      }
    },
  )

  const transport = new StdioServerTransport()
  server.connect(transport)

  return server
}
