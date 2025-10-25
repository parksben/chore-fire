#!/usr/bin/env node
const { nanoid } = require('nanoid')
const fs = require('node:fs')
const path = require('node:path')
const { findAvailablePort } = require('../cjs/server/common/utils')

;(async () => {
  const PROJECT_NAMESPACE = `${path.basename(process.cwd())}_${nanoid(4)}`
  const LOCAL_MCP_SERVER_NAME = 'chore-fire'
  const HTTP_SERVER_PORT = await findAvailablePort(12306)

  const mcpConfig = {
    servers: {
      [LOCAL_MCP_SERVER_NAME]: {
        command: 'node',
        args: [
          path.join(__dirname, '../cjs/server/index.js'),
          '--project_namespace',
          PROJECT_NAMESPACE,
          '--http_server_port',
          String(HTTP_SERVER_PORT),
          '--local_mcp_server_name',
          LOCAL_MCP_SERVER_NAME,
        ],
      },
    },
  }

  const jsonPath = path.join(process.cwd(), '.vscode/mcp.json')

  if (!fs.existsSync(jsonPath)) {
    const vscodeDir = path.dirname(jsonPath)
    if (!fs.existsSync(vscodeDir)) {
      fs.mkdirSync(vscodeDir)
    }
    fs.writeFileSync(jsonPath, JSON.stringify(mcpConfig, null, 2), 'utf-8')
    return
  }

  try {
    const existingConfig = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'))
    Object.assign(existingConfig.servers, mcpConfig.servers)
    fs.writeFileSync(jsonPath, JSON.stringify(existingConfig, null, 2), 'utf-8')
  } catch (e) {
    console.error('Failed to update .vscode/mcp.json:', e)
  }
})()
