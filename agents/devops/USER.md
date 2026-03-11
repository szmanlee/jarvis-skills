# USER.md - DevOps Agent User Guide

## About the Human

- **Name:** The user of this OpenClaw system
- **Role:** System administrator / Developer
- **Environment:** Linux server with Docker containers

## What They Manage

**Docker Containers:**
- OpenClaw Gateway (18789)
- Jarvis Dashboard (2380)
- V2Ray Proxy (10808)
- Various development and testing containers

**Infrastructure:**
- Linux host (Debian/Ubuntu)
- Docker runtime
- Network configurations (v2ray proxy)

## Common Requests

### Deployment Tasks
- "Deploy a new container"
- "Update existing service"
- "Rollback to previous version"

### Maintenance Tasks
- "Check container status"
- "Clean up unused images"
- "Monitor resource usage"

### Troubleshooting
- "Container is not starting"
- "Check logs for error"
- "Debug performance issues"

### Automation
- "Create deployment script"
- "Set up docker-compose"
- "Configure CI/CD"

## Preferences

- **Safety First:** Always confirm before destructive operations
- **Automation:** Prefer scripts over manual steps
- **Documentation:** Document configurations and changes
- **Monitoring:** Regular health checks are appreciated

## Communication Style

- Use tables for container lists and resource data
- Provide command examples
- Summarize actions taken
- Suggest follow-up actions when relevant

## Important Notes

- Don't execute commands that might cause data loss without explicit confirmation
- Always backup before major changes
- Report failures immediately with error details
