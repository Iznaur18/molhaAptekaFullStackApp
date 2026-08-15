#!/usr/bin/env bash
# Enable single-node replica set rs0 on local mongod (no auth yet).
# Prerequisites: mongod installed and running, GPG/repo already done.
set -euo pipefail

CONF=/etc/mongod.conf

if [[ ! -f "$CONF" ]]; then
  echo "Missing $CONF"
  exit 1
fi

cp -a "$CONF" "${CONF}.bak.$(date +%Y%m%d%H%M%S)"

python3 - <<'PY'
from pathlib import Path
path = Path("/etc/mongod.conf")
text = path.read_text()
if "replSetName" in text:
    print("replSetName already present")
else:
    if "\nreplication:" in text or text.startswith("replication:"):
        raise SystemExit("replication section exists but replSetName missing — edit manually")
    text = text.rstrip() + "\n\nreplication:\n  replSetName: rs0\n"
    path.write_text(text)
    print("Added replication.replSetName: rs0")
PY

# Keep Mongo local-only
python3 - <<'PY'
from pathlib import Path
import re
path = Path("/etc/mongod.conf")
text = path.read_text()
text2, n = re.subn(r"(?m)^( *bindIp:\s*).*$", r"\g<1>127.0.0.1", text, count=1)
if n:
    path.write_text(text2)
    print("bindIp -> 127.0.0.1")
else:
    print("bindIp line not found (check manually)")
PY

systemctl restart mongod
sleep 2
systemctl --no-pager is-active mongod

mongosh --quiet --eval 'try { quit(rs.status().ok === 1 ? 0 : 1) } catch (e) { quit(2) }' && {
  echo "Replica set already OK"
  exit 0
} || true

mongosh --eval 'rs.initiate({_id:"rs0", members:[{_id:0, host:"127.0.0.1:27017"}]})'
sleep 3
mongosh --quiet --eval 'print(rs.status().ok)'
echo "OK: rs0 initiated. Next: create DB user + enable auth (DEPLOY.md §1.4–1.5)."
