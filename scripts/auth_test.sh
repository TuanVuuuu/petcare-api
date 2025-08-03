#!/bin/bash
set -euo pipefail

BASE_URL="http://localhost:8989"
EMAIL="testuser@petcare.com"
PASSWORD="123456"
NAME="Test User"

echo "🧹 Step 0: Cleanup user nếu tồn tại"
DELETE_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "$BASE_URL/auth/delete" \
  -H "Content-Type: application/json" \
  -d '{"email":"'$EMAIL'"}')

if [ "$DELETE_RESPONSE" -eq 200 ]; then
  echo "✅ User cũ đã bị xóa"
else
  echo "ℹ️ Không có user cũ hoặc không cần xóa"
fi

echo ""
echo "🆕 Step 1: Signup user ($EMAIL)"
HTTP_CODE=$(curl -s -o signup_response.json -w "%{http_code}" -X POST "$BASE_URL/auth/signup" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\",
    \"name\": \"$NAME\"
  }")

HTTP_BODY=$(cat signup_response.json)

echo "📥 Signup HTTP Code: $HTTP_CODE"
echo "📦 Signup Body: $HTTP_BODY"

# ✅ Kiểm tra JSON có hợp lệ không
if ! jq empty signup_response.json 2>/dev/null; then
  echo "❌ Lỗi: Signup trả về không phải JSON hợp lệ"
  cat signup_response.json
  exit 1
fi

# ❌ Nếu signup fail thì dừng script
if [ "$HTTP_CODE" -ne 200 ] && [ "$HTTP_CODE" -ne 201 ]; then
  echo "❌ Signup thất bại ($HTTP_CODE): $HTTP_BODY"
  exit 1
fi

CUSTOM_TOKEN=$(jq -r '.customToken' signup_response.json)
echo "✅ Custom Token: ${CUSTOM_TOKEN:0:30}..."

echo ""
echo "🔄 Step 2: Exchange customToken -> idToken"
EXCHANGE_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/exchange" \
  -H "Content-Type: application/json" \
  -d "{\"customToken\":\"$CUSTOM_TOKEN\"}")

ID_TOKEN=$(echo "$EXCHANGE_RESPONSE" | jq -r '.data.idToken')

if [ -z "$ID_TOKEN" ] || [ "$ID_TOKEN" == "null" ]; then
  echo "❌ Không lấy được ID Token"
  exit 1
fi
echo "✅ ID Token: ${ID_TOKEN:0:30}..."

echo ""
echo "📡 Step 3: Call /auth/me với ID Token"
ME_RESPONSE=$(curl -s -X GET "$BASE_URL/auth/me" \
  -H "Authorization: Bearer $ID_TOKEN")
echo "Me Response: $ME_RESPONSE"

echo ""
echo "🚪 Step 4: Logout user"
LOGOUT_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/logout" \
  -H "Authorization: Bearer $ID_TOKEN")
echo "Logout Response: $LOGOUT_RESPONSE"

echo ""
echo "❌ Step 5: Test lại /auth/me sau khi logout (nên fail)"
ME_AGAIN_RESPONSE=$(curl -s -i -X GET "$BASE_URL/auth/me" \
  -H "Authorization: Bearer $ID_TOKEN")
echo "Me After Logout Response:"
echo "$ME_AGAIN_RESPONSE"
