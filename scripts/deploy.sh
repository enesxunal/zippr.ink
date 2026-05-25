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
echo "[deploy] HEAD: $(git log -1 --oneline)"

echo "[deploy] env check ..."
bash scripts/check-env.sh .env.local

echo "[deploy] stop app (build sırasında 502 önlenir) ..."
if pm2 describe "$PM2_NAME" >/dev/null 2>&1; then
  pm2 stop "$PM2_NAME" || true
fi

echo "[deploy] npm install ..."
npm ci

echo "[deploy] clean .next ..."
rm -rf .next

echo "[deploy] build ..."
npm run build

if [ ! -f .next/required-server-files.json ]; then
  echo "HATA: Build eksik — .next/required-server-files.json yok"
  exit 1
fi

if grep -rq "xxxxxxxx.supabase" .next 2>/dev/null; then
  echo "HATA: Build hâlâ xxxxxxxx.supabase içeriyor — .env.local kontrol et"
  exit 1
fi

echo "[deploy] Supabase host: $(grep '^NEXT_PUBLIC_SUPABASE_URL=' .env.local | cut -d= -f2 | sed 's|https://||;s|\.supabase\.co||')"

echo "[deploy] start pm2 ($PM2_NAME) ..."
if pm2 describe "$PM2_NAME" >/dev/null 2>&1; then
  pm2 start "$PM2_NAME" --update-env
else
  pm2 start npm --name "$PM2_NAME" -- start
fi

sleep 2
if curl -sf "http://127.0.0.1:3000/api/health/env" >/dev/null; then
  echo "[deploy] health OK"
else
  echo "UYARI: /api/health/env yanıt vermedi — pm2 logs $PM2_NAME kontrol et"
fi

pm2 save
echo "[deploy] done."
