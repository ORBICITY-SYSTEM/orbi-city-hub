#!/bin/bash

# GitHub Push Script for Cloud Shell / Bash
# Usage: ./push-to-github.sh YOUR_GITHUB_TOKEN

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Check if token is provided
if [ -z "$1" ]; then
    echo -e "${RED}❌ Error: GitHub token required${NC}"
    echo -e "${YELLOW}Usage: ./push-to-github.sh YOUR_GITHUB_TOKEN${NC}"
    exit 1
fi

GITHUB_TOKEN="$1"
REPO="ORBICITY-SYSTEM/orbi-city-hub"
BRANCH="main"
API_BASE="https://api.github.com/repos/$REPO"

echo -e "${CYAN}🚀 Pushing to GitHub...${NC}"
echo -e "${YELLOW}Repository: $REPO${NC}"
echo -e "${YELLOW}Branch: $BRANCH${NC}"
echo ""

# Function to upload/update file via GitHub API
push_file() {
    local file_path="$1"
    local git_path="$2"
    local commit_msg="$3"
    
    if [ ! -f "$file_path" ]; then
        echo -e "${YELLOW}⚠️  File not found: $file_path${NC}"
        return 1
    fi
    
    # Encode file content to base64
    local base64_content=$(base64 -w 0 "$file_path" 2>/dev/null || base64 -b 0 "$file_path")
    
    # Check if file exists in repo
    local file_url="$API_BASE/contents/$git_path"
    local sha=$(curl -s -H "Authorization: token $GITHUB_TOKEN" \
        -H "Accept: application/vnd.github.v3+json" \
        "$file_url?ref=$BRANCH" | jq -r '.sha // empty')
    
    # Prepare JSON body
    local json_body
    if [ -z "$sha" ] || [ "$sha" == "null" ]; then
        # Create new file
        json_body=$(jq -n \
            --arg msg "$commit_msg" \
            --arg content "$base64_content" \
            --arg branch "$BRANCH" \
            '{message: $msg, content: $content, branch: $branch}')
        echo -e "${CYAN}📝 Creating: $git_path${NC}"
    else
        # Update existing file
        json_body=$(jq -n \
            --arg msg "$commit_msg" \
            --arg content "$base64_content" \
            --arg branch "$BRANCH" \
            --arg sha "$sha" \
            '{message: $msg, content: $content, branch: $branch, sha: $sha}')
        echo -e "${CYAN}✏️  Updating: $git_path${NC}"
    fi
    
    # Upload file
    local response=$(curl -s -w "\n%{http_code}" -X PUT \
        -H "Authorization: token $GITHUB_TOKEN" \
        -H "Accept: application/vnd.github.v3+json" \
        -H "Content-Type: application/json" \
        -d "$json_body" \
        "$file_url")
    
    local http_code=$(echo "$response" | tail -n1)
    local body=$(echo "$response" | head -n-1)
    
    if [ "$http_code" == "200" ] || [ "$http_code" == "201" ]; then
        echo -e "${GREEN}✅ Success: $git_path${NC}"
        return 0
    else
        echo -e "${RED}❌ Error ($http_code): $git_path${NC}"
        echo "$body" | jq -r '.message // .' 2>/dev/null || echo "$body"
        return 1
    fi
}

# Check if jq is installed (needed for JSON parsing)
if ! command -v jq &> /dev/null; then
    echo -e "${YELLOW}📦 Installing jq (required for JSON parsing)...${NC}"
    sudo apt-get update -qq && sudo apt-get install -y -qq jq
fi

# Get base directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

echo -e "${CYAN}📦 Preparing files...${NC}"
echo ""

# Array of files to push (relative to script directory)
declare -a files=(
    "client/src/components/AIDirectorsShowcase.tsx:client/src/components/AIDirectorsShowcase.tsx"
    "client/src/pages/reservations/AIReservationsDirector.tsx:client/src/pages/reservations/AIReservationsDirector.tsx"
    "client/src/pages/finance/AIFinanceDirector.tsx:client/src/pages/finance/AIFinanceDirector.tsx"
    "client/src/pages/logistics/AILogisticsDirector.tsx:client/src/pages/logistics/AILogisticsDirector.tsx"
    "server/routers/reservationsRouter.ts:server/routers/reservationsRouter.ts"
    "server/routers/financeRouter.ts:server/routers/financeRouter.ts"
    "server/routers/logisticsRouter.ts:server/routers/logisticsRouter.ts"
    "drizzle/0004_reservations_tasks.sql:drizzle/0004_reservations_tasks.sql"
    "drizzle/0005_finance_tasks.sql:drizzle/0005_finance_tasks.sql"
    "drizzle/0006_logistics_tasks.sql:drizzle/0006_logistics_tasks.sql"
    "client/src/pages/Home.tsx:client/src/pages/Home.tsx"
    "client/src/pages/Integrations.tsx:client/src/pages/Integrations.tsx"
    "client/src/components/ModularLayout.tsx:client/src/components/ModularLayout.tsx"
    "client/src/App.tsx:client/src/App.tsx"
    "client/src/lib/translations/ka.ts:client/src/lib/translations/ka.ts"
    "client/src/lib/translations/en.ts:client/src/lib/translations/en.ts"
    "server/routers.ts:server/routers.ts"
    "drizzle/schema.ts:drizzle/schema.ts"
)

COMMIT_MSG="✨ Add 5D AI Directors Showcase with stunning effects

- Created interactive 5D AI Directors Panel with 3D transforms
- CEO AI personalized prototype (182cm, elegant, professional)
- Marketing, Reservations, Finance, Logistics AI Directors
- Scrolling task marquee with real-time data
- Particle effects, glow animations, professional gestures
- Enhanced Integrations page with Development Tools
- Complete bilingual support (English/Georgian)"

success_count=0
fail_count=0

# Push each file
for file_entry in "${files[@]}"; do
    IFS=':' read -r local_path git_path <<< "$file_entry"
    
    if push_file "$local_path" "$git_path" "$COMMIT_MSG"; then
        ((success_count++))
    else
        ((fail_count++))
    fi
    
    # Rate limiting: wait 200ms between requests
    sleep 0.2
done

echo ""
echo -e "${CYAN}📊 Summary:${NC}"
echo -e "${GREEN}✅ Successfully pushed: $success_count files${NC}"
if [ $fail_count -gt 0 ]; then
    echo -e "${RED}❌ Failed: $fail_count files${NC}"
else
    echo -e "${GREEN}❌ Failed: $fail_count files${NC}"
fi

if [ $success_count -gt 0 ]; then
    echo ""
    echo -e "${GREEN}🎉 Push completed!${NC}"
    echo -e "${CYAN}📍 Repository: https://github.com/$REPO${NC}"
    echo -e "${CYAN}🌐 View changes: https://github.com/$REPO/commits/$BRANCH${NC}"
fi
