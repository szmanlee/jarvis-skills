---
name: system-monitor
description: System monitoring and health checks for servers, Docker containers, processes, and network status. Provides real-time metrics and alerting capabilities.
metadata:
  prerequisites:
    bins:
    - docker
    - df
    - free
    env: []
  capabilities:
  - CPU/Memory/Disk monitoring
  - Docker container status
  - Process listing
  - Network connectivity checks
  - Health status reporting
---

# System Monitor Skill

Monitor system health, resource usage, and container status.

## When to Use

- Check server resource usage (CPU, memory, disk)
- Monitor Docker containers
- List running processes
- Verify network connectivity
- Generate health reports

## Quick Commands

### System Resources

```bash
# CPU and Memory
top -bn1 | head -5

# Disk usage
df -h

# Memory (human readable)
free -h

# Load average
cat /proc/loadavg
```

### Docker Containers

```bash
# List all containers
docker ps -a

# Container stats
docker stats --no-stream

# Docker system df
docker system df
```

### Process Monitoring

```bash
# All processes
ps aux

# Top CPU
ps aux --sort=-%cpu | head -10

# Top Memory
ps aux --sort=-%mem | head -10
```

### Network

```bash
# Open ports
netstat -tulpn

# Active connections
ss -tulpn

# DNS lookup
nslookup google.com

# Ping
ping -c 3 google.com
```

## Jarvis Dashboard Integration

This skill is integrated with Jarvis Dashboard:

- **API Endpoints:**
  - `/api/all` - Complete system data
  - `/api/docker` - Container status
  - `/api/processes` - Process list
  - `/api/system` - System resources

- **Monitor Script:** `jarvis-dashboard/scripts/system-monitor.sh`

## Health Check Script

Create a comprehensive health check script:

```bash
#!/bin/bash
echo "=== System Health Check ==="
echo "Time: $(date)"
echo ""

echo "--- CPU & Memory ---"
top -bn1 | grep -E "(^%Cpu|^Mem)"

echo ""
echo "--- Disk ---"
df -h | grep -E "^/dev"

echo ""
echo "--- Docker ---"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "--- Services ---"
systemctl is-active nginx openclaw docker || true
```

## Alerting Thresholds

| Resource | Warning | Critical |
|----------|---------|----------|
| CPU | > 70% | > 90% |
| Memory | > 80% | > 95% |
| Disk | > 80% | > 90% |
| Container Down | - | Any |

## Integration with Agents

Use with DevOps Agent for automated monitoring:

```bash
# DevOps Agent can:
# - Run scheduled health checks
# - Alert on critical issues
# - Auto-restart failed containers
# - Generate daily reports
```

## Best Practices

1. **Monitor Regularly** - Set up cron jobs for periodic checks
2. **Log History** - Track trends over time
3. **Alert Wisely** - Don't alert on minor issues
4. **Document Baselines** - Know what's normal
5. **Automate Response** - Auto-heal when possible

## Quick Reference

| Command | Purpose |
|---------|---------|
| `df -h` | Disk usage |
| `free -h` | Memory usage |
| `top` | Real-time stats |
| `docker ps` | Container status |
| `ps aux` | Process list |
| `netstat -tulpn` | Open ports |
| `ss -tulpn` | Socket statistics |
| `uptime` | Load average |

## File Locations

- **Monitor Script:** `/root/.openclaw/workspace/jarvis-dashboard/scripts/system-monitor.sh`
- **API Server:** `/root/.openclaw/workspace/jarvis-dashboard/server.js`
- **Dashboard:** `http://192.168.32.23:2380/monitor`
