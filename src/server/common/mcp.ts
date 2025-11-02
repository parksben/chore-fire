import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { nanoid } from 'nanoid'
import { z } from 'zod'
import type { Task, TaskStore } from './store'
import { TaskActionType, type TaskStatus } from './store'
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
        "Get all user-annotated tasks to be executed. CRITICAL WORKFLOW: 1) FIRST, you MUST analyze all tasks together - identify dependencies, conflicts, and logical groupings. Look for tasks that can be merged or need reordering. 2) IMMEDIATELY after analyzing, you MUST call start_all tool to notify the frontend application that task execution is beginning. 3) For each task, you MUST follow this exact pattern: a) Call change_status with status='doing' BEFORE starting work. b) Execute the task work. c) Call change_status with status='done' IMMEDIATELY after completing the work - this is MANDATORY, not optional. 4) If you determine a task should NOT be executed, you MUST call change_status with status='cancel' - never leave a task in 'todo' or 'doing' state if you're not executing it. 5) AFTER ALL tasks are updated to 'done' or 'cancel' (no tasks left in 'todo' or 'doing'), you MUST call finish_all tool. REMEMBER: analyze → start_all → [change_status(doing) → work → change_status(done)] OR [change_status(cancel)] → finish_all. ⚠️ CRITICAL: Every task MUST end with either status='done' or status='cancel'. Never skip the final status update!",
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
          text: `Found ${tasks.length} task(s) to execute.\n\n⚠️ CRITICAL WORKFLOW - MUST FOLLOW THIS SEQUENCE:\n\n1. 📋 ANALYZE ALL TASKS FIRST: Review all tasks together, identify dependencies, conflicts, and determine optimal execution order.\n\n2. 🚀 CALL start_all TOOL: Immediately after analyzing, you MUST call start_all to notify the frontend that execution is beginning.\n\n3. 🔄 FOR EACH TASK, FOLLOW THIS EXACT PATTERN:\n   a) ▶️ Call change_status(id, 'doing') BEFORE starting work\n   b) 💼 Execute the task work\n   c) ✅ Call change_status(id, 'done') IMMEDIATELY after completing - THIS IS MANDATORY!\n   \n   OR if task should not be executed:\n   ❌ Call change_status(id, 'cancel') - REQUIRED, never leave tasks unfinished!\n\n4. ⚠️ EVERY TASK MUST END WITH EITHER 'done' OR 'cancel':\n   - Completed work → change_status(id, 'done') - MANDATORY!\n   - Won't execute → change_status(id, 'cancel') - MANDATORY!\n   - NEVER leave tasks in 'todo' or 'doing' state!\n   - Do NOT batch status updates - update immediately after each task!\n\n5. 🏁 CALL finish_all TOOL: Only after ALL tasks are 'done' or 'cancel' (verify no tasks remain in 'todo' or 'doing').\n\n📌 CORRECT SEQUENCE FOR EACH TASK:\n   change_status(doing) → do work → change_status(done) ✓\n   OR: change_status(cancel) for tasks not executed ✓\n\n❌ WRONG - DO NOT DO THIS:\n   ✗ Forget to call change_status(done) after completing work\n   ✗ Forget to call change_status(cancel) for skipped tasks\n   ✗ Leave tasks in 'doing' state when moving to next task\n   ✗ Batch all status updates at the end\n\n⚠️ REMEMBER: Every task status change is a separate tool call. Update status immediately!\n\n`,
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
    'start_all',
    {
      title: 'Start all tasks',
      description: 'Emit an event indicating that all tasks are starting execution.',
      inputSchema: {},
      outputSchema: {
        success: z.boolean(),
        message: z.string(),
      },
    },
    async () => {
      store.emit(TaskActionType.START_ALL, { messageId: nanoid() })

      return {
        content: [
          {
            type: 'text',
            text: `🚀 All tasks are starting execution.`,
          },
        ],
        structuredContent: {
          success: true,
          message: 'All tasks start event emitted successfully',
        },
      }
    },
  )

  server.registerTool(
    'finish_all',
    {
      title: 'Finish all tasks',
      description:
        "Emit an event indicating that all tasks have finished execution. ⚠️ CRITICAL: Only call this tool after you have verified that ALL tasks have been updated to either 'done' or 'cancel' status. Before calling this, ensure: 1) Every completed task has been marked as 'done' via change_status. 2) Every skipped/cancelled task has been marked as 'cancel' via change_status. 3) No tasks remain in 'todo' or 'doing' state. This is the final step in the workflow and signals to the frontend that all work is complete.",
      inputSchema: {},
      outputSchema: {
        success: z.boolean(),
        message: z.string(),
      },
    },
    async () => {
      store.emit(TaskActionType.FINISH_ALL, { messageId: nanoid() })

      return {
        content: [
          {
            type: 'text',
            text: `🏁 All tasks have finished execution.`,
          },
        ],
        structuredContent: {
          success: true,
          message: 'All tasks finish event emitted successfully',
        },
      }
    },
  )

  server.registerTool(
    'change_status',
    {
      title: 'Update task status',
      description:
        "Update the status of tasks in real-time based on execution progress. REQUIRED USAGE: 1) Set status to 'doing' BEFORE starting work on a task. 2) Set status to 'done' IMMEDIATELY after completing a task's work - THIS IS MANDATORY, you must call this for every completed task! 3) Set status to 'cancel' for tasks that should not be executed - THIS IS ALSO MANDATORY for skipped tasks! This tool must be called for every task status transition. ⚠️ CRITICAL REQUIREMENTS: a) You MUST call this tool with status='doing' BEFORE you begin working on any task. b) You MUST call this tool with status='done' IMMEDIATELY after finishing each task - do not forget or skip this! c) You MUST call this tool with status='cancel' for any task you decide not to execute. d) EVERY task must end with either 'done' or 'cancel' - no exceptions! Never leave tasks in 'todo' or 'doing' state. This ensures the UI updates correctly to show task progress.",
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
        'Clear all tasks from storage to free up space. This tool is primarily intended for manual user-initiated cleanup, not as part of the automated task execution workflow.',
      inputSchema: {},
      outputSchema: {
        success: z.boolean(),
        message: z.string(),
        cleared_count: z.number(),
      },
    },
    async () => {
      const clearedCount = store.size
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
