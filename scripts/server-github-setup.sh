#!/bin/bash
# VPS'te BİR KEZ çalıştır (root veya sudo). GitHub'dan otomatik çekme kurar.
set -euo pipefail

REPO="git@github.com:enesxunal/zippr.ink.git"
APP_DIR="${APP_DIR:-/var/www/zippr.ink}"
DEPLOY_USER="${DEPLOY_USER:-$USER}"

echo "==> Git kurulumu"
apt update
apt install -y git curl

echo "==> Node.js 20"
if ! command -v node >/dev/null 2>&1; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt install -y nodejs
fi

echo "==> PM2"
npm install -g pm2

echo "==> SSH anahtarı (GitHub için)"
if [ ! -f "$HOME/.ssh/id_ed25519.pub" ]; then
  ssh-keygen -t ed25519 -C "server1.zippr.ink" -f "$HOME/.ssh/id_ed25519" -N ""
fi
echo ""
echo "Aşağıdaki anahtarı GitHub'a ekle:"
echo "  Repo → Settings → Deploy keys → Add deploy key"
echo "  veya hesap → Settings → SSH keys"
echo ""
cat "$HOME/.ssh/id_ed25519.pub"
echo ""
read -r -p "GitHub'a ekledin mi? Enter'a bas..."

ssh -o StrictHostKeyChecking=accept-new -T git@github.com || true

echo "==> Proje klasörü"
mkdir -p "$(dirname "$APP_DIR")"
if [ ! -d "$APP_DIR/.git" ]; then
  git clone "$REPO" "$APP_DIR"
else
  cd "$APP_DIR"
  git remote set-url origin "$REPO"
  git fetch origin main
  git reset --hard origin/main
fi

cd "$APP_DIR"
chmod +x scripts/deploy.sh

if [ ! -f .env.local ]; then
  if [ -f .env.production.example ]; then
    cp .env.production.example .env.local
    chmod 600 .env.local
    echo ".env.local şablondan oluşturuldu."
  fi
  echo ""
  echo "ÖNEMLİ: değerleri doldur → nano $APP_DIR/.env.local"
  echo "  (Mac'teki .env.local kopyala, APP_URL=https://zippr.ink yap)"
  echo ""
fi

echo "==> İlk deploy"
bash scripts/deploy.sh

echo "==> Cron: her 3 dakikada GitHub kontrol"
CRON_LINE="*/3 * * * * cd $APP_DIR && git fetch origin main -q && [ \$(git rev-parse HEAD) != \$(git rev-parse origin/main) ] && bash scripts/deploy.sh >> /var/log/zippr-deploy.log 2>&1"
( crontab -l 2>/dev/null | grep -v "zippr.ink" || true; echo "$CRON_LINE" ) | crontab -

echo ""
echo "Kurulum bitti."
echo "  Uygulama: pm2 logs $PM2_NAME"
echo "  Deploy log: /var/log/zippr-deploy.log"
echo "  Manuel güncelleme: cd $APP_DIR && bash scripts/deploy.sh"
