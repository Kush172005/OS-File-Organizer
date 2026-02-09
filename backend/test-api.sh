set -e
if [ -f .env ]; then set -a; . ./.env; set +a; fi
BASE_URL="${API_URL:-${BASE_URL:-https://os-file-organizer-api.vercel.app}}"

fail() { echo "FAIL: $1"; exit 1; }
ok()   { echo "OK: $1"; }

echo "Testing File Organizer API at $BASE_URL"

# 1. GET /api/categories -> 200
code=$(curl -s -o /tmp/cat.json -w "%{http_code}" "$BASE_URL/api/categories")
[ "$code" = "200" ] || fail "GET /api/categories returned $code"
grep -q '"categories"' /tmp/cat.json || fail "GET /api/categories: response must contain categories"
ok "GET /api/categories returns 200 with categories"

# 2. GET /api/files -> 200
code=$(curl -s -o /tmp/files.json -w "%{http_code}" "$BASE_URL/api/files")
[ "$code" = "200" ] || fail "GET /api/files returned $code"
grep -q '"files"' /tmp/files.json || fail "GET /api/files: response must contain files"
grep -q '"categories"' /tmp/files.json || fail "GET /api/files: response must contain categories"
ok "GET /api/files returns 200 with files and categories"

# 3. POST /api/organize -> 200
code=$(curl -s -o /tmp/org.json -w "%{http_code}" -X POST "$BASE_URL/api/organize" -H "Content-Type: application/json")
[ "$code" = "200" ] || fail "POST /api/organize returned $code"
grep -q '"success":true' /tmp/org.json || fail "POST /api/organize: response must have success true"
grep -q '"operations"' /tmp/org.json || fail "POST /api/organize: response must have operations"
ok "POST /api/organize returns 200 with success and operations"

# 4. POST /api/move (non-existent file) -> 404
code=$(curl -s -o /tmp/move.json -w "%{http_code}" -X POST "$BASE_URL/api/move" \
  -H "Content-Type: application/json" \
  -d '{"fileName":"__nonexistent_file_12345__.txt","targetCategory":"Documents"}')
[ "$code" = "404" ] || fail "POST /api/move (missing file) should return 404, got $code"
ok "POST /api/move returns 404 for non-existent file"

# 5. DELETE /api/files/:fileName (non-existent) -> 404
code=$(curl -s -o /tmp/del.json -w "%{http_code}" -X DELETE "$BASE_URL/api/files/__nonexistent_file_12345__.txt")
[ "$code" = "404" ] || fail "DELETE /api/files/:fileName (missing file) should return 404, got $code"
ok "DELETE /api/files/:fileName returns 404 for non-existent file"

echo ""
echo "All API tests passed."
