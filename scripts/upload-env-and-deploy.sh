#!/bin/bash
# Mac'te çalıştır: şifreyi 2 kez sorar (scp + ssh)
set -euo pipefail

SERVER="${SERVER:-root@159.198.68.228}"
APP_DIR="${APP_DIR:-/var/www/zippr.ink}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

cd "$ROOT"

if [ ! -f .env.local ]; then
  echo "HATA: $ROOT/.env.local yok"
  exit 1
fi

echo "==> .env.local sunucuya kopyalanıyor (şifre isteyebilir)..."
TMP_ENV=$(mktemp)
sed 's|^NEXT_PUBLIC_APP_URL=.*|NEXT_PUBLIC_APP_URL=https://zippr.ink|' .env.local > "$TMP_ENV"
if grep -q '^TOSLA_CALLBACK_URL=' "$TMP_ENV"; then
  sed -i '' 's|^TOSLA_CALLBACK_URL=.*|TOSLA_CALLBACK_URL=https://zippr.ink/api/payments/tosla/webhook|' "$TMP_ENV" 2>/dev/null || \
  sed -i 's|^TOSLA_CALLBACK_URL=.*|TOSLA_CALLBACK_URL=https://zippr.ink/api/payments/tosla/webhook|' "$TMP_ENV"
fi

scp "$TMP_ENV" "$SERVER:$APP_DIR/.env.local"
rm -f "$TMP_ENV"
ssh "$SERVER" "chmod 600 $APP_DIR/.env.local && cd $APP_DIR && git pull origin main && bash scripts/deploy.sh"

echo ""
echo "Bitti. Dene:"
echo "  https://zippr.ink/tr/admin/login"
echo "  https://zippr.ink/tr/login (Google)"
