#!/usr/bin/env node
const fs = require('node:fs')
const path = require('node:path')
const { exec } = require('node:child_process')
const { HTTP_SERVER_PORT } = require('../cjs/server/runtime')

// 1. Remove chore-fire mcp schema from .vscode/mcp.json
const jsonPath = path.join(process.cwd(), '.vscode/mcp.json')

if (fs.existsSync(jsonPath)) {
  const existingConfig = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'))

  if (existingConfig.servers?.['chore-fire']) {
    delete existingConfig.servers['chore-fire']

    if (Object.keys(existingConfig.servers).length > 0) {
      fs.writeFileSync(jsonPath, JSON.stringify(existingConfig, null, 2), 'utf-8')
    } else {
      fs.unlinkSync(jsonPath)
    }
  }
}

// 2. Kill the process running on the HTTP_SERVER_PORT for stopping the local HTTP server
const port = Number(HTTP_SERVER_PORT)
const platform = process.platform

let command
if (platform === 'win32') {
  // Windows
  command = `netstat -ano | findstr :${port}`
} else {
  // Unix/Linux/Mac
  command = `lsof -i :${port} | grep LISTEN`
}

exec(command, (err, stdout, stderr) => {
  if (err || stderr) {
    console.error(`Error executing command: ${err || stderr}`)
    return
  }

  const lines = stdout.trim().split('\n')
  lines.forEach((line) => {
    let pid
    if (platform === 'win32') {
      const parts = line.trim().split(/\s+/)
      pid = parts[parts.length - 1]
    } else {
      const parts = line.trim().split(/\s+/)
      pid = parts[1]
    }

    if (pid) {
      try {
        process.kill(pid, 'SIGKILL')
        console.log(`Killed process with PID: ${pid} on port: ${port}`)
      } catch (e) {
        console.error(`Failed to kill process with PID: ${pid}`, e)
      }
    }
  })
})
