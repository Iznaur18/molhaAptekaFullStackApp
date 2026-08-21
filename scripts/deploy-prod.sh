#!/usr/bin/env bash
#
# Деплой Gitorg на прод (https://gitorg.ru) одной командой.
#
# Запускать НА ПК (Windows: Git Bash), из корня репозитория:
#     bash scripts/deploy-prod.sh
#
# Что делает:
#   1. git push origin main (код уезжает на GitHub)
#   2. собирает client ЛОКАЛЬНО (VPS слабый по RAM — не собираем там)
#   3. заливает готовый client/dist на сервер (замена целиком)
#   4. на сервере: git pull + deps (contract, shared-lib, server) +
#      миграции + рестарт gitorg-api / gitorg-worker
#   5. проверяет https://gitorg.ru/health
#
# Требуется: рабочий SSH-доступ к серверу по ключу (root@VPS).
# Подробности процесса — docs/deploy/SHPARGALKA-SERVER.md §4–§5.
#
set -euo pipefail

SERVER="root@135.106.146.218"
REMOTE_DIR="/var/www/gitorg"
HEALTH_URL="https://gitorg.ru/health"

# Корень репо (скрипт лежит в scripts/), чтобы можно было звать откуда угодно.
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

echo "==> [1/5] git push origin main"
git push origin main

echo "==> [2/5] сборка client локально"
( cd client && npm ci --prefer-offline --no-audit --fund=false && npm run build )

echo "==> [3/5] серверная часть: git pull + deps + миграции + рестарт"
ssh "$SERVER" bash -se <<REMOTE
  set -euo pipefail
  cd "$REMOTE_DIR"
  git pull origin main
  ( cd contract && npm ci )
  ( cd packages/shared-lib && npm install --ignore-scripts && npx tsc -p tsconfig.json )
  ( cd server && npm ci --ignore-scripts && npm rebuild bcrypt && npm run migrate:apply )
  systemctl restart gitorg-api gitorg-worker
REMOTE

echo "==> [4/5] заливка свежего client/dist на сервер"
tar czf - -C client/dist . | ssh "$SERVER" bash -se <<REMOTE
  set -euo pipefail
  rm -rf "$REMOTE_DIR/client/dist"
  mkdir -p "$REMOTE_DIR/client/dist"
  tar xzf - -C "$REMOTE_DIR/client/dist"
REMOTE

echo "==> [5/5] health-check"
curl -fsS "$HEALTH_URL" && echo
echo
echo "✅ Готово. Открой https://gitorg.ru и обнови Ctrl+F5."
