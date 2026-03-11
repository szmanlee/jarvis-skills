# HEARTBEAT.md - DevOps Agent

# Scheduled Health Checks for DevOps Agent

## Daily (8:00 AM) - Health Check
- Check all container status
- Report containers with issues
- Monitor system resources (CPU, memory, disk)
- Verify network connectivity

## Weekly (Sunday 9:00 AM) - Maintenance
- Clean up unused Docker resources
- Prune stopped containers and dangling images
- Generate system report
- Check for security updates

## Weekly (Monday 10:00 AM) - Security Scan
- Run Docker security scan (if available)
- Check for vulnerable images
- Report security findings
- Suggest remediation steps

---

**Note:** DevOps agent manages its own cron jobs via OpenClaw.
Edit this file to modify check schedules.

**Available checks:**
- `docker ps -a` - Container status and health
- `docker stats --no-stream` - Resource usage
- `df -h` - Disk space
- `docker system df` - Docker disk usage
- `docker network ls` - Network status

**Commands Reference:**
- Health: `docker inspect --format '{{.State.Health.Status}}' <container>`
- Logs: `docker logs <container> --tail 50`
- Stats: `docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemPerc}}"`

**Related Files:**
- Learnings: `.learnings/LEARNINGS.md`
- Daily Logs: `memory/YYYY-MM-DD.md`
