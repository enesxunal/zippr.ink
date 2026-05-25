#!/bin/bash
# Sunucuda tek seferlik tam temizlik (SSH içinde):
#   cd /var/www/zippr.ink && bash scripts/server-clean-deploy.sh
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/zippr.ink}"
PM2_NAME="${PM2_NAME:-zippr}"

cd "$APP_DIR"
git pull origin main
bash scripts/deploy.sh

echo ""
echo "Tarayıcıda: gizli sekme + Cmd+Shift+R (eski JS cache silinir)"
echo "Test: https://zippr.ink/tr/login → Google ile giriş"
