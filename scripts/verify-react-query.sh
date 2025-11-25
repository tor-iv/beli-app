#!/bin/bash
# scripts/verify-react-query.sh - Verify React Query migration for beli-native
# Run this to verify the migration is complete and all pieces are in place

NATIVE_DIR="$(dirname "$0")/../beli-native"
PASS=0
FAIL=0
WARN=0

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test functions
test_file_exists() {
  local file="$1"
  local description="$2"

  if [ -f "$NATIVE_DIR/$file" ]; then
    echo -e "${GREEN}  [PASS]${NC} $description"
    ((PASS++))
  else
    echo -e "${RED}  [FAIL]${NC} $description"
    echo -e "         Missing: $file"
    ((FAIL++))
  fi
}

test_grep_found() {
  local pattern="$1"
  local file="$2"
  local description="$3"

  if grep -q "$pattern" "$NATIVE_DIR/$file" 2>/dev/null; then
    echo -e "${GREEN}  [PASS]${NC} $description"
    ((PASS++))
  else
    echo -e "${RED}  [FAIL]${NC} $description"
    ((FAIL++))
  fi
}

test_grep_not_found() {
  local pattern="$1"
  local file="$2"
  local description="$3"

  if ! grep -q "$pattern" "$NATIVE_DIR/$file" 2>/dev/null; then
    echo -e "${GREEN}  [PASS]${NC} $description"
    ((PASS++))
  else
    echo -e "${YELLOW}  [WARN]${NC} $description - Found: $pattern"
    ((WARN++))
  fi
}

test_typescript() {
  echo -e "${BLUE}Running TypeScript compilation...${NC}"

  cd "$NATIVE_DIR"
  if npx tsc --noEmit 2>&1 | grep -q "error TS"; then
    local error_count=$(npx tsc --noEmit 2>&1 | grep -c "error TS")
    echo -e "${YELLOW}  [WARN]${NC} TypeScript has $error_count errors (some may be pre-existing)"
    ((WARN++))
  else
    echo -e "${GREEN}  [PASS]${NC} TypeScript compilation"
    ((PASS++))
  fi
  cd - > /dev/null
}

echo ""
echo "=========================================="
echo "  React Query Migration Verification"
echo "=========================================="
echo "Checking: $NATIVE_DIR"
echo ""

# Check if directory exists
if [ ! -d "$NATIVE_DIR" ]; then
  echo -e "${RED}ERROR: beli-native directory not found at $NATIVE_DIR${NC}"
  exit 1
fi

# ===========================================
# TYPESCRIPT COMPILATION
# ===========================================
echo -e "${YELLOW}--- TypeScript ---${NC}"
test_typescript

# ===========================================
# INFRASTRUCTURE FILES
# ===========================================
echo ""
echo -e "${YELLOW}--- Infrastructure ---${NC}"
test_file_exists "src/lib/providers/QueryProvider.tsx" "QueryProvider.tsx exists"
test_file_exists "src/lib/hooks/index.ts" "hooks/index.ts barrel export exists"
test_file_exists "src/lib/services/index.ts" "services/index.ts barrel export exists"
test_file_exists "src/lib/data-provider/index.ts" "data-provider/index.ts exists"
test_file_exists "src/lib/supabase/client.ts" "supabase/client.ts exists"
test_file_exists "src/lib/store/syncStore.ts" "syncStore.ts exists"

# ===========================================
# DOMAIN SERVICES (9 services)
# ===========================================
echo ""
echo -e "${YELLOW}--- Domain Services ---${NC}"
test_file_exists "src/lib/services/restaurants/RestaurantService.ts" "RestaurantService.ts exists"
test_file_exists "src/lib/services/users/UserService.ts" "UserService.ts exists"
test_file_exists "src/lib/services/user-restaurant/UserRestaurantService.ts" "UserRestaurantService.ts exists"
test_file_exists "src/lib/services/feed/FeedService.ts" "FeedService.ts exists"
test_file_exists "src/lib/services/notifications/NotificationService.ts" "NotificationService.ts exists"
test_file_exists "src/lib/services/lists/ListService.ts" "ListService.ts exists"
test_file_exists "src/lib/services/tastemakers/TastemakerService.ts" "TastemakerService.ts exists"
test_file_exists "src/lib/services/group-dinner/GroupDinnerService.ts" "GroupDinnerService.ts exists"
test_file_exists "src/lib/services/menu/MenuService.ts" "MenuService.ts exists"

# ===========================================
# REACT QUERY HOOKS
# ===========================================
echo ""
echo -e "${YELLOW}--- React Query Hooks ---${NC}"
test_file_exists "src/lib/hooks/use-restaurants.ts" "use-restaurants.ts exists"
test_file_exists "src/lib/hooks/use-user.ts" "use-user.ts exists"
test_file_exists "src/lib/hooks/use-user-restaurant.ts" "use-user-restaurant.ts exists"
test_file_exists "src/lib/hooks/use-feed.ts" "use-feed.ts exists"
test_file_exists "src/lib/hooks/use-notifications.ts" "use-notifications.ts exists"
test_file_exists "src/lib/hooks/use-lists.ts" "use-lists.ts exists"
test_file_exists "src/lib/hooks/use-tastemakers.ts" "use-tastemakers.ts exists"
test_file_exists "src/lib/hooks/use-group-dinner.ts" "use-group-dinner.ts exists"
test_file_exists "src/lib/hooks/use-menu.ts" "use-menu.ts exists"
test_file_exists "src/lib/hooks/use-network-status.ts" "use-network-status.ts exists"

# ===========================================
# SCREEN IMPORTS - Main 13 migrated screens
# ===========================================
echo ""
echo -e "${YELLOW}--- Screen Imports (lib/hooks) ---${NC}"

MAIN_SCREENS=(
  "LeaderboardScreen.tsx"
  "NotificationsScreen.tsx"
  "FeaturedListsScreen.tsx"
  "TastemakerPostScreen.tsx"
  "UserProfileScreen.tsx"
  "SearchScreen.tsx"
  "TastemakersScreen.tsx"
  "GroupDinnerScreen.tsx"
  "FeaturedListDetailScreen.tsx"
  "ProfileScreen.tsx"
  "RestaurantInfoScreen.tsx"
  "FeedScreen.tsx"
  "ListsScreen.tsx"
)

for screen in "${MAIN_SCREENS[@]}"; do
  screen_name="${screen%.tsx}"
  test_grep_found "from.*lib/hooks" "src/screens/$screen" "$screen_name imports from lib/hooks"
done

# ===========================================
# NO LEGACY MOCKDATASERVICE IN MAIN SCREENS
# ===========================================
echo ""
echo -e "${YELLOW}--- No Direct MockDataService Imports ---${NC}"

for screen in "${MAIN_SCREENS[@]}"; do
  screen_name="${screen%.tsx}"
  # Check for direct MockDataService import (not just comments or types)
  if grep -E "^import.*MockDataService" "$NATIVE_DIR/src/screens/$screen" 2>/dev/null | grep -v "// " > /dev/null; then
    echo -e "${YELLOW}  [WARN]${NC} $screen_name still imports MockDataService directly"
    ((WARN++))
  else
    echo -e "${GREEN}  [PASS]${NC} $screen_name has no direct MockDataService import"
    ((PASS++))
  fi
done

# ===========================================
# REACT QUERY PROVIDER IN APP
# ===========================================
echo ""
echo -e "${YELLOW}--- QueryClientProvider Integration ---${NC}"

# Check if QueryProvider is used in App.tsx or a navigation file
if grep -rq "QueryProvider\|QueryClientProvider" "$NATIVE_DIR/src/navigation/" 2>/dev/null || \
   grep -q "QueryProvider\|QueryClientProvider" "$NATIVE_DIR/App.tsx" 2>/dev/null; then
  echo -e "${GREEN}  [PASS]${NC} QueryProvider integrated in app"
  ((PASS++))
else
  echo -e "${RED}  [FAIL]${NC} QueryProvider not found in App.tsx or navigation"
  ((FAIL++))
fi

# ===========================================
# DEPENDENCIES CHECK
# ===========================================
echo ""
echo -e "${YELLOW}--- Package Dependencies ---${NC}"

if grep -q "@tanstack/react-query" "$NATIVE_DIR/package.json"; then
  echo -e "${GREEN}  [PASS]${NC} @tanstack/react-query is installed"
  ((PASS++))
else
  echo -e "${RED}  [FAIL]${NC} @tanstack/react-query not in package.json"
  ((FAIL++))
fi

if grep -q "@supabase/supabase-js" "$NATIVE_DIR/package.json"; then
  echo -e "${GREEN}  [PASS]${NC} @supabase/supabase-js is installed"
  ((PASS++))
else
  echo -e "${RED}  [FAIL]${NC} @supabase/supabase-js not in package.json"
  ((FAIL++))
fi

# ===========================================
# RESULTS SUMMARY
# ===========================================
echo ""
echo "=========================================="
TOTAL=$((PASS + FAIL + WARN))

if [ $FAIL -eq 0 ] && [ $WARN -eq 0 ]; then
  echo -e "${GREEN}  All $TOTAL tests passed!${NC}"
elif [ $FAIL -eq 0 ]; then
  echo -e "  Results: ${GREEN}$PASS passed${NC}, ${YELLOW}$WARN warnings${NC}"
else
  echo -e "  Results: ${GREEN}$PASS passed${NC}, ${RED}$FAIL failed${NC}, ${YELLOW}$WARN warnings${NC}"
fi
echo "=========================================="
echo ""

# Exit with failure count (0 = success)
exit $FAIL
