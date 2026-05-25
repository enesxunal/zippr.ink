#!/bin/bash
# VPS panel → VNC ile sunucuya gir → bu dosyanın içeriğini terminale yapıştır (tek seferlik)
set -euo pipefail

echo "=== zippr.ink sunucu kurulumu ==="

apt update
apt install -y git curl

if ! command -v node >/dev/null 2>&1; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt install -y nodejs
fi

npm install -g pm2

# GitHub SSH anahtarı (sunucu için)
if [ ! -f /root/.ssh/id_ed25519.pub ]; then
  ssh-keygen -t ed25519 -f /root/.ssh/id_ed25519 -N "" -C "server1.zippr.ink"
fi

echo ""
echo "========== GITHUB DEPLOY KEY =========="
echo "Aşağıdaki TEK SATIRI kopyala:"
echo "GitHub → zippr.ink → Settings → Deploy keys → Add"
echo ""
cat /root/.ssh/id_ed25519.pub
echo ""
echo "========================================"
read -r -p "GitHub'a ekledin mi? Enter..."

ssh -o StrictHostKeyChecking=accept-new -T git@github.com || true

mkdir -p /var/www
if [ ! -d /var/www/zippr.ink/.git ]; then
  git clone git@github.com:enesxunal/zippr.ink.git /var/www/zippr.ink
fi

cd /var/www/zippr.ink
git pull origin main
chmod +x scripts/*.sh

if [ ! -f .env.local ]; then
  cp .env.production.example .env.local
  chmod 600 .env.local
  echo ""
  echo "Şimdi .env.local doldur: nano /var/www/zippr.ink/.env.local"
  echo "Mac'teki .env.local yapıştır, APP_URL=https://zippr.ink yap"
  read -r -p "nano ile kaydettin mi? Enter..."
fi

bash scripts/deploy.sh

CRON_LINE='*/3 * * * * cd /var/www/zippr.ink && git fetch origin main -q && [ $(git rev-parse HEAD) != $(git rev-parse origin/main) ] && bash scripts/deploy.sh >> /var/log/zippr-deploy.log 2>&1'
( crontab -l 2>/dev/null | grep -v zippr.ink || true; echo "$CRON_LINE" ) | crontab -

echo ""
echo "=== Bitti ==="
echo "pm2 status"
pm2 status
