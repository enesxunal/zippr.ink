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

# Küçük sunucuda Sentry webpack eklentisi build'i öldürür (OOM) — runtime Sentry açık kalır
export SENTRY_DISABLE_WEBPACK="${SENTRY_DISABLE_WEBPACK:-1}"
export LOW_MEMORY_BUILD="${LOW_MEMORY_BUILD:-1}"
export NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=1536}"
export NEXT_TELEMETRY_DISABLED=1

FREE_MB=$(free -m 2>/dev/null | awk '/^Mem:/{print $7}' || echo "?")
echo "[deploy] kullanılabilir RAM: ${FREE_MB} MB (düşükse: bash scripts/setup-swap.sh)"

echo "[deploy] npm install (site ayakta kalır, pm2 build sonrası yenilenir) ..."
if ! npm ci; then
  echo "[deploy] npm ci başarısız (ENOTEMPTY vb.) — node_modules silinip yeniden deneniyor ..."
  rm -rf node_modules
  npm ci
fi

echo "[deploy] temiz build (.next + cache siliniyor) ..."
rm -rf .next node_modules/.cache .next-build

echo "[deploy] build (SENTRY_DISABLE_WEBPACK=$SENTRY_DISABLE_WEBPACK) ..."
export NODE_ENV=production
if ! npm run build; then
  echo ""
  echo "HATA: Build başarısız veya 'Killed' (bellek bitti)."
  echo "  1) bash scripts/setup-swap.sh   # 2GB swap (bir kez)"
  echo "  2) Tekrar: bash scripts/deploy.sh"
  echo "  veya Mac'te build alıp .next klasörünü sunucuya kopyalayın."
  exit 1
fi

if [ ! -d .next/static/chunks ]; then
  echo "HATA: .next/static/chunks yok — build bozuk"
  exit 1
fi

STATIC_JS=$(find .next/static/chunks -name '*.js' 2>/dev/null | wc -l | tr -d ' ')
if [ "${STATIC_JS:-0}" -lt 5 ]; then
  echo "HATA: client chunk sayısı çok az ($STATIC_JS)"
  exit 1
fi

if [ ! -f .next/required-server-files.json ]; then
  echo "HATA: Build eksik — .next/required-server-files.json yok"
  exit 1
fi

CHUNK_COUNT=$(find .next/server -name '*.js' 2>/dev/null | wc -l | tr -d ' ')
if [ "${CHUNK_COUNT:-0}" -lt 10 ]; then
  echo "HATA: .next/server chunk sayısı çok az ($CHUNK_COUNT) — build bozuk"
  exit 1
fi

if grep -rq "xxxxxxxx.supabase" .next 2>/dev/null; then
  echo "HATA: Build hâlâ xxxxxxxx.supabase içeriyor — .env.local kontrol et"
  exit 1
fi

echo "[deploy] Supabase host: $(grep '^NEXT_PUBLIC_SUPABASE_URL=' .env.local | cut -d= -f2 | sed 's|https://||;s|\.supabase\.co||')"

echo "[deploy] pm2 yeniden başlat (build başarılı) ..."
pm2 delete "$PM2_NAME" 2>/dev/null || true
pm2 start npm --name "$PM2_NAME" --cwd "$APP_DIR" -- start
pm2 save
pm2 flush "$PM2_NAME" 2>/dev/null || true

sleep 3
if curl -sf "http://127.0.0.1:3000/api/health/env" >/dev/null; then
  echo "[deploy] health OK"
else
  echo "UYARI: /api/health/env yanıt vermedi"
  pm2 logs "$PM2_NAME" --lines 15 --nostream || true
  exit 1
fi

echo "[deploy] done."
