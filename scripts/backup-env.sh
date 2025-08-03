#!/bin/bash

# Backup environment variables
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./backups"
BACKUP_FILE="$BACKUP_DIR/env_backup_$DATE.txt"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup .env file
if [ -f .env ]; then
  cp .env $BACKUP_FILE
  echo "✅ Environment variables backed up to: $BACKUP_FILE"
else
  echo "❌ .env file not found"
  exit 1
fi

# Create restore script
RESTORE_SCRIPT="$BACKUP_DIR/restore_env.sh"
cat > $RESTORE_SCRIPT << 'EOF'
#!/bin/bash
# Restore environment variables
if [ -f "$1" ]; then
  cp "$1" .env
  echo "✅ Environment variables restored from: $1"
else
  echo "❌ Backup file not found: $1"
  exit 1
fi
EOF

chmod +x $RESTORE_SCRIPT

echo "📝 To restore environment variables:"
echo "   ./backups/restore_env.sh $BACKUP_FILE"
echo ""
echo "🔒 Remember to keep your backup files secure!" 