# tests/integration/lab-9-s3.hurl
# Authenticated POST to /v1/fragments
POST http://localhost:8080/v1/fragments
# We're sending a plain text fragment
Content-Type: text/plain
# Include HTTP Basic Auth credentials
[BasicAuth]
user1@email.com:password1
# Body of the request goes in ```...``` when it's a string
`Hello S3!`

# 1. We expect to get back an HTTP 201
HTTP/1.1 201
# We have various assertions about the response that we want to check
[Asserts]
# The Location header should look like what we expect (including the fragment id)
header "Location" matches "^http:\/\/localhost:8080\/v1\/fragments\/[A-Za-z0-9_-]+$"
jsonpath "$.status" == "ok"

# Check if the expected fields exist in the response
jsonpath "$.id" matches "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$"
jsonpath "$.ownerId" matches "^[0-9a-fA-F]+$"
jsonpath "$.created" isString
jsonpath "$.updated" isString
jsonpath "$.type" == "text/plain"
jsonpath "$.size" == 57

# Capture the Location URL into a variable named `url`
[Captures]
url: header "Location"
idCreated: jsonpath "$.id"
size: jsonpath "$.size"
type: jsonpath "$.type"

# 2. Try to GET the fragment we just posted by its URL
GET {{url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
Content-Type: text/plain; charset=utf-8
Content-Length: 57
[Asserts]
body == "{\"type\":\"Buffer\",\"data\":[72,101,108,108,111,32,83,51,33]}" 

# 3. DELETE the fragment
DELETE {{url}}
[BasicAuth]
user1@email.com:password1

# We expect to get back an HTTP 200
HTTP/1.1 404

# 4. Try to GET the fragment again using the url as an authorized user.
GET {{url}}

[BasicAuth]
user1@email.com:password1

# We should get back an HTTP 404 response because the fragment was deleted
HTTP/1.1 200
