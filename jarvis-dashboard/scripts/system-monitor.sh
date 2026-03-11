#!/bin/bash
case "$1" in
    cpu) top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1 ;;
    memory) free | grep Mem | awk '{printf "%.0f", $3/$2 * 100.0}' ;;
    disk) df -h / | tail -1 | awk '{print $5}' | cut -d'%' -f1 ;;
    uptime) uptime -p 2>/dev/null || uptime | awk '{print $3,$4}' | cut -d',' -f1 ;;
    hostname) hostname ;;
    kernel) uname -r ;;
    load) uptime | awk '{print $10,$11,$12}' | tr -d ',' ;;
    processes) ps aux --sort=-%cpu -o pid,comm,%cpu,%mem,stat | head -11 | tail -10 ;;
    network) cat /proc/net/dev | grep eth0 | awk '{print $2,$10}' ;;
    docker-containers) docker ps --format "{{.Names}}|{{.Status}}|{{.Ports}}" ;;
    docker-stats) docker stats --no-stream --format "{{.Name}}|{{.CPUPerc}}|{{.MemPerc}}|{{.MemUsage}}" ;;
    files) ls -lah --time-style=long-iso "$2" 2>/dev/null | tail -n +2 ;;
    log) tail -50 "$2" 2>/dev/null ;;
    ping) ping -c 4 "$2" 2>&1 ;;
    port) nc -zv -w3 "$2" "$3" 2>&1 ;;
    dns) nslookup "$2" 2>&1 | tail -10 ;;
    *) echo "Usage: $0 {cpu|memory|disk|uptime|hostname|kernel|load|processes|network|docker-containers|docker-stats|files|log|ping|port|dns}" ;;
esac
