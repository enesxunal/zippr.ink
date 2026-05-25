#!/bin/bash
# Sunucuda bir kez: boş .env.local şablonu oluşturur
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/zippr.ink}"
ENV_FILE="$APP_DIR/.env.local"
TEMPLATE="$APP_DIR/.env.production.example"

cd "$APP_DIR"

if [ -f "$ENV_FILE" ]; then
  echo "Zaten var: $ENV_FILE"
  echo "Düzenlemek için: nano $ENV_FILE"
  exit 0
fi

if [ -f "$TEMPLATE" ]; then
  cp "$TEMPLATE" "$ENV_FILE"
  chmod 600 "$ENV_FILE"
  echo "Oluşturuldu: $ENV_FILE"
  echo "Mac'teki .env.local değerlerini yapıştır:"
  echo "  nano $ENV_FILE"
else
  echo "Hata: $TEMPLATE bulunamadı. Önce git pull yap."
  exit 1
fi
