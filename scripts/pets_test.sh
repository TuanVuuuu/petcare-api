#!/bin/bash
set -e

API_URL="http://localhost:8989"
EMAIL="test@petcare.com"
PASSWORD="123456"

echo "🔐 Step 1: Login to get customToken"
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

CUSTOM_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.customToken.customToken')
if [ "$CUSTOM_TOKEN" == "null" ] || [ -z "$CUSTOM_TOKEN" ]; then
  echo "❌ ERROR: Không lấy được customToken. Check lại /auth/login"
  echo "Full response: $LOGIN_RESPONSE"
  exit 1
fi
echo "✅ Custom Token: ${CUSTOM_TOKEN:0:40}..."

echo ""
echo "🔄 Step 2: Exchange customToken -> idToken"
EXCHANGE_RESPONSE=$(curl -s -X POST "$API_URL/auth/exchange" \
  -H "Content-Type: application/json" \
  -d "{\"customToken\":\"$CUSTOM_TOKEN\"}")

ID_TOKEN=$(echo "$EXCHANGE_RESPONSE" | jq -r '.data.idToken')
if [ "$ID_TOKEN" == "null" ] || [ -z "$ID_TOKEN" ]; then
  echo "❌ ERROR: Không lấy được idToken. Check lại /auth/exchange"
  echo "Full response: $EXCHANGE_RESPONSE"
  exit 1
fi
echo "✅ ID Token: ${ID_TOKEN:0:40}..."

echo ""
echo "🐶 Step 3: Create new pet"
CREATE_RESPONSE=$(curl -s -X POST "$API_URL/pets" \
  -H "Authorization: Bearer $ID_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Milo","type":"dog","age":2}')

PET_ID=$(echo "$CREATE_RESPONSE" | jq -r '.id')
if [ "$PET_ID" == "null" ] || [ -z "$PET_ID" ]; then
  echo "❌ ERROR: Không tạo được pet."
  echo "Full response: $CREATE_RESPONSE"
  exit 1
fi
echo "✅ Pet created: $PET_ID"

echo ""
echo "📋 Step 4: Get pets list"
LIST_RESPONSE=$(curl -s -X GET "$API_URL/pets" \
  -H "Authorization: Bearer $ID_TOKEN")

echo "Pets List: $LIST_RESPONSE"
if ! echo "$LIST_RESPONSE" | jq -e ".[] | select(.id==\"$PET_ID\")" > /dev/null; then
  echo "❌ ERROR: Pet vừa tạo ($PET_ID) không có trong list"
  exit 1
fi
echo "✅ Pet có trong list"

echo ""
echo "🗑 Step 5: Delete pet"
DELETE_RESPONSE=$(curl -s -X DELETE "$API_URL/pets/$PET_ID" \
  -H "Authorization: Bearer $ID_TOKEN")

if ! echo "$DELETE_RESPONSE" | grep -q "Pet deleted"; then
  echo "❌ ERROR: Xóa pet thất bại"
  echo "Full response: $DELETE_RESPONSE"
  exit 1
fi
echo "✅ Pet deleted thành công"

echo ""
echo "🚪 Step 6: Logout user"
LOGOUT_RESPONSE=$(curl -s -X POST "$API_URL/auth/logout" \
  -H "Authorization: Bearer $ID_TOKEN")
echo "Logout Response: $LOGOUT_RESPONSE"

echo ""
echo "❌ Step 7: Test lại /pets sau khi logout (nên fail)"
AFTER_LOGOUT=$(curl -s -i -s -X GET "$API_URL/pets" \
  -H "Authorization: Bearer $ID_TOKEN")

echo "After Logout Response: $AFTER_LOGOUT"

HTTP_CODE=$(echo "$AFTER_LOGOUT" | grep "HTTP/" | awk '{print $2}')

if [ "$HTTP_CODE" == "401" ]; then
  echo "✅ Logout hoạt động: Token bị revoke, /pets không truy cập được."
else
  echo "❌ LỖI: Sau logout vẫn gọi được /pets, verifyToken chưa chặn."
fi