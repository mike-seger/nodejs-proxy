const express = require("express")
const morgan = require("morgan");
const fs = require("fs");
const { createProxyMiddleware } = require("http-proxy-middleware");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = "0.0.0.0";

const APIT_SERVICE_URL = PORT==3000? "http://localhost:8000/":
    "http://api-service.net128.com/"

app.use(express.static(path.join(path.resolve(), "static")));

app.use("", (req,res,next) => {
    res.append("X-Test", "test");
    next();
});

app.use("/proxytest",createProxyMiddleware({
    target: APIT_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
        ["/proxytest"]: "",
    }
}));

app.listen(PORT, HOST, () => {
    console.log(`Proxy is listening on ${HOST}:${PORT}`);
})
