const { nanoid } = require("nanoid");
const fs = require("node:fs");
const net = require("node:net");
const path = require("node:path");

function findAvailablePort(startPort) {
	let port = startPort;
	const maxAttempts = 200;

	for (let i = 0; i < maxAttempts; i++) {
		const server = net.createServer();
		let available = false;

		try {
			server.listen(port);
			server.close();
			available = true;
		} catch (err) {
			server.close();
			if (err.code === "EADDRINUSE") {
				port++;
				continue;
			} else {
				throw err;
			}
		}

		if (available) {
			return port;
		}
	}

	throw new Error(
		`Unable to find available port after ${maxAttempts} attempts`,
	);
}

const PROJECT_NAMESPACE = `${path.basename(process.cwd())}_${nanoid(4)}`;
const HTTP_SERVER_PORT = findAvailablePort(12306);
const LOCAL_MCP_SERVER_NAME = "chore-fire";

const mcpConfig = {
	servers: {
		[LOCAL_MCP_SERVER_NAME]: {
			command: "node",
			args: [
				path.join(process.cwd(), "./server/index.js"),
				"--project_namespace",
				PROJECT_NAMESPACE,
				"--http_server_port",
				String(HTTP_SERVER_PORT),
				"--local_mcp_server_name",
				LOCAL_MCP_SERVER_NAME,
			],
		},
	},
};

const jsonPath = path.join(process.cwd(), ".vscode/mcp.json");

if (!fs.existsSync(jsonPath)) {
	const vscodeDir = path.dirname(jsonPath);
	if (!fs.existsSync(vscodeDir)) {
		fs.mkdirSync(vscodeDir);
	}
	fs.writeFileSync(jsonPath, JSON.stringify(mcpConfig, null, 2), "utf-8");
} else {
	try {
		const existingConfig = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
		Object.assign(existingConfig.servers, mcpConfig.servers);
		fs.writeFileSync(
			jsonPath,
			JSON.stringify(existingConfig, null, 2),
			"utf-8",
		);
	} catch (e) {
		console.error("Failed to update .vscode/mcp.json:", e);
	}
}
