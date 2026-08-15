#!/usr/bin/env bash
# Interactively set MONGO_URI in server/.env (avoids broken paste of special chars into nano).
set -euo pipefail

ENV_FILE="${1:-/var/www/gitorg/server/.env}"
if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing $ENV_FILE"
  exit 1
fi

echo "Paste full MONGO_URI line value ONLY (starts with mongodb://), then Enter:"
read -r URI
URI="$(echo -n "$URI" | tr -d '\r')"

if [[ "$URI" != mongodb://* ]]; then
  echo "ERROR: must start with mongodb://"
  exit 1
fi
if [[ "$URI" != *"replicaSet=rs0&authSource=admin" ]]; then
  echo "ERROR: must contain replicaSet=rs0&authSource=admin"
  exit 1
fi

cp -a "$ENV_FILE" "${ENV_FILE}.bak.$(date +%Y%m%d%H%M%S)"

python3 - "$ENV_FILE" "$URI" <<'PY'
import sys
from pathlib import Path
path = Path(sys.argv[1])
uri = sys.argv[2]
lines = path.read_text().splitlines()
out = []
replaced = False
for line in lines:
    if line.startswith("MONGO_URI="):
        out.append("MONGO_URI=" + uri)
        replaced = True
    else:
        out.append(line)
if not replaced:
    out.append("MONGO_URI=" + uri)
path.write_text("\n".join(out) + "\n")
print("Updated MONGO_URI in", path)
PY

echo "Check (password hidden):"
python3 - "$ENV_FILE" <<'PY'
from pathlib import Path
import re, sys
text = Path(sys.argv[1]).read_text()
for line in text.splitlines():
    if line.startswith("MONGO_URI="):
        print(re.sub(r"(mongodb://[^:]+:)[^@]+", r"\1***", line))
PY
