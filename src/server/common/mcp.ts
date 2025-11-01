import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'
import type { Task, TaskStore } from './store'
import { TaskStatus } from './store'
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
        "Get all user-annotated tasks to be executed. CRITICAL WORKFLOW: 1) FIRST, you MUST analyze all tasks together - identify dependencies, conflicts, and logical groupings. Look for tasks that can be merged or need reordering. 2) BEFORE starting ANY task execution, update its status to 'doing' using change_status tool. If you decide not to execute a task, mark it as 'cancel' with change_status. 3) IMMEDIATELY after completing each task's work, mark it as 'done' using change_status - do not batch status updates. 4) AFTER ALL tasks are completed (all marked as 'done' or 'cancel'), you MUST call clear to free up storage. REMEMBER: Always analyze first, update status before and after each task, and clear storage when all done.",
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
      > = [
        {
          type: 'text',
          text: `Found ${tasks.length} task(s) to execute.\n\n⚠️ IMPORTANT INSTRUCTIONS:\n1. ANALYZE ALL TASKS FIRST: Review all tasks together, identify dependencies, conflicts, and determine optimal execution order.\n2. UPDATE STATUS BEFORE EXECUTION: Call change_status to set status to 'doing' before starting each task.\n3. UPDATE STATUS AFTER COMPLETION: Call change_status to set status to 'done' immediately after finishing each task.\n4. CANCEL INAPPROPRIATE TASKS: If a task should not be executed, mark it as 'cancel' using change_status.\n5. CLEAR STORAGE WHEN DONE: After all tasks are 'done' or 'cancel', call clear to free up storage.\n\n`,
        },
      ]

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
        structuredContent: { tasks },
      }
    },
  )

  server.registerTool(
    'change_status',
    {
      title: 'Update task status',
      description:
        "Update the status of tasks in real-time based on execution progress. REQUIRED USAGE: 1) Set status to 'doing' BEFORE starting work on a task. 2) Set status to 'done' IMMEDIATELY after completing a task's work. 3) Set status to 'cancel' for tasks that should not be executed. This tool must be called for every task status transition.",
      inputSchema: {
        id: z.string().describe('The task ID to be updated'),
        status: z.enum(['todo', 'doing', 'done', 'cancel']).describe('New status of the task'),
      },
      outputSchema: {
        success: z.boolean(),
        message: z.string(),
        task_id: z.string(),
        new_status: z.string(),
      },
    },
    async ({ id, status }: { id: string; status: 'todo' | 'doing' | 'done' | 'cancel' }) => {
      const task = store.get(id)
      if (!task) {
        return {
          content: [{ type: 'text', text: `❌ Task \`${id}\` not found.` }],
          structuredContent: {
            success: false,
            message: 'Task not found',
            task_id: id,
            new_status: status,
          },
        }
      }

      store.status({ id, status: status as TaskStatus })

      const statusEmoji =
        {
          todo: '⏸️',
          doing: '▶️',
          done: '✅',
          cancel: '❌',
        }[status] || '📝'

      return {
        content: [
          {
            type: 'text',
            text: `${statusEmoji} Task \`${id}\` status updated: ${task.status} → ${status}`,
          },
        ],
        structuredContent: {
          success: true,
          message: 'Task status updated successfully',
          task_id: id,
          new_status: status,
        },
      }
    },
  )

  server.registerTool(
    'clear',
    {
      title: 'Clear all tasks',
      description:
        "Clear all tasks from storage to free up space. REQUIRED: This tool MUST be called after all tasks have been executed (all tasks have status 'done' or 'cancel'). Do not skip this step - it's essential for proper cleanup and preventing storage overflow.",
      inputSchema: {},
      outputSchema: {
        success: z.boolean(),
        message: z.string(),
        cleared_count: z.number(),
      },
    },
    async () => {
      const tasks = store.list()
      const clearedCount = tasks.length

      // Check if all tasks are done or cancelled
      const allTasksCompleted = tasks.every(
        (task) => task.status === TaskStatus.DONE || task.status === TaskStatus.CANCEL,
      )

      if (!allTasksCompleted) {
        const pendingTasks = tasks.filter(
          (task) => task.status !== TaskStatus.DONE && task.status !== TaskStatus.CANCEL,
        )
        return {
          content: [
            {
              type: 'text',
              text: `⚠️ Warning: ${pendingTasks.length} task(s) are still pending (not 'done' or 'cancel'). It's recommended to complete or cancel them before clearing.\n\nPending tasks: ${pendingTasks.map((t) => `${t.id} (${t.status})`).join(', ')}`,
            },
          ],
          structuredContent: {
            success: false,
            message: 'Some tasks are still pending',
            cleared_count: 0,
          },
        }
      }

      store.clear()
      return {
        content: [
          {
            type: 'text',
            text: `🧹 Successfully cleared ${clearedCount} task(s) from storage. All tasks completed!`,
          },
        ],
        structuredContent: {
          success: true,
          message: 'All tasks cleared successfully',
          cleared_count: clearedCount,
        },
      }
    },
  )

  const transport = new StdioServerTransport()
  server.connect(transport)

  return server
}
