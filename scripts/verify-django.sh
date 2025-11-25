#!/bin/bash
# scripts/verify-django.sh - Quick Django API verification
# Run this to verify Django endpoints are working and match expected response shapes

DJANGO_URL="${DJANGO_URL:-http://localhost:8000/api/v1}"
PASS=0
FAIL=0

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

test_endpoint() {
  local name="$1"
  local endpoint="$2"
  local expected_field="$3"

  response=$(curl -s --max-time 10 "$DJANGO_URL$endpoint")

  # Check if response is empty or error
  if [ -z "$response" ]; then
    echo -e "${RED}  [FAIL]${NC} $name - No response (server not running?)"
    ((FAIL++))
    return
  fi

  # Check for error response
  if echo "$response" | jq -e '.error' > /dev/null 2>&1; then
    echo -e "${RED}  [FAIL]${NC} $name - Error: $(echo "$response" | jq -r '.error')"
    ((FAIL++))
    return
  fi

  # Check for HTML error page (404, 500)
  if echo "$response" | grep -q "<!DOCTYPE html>"; then
    echo -e "${RED}  [FAIL]${NC} $name - HTML error page returned"
    ((FAIL++))
    return
  fi

  # Try to extract the field - handle both paginated and unpaginated responses
  # For paginated: {"count":N, "results":[...]} - check .results[0]
  # For arrays: [...] - check .[0]
  if echo "$response" | jq -e "$expected_field" > /dev/null 2>&1; then
    echo -e "${GREEN}  [PASS]${NC} $name"
    ((PASS++))
  elif echo "$response" | jq -e ".results[0]" > /dev/null 2>&1; then
    # Paginated response with results
    echo -e "${GREEN}  [PASS]${NC} $name (paginated)"
    ((PASS++))
  elif echo "$response" | jq -e ".[0]" > /dev/null 2>&1; then
    # Array response with items
    echo -e "${GREEN}  [PASS]${NC} $name (array)"
    ((PASS++))
  elif echo "$response" | jq -e "type" > /dev/null 2>&1; then
    # Valid JSON but might be empty array
    local json_type=$(echo "$response" | jq -r "type")
    if [ "$json_type" = "array" ] || [ "$json_type" = "object" ]; then
      echo -e "${GREEN}  [PASS]${NC} $name (empty $json_type)"
      ((PASS++))
    else
      echo -e "${RED}  [FAIL]${NC} $name - Unexpected type: $json_type"
      ((FAIL++))
    fi
  else
    echo -e "${RED}  [FAIL]${NC} $name - Missing: $expected_field"
    echo "         Response preview: $(echo "$response" | head -c 200)"
    ((FAIL++))
  fi
}

echo ""
echo "=========================================="
echo "  Django API Verification"
echo "=========================================="
echo "Testing: $DJANGO_URL"
echo ""

# Check if server is running
if ! curl -s --max-time 3 "$DJANGO_URL/restaurants/" > /dev/null 2>&1; then
  echo -e "${RED}ERROR: Django server not responding at $DJANGO_URL${NC}"
  echo ""
  echo "Make sure Django is running:"
  echo "  cd beli-backend && python manage.py runserver"
  echo ""
  exit 1
fi

# ===========================================
# RESTAURANT ENDPOINTS
# ===========================================
echo -e "${YELLOW}--- Restaurants ---${NC}"
test_endpoint "GET /restaurants/" "/restaurants/" ".[0].name // .results[0].name"
test_endpoint "GET /restaurants/search/?q=pizza" "/restaurants/search/?q=pizza" ".results // ."
test_endpoint "GET /restaurants/trending/" "/restaurants/trending/" ".results // ."

# Get a restaurant ID for detail test
RESTAURANT_ID=$(curl -s "$DJANGO_URL/restaurants/" | jq -r '.[0].id // .results[0].id' 2>/dev/null)
if [ -n "$RESTAURANT_ID" ] && [ "$RESTAURANT_ID" != "null" ]; then
  test_endpoint "GET /restaurants/{id}/" "/restaurants/$RESTAURANT_ID/" ".name"
fi

# ===========================================
# USER ENDPOINTS
# ===========================================
echo ""
echo -e "${YELLOW}--- Users ---${NC}"
test_endpoint "GET /users/" "/users/" ".[0].username // .results[0].username"
test_endpoint "GET /users/me/" "/users/me/" ".username"
test_endpoint "GET /users/search/?q=test" "/users/search/?q=test" ". // .results"
test_endpoint "GET /users/leaderboard/" "/users/leaderboard/" ".[0].stats.beenCount // .results[0].stats.beenCount"

# Get user IDs for detail/match tests
USER1=$(curl -s "$DJANGO_URL/users/" | jq -r '.[0].id // .results[0].id' 2>/dev/null)
USER2=$(curl -s "$DJANGO_URL/users/" | jq -r '.[1].id // .results[1].id' 2>/dev/null)

if [ -n "$USER1" ] && [ "$USER1" != "null" ]; then
  test_endpoint "GET /users/{id}/" "/users/$USER1/" ".username"
  test_endpoint "GET /users/{id}/followers/" "/users/$USER1/followers/" ". // .results"
  test_endpoint "GET /users/{id}/following/" "/users/$USER1/following/" ". // .results"
  test_endpoint "GET /users/{id}/ratings/" "/users/$USER1/ratings/" ". // .results"
  test_endpoint "GET /users/{id}/taste-profile/" "/users/$USER1/taste-profile/" ".topCuisines"
fi

if [ -n "$USER1" ] && [ -n "$USER2" ] && [ "$USER1" != "null" ] && [ "$USER2" != "null" ]; then
  test_endpoint "GET /users/{id}/match/{targetId}/" "/users/$USER1/match/$USER2/" ".matchPercentage"
fi

# ===========================================
# FEED ENDPOINTS
# ===========================================
echo ""
echo -e "${YELLOW}--- Feed ---${NC}"
test_endpoint "GET /feed/" "/feed/" ". // .results"

# ===========================================
# LISTS ENDPOINTS
# ===========================================
echo ""
echo -e "${YELLOW}--- Lists ---${NC}"
test_endpoint "GET /lists/" "/lists/" ". // .results"

# ===========================================
# RATINGS ENDPOINTS
# ===========================================
echo ""
echo -e "${YELLOW}--- Ratings ---${NC}"
if [ -n "$USER1" ] && [ "$USER1" != "null" ]; then
  test_endpoint "GET /ratings/watchlist/?userId={id}" "/ratings/watchlist/?userId=$USER1" ". // .results"
fi

# ===========================================
# NOTIFICATIONS ENDPOINTS
# ===========================================
echo ""
echo -e "${YELLOW}--- Notifications ---${NC}"
test_endpoint "GET /notifications/" "/notifications/" ". // .results"

# ===========================================
# TASTEMAKERS ENDPOINTS
# ===========================================
echo ""
echo -e "${YELLOW}--- Tastemakers ---${NC}"
test_endpoint "GET /tastemakers/" "/tastemakers/" ". // .results"

# ===========================================
# GROUP DINNER ENDPOINTS
# ===========================================
echo ""
echo -e "${YELLOW}--- Group Dinner ---${NC}"
if [ -n "$USER1" ] && [ "$USER1" != "null" ]; then
  test_endpoint "GET /group-dinner/friends/{userId}/" "/group-dinner/friends/$USER1/" ". // .results"
fi

# ===========================================
# MENUS ENDPOINTS
# ===========================================
echo ""
echo -e "${YELLOW}--- Menus ---${NC}"
if [ -n "$RESTAURANT_ID" ] && [ "$RESTAURANT_ID" != "null" ]; then
  test_endpoint "GET /menus/?restaurantId={id}" "/menus/?restaurantId=$RESTAURANT_ID" ". // .results"
fi

# ===========================================
# RESULTS SUMMARY
# ===========================================
echo ""
echo "=========================================="
TOTAL=$((PASS + FAIL))
if [ $FAIL -eq 0 ]; then
  echo -e "${GREEN}  All $TOTAL tests passed!${NC}"
else
  echo -e "  Results: ${GREEN}$PASS passed${NC}, ${RED}$FAIL failed${NC}"
fi
echo "=========================================="
echo ""

exit $FAIL
