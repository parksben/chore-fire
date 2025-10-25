import * as path from 'node:path'
import Koa from 'koa'
import bodyParser from 'koa-bodyparser'
import mount from 'koa-mount'
import Router from 'koa-router'
import staticDir from 'koa-static'

export interface Task {
  status: 'pending' | 'completed'
  result: unknown
}

export interface HttpServerParams {
  repo: Map<string, Task>
  http_server_port: string
}

// 创建一个 HTTP 服务器，提供以下接口：
// 1. GET /task/all 返回所有任务
// 2. GET /task/:taskId 返回指定任务
// 3. POST /task/:taskId 设置指定任务结果，body 格式为 { result: any }
// 4. DELETE /task/:taskId 删除指定任务
export function createHttpServer({ repo, http_server_port: port }: HttpServerParams): Koa {
  const app = new Koa()
  const router = new Router()

  router.get('/task/all', (ctx: Router.RouterContext) => {
    ctx.body = Array.from(repo.entries()).map(([taskId, task]) => ({
      taskId,
      ...task,
    }))
  })

  router.get('/task/:taskId', (ctx: Router.RouterContext) => {
    const task = repo.get(ctx.params.taskId)
    if (!task) {
      ctx.status = 404
      ctx.body = { error: 'task not found' }
      return
    }
    ctx.body = task
  })

  router.post('/task/:taskId', (ctx: Router.RouterContext) => {
    const task = repo.get(ctx.params.taskId)
    if (!task) {
      ctx.status = 404
      ctx.body = { error: 'task not found' }
      return
    }
    const { result } = ctx.request.body as { result: unknown }
    task.status = 'completed'
    task.result = result
    repo.set(ctx.params.taskId, task)
    ctx.body = { message: 'task updated' }
  })

  router.delete('/task/:taskId', (ctx: Router.RouterContext) => {
    const existed = repo.delete(ctx.params.taskId)
    if (!existed) {
      ctx.status = 404
      ctx.body = { error: 'task not found' }
      return
    }
    ctx.body = { message: 'task deleted' }
  })

  router.get('/const.js', (ctx: Router.RouterContext) => {
    const runtime = require('../runtime.json')
    ctx.type = 'application/javascript'
    ctx.body = `window.CHORE_FIRE_RUNTIME_INFO = ${JSON.stringify(runtime)};`
  })

  app.use(bodyParser())
  app.use(mount('/static', staticDir(path.join(__dirname, '../../ui'))))
  app.use(router.routes())
  app.use(router.allowedMethods())

  app.listen(Number(port))

  return app
}
