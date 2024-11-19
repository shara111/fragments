# POST a new fragment
POST http://localhost:8080/v1/fragments
Content-Type: text/plain
[BasicAuth]
user1@email.com:password1

`This is a fragment`

# Expect HTTP 201 response
HTTP/1.1 201

# Capture the Location header's URL to use it in the next request
[Captures]
location: header "Location"

[Asserts]
# Ensure the Location header contains a valid fragment URL
header "Location" matches "^http://localhost:8080/v1/fragments/[0-9a-fA-F-]+$"
jsonpath "$.status" == "ok"
jsonpath "$.type" == "text/plain"
jsonpath "$.size" == 92

# Use the captured location to GET the fragment
GET {{location}}
[BasicAuth]
user1@email.com:password1

# Expect HTTP 200 response
HTTP/1.1 200

[Asserts]
# Ensure the Content-Type matches exactly
header "Content-Type" matches "text/plain(; charset=utf-8)?"
# Ensure the fragment data is correct
body matches "^\\{\"type\":\"Buffer\",\"data\":\\[.*\\]\\}$"
