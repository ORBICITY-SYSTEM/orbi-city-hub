#!/usr/bin/env python3
"""
GitHub API Push Script for Instagram Analytics Integration
"""
import os
import base64
import json
import requests
from pathlib import Path

# Configuration
REPO_OWNER = input("GitHub Username/Org: ").strip()
REPO_NAME = input("Repository Name: ").strip()
BRANCH = input("Branch name (default: main): ").strip() or "main"
GITHUB_TOKEN = input("GitHub Personal Access Token: ").strip()

API_BASE = f"https://api.github.com/repos/{REPO_OWNER}/{REPO_NAME}"
HEADERS = {
    "Authorization": f"token {GITHUB_TOKEN}",
    "Accept": "application/vnd.github.v3+json",
}

def get_file_sha(path: str) -> str | None:
    """Get file SHA from GitHub"""
    url = f"{API_BASE}/contents/{path}"
    response = requests.get(url, headers=HEADERS, params={"ref": BRANCH})
    if response.status_code == 200:
        return response.json().get("sha")
    return None

def upload_file(path: str, file_path: Path, commit_message: str):
    """Upload or update file via GitHub API"""
    relative_path = str(path).replace("\\", "/")
    
    # Read file content
    with open(file_path, "rb") as f:
        content = base64.b64encode(f.read()).decode("utf-8")
    
    # Get existing SHA if file exists
    sha = get_file_sha(relative_path)
    
    # Prepare data
    data = {
        "message": commit_message,
        "content": content,
        "branch": BRANCH,
    }
    if sha:
        data["sha"] = sha
    
    # Upload
    url = f"{API_BASE}/contents/{relative_path}"
    response = requests.put(url, headers=HEADERS, json=data)
    
    if response.status_code in [200, 201]:
        print(f"✅ {relative_path}")
        return True
    else:
        print(f"❌ {relative_path}: {response.status_code} - {response.text[:200]}")
        return False

# Files to upload (modified and new files)
files_to_upload = [
    ("drizzle/schema.ts", "Add Instagram database tables"),
    ("server/routers/instagramRouter.ts", "Add Instagram tRPC router"),
    ("server/routers.ts", "Add Instagram router to main router"),
    ("drizzle/0007_instagram_tables.sql", "Add Instagram tables migration"),
    ("client/src/components/instagram/types.ts", "Add Instagram types"),
    ("client/src/components/instagram/InstagramHeader.tsx", "Add Instagram header component"),
    ("client/src/components/instagram/MediaTypeFilter.tsx", "Add Instagram media type filter"),
    ("client/src/components/instagram/index.ts", "Add Instagram components index"),
    ("client/src/components/instagram/modules/HeroKPICard.tsx", "Add Instagram KPI card module"),
    ("client/src/components/instagram/modules/TimingModule.tsx", "Add Instagram timing module"),
    ("client/src/components/instagram/modules/ThemesModule.tsx", "Add Instagram themes module"),
    ("client/src/components/instagram/modules/CalendarModule.tsx", "Add Instagram calendar module"),
    ("client/src/components/instagram/modules/TopPostsModule.tsx", "Add Instagram top posts module"),
    ("client/src/components/instagram/modules/index.ts", "Add Instagram modules index"),
    ("client/src/pages/marketing/InstagramAnalytics.tsx", "Add Instagram Analytics page"),
    ("client/src/pages/ComingSoon.tsx", "Add ComingSoon component"),
    ("client/src/App.tsx", "Add Instagram and marketing routes"),
]

base_path = Path(__file__).parent

print(f"\n🚀 Pushing {len(files_to_upload)} files to {REPO_OWNER}/{REPO_NAME} (branch: {BRANCH})...\n")

success_count = 0
for file_path, commit_msg in files_to_upload:
    full_path = base_path / file_path
    if full_path.exists():
        if upload_file(file_path, full_path, commit_msg):
            success_count += 1
    else:
        print(f"⚠️  {file_path} - File not found, skipping")

print(f"\n✅ Successfully pushed {success_count}/{len(files_to_upload)} files!")
print(f"\n🔗 View commit: https://github.com/{REPO_OWNER}/{REPO_NAME}/commits/{BRANCH}")
