# DevOps Agent Learnings

## [LRN-20260224-001] Initial Setup

**Date**: 2026-02-24
**Status**: completed

### Context
Created DevOps agent for container management, deployment automation, and CI/CD.

### What Worked
- Detailed SOUL.md with clear 4-step workflow
- Safety boundaries well-defined
- HEARTBEAT.md with scheduled checks

### Challenges
- Agent not registered in gateway (sessions_spawn forbidden)
- Need manual gateway configuration

### Lessons Learned
- Agent creation via skill works but gateway config needs separate step
- Always test agent commands manually before finalizing

### Related
- Agent: /root/.openclaw/workspace/agents/devops/
- Research: agents/sherlock/memory/2026-02-24.md

---

## [LRN-20260224-002] Container Naming Convention

**Date**: 2026-02-24
**Status**: best-practice

### Pattern
Use descriptive, consistent naming:
```
<project>-<service>  # e.g., tradingagents-nginx, tradingagents-backend
```

### Benefits
1. Easy to identify project ownership
2. Group-related containers together
3. Clear separation between environments

### Examples from Current System
- tradingagents-nginx (frontend proxy)
- tradingagents-frontend (React UI)
- tradingagents-backend (API server)
- tradingagents-mongodb (database)
- tradingagents-redis (cache)

### Best Practices
- Use lowercase with hyphens
- Max 4-5 segments
- Include environment indicator if needed (prod/staging)

---

## [LRN-20260224-003] Health Check Debugging

**Date**: 2026-02-24
**Status**: solved

### Issue
nginx and frontend containers showing "unhealthy" status despite being Up.

### Investigation Steps
1. Check container logs: `docker logs <container> --tail 50`
2. Inspect healthcheck config: `docker inspect <container> --format '{{.Config.Healthcheck}}'`
3. Check health status: `docker inspect <container> --format '{{.State.Health.Status}}'`

### Common Causes
- Health check script failing
- Health check interval too short
- Application not responding on expected endpoint
- Network connectivity issues

### Resolution
Run detailed health check commands before reporting issues.

---

## [LRN-20260224-004] Docker Resource Monitoring

**Date**: 2026-02-24
**Status**: best-practice

### Essential Commands

**CPU/Memory:**
```bash
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemPerc}}\t{{.PIDs}}"
```

**Disk Usage:**
```bash
docker system df
docker system df -v  # Detailed view
```

**Container Count:**
```bash
docker ps -aq | wc -l  # Total containers
docker ps -aq -f status=running | wc -l  # Running only
```

### Alert Thresholds
| Resource | Warning | Critical |
|----------|---------|----------|
| Memory | > 80% | > 90% |
| Disk | > 70% | > 85% |
| Container restart | > 2 in 1h | > 5 in 1h |

---

## [LRN-20260224-005] Security Best Practices

**Date**: 2026-02-24
**Status**: guidelines

### Container Security Checklist
- [ ] Use official base images
- [ ] Specify image tags (avoid `:latest`)
- [ ] Run containers with non-root user
- [ ] Limit container capabilities
- [ ] Use read-only filesystem where possible
- [ ] Don't expose unnecessary ports
- [ ] Use secrets for sensitive data
- [ ] Regular image scanning

### Image Scanning Tools
- Docker Scout: `docker scout cves <image>`
- Trivy: `trivy image <image>`
- Snyk: `snyk container test <image>`

### Resource Limits
Always set limits in docker-compose:
```yaml
deploy:
  resources:
    limits:
      cpus: '2'
      memory: 4G
    reservations:
      cpus: '0.5'
      memory: 1G
```

---

## [LRN-20260224-006] Backup Strategy

**Date**: 2026-02-24
**Status**: guidelines

### Backup Types

**Configuration Backup:**
```bash
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  nexdrew/dockercfg backup > docker-backup.json
```

**Volume Backup:**
```bash
docker run --rm -v <volume>:/data -v $(pwd):/backup alpine \
  tar czf /backup/<volume>.tar.gz -C /data .
```

**Full System Backup:**
```bash
docker save $(docker ps -aq) -o full-backup.tar
```

### Restore Procedures

**Volume Restore:**
```bash
docker run --rm -v <volume>:/data -v $(pwd):/backup alpine \
  tar xzf /backup/<volume>.tar.gz -C /data
```

**Image Restore:**
```bash
docker load -i full-backup.tar
```

### Backup Schedule
| Data Type | Frequency | Retention |
|-----------|-----------|-----------|
| Config | Weekly + before changes | 4 weeks |
| Volumes | Daily | 7 days |
| Full images | Monthly | 3 months |

---

## [LRN-20260224-007] Network Troubleshooting

**Date**: 2026-02-24
**Status**: best-practice

### Common Issues

**Container can't reach internet:**
1. Check bridge network: `docker network inspect bridge`
2. Verify DNS: `docker exec <container> nslookup google.com`
3. Check iptables: `sudo iptables -L DOCKER -n -v`

**Container-to-container communication:**
1. Verify same network: `docker inspect <container> --format '{{range $k, $v := .NetworkSettings.Networks}}{{$k}} {{end}}'`
2. Test connection: `docker run --rm --network <network> alpine ping <target>`
3. Check service discovery: `docker run --rm --network <network> alpine nslookup <service>`

**Port not accessible:**
1. Verify port mapping: `docker port <container>`
2. Check container listening: `docker exec <container> netstat -tulpn`
3. Test locally: `curl http://localhost:<port>`

---

## [LRN-20260224-008] CRON Job Improvements

**Date**: 2026-02-24
**Status**: completed

### Current Jobs
| Job | Schedule | Purpose |
|-----|----------|---------|
| devops-healthcheck | 0 8 * * * | Daily health check |
| devops-weekly-maintenance | 0 9 * * 0 | Weekly cleanup |

### Suggested Additional Jobs

**Security Scan (Weekly):**
```bash
# Add to cron
0 10 * * 1  # Monday 10 AM
# Task: Run docker scout or trivy on all images
```

**Backup Check (Daily):**
```bash
# Add to cron
0 7 * * *  # Daily 7 AM
# Task: Verify backup files exist and are recent
```

### Monitoring Setup
Use cron history to track job success/failure:
```bash
npx openclaw cron runs --name devops-healthcheck
```

---
