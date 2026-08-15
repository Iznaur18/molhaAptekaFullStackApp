#!/usr/bin/env bash
set -euo pipefail

ROOT=/var/www/gitorg

# Swap for vite on 4GB (idempotent)
if ! swapon --show | grep -q .; then
  if [[ ! -f /swapfile ]]; then
    fallocate -l 2G /swapfile || dd if=/dev/zero of=/swapfile bs=1M count=2048
    chmod 600 /swapfile
    mkswap /swapfile
  fi
  swapon /swapfile || true
  grep -q '/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
  echo SWAP_ON
else
  echo SWAP_EXISTS
fi

# systemd API
python3 - <<'PY'
from pathlib import Path
src = Path("/var/www/gitorg/docs/deploy/systemd-izibuy.service.example").read_text()
src = src.replace("/var/www/izibuy", "/var/www/gitorg")
src = src.replace("Izibuy", "Gitorg").replace("izibuy-api", "gitorg-api")
lines = []
for line in src.splitlines():
    lines.append(line)
    if line.startswith("EnvironmentFile="):
        lines.append("Environment=CRON_LEADER=false")
Path("/etc/systemd/system/gitorg-api.service").write_text("\n".join(lines) + "\n")
print("wrote gitorg-api.service")
PY

python3 - <<'PY'
from pathlib import Path
src = Path("/var/www/gitorg/docs/deploy/systemd-izibuy-worker.service.example").read_text()
src = src.replace("/var/www/izibuy", "/var/www/gitorg")
src = src.replace("Izibuy", "Gitorg").replace("izibuy-worker", "gitorg-worker")
Path("/etc/systemd/system/gitorg-worker.service").write_text(src)
print("wrote gitorg-worker.service")
PY

mkdir -p "$ROOT/server/uploads"
chown -R www-data:www-data "$ROOT/server/uploads"
chown www-data:www-data "$ROOT/server/.env"
chmod 600 "$ROOT/server/.env"
chown -R www-data:www-data "$ROOT/server" "$ROOT/contract" "$ROOT/packages"

systemctl daemon-reload
systemctl enable gitorg-api gitorg-worker
systemctl restart gitorg-api gitorg-worker
sleep 3
systemctl is-active gitorg-api || true
systemctl is-active gitorg-worker || true
systemctl --no-pager --full status gitorg-api | head -25 || true
curl -sS -w "\nHTTP:%{http_code}\n" http://127.0.0.1:4444/health || true
