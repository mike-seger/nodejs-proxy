const express = require("express")
const morgan = require("morgan")
const fs = require("fs")
const { createProxyMiddleware } = require("http-proxy-middleware")
const path = require("path")

const proxy = express()
const PORT = process.env.PORT || 3000
const HOST = "0.0.0.0"

const API_SERVICE_URL = PORT == 3000 ? `http://localhost:${PORT}/` :
	"http://api-service.net128.com/"

proxy.disable('x-powered-by')
express.static.mime.define({'application/json': ['info']});
proxy.use(express.static("static"))
proxy.use(express.static("file-content"))

proxy.on('proxyRes', function onProxyRes(proxyRes, req, res) {
	proxyRes.headers['x-added'] = 'foobar'
	delete proxyRes.headers['X-Powered-By', 'X-Test']
})

const preAuthenticator = async (req, res, next) => {
	const result = await new Promise((resolve, reject) => {
	//   setTimeout(() => {
	// 	resolve({ data: 
	// 		JSON.parse(fs.readFileSync(
	// 			"content/permissions.json").toString()).permissions })
	//   }, 2000)  
		resolve({ data: 
			JSON.parse(fs.readFileSync(
				"content/permissions.json").toString()).permissions })
	})
	req.locals = {
	  da: result.data,
	}
	next()
}  

const proxyOptions = {
	target: API_SERVICE_URL,
	changeOrigin: true,
	selfHandleResponse: true,
	pathRewrite: { ["/proxytest"]: "" },
	onProxyReq: (proxyReq, req, res) => {
		const permissions = req.locals.da
		console.log(`Successfully set permissions: ${permissions}`)
		proxyReq.setHeader('X-Permission', permissions)
	},
	onProxyRes: async (proxyRes, req, res) => {
		// const da = await new Promise((resolve, reject) => {
		//   setTimeout(() => {
		// 	resolve({ wei: 'wei' });
		//   }, 200);
		// });
		res.setHeader('X-Permission', req.locals.da);
		proxyRes.pipe(res);
	},
	
}

proxy.use("/proxytest", preAuthenticator, createProxyMiddleware(proxyOptions))

proxy.listen(PORT, HOST, () => {
	console.log(`Proxy is listening on ${HOST}:${PORT}`)
})
