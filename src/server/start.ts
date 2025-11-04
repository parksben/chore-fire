import * as fs from 'node:fs'
import * as path from 'node:path'
import { parseArgs } from 'node:util'
import { nanoid } from 'nanoid'
import { createHttpServer } from './common/http'
import { createMcpServer } from './common/mcp'
import { TaskStore } from './common/store'

interface ServerConfig {
  project_namespace: string
  http_server_port: string
  local_mcp_server_name: string
  http_server_only: boolean
  mcp_server_only: boolean
}

interface RuntimeConfig {
  PROJECT_DIRECTORY: string
  PROJECT_NAMESPACE: string
  HTTP_SERVER_PORT: string
  LOCAL_MCP_SERVER_NAME: string
}

const { values } = parseArgs({
  options: {
    project_namespace: {
      type: 'string',
      short: 'n',
      default: `chore-fire_${nanoid(4)}`,
    },
    http_server_port: { type: 'string', short: 'p', default: '12306' },
    local_mcp_server_name: {
      type: 'string',
      short: 'm',
      default: 'chore-fire',
    },
    http_server_only: { type: 'boolean', short: 'o', default: false },
    mcp_server_only: { type: 'boolean', short: 'c', default: false },
  },
}) as { values: ServerConfig }

const store = new TaskStore()
const params = { store, ...values }

if (!values.http_server_only) {
  createMcpServer(params)
}
if (!values.mcp_server_only) {
  createHttpServer(params)
}

const runtimeConfig: RuntimeConfig = {
  PROJECT_DIRECTORY: process.cwd(),
  PROJECT_NAMESPACE: values.project_namespace,
  HTTP_SERVER_PORT: values.http_server_port,
  LOCAL_MCP_SERVER_NAME: values.local_mcp_server_name,
}

const fileContent = JSON.stringify(runtimeConfig, null, 2)
const runtimeInfoPath = path.join(__dirname, 'runtime.json')
fs.writeFileSync(runtimeInfoPath, fileContent, 'utf-8')

const esmRuntimeInfoPath = path.join(__dirname, '../../esm/server/runtime.json')
fs.writeFileSync(esmRuntimeInfoPath, fileContent, 'utf-8')
