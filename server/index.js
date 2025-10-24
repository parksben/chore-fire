const fs = require("node:fs");
const path = require("node:path");
const { parseArgs } = require("node:util");
const { createHttpServer } = require("./createHttpServer.js");
const { createMcpServer } = require("./createMcpServer.js");

const repo = new Map(); // taskId -> { status, result }

const { values } = parseArgs({
	options: {
		project_namespace: {
			type: "string",
			short: "n",
			default: "chore-fire",
		},
		http_server_port: { type: "string", short: "p", default: "12306" },
		local_mcp_server_name: {
			type: "string",
			short: "m",
			default: "chore-fire",
		},
	},
});

const params = { repo, ...values };

createMcpServer(params);
createHttpServer(params);

const envContent = Object.entries({
	PROJECT_NAMESPACE: values.project_namespace,
	HTTP_SERVER_PORT: values.http_server_port,
	LOCAL_MCP_SERVER_NAME: values.local_mcp_server_name,
})
	.map(([key, value]) => `${key}=${value}`)
	.join("\n");

const runtimeInfoPath = path.join(process.cwd(), "./server/.env.runtime");
fs.writeFileSync(runtimeInfoPath, envContent, "utf-8");
