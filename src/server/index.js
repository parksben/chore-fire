const fs = require('node:fs')
const path = require('node:path')
const { parseArgs } = require('node:util')
const { createHttpServer } = require('./common/http.js')
const { createMcpServer } = require('./common/mcp.js')

const repo = new Map() // taskId -> { status, result }

const { values } = parseArgs({
  options: {
    project_namespace: {
      type: 'string',
      short: 'n',
      default: 'chore-fire',
    },
    http_server_port: { type: 'string', short: 'p', default: '12306' },
    local_mcp_server_name: {
      type: 'string',
      short: 'm',
      default: 'chore-fire',
    },
  },
})

const params = { repo, ...values }

createMcpServer(params)
createHttpServer(params)

const fileContent = `module.exports = {
	PROJECT_NAMESPACE: "${values.project_namespace}",
	HTTP_SERVER_PORT: ${values.http_server_port},
	LOCAL_MCP_SERVER_NAME: "${values.local_mcp_server_name}",
	VITE_PROXY_CONFIG: {
		"/chore-fire": {
			target: "http://localhost:${values.http_server_port}",
			changeOrigin: true,
			rewrite: (path) => path.replace(/^\\/chore-fire/, ""),
		},
	},
  WEBPACK_PROXY_CONFIG: {
    '/chore-fire': {
      target: "http://localhost:${values.http_server_port}",
      changeOrigin: true,
      pathRewrite: { '^/chore-fire': '' },
    },
  },
};
`
const runtimeInfoPath = path.join(__dirname, 'runtime.js')
fs.writeFileSync(runtimeInfoPath, fileContent, 'utf-8')
