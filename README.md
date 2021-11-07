```
$ curl -s localhost:3000/proxytest/request-info | jq . 
{
  "url": "/request-info",
  "headers": {
    "host": "localhost:3000",
    "user-agent": "curl/7.64.1",
    "accept": "*/*"
  }
}
```

$ curl -s localhost:3000/proxytest/request-info | jq . 
{
  "url": "/request-info",
  "headers": {
    "accept": "*/*",
    "user-agent": "curl/7.64.1",
    "host": "localhost:3000",
    "connection": "close",
    "x-permission": "['a', 'b', 'c', 'd']"
  }
}
```