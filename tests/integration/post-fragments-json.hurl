# POST a JSON fragment
POST http://localhost:8080/v1/fragments
Content-Type: application/json
[BasicAuth]
user1@email.com:password1

`{"key": "value"}`

HTTP/1.1 201

[Captures]
location: header "Location"

[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.type" == "application/json"

# GET the fragment
GET {{location}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200

[Asserts]
header "Content-Type" == "application/json; charset=utf-8"
body matches "^\\{\"key\":\"value\"\\}$"
