#!/usr/bin/env bash
set -euo pipefail

ENV=/var/www/gitorg/server/.env
echo "=== SMTP ==="
grep -E '^SMTP_(HOST|PORT|USER|FROM)=' "$ENV" || true

echo "=== ENV CHECK ==="
python3 - <<'PY'
from pathlib import Path
import re
t = Path("/var/www/gitorg/server/.env").read_text()
need = [
    "JWT_SECRET",
    "JWT_ACCESS_SECRET",
    "JWT_REFRESH_SECRET",
    "PASSPORT_VAULT_KEK",
    "MONGO_URI",
    "FRONTEND_URL",
    "PUBLIC_UPLOAD_BASE_URL",
    "SMTP_HOST",
    "SMTP_USER",
    "SMTP_PASS",
]
bad = []
for k in need:
    m = re.search(rf"^{k}=(.*)$", t, re.M)
    v = (m.group(1).strip() if m else "")
    ok = bool(v) and not v.startswith("REPLACE") and not v.startswith("CHANGE")
    if k == "MONGO_URI":
        ok = ok and v.startswith("mongodb://") and "replicaSet=rs0&authSource=admin" in v
    if k == "SMTP_USER":
        ok = ok and "@" in v
    print(f"{k}: {'OK' if ok else 'BAD'}")
    if not ok:
        bad.append(k)
# JWT distinct
vals = []
for k in ("JWT_SECRET", "JWT_ACCESS_SECRET", "JWT_REFRESH_SECRET"):
    m = re.search(rf"^{k}=(.*)$", t, re.M)
    vals.append(m.group(1).strip() if m else "")
if len(set(vals)) < 3 or any(not x for x in vals):
    print("JWT_DISTINCT: BAD")
    bad.append("JWT_DISTINCT")
else:
    print("JWT_DISTINCT: OK")
open("/tmp/env_bad_count", "w").write(str(len(bad)))
PY

echo "=== MONGO ==="
systemctl is-active mongod || true
mongosh --quiet --eval 'db.adminCommand({ ping: 1 }).ok' 2>/dev/null || echo "mongo_ping_fail"

echo "=== NODE ==="
node -v
npm -v

echo "=== DONE_PROBE ==="
cat /tmp/env_bad_count
