import * as fs from 'node:fs'
import * as path from 'node:path'
import { PassThrough } from 'node:stream'
import multer from '@koa/multer'
import Koa from 'koa'
import bodyParser from 'koa-bodyparser'
import mount from 'koa-mount'
import Router from 'koa-router'
import staticDir from 'koa-static'
import { nanoid } from 'nanoid'
import { getTaskProperties, type Task, TaskActionType, TaskStatus, type TaskStore } from './store'

export interface HttpServerParams {
  store: TaskStore
  http_server_port: string
}

const TASK_STORE_EVENT_TYPE = Object.values(TaskActionType)

const RUNTIME_JSON_PATH = path.join(__dirname, '../runtime.json')
const STATIC_FILE_DIRECTORY = path.join(__dirname, '../../ui')
const IMAGE_DIRECTORY = path.join(__dirname, '../../ui/image')

// 配置 multer 用于文件上传
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 限制 10MB
  },
})

export function createHttpServer({ store, http_server_port: port }: HttpServerParams): Koa {
  const app = new Koa()
  const router = new Router()

  router.post('/tasks', (ctx: Router.RouterContext) => {
    const tasksData = ctx.request.body as Partial<Task>[]

    const tasks = tasksData.map((data) => {
      const newTask: Task = {
        id: data.id as string,
        page_url: data.page_url as string,
        element_selector: data.element_selector as string,
        element_tag: data.element_tag || '',
        element_html: data.element_html || '',
        element_screenshot: data.element_screenshot || '',
        user_prompt: data.user_prompt as string,
        status: data.status || TaskStatus.TODO,
      }
      return newTask
    })

    store.write(tasks)
    ctx.status = 201
    ctx.body = {
      success: true,
      message: 'Multiple tasks written successfully',
      data: tasks,
    }
  })

  router.post('/task', (ctx: Router.RouterContext) => {
    const taskData = ctx.request.body as Partial<Task>

    if (!taskData.id || !taskData.page_url || !taskData.element_selector || !taskData.user_prompt) {
      ctx.status = 400
      ctx.body = {
        success: false,
        message: 'Missing required fields',
        required: ['id', 'page_url', 'element_selector', 'user_prompt'],
      }
      return
    }

    const existingTask = store.get(taskData.id)
    if (existingTask) {
      ctx.status = 409
      ctx.body = {
        success: false,
        message: 'Task already exists',
      }
      return
    }

    const newTask: Task = {
      id: taskData.id,
      page_url: taskData.page_url,
      element_selector: taskData.element_selector,
      element_tag: taskData.element_tag || '',
      element_html: taskData.element_html || '',
      element_screenshot: taskData.element_screenshot || '',
      user_prompt: taskData.user_prompt,
      status: taskData.status || TaskStatus.TODO,
    }

    store.add(newTask)
    ctx.status = 201
    ctx.body = {
      success: true,
      message: 'Task created successfully',
      data: newTask,
    }
  })

  router.get('/task/all', (ctx: Router.RouterContext) => {
    const tasks = store.list()
    ctx.body = {
      success: true,
      data: tasks,
      total: tasks.length,
      message: 'Tasks retrieved successfully',
    }
  })

  router.get('/task/:taskId', (ctx: Router.RouterContext) => {
    const task = store.get(ctx.params.taskId)
    if (!task) {
      ctx.status = 404
      ctx.body = { success: false, data: null, message: 'Task not found' }
      return
    }
    ctx.body = {
      success: true,
      data: task,
      message: 'Task retrieved successfully',
    }
  })

  router.put('/task/:taskId', (ctx: Router.RouterContext) => {
    const taskId = ctx.params.taskId
    const updateData = ctx.request.body as Partial<Task>

    const existingTask = store.get(taskId)
    if (!existingTask) {
      ctx.status = 404
      ctx.body = { success: false, message: 'Task not found' }
      return
    }

    const validUpdateData = getTaskProperties(updateData)

    if (Object.keys(validUpdateData).length === 1 && validUpdateData.status) {
      store.status({ id: taskId, status: validUpdateData.status })
    } else {
      store.update({ id: taskId, ...validUpdateData })
    }

    const updatedTask = store.get(taskId)
    ctx.body = { success: true, message: 'Task updated successfully', data: updatedTask }
  })

  router.delete('/task/:taskId', (ctx: Router.RouterContext) => {
    const taskId = ctx.params.taskId
    const existingTask = store.get(taskId)

    if (!existingTask) {
      ctx.status = 404
      ctx.body = { success: false, error: 'Task not found' }
      return
    }

    store.delete(taskId)
    ctx.body = { success: true, message: 'Task deleted successfully' }
  })

  router.delete('/task', (ctx: Router.RouterContext) => {
    store.clear()
    ctx.body = { success: true, message: 'All tasks cleared successfully' }
  })

  router.get('/const.js', (ctx: Router.RouterContext) => {
    const runtimeData = fs.readFileSync(RUNTIME_JSON_PATH, 'utf-8')
    ctx.type = 'application/javascript'
    ctx.body = `window.CHORE_FIRE_RUNTIME_INFO = ${runtimeData};`
  })

  const messageCache: string[] = []
  const messageCacheCleanList = TASK_STORE_EVENT_TYPE.map((type) => {
    const handler = (data: Partial<Task>) => {
      const message = `id: ${data.id}\ndata: ${JSON.stringify({ event: type, data })}\n\n`
      messageCache.push(message)
      while (messageCache.length > 200) {
        messageCache.shift()
      }
    }
    store.on(type, handler)
    return () => {
      store.off(type, handler)
    }
  })

  router.get('/sse', (ctx) => {
    ctx.set({
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'Content-Encoding': 'identity',
    })
    ctx.status = 200

    const stream = new PassThrough()

    const lastMsgId = ctx.get('Last-Event-ID')
    if (lastMsgId) {
      const lastMsgIndex = messageCache.findIndex((msg) => msg.startsWith(`id: ${lastMsgId}\n`))
      if (lastMsgIndex !== -1 && lastMsgIndex < messageCache.length - 1) {
        const missedMessages = messageCache.slice(lastMsgIndex + 1)
        missedMessages.forEach((msg) => {
          stream.write(msg)
        })
      }
    }

    const cleanList = TASK_STORE_EVENT_TYPE.map((type) => {
      const handler = (data: Partial<Task>) => {
        stream.write(`id: ${data.id}\ndata: ${JSON.stringify({ event: type, data })}\n\n`)
      }
      store.on(type, handler)
      return () => {
        store.off(type, handler)
      }
    })
    const heartbeat = setInterval(() => stream.write(`:\n\n`), 15 * 1000)

    const destroy = () => {
      cleanList.forEach((clean) => {
        clean()
      })
      clearInterval(heartbeat)
      stream.destroy()
    }

    ctx.req.on('close', destroy)
    ctx.req.on('finish', destroy)
    ctx.body = stream
  })

  router.post('/upload-image', async (ctx: Router.RouterContext) => {
    // biome-ignore lint/suspicious/noExplicitAny: use multer to handle file upload
    await upload.single('file')(ctx as any, async () => {
      // biome-ignore lint/suspicious/noExplicitAny: use multer to handle file upload
      const file = (ctx as any).file as Express.Multer.File | undefined
      if (!file) {
        ctx.status = 400
        ctx.body = { success: false, message: 'No file uploaded' }
        return
      }

      const fileName = `${nanoid()}.png`
      const filePath = path.join(IMAGE_DIRECTORY, fileName)

      await fs.promises.mkdir(IMAGE_DIRECTORY, { recursive: true })
      await fs.promises.writeFile(filePath, file.buffer)

      const fileUrl = `/static/image/${fileName}`

      ctx.body = {
        success: true,
        message: 'File uploaded successfully',
        data: { url: fileUrl },
      }
    })
  })

  app.use(bodyParser())
  app.use(mount('/static', staticDir(STATIC_FILE_DIRECTORY)))
  app.use(router.routes())
  app.use(router.allowedMethods())

  app.listen(Number(port))
  app.addListener('close', () => {
    messageCacheCleanList.forEach((clean) => {
      clean()
    })
    messageCache.length = 0
  })

  return app
}
