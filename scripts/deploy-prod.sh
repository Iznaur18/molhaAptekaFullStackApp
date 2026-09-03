#!/usr/bin/env bash
#
# Деплой Gitorg на прод (https://gitorg.ru) одной командой.
#
# Запускать НА ПК (Windows: Git Bash), из корня репозитория:
#     bash scripts/deploy-prod.sh
#
# Что делает:
#   1. git push <ветка>:main (код уезжает на GitHub)
#   2. собирает client ЛОКАЛЬНО (VPS слабый по RAM — не собираем там)
#   3. везёт код на сервер пакетом git bundle (с VPS GitHub недоступен)
#   4. на сервере: ff-only merge на нужный SHA + deps (contract, shared-lib,
#      server) + миграции + права на uploads + рестарт gitorg-api / gitorg-worker
#   5. заливает готовый client/dist на сервер (старые ассеты сохраняются)
#   6. проверяет https://gitorg.ru/health
#
# Катим main. Чтобы выкатить ветку, не переключаясь на неё:
#     DEPLOY_REF=fix/моя-ветка bash scripts/deploy-prod.sh
#
# Требуется: рабочий SSH-доступ к серверу по ключу (root@VPS).
# Подробности процесса — docs/deploy/SHPARGALKA-SERVER.md §4–§5.
#
set -euo pipefail

SERVER="root@135.106.146.218"
REMOTE_DIR="/var/www/gitorg"
HEALTH_URL="https://gitorg.ru/health"
REMOTE_BUNDLE="/tmp/gitorg-deploy.bundle"
DEPLOY_REF="${DEPLOY_REF:-main}"

# Корень репо (скрипт лежит в scripts/), чтобы можно было звать откуда угодно.
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

LOCAL_SHA="$(git rev-parse "$DEPLOY_REF")"

echo "==> [1/6] git push origin $DEPLOY_REF:main"
git push origin "$DEPLOY_REF:main"

echo "==> [2/6] сборка client локально"
# Ставим из КОРНЯ, а не из client/. У client есть свой package-lock.json, и
# `cd client && npm ci` выглядит законно, но client объявлен воркспейсом
# корневого package.json: npm 7+ поднимается до корня, ограничивает установку
# одним воркспейсом и выметает корневые devDependencies — следом падает
# корневой postinstall, потому что сам patch-package он только что и удалил.
# Установка обрывается, client/node_modules остаётся пустой.
npm ci --prefer-offline --no-audit --fund=false
npm run build --workspace=client

echo "==> [3/6] доставка кода на сервер пакетом (git bundle)"
# На VPS нет доступа к GitHub: учётных данных не заведено, и `git pull` уходит
# в интерактивный запрос логина — деплой вешался прямо здесь. Поэтому код
# везём пакетом от текущего прод-коммита до нашего.
#
# Заодно это пиннинг на конкретный SHA вместо слепого pull: в main пишут
# параллельно, и утащить на прод чужое непроверенное не хочется.
PROD_SHA="$(ssh "$SERVER" "rm -f '$REMOTE_BUNDLE'; git -C '$REMOTE_DIR' rev-parse HEAD")"
if [ "$PROD_SHA" = "$LOCAL_SHA" ]; then
  echo "    прод уже на $LOCAL_SHA — код не везём"
else
  if ! git merge-base --is-ancestor "$PROD_SHA" "$LOCAL_SHA" 2>/dev/null; then
    echo "ОШИБКА: прод стоит на $PROD_SHA — это не предок $LOCAL_SHA" >&2
    echo "(или коммита нет локально). Fast-forward невозможен: похоже, на прод" >&2
    echo "катили мимо этого скрипта. Разберись вручную, деплой остановлен." >&2
    exit 1
  fi
  BUNDLE="$(mktemp)"
  git bundle create "$BUNDLE" "$PROD_SHA..$DEPLOY_REF"
  scp "$BUNDLE" "$SERVER:$REMOTE_BUNDLE"
  rm -f "$BUNDLE"
  echo "    $PROD_SHA -> $LOCAL_SHA"
fi

echo "==> [4/6] серверная часть: код + deps + миграции + права + рестарт"
ssh "$SERVER" bash -se <<REMOTE
  set -euo pipefail
  cd "$REMOTE_DIR"
  # package-lock.json на проде всегда дрейфует ("peer": true от прошлых
  # npm install) и блокирует merge — сбрасываем.
  git checkout -- package-lock.json 2>/dev/null || true
  if [ -f "$REMOTE_BUNDLE" ]; then
    git bundle verify "$REMOTE_BUNDLE"
    git fetch "$REMOTE_BUNDLE" "refs/heads/*:refs/remotes/deploybundle/*"
    git merge --ff-only $LOCAL_SHA
    rm -f "$REMOTE_BUNDLE"
  fi
  git --no-pager log --oneline -1
  ( cd contract && npm ci )
  ( cd packages/shared-lib && npm install --ignore-scripts && npx tsc -p tsconfig.json )
  ( cd server && npm ci --ignore-scripts && npm rebuild bcrypt && npm run migrate:apply )
  # Заливки файлов с ПК сбивают владельца каталога на виндовый UID
  # (197610:197121), и сервис под www-data перестаёт писать в uploads: любая
  # загрузка медиа отдаёт 500 EACCES — фото товаров, аватары, истории. Так
  # сломалось 02.09.2026 и вскрылось только через сутки, когда пожаловались
  # на истории. Дешевле переутверждать права на каждом деплое, чем ловить
  # это по логам ещё раз. private/ закрыт наглухо: там паспортные сканы.
  chown -R www-data:www-data server/uploads
  chmod 755 server/uploads
  if [ -d server/uploads/private ]; then chmod 700 server/uploads/private; fi
  systemctl restart gitorg-api gitorg-worker
REMOTE

echo "==> [5/6] заливка свежего client/dist на сервер"
# Скрипт передаём АРГУМЕНТОМ, а не heredoc'ом на stdin: stdin здесь занят
# потоком tar. При `ssh … bash -se <<REMOTE` heredoc перебивал пайп — tar
# локально падал в broken pipe, а удалённый `tar xzf -` вычитывал со stdin
# остаток самого heredoc и ругался «not in gzip format». Шаг не работал
# никогда, поэтому выкаты и делались руками.
#
# $REMOTE_DIR подставляется здесь, \$ts и \$(date) остаются серверу.
UPLOAD_DIST_SCRIPT=$(cat <<REMOTE
set -euo pipefail
cd "$REMOTE_DIR/client"
rm -rf dist.new
mkdir -p dist.new
tar xzf - -C dist.new
# Старые хешированные ассеты переносим в новый каталог: у части посетителей
# в кеше висит прошлый index.html, и без своих файлов он падает в белый
# экран (на iOS Safari — стабильно). Новые файлы не перезаписываем.
if [ -d dist/assets ]; then cp -rn dist/assets/. dist.new/assets/ 2>/dev/null || true; fi
ts=\$(date +%Y%m%d-%H%M%S)
mv dist "dist.prev-\$ts"
mv dist.new dist
# Держим два последних снимка для отката, старьё убираем.
ls -1dt dist.prev-* 2>/dev/null | tail -n +3 | xargs -r rm -rf
REMOTE
)
tar czf - -C client/dist . | ssh "$SERVER" "$UPLOAD_DIST_SCRIPT"

echo "==> [6/6] health-check"
curl -fsS "$HEALTH_URL" && echo
echo
echo "✅ Готово. Открой https://gitorg.ru и обнови Ctrl+F5."
