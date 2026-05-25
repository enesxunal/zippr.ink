#!/bin/bash
# Sunucuda çalışır: GitHub'dan son kodu çeker, build alır, uygulamayı yeniden başlatır.
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/zippr.ink}"
BRANCH="${BRANCH:-main}"
PM2_NAME="${PM2_NAME:-zippr}"

cd "$APP_DIR"

echo "[deploy] fetch origin/$BRANCH ..."
git fetch origin "$BRANCH"
git reset --hard "origin/$BRANCH"

echo "[deploy] env check ..."
bash scripts/check-env.sh .env.local

echo "[deploy] npm install ..."
npm ci

echo "[deploy] build ..."
npm run build

if grep -rq "xxxxxxxx.supabase" .next 2>/dev/null; then
  echo "HATA: Build hâlâ xxxxxxxx.supabase içeriyor — .env.local kontrol et"
  exit 1
fi

echo "[deploy] Supabase host: $(grep '^NEXT_PUBLIC_SUPABASE_URL=' .env.local | cut -d= -f2 | sed 's|https://||;s|\.supabase\.co||')"

echo "[deploy] restart pm2 ($PM2_NAME) ..."
if pm2 describe "$PM2_NAME" >/dev/null 2>&1; then
  pm2 restart "$PM2_NAME"
else
  pm2 start npm --name "$PM2_NAME" -- start
fi

pm2 save
echo "[deploy] done."
