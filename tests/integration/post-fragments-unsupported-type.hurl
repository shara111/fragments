POST http://localhost:8080/v1/fragments
Content-Type: application/unsupported
[BasicAuth]
user1@email.com:password1

`This is unsupported content`

HTTP/1.1 415
[Asserts]
jsonpath "$.error" exists
jsonpath "$.status" == "error"
