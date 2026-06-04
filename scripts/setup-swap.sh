#!/bin/bash
# Sunucuda bir kez: build sırasında RAM yetmezse 2GB swap ekler
#   sudo bash scripts/setup-swap.sh
set -euo pipefail

if [ "$(id -u)" -ne 0 ]; then
  echo "sudo ile çalıştırın: sudo bash scripts/setup-swap.sh"
  exit 1
fi

if swapon --show | grep -q '/swapfile'; then
  echo "Swap zaten aktif:"
  swapon --show
  free -h
  exit 0
fi

echo "[swap] 2GB swap dosyası oluşturuluyor..."
fallocate -l 2G /swapfile 2>/dev/null || dd if=/dev/zero of=/swapfile bs=1M count=2048 status=progress
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile

if ! grep -q '/swapfile' /etc/fstab; then
  echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

echo "[swap] Tamam:"
free -h
swapon --show
