const path = require('node:path')
const Koa = require('koa')
const Router = require('koa-router')
const staticDir = require('koa-static')
const mount = require('koa-mount')
const bodyParser = require('koa-bodyparser')

// 创建一个 HTTP 服务器，提供以下接口：
// 1. GET /task/all 返回所有任务
// 2. GET /task/:taskId 返回指定任务
// 3. POST /task/:taskId 设置指定任务结果，body 格式为 { result: any }
// 4. DETETE /task/:taskId 删除指定任务
function createHttpServer({ repo, http_server_port: port }) {
  const app = new Koa()
  const router = new Router()

  router.get('/task/all', (ctx) => {
    ctx.body = Array.from(repo.entries()).map(([taskId, task]) => ({
      taskId,
      ...task,
    }))
  })

  router.get('/task/:taskId', (ctx) => {
    const task = repo.get(ctx.params.taskId)
    if (!task) {
      ctx.status = 404
      ctx.body = { error: 'task not found' }
      return
    }
    ctx.body = task
  })

  router.post('/task/:taskId', (ctx) => {
    const task = repo.get(ctx.params.taskId)
    if (!task) {
      ctx.status = 404
      ctx.body = { error: 'task not found' }
      return
    }
    const { result } = ctx.request.body
    task.status = 'completed'
    task.result = result
    repo.set(ctx.params.taskId, task)
    ctx.body = { message: 'task updated' }
  })

  router.delete('/task/:taskId', (ctx) => {
    const existed = repo.delete(ctx.params.taskId)
    if (!existed) {
      ctx.status = 404
      ctx.body = { error: 'task not found' }
      return
    }
    ctx.body = { message: 'task deleted' }
  })

  app.use(bodyParser())
  app.use(mount('/static', staticDir(path.join(__dirname, '../../ui/dist'))))
  app.use(router.routes())
  app.use(router.allowedMethods())

  app.listen(port)

  return app
}

exports.createHttpServer = createHttpServer
module.exports = { createHttpServer }
