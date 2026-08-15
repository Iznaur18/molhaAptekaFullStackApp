#!/usr/bin/env bash
# Cutover live VPS from /var/www/torgum + torgum-* units to gitorg.
set -euo pipefail

OLD_ROOT=/var/www/torgum
NEW_ROOT=/var/www/gitorg

systemctl stop torgum-api torgum-worker 2>/dev/null || true
systemctl disable torgum-api torgum-worker 2>/dev/null || true

if [[ -d "$OLD_ROOT" && ! -d "$NEW_ROOT" ]]; then
  mv "$OLD_ROOT" "$NEW_ROOT"
  echo "moved $OLD_ROOT -> $NEW_ROOT"
elif [[ -d "$NEW_ROOT" ]]; then
  echo "NEW_ROOT already exists"
else
  echo "ERROR: neither old nor new root found"
  exit 1
fi

cd "$NEW_ROOT"
git fetch origin
git checkout main
git pull --ff-only origin main

# Domain only in .env — keep existing Mongo user/db (torgum) on this VPS
python3 - <<'PY'
from pathlib import Path
import re
p = Path("/var/www/gitorg/server/.env")
t = p.read_text()
t = t.replace("https://torgum.ru", "https://gitorg.ru")
t = t.replace("http://torgum.ru", "https://gitorg.ru")
t = t.replace("torgum.ru", "gitorg.ru")
# do NOT rewrite mongodb://torgum: or /torgum? — live DB user
p.write_text(t)
print("env urls updated")
for line in p.read_text().splitlines():
    if line.startswith(("FRONTEND_URL=", "PUBLIC_UPLOAD_BASE_URL=", "MONGO_URI=")):
        print(re.sub(r"(mongodb://[^:]+:)[^@]+", r"\1***", line))
PY

chown www-data:www-data "$NEW_ROOT/server/.env"
chmod 600 "$NEW_ROOT/server/.env"

# Rebuild SPA with new brand assets if any
cd "$NEW_ROOT/packages/shared-lib"
npm install --ignore-scripts >/dev/null
npx --yes tsc -p tsconfig.json || ./node_modules/typescript/bin/tsc -p tsconfig.json
cd "$NEW_ROOT/client"
npm ci --ignore-scripts
npm run build
chown -R www-data:www-data "$NEW_ROOT/client/dist"

bash "$NEW_ROOT/docs/deploy/scripts/setup-systemd-gitorg.sh"
bash "$NEW_ROOT/docs/deploy/scripts/setup-nginx-gitorg.sh"
python3 "$NEW_ROOT/docs/deploy/scripts/fix-nginx-brace-quotes.py" || true

rm -f /etc/nginx/sites-enabled/torgum /etc/nginx/sites-available/torgum
systemctl daemon-reload
systemctl disable --now torgum-api torgum-worker 2>/dev/null || true
rm -f /etc/systemd/system/torgum-api.service /etc/systemd/system/torgum-worker.service
systemctl daemon-reload

systemctl restart gitorg-api gitorg-worker nginx
sleep 2
systemctl is-active gitorg-api gitorg-worker nginx
curl -sS http://127.0.0.1:4444/health
echo
curl -sS -o /dev/null -w "spa:%{http_code}\n" -H "Host: gitorg.ru" http://127.0.0.1/
echo CUTOVER_OK
