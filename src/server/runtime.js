module.exports = {
	PROJECT_NAMESPACE: "chore-fire",
	HTTP_SERVER_PORT: 12306,
	LOCAL_MCP_SERVER_NAME: "chore-fire",
	VITE_PROXY_CONFIG: {
		"/chore-fire": {
			target: "http://localhost:12306",
			changeOrigin: true,
			rewrite: (path) => path.replace(/^\/chore-fire/, ""),
		},
	},
  WEBPACK_PROXY_CONFIG: {
    '/chore-fire': {
      target: "http://localhost:12306",
      changeOrigin: true,
      pathRewrite: { '^/chore-fire': '' },
    },
  },
};
