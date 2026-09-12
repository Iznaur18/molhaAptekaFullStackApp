#!/usr/bin/env bash
set -euo pipefail

SERVER="${SERVER:-root@135.106.146.218}"
REMOTE_DIR="${REMOTE_DIR:-/var/www/gitorg}"
HEALTH_URL="${HEALTH_URL:-https://gitorg.ru/health}"
DEPLOY_REF="${DEPLOY_REF:-feat/seller-trust-order-cancel-email-auth}"

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

LOCAL_SHA="$(git rev-parse "${DEPLOY_REF}")"
echo "==> deploy ${DEPLOY_REF} @ ${LOCAL_SHA} -> ${SERVER}:${REMOTE_DIR}"

echo "==> [1/4] fetch branch on VPS"
ssh -o BatchMode=yes -o ConnectTimeout=30 "${SERVER}" bash -s <<EOF
set -euo pipefail
cd "${REMOTE_DIR}"
echo "prod before: \$(git rev-parse --short HEAD)"
git fetch origin "${DEPLOY_REF}"
# прошлые scp оставляли dirty/untracked — мешают checkout
git reset --hard HEAD
git clean -fd -- \
  server/scripts/cleanupOneCProductsWithoutImagesAndStock.js \
  server/scripts/tmpInspectNoImageProduct.js \
  server/services/onec/cleanupOneCProductsWithoutImagesAndStock.js \
  server/services/product/myProductsOneCVisibility.js \
  server/services/product/myProductsListFilter.js \
  || true
git checkout -B "${DEPLOY_REF}" "origin/${DEPLOY_REF}"
git reset --hard "${LOCAL_SHA}"
echo "prod after:  \$(git rev-parse --short HEAD) \$(git log -1 --oneline)"
EOF

echo "==> [2/4] npm ci + migrate + client build"
ssh -o BatchMode=yes -o ConnectTimeout=30 "${SERVER}" bash -s <<EOF
set -euo pipefail
cd "${REMOTE_DIR}/contract" && npm ci
cd "${REMOTE_DIR}/server" && npm ci && npm run migrate:apply
cd "${REMOTE_DIR}/client" && npm ci && npm run build
EOF

echo "==> [3/4] restart services"
ssh -o BatchMode=yes -o ConnectTimeout=30 "${SERVER}" bash -s <<'EOF'
set -euo pipefail
systemctl restart gitorg-api
if systemctl list-unit-files --type=service | grep -q '^gitorg-worker'; then
  systemctl restart gitorg-worker || true
fi
nginx -t
systemctl reload nginx
systemctl is-active gitorg-api
EOF

echo "==> [4/4] health"
sleep 2
curl -fsS "${HEALTH_URL}"
echo
echo "==> done"
