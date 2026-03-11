# Learnings Log

Track corrections, knowledge gaps, and best practices.

---

## [LRN-20260224-001] persistence

**Logged**: 2026-02-24T10:48:00Z
**Priority**: medium
**Status**: pending
**Area**: infra

### Summary
Download failures should be retried multiple times before giving up or suggesting alternatives.

### Details
Attempted to download v2ray from GitHub, initial attempts failed with timeout errors. After trying multiple times (3rd attempt succeeded), the 14.2MB file downloaded successfully in ~40 seconds.

### Suggested Action
When downloading files:
1. Always retry at least 3-5 times before concluding it's impossible
2. Network conditions vary; what fails now may succeed later
3. Only suggest alternative methods (mirrors, manual upload) after multiple retries
4. Use background download with long timeout (600s+) for large files

### Metadata
- Source: user_feedback
- Tags: download, persistence, network
- Pattern-Key: download.retry-multiple-times
- First-Seen: 2026-02-24
- Last-Seen: 2026-02-24

---

## [LRN-20260224-002] network_detection

**Logged**: 2026-02-24T11:35:00Z
**Priority**: medium
**Status**: pending
**Area**: infra

### Summary
When v2ray fails to connect with "TLS connection failed" or "i/o timeout", the issue is network-level blocking, not configuration error.

### Details
Attempted to connect v2ray to 3 Cloudflare VLESS nodes. All failed with:
- "dial TLS connection failed"  
- "dial tcp 104.24.127.83:443: i/o timeout"
- "operation was canceled"

Local SOCKS5 proxy (port 10808) works correctly.

### Suggested Action
1. Check if server IP is reachable directly from this machine
2. If direct connection fails but works elsewhere → IP is blocked/filtered
3. Use domain name instead of IP in v2ray config (may bypass IP-based blocking)
4. Document in project status: "blocked - network restriction"

### Metadata
- Source: error
- Tags: network, v2ray, tls, timeout
- Pattern-Key: network.tls-timeout-diagnosis
- First-Seen: 2026-02-24

---

## [LRN-20260224-003] github_upload_workflow

**Logged**: 2026-02-24T14:15:00Z
**Priority**: high
**Status**: pending
**Area**: workflow

### Summary
Standard workflow for uploading OpenClaw workspace to GitHub repository.

### Prerequisites
1. GitHub account: szmanlee
2. Repository: https://github.com/szmanlee (to be created or exists)
3. Git config configured:
   ```bash
   git config --global user.name "szmanlee"
   git config --global user.email "szmanlee@github.com"
   ```

### Workflow Steps

#### Step 1: Initialize Git Repository
```bash
cd /root/.openclaw/workspace
git init
```

#### Step 2: Add Remote Origin
```bash
git remote add origin https://github.com/szmanlee/jarvis-dashboard.git
# Or for the main workspace
git remote add origin https://github.com/szmanlee/openclaw-workspace.git
```

#### Step 3: Create Initial Commit
```bash
git add .
git commit -m "Initial commit: Jarvis AI Control Panel with v2ray proxy"
```

#### Step 4: Push to GitHub
```bash
# First push (set upstream)
git push -u origin master

# Subsequent pushes
git add .
git commit -m "描述改动"
git push
```

#### Step 5: Large File Upload (if > 100MB)
```bash
# Install git-lfs
git lfs install

# Track large files
git lfs track "*.tar.gz"
git lfs track "*.zip"

# Commit and push
git add .
git commit -m "Add large files"
git push
```

### Automation Script
Create a helper script at `/root/.openclaw/workspace/push.sh`:
```bash
#!/bin/bash
echo "📦 Committing and pushing to GitHub..."
git add .
git commit -m "$(date '+%Y-%m-%d %H:%M'): Auto-commit"
git push
echo "✅ Done!"
```

### Common Commands
```bash
# Check status
git status

# View remote
git remote -v

# Pull latest
git pull

# Force push (use with caution)
git push --force
```

### Metadata
- Source: workflow_creation
- Tags: git, github, workflow
- Pattern-Key: workflow.github-upload
- First-Seen: 2026-02-24

---

## [LRN-20260224-004] code_review_findings_jarvis_dashboard

**Logged**: 2026-02-24T15:30:00Z
**Priority**: high
**Status**: pending
**Area**: security, code-quality

### Summary
Code Review of Jarvis Dashboard revealed 2 critical security vulnerabilities and several code quality improvements.

### Critical Findings

#### 1. Command Injection Risk (server.js:78)
```javascript
const fullCmd = `cd "${terminalCwd}" && ${cmd}`;
```
**Problem:** User can inject commands via cmd parameter (e.g., `?cmd=foo"; rm -rf /"`)

**Solution:** Implement command whitelist
```javascript
const allowedCmds = ['ls', 'cat', 'echo', 'grep', 'find', 'ps', 'docker'];
if (!allowedCmds.some(c => cmd.startsWith(c))) {
    return res.end(JSON.stringify({ success: false, error: 'Command not allowed' }));
}
```

#### 2. Path Traversal Risk (server.js:48)
```javascript
sys.files(dir)  // dir from query param without validation
```
**Problem:** User can access arbitrary files via `?dir=/etc/passwd`

**Solution:** Add path sanitization
```javascript
function sanitizePath(inputPath) {
    const basePath = '/root/.openclaw/workspace';
    const resolved = path.resolve(basePath, inputPath);
    if (!resolved.startsWith(basePath)) return basePath;
    return resolved;
}
```

### Additional Improvements

#### 3. Rate Limiting Missing
- Add middleware to prevent DoS attacks
- ~100 requests per minute per IP

#### 4. Input Validation Incomplete
- Network tools (ping, dns, port) lack parameter validation
- Add max length limits

#### 5. CORS Too Permissive
- Currently `*` for all origins
- Restrict to known domains in production

### Assessment Results

| Category | Grade |
|----------|-------|
| Code Quality | A |
| Security | B+ |
| Maintainability | A |
| Performance | A |
| **Overall** | **A-** |

### Action Items

- [ ] Implement command whitelist
- [ ] Add path sanitization
- [ ] Add rate limiting middleware
- [ ] Complete input validation
- [ ] Standardize error responses

### Related Files

- Report: `/root/.openclaw/workspace/agents/reviewer/memory/jarvis-dashboard-review.md`
- Reviewed: server.js, js/app.js, index.html, css/style.css

### Metadata
- Source: code_review
- Tags: security, command-injection, path-traversal, code-quality
- Pattern-Key: security.command-whitelist
- Reviewed-By: Code Reviewer 👨‍💻
- First-Seen: 2026-02-24

---

## [LRN-20260224-005] security_patches_applied

**Logged**: 2026-02-24T15:40:00Z
**Priority**: critical
**Status**: completed
**Area**: security

### Summary
Applied 5 security patches to Jarvis Dashboard based on Code Review findings.

### Patches Applied

#### 1. Command Whitelist ✅
- **Removed dangerous commands:** rm, chmod, chown
- **Allowed safe commands:** ls, cat, echo, ps, grep, find, docker, etc.
- **Dangerous chars blocked:** ; | && || ` $() > < >> <<

#### 2. Path Sanitization ✅
```javascript
function sanitizePath(inputPath) {
    const basePath = '/root/.openclaw/workspace';
    const resolved = path.resolve(basePath, inputPath);
    if (!resolved.startsWith(basePath)) return basePath;
    return resolved;
}
```

#### 3. Rate Limiting ✅
- 100 requests per minute per IP
- Returns 429 when exceeded

#### 4. Input Validation ✅
- Host sanitization (alphanumeric, dots, hyphens only)
- Port range validation (1-65535)
- Hostname length limits (1-253 chars)

#### 5. CORS Hardening ✅
- Production: specific domain only
- Development: permissive

### Security Test Results

| Test | Expected | Actual | Status |
|------|----------|--------|--------|
| rm command | Blocked | Blocked | ✅ |
| path traversal /etc/passwd | Redirect to workspace | Redirected | ✅ |
| dangerous chars (; \| &&) | Blocked | Blocked | ✅ |
| safe command ls | Allowed | Allowed | ✅ |
| docker ps | Allowed | Allowed | ✅ |

### Files Modified

- `/root/.openclaw/workspace/jarvis-dashboard/server.js` (96 lines → 207 lines)
- Added: sanitizePath(), isCommandAllowed(), checkRateLimit(), sanitizeHost()
- Added: ALLOWED_COMMANDS array (26 safe commands)
- Added: rateLimitMap with RATE_LIMIT_MAX=100

### Risk Reduction

**Before:** Critical command injection, path traversal  
**After:** Command whitelist, path sanitization, rate limiting

### Metadata
- Source: code_review_fix
- Tags: security, command-whitelist, path-sanitization, rate-limiting
- Pattern-Key: security.command-whitelist
- Patched-By: Jarvis
- Verified-By: security_test

---

## [LRN-20260224-006] repo_privacy_and_docs_updated

**Logged**: 2026-02-24T16:00:00Z
**Priority**: medium
**Status**: completed
**Area**: documentation, security

### Summary
- Set GitHub repository to private
- Unified documentation to Chinese (README.md)
- Added Chinese version README-CN.md

### Changes Made

1. Repository Visibility: public → private
2. README.md: Replaced English with Chinese
3. README-CN.md: Created as reference

### GitHub API Used

```bash
curl -X PATCH \
  -H "Authorization: token $TOKEN" \
  https://api.github.com/repos/szmanlee/jarvis-23-dashboard \
  -d '{"private": true}'
```

### Related

- Security fix: [LRN-20260224-005]
- Code review: agents/reviewer/memory/jarvis-dashboard-review.md

---
