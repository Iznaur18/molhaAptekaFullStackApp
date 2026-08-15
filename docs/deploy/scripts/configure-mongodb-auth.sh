#!/usr/bin/env bash
# Create gitorg DB user, enable auth+keyFile for single-node rs0.
# Prints MONGO_URI at the end — save it into server/.env
set -euo pipefail

CONF=/etc/mongod.conf
KEYFILE=/etc/mongo-keyfile
USER_NAME=gitorg
DB_NAME=gitorg

if [[ ! -f "$CONF" ]]; then
  echo "Missing $CONF"
  exit 1
fi

PASS="$(openssl rand -hex 24)"

# Wait until PRIMARY
for i in $(seq 1 30); do
  state="$(mongosh --quiet --eval 'try { print(rs.isMaster().ismaster ? "PRIMARY" : "WAIT") } catch (e) { print("WAIT") }' || true)"
  if [[ "$state" == "PRIMARY" ]]; then
    break
  fi
  sleep 1
done

mongosh --quiet --eval "
const admin = db.getSiblingDB('admin');
const existing = admin.getUser('${USER_NAME}');
if (existing) {
  admin.updateUser('${USER_NAME}', {
    pwd: '${PASS}',
    roles: [
      { role: 'readWrite', db: '${DB_NAME}' },
      { role: 'dbAdmin', db: '${DB_NAME}' },
      { role: 'clusterMonitor', db: 'admin' }
    ]
  });
  print('UPDATED_USER');
} else {
  admin.createUser({
    user: '${USER_NAME}',
    pwd: '${PASS}',
    roles: [
      { role: 'readWrite', db: '${DB_NAME}' },
      { role: 'dbAdmin', db: '${DB_NAME}' },
      { role: 'clusterMonitor', db: 'admin' }
    ]
  });
  print('CREATED_USER');
}
"

if [[ ! -f "$KEYFILE" ]]; then
  openssl rand -base64 756 >"$KEYFILE"
  chmod 400 "$KEYFILE"
  chown mongodb:mongodb "$KEYFILE"
  echo "Created $KEYFILE"
else
  echo "Keyfile already exists"
fi

cp -a "$CONF" "${CONF}.bak.auth.$(date +%Y%m%d%H%M%S)"

python3 - <<'PY'
from pathlib import Path
path = Path("/etc/mongod.conf")
text = path.read_text()
if "authorization:" in text or "keyFile:" in text:
    print("security section already present — leave as is")
else:
    text = text.rstrip() + "\n\nsecurity:\n  authorization: enabled\n  keyFile: /etc/mongo-keyfile\n"
    path.write_text(text)
    print("Enabled security.authorization + keyFile")
PY

systemctl restart mongod
sleep 3
systemctl --no-pager is-active mongod

URI="mongodb://${USER_NAME}:${PASS}@127.0.0.1:27017/${DB_NAME}?replicaSet=rs0&authSource=admin"

mongosh --quiet "$URI" --eval 'db.runCommand({ ping: 1 })'

echo
echo "===== SAVE THIS (server/.env MONGO_URI) ====="
echo "$URI"
echo "===== END ====="
echo "Also store password separately. Do not paste URI into public chats."
