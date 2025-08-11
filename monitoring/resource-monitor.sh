#!/bin/bash
# Resource Monitor Script - Logs system resources to file

LOG_FILE="/var/log/petcare-resources.log"
DATE=$(date '+%Y-%m-%d %H:%M:%S')

# Function to log with timestamp
log_with_timestamp() {
    echo "[$DATE] $1" | tee -a "$LOG_FILE"
}

# Check if running as root (needed for log file)
if [ "$EUID" -ne 0 ]; then
    echo "Please run as root to write to log file"
    exit 1
fi

log_with_timestamp "=== RESOURCE MONITOR ==="

# CPU Usage
CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)
log_with_timestamp "CPU Usage: ${CPU_USAGE}%"

# Memory Usage
MEMORY_INFO=$(free | grep Mem)
MEMORY_TOTAL=$(echo $MEMORY_INFO | awk '{print $2}')
MEMORY_USED=$(echo $MEMORY_INFO | awk '{print $3}')
MEMORY_PERCENTAGE=$(echo "scale=1; $MEMORY_USED/$MEMORY_TOTAL*100" | bc)
log_with_timestamp "Memory Usage: ${MEMORY_PERCENTAGE}% (${MEMORY_USED}/${MEMORY_TOTAL})"

# Disk Usage
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | cut -d'%' -f1)
log_with_timestamp "Disk Usage: ${DISK_USAGE}%"

# API Response Time
API_RESPONSE=$(curl -s -w "%{time_total}" -o /dev/null http://localhost:8989/health)
if [ $? -eq 0 ]; then
    log_with_timestamp "API Response Time: ${API_RESPONSE}s"
else
    log_with_timestamp "API Status: DOWN"
fi

# Check for high resource usage alerts
CPU_INT=$(echo "$CPU_USAGE" | cut -d'.' -f1)
MEMORY_INT=$(echo "$MEMORY_PERCENTAGE" | cut -d'.' -f1)

if [ "$CPU_INT" -gt 80 ] 2>/dev/null; then
    log_with_timestamp "⚠️  WARNING: High CPU usage detected!"
fi

if [ "$MEMORY_INT" -gt 80 ] 2>/dev/null; then
    log_with_timestamp "⚠️  WARNING: High memory usage detected!"
fi

if [ "$DISK_USAGE" -gt 85 ] 2>/dev/null; then
    log_with_timestamp "⚠️  WARNING: High disk usage detected!"
fi

log_with_timestamp "=== MONITOR COMPLETE ==="
echo ""
