const express = require("express")
const fs = require("fs")
const { createProxyMiddleware } = require("http-proxy-middleware")

const proxy = express()
const PORT = process.env.PORT || 3000
const HOST = "0.0.0.0"

const API_SERVICE_URL = PORT == 3000 ? `http://localhost:${PORT}/` :
	"http://api-service.net128.com/"

proxy.disable('x-powered-by')
express.static.mime.define({'application/json': ['info']});
proxy.use(express.static("static"))
proxy.use(express.static("file-content"))

const preAuthenticator = async (req, res, next) => {
	const result = await new Promise((resolve, reject) => {
		const data = null
		const file="content/permissions.json"
		try { JSON.parse(fs.readFileSync(file).toString()).permissions }
		catch(error) { console.log(error) }
		if(data!=null) resolve( { data: data })
		else reject(`Error occurred reding ${file}`)
	}).catch((error) => { 
		console.log(error);
	});
	req.locals = { data: result?result.data:null }
	next()
}  

const proxyOptions = {
	target: API_SERVICE_URL,
	changeOrigin: true,
	selfHandleResponse: true,
	pathRewrite: { ["/proxytest"]: "" },
	onProxyReq: (proxyReq, req, res) => {
		const permissions = req.locals.data
		if(!permissions) {
			res.status(500).send()
			return
		}
		console.log(`Successfully set permissions: ${permissions}`)
		proxyReq.setHeader('X-Permission', permissions)
	},
	onProxyRes: async (proxyRes, req, res) => {
		res.setHeader('X-Permission', req.locals.data)
		proxyRes.pipe(res)
	}
}

proxy.get('/request-info', (req, res) => {
    res.send({
		"url": req.url,
		"body": req.body,
		"headers": req.headers,
		"parameters": req.parameters
	});
});

proxy.use("/proxytest", preAuthenticator, createProxyMiddleware(proxyOptions))

proxy.listen(PORT, HOST, () => {
	console.log(`Proxy is listening on ${HOST}:${PORT}`)
})
