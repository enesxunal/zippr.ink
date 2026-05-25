#!/bin/bash
# Sunucuda: sudo bash scripts/setup-domain.sh
set -euo pipefail

DOMAIN="${DOMAIN:-zippr.ink}"
APP_DIR="${APP_DIR:-/var/www/zippr.ink}"

if [ "$(id -u)" -ne 0 ]; then
  echo "sudo ile çalıştır: sudo bash scripts/setup-domain.sh"
  exit 1
fi

apt install -y nginx certbot python3-certbot-nginx

cp "$APP_DIR/scripts/nginx-zippr.ink.conf" /etc/nginx/sites-available/zippr.ink
ln -sf /etc/nginx/sites-available/zippr.ink /etc/nginx/sites-enabled/zippr.ink
rm -f /etc/nginx/sites-enabled/default

nginx -t
systemctl enable nginx
systemctl reload nginx

echo ""
echo "DNS A kaydı 159.198.68.228'e işaret etmeli (zippr.ink ve www)."
echo "DNS yayıldıktan sonra SSL:"
echo "  certbot --nginx -d zippr.ink -d www.zippr.ink"
echo ""
read -r -p "DNS hazır mı? SSL kurulsun mu? (y/n) " ans
if [ "$ans" = "y" ] || [ "$ans" = "Y" ]; then
  certbot --nginx -d zippr.ink -d www.zippr.ink --non-interactive --agree-tos -m admin@zippr.ink || \
    certbot --nginx -d zippr.ink -d www.zippr.ink
fi

echo "Bitti. https://zippr.ink dene."
