#!/bin/bash
# System Health Check Script for PetCare API

echo "=== SYSTEM HEALTH CHECK - $(date) ==="

# 1. Disk Usage
echo "🗂️  DISK USAGE:"
df -h | grep -E '(Filesystem|/dev)'

# 2. Memory Usage  
echo -e "\n💾 MEMORY USAGE:"
free -h

# 3. CPU Load
echo -e "\n🔥 CPU LOAD:"
uptime

# 4. API Status
echo -e "\n🚀 API STATUS:"
curl -s http://localhost:8989/health || echo "❌ API DOWN"

# 5. PM2 Status
echo -e "\n📊 PM2 STATUS:"
pm2 status

# 6. PostgreSQL Status
echo -e "\n🗄️  POSTGRESQL STATUS:"
systemctl is-active postgresql || echo "❌ PostgreSQL DOWN"

# 7. Nginx Status
echo -e "\n🌐 NGINX STATUS:"
systemctl is-active nginx || echo "❌ Nginx DOWN"

# 8. Active Connections
echo -e "\n🔗 ACTIVE CONNECTIONS:"
ss -tuln | grep -E ':(80|443|8989|5432)'

echo -e "\n=== HEALTH CHECK COMPLETE ===\n"
