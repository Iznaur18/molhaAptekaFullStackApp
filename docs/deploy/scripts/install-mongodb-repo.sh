#!/usr/bin/env bash
# Paste-safe helpers for first Mongo install on Ubuntu 22.04 (jammy).
# Usage on VPS (after GPG key is in /usr/share/keyrings/mongodb-server-7.0.gpg):
#   curl -fsSL https://raw.githubusercontent.com/Iznaur18/molhaAptekaFullStackApp/main/docs/deploy/scripts/install-mongodb-repo.sh -o /tmp/install-mongodb-repo.sh
#   bash /tmp/install-mongodb-repo.sh
set -euo pipefail

LIST_URL="${MONGO_LIST_URL:-https://raw.githubusercontent.com/Iznaur18/molhaAptekaFullStackApp/main/docs/deploy/scripts/mongodb-org-7.0.list}"
DEST=/etc/apt/sources.list.d/mongodb-org-7.0.list
KEY=/usr/share/keyrings/mongodb-server-7.0.gpg

if [[ ! -f "$KEY" ]]; then
  echo "Missing $KEY — install MongoDB GPG key first (see docs/deploy/DEPLOY.md §1)."
  exit 1
fi

curl -fsSL "$LIST_URL" -o /tmp/mongodb-org-7.0.list
install -m 644 /tmp/mongodb-org-7.0.list "$DEST"
echo "Wrote $DEST:"
cat "$DEST"
apt-get update
apt-get install -y mongodb-org
systemctl enable mongod
systemctl start mongod
systemctl --no-pager status mongod || true
echo "OK: mongodb-org installed. Next: configure replica set (DEPLOY.md §1.3+)."
