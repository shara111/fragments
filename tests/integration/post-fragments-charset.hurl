# POST with charset
POST http://localhost:8080/v1/fragments
Content-Type: text/plain; charset=utf-8
[BasicAuth]
user1@email.com:password1

`This is a fragment with charset`

HTTP/1.1 201

[Captures]
location: header "Location"

[Asserts]
jsonpath "$.status" == "ok"

# GET the fragment
GET {{location}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
[Asserts]
header "Content-Type" matches "text/plain(; charset=utf-8)?"
body matches "This is a fragment with charset"