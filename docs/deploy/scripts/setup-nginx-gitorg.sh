#!/usr/bin/env bash
set -euo pipefail

python3 - <<'PY'
from pathlib import Path
src = Path("/var/www/gitorg/docs/deploy/nginx-izibuy.conf.example").read_text()
src = src.replace("/var/www/izibuy", "/var/www/gitorg")
src = src.replace("izibuy_api", "gitorg_api")
Path("/etc/nginx/sites-available/gitorg").write_text(src)
print("wrote nginx site gitorg")
PY

ln -sfn /etc/nginx/sites-available/gitorg /etc/nginx/sites-enabled/gitorg
rm -f /etc/nginx/sites-enabled/default
mkdir -p /var/www/certbot
nginx -t
systemctl reload nginx
echo NGINX_OK
