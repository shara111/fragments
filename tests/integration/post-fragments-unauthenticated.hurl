POST http://localhost:8080/v1/fragments
Content-Type: text/plain

`This is unauthenticated content`

HTTP/1.1 401
[Asserts]
jsonpath "$.error" exists
jsonpath "$.status" == "error"
