#!/bin/bash
# Sunucuda build öncesi .env.local kontrolü
set -euo pipefail

ENV_FILE="${1:-.env.local}"

if [ ! -f "$ENV_FILE" ]; then
  echo "HATA: $ENV_FILE yok. cp .env.production.example .env.local && nano"
  exit 1
fi

# shellcheck disable=SC1090
source "$ENV_FILE"

fail=0

check_nonempty() {
  local name=$1
  local val=$2
  if [ -z "${val:-}" ]; then
    echo "HATA: $name boş"
    fail=1
  fi
}

check_nonempty "NEXT_PUBLIC_SUPABASE_URL" "${NEXT_PUBLIC_SUPABASE_URL:-}"
check_nonempty "NEXT_PUBLIC_SUPABASE_ANON_KEY" "${NEXT_PUBLIC_SUPABASE_ANON_KEY:-}"
check_nonempty "SUPABASE_SERVICE_ROLE_KEY" "${SUPABASE_SERVICE_ROLE_KEY:-}"
check_nonempty "NEXT_PUBLIC_APP_URL" "${NEXT_PUBLIC_APP_URL:-}"

if echo "${NEXT_PUBLIC_SUPABASE_URL:-}" | grep -qE 'xxxx|your-project|example'; then
  echo "HATA: NEXT_PUBLIC_SUPABASE_URL hâlâ şablon (xxxx) — Mac .env.local'deki gerçek URL'yi yaz"
  fail=1
fi

if ! echo "${NEXT_PUBLIC_SUPABASE_URL:-}" | grep -q '\.supabase\.co'; then
  echo "HATA: NEXT_PUBLIC_SUPABASE_URL geçersiz (https://PROJE_ID.supabase.co olmalı)"
  fail=1
fi

if [ "$fail" -ne 0 ]; then
  exit 1
fi

echo "OK: .env.local temel değişkenler dolu"
