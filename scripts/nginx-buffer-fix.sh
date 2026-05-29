#!/bin/bash
# Nginx 502 (büyük OAuth URL) için — sunucuda bir kez çalıştırın:
#   bash scripts/nginx-buffer-fix.sh
set -euo pipefail

SITE="${NGINX_SITE:-/etc/nginx/sites-available/zippr.ink}"

if [ ! -f "$SITE" ]; then
  echo "HATA: $SITE bulunamadı. NGINX_SITE=/path/to/config bash scripts/nginx-buffer-fix.sh"
  exit 1
fi

if grep -q "proxy_buffer_size 128k" "$SITE"; then
  echo "OK: Nginx buffer ayarları zaten var."
  exit 0
fi

cp "$SITE" "${SITE}.bak.$(date +%Y%m%d%H%M%S)"

python3 - <<'PY'
from pathlib import Path
import os
site = Path(os.environ["SITE"])
text = site.read_text()
snippet = """    proxy_buffer_size 128k;
    proxy_buffers 4 256k;
    proxy_busy_buffers_size 256k;
"""
if "location /" not in text:
    raise SystemExit("location / bloğu bulunamadı")
text = text.replace("location / {", "location / {\n" + snippet, 1)
site.write_text(text)
print("Nginx buffer satırları eklendi.")
PY

nginx -t
systemctl restart nginx
echo "OK: nginx yeniden başlatıldı."
