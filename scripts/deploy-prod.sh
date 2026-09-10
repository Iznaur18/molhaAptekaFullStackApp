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
#   6. проверяет https://gitorg.ru/health и что nginx знает все API-префиксы
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

  # ── Второй инстанс API: приводим к нужному состоянию на КАЖДОМ выкате ──
  #
  # Зачем он вообще: "systemctl restart gitorg-api" оставляет ~4 с, когда на
  # 4444 никто не слушает. 08.09.2026 в 02:15:35 в это окно попал живой
  # пользователь и увидел 502. Два бэкенда + рестарт по очереди убирают окно:
  # nginx уводит запрос на живой по своему дефолтному proxy_next_upstream,
  # отдельная директива не нужна.
  #
  # Почему провижн живёт ЗДЕСЬ, а не в отдельном скрипте: юнит, заведённый
  # однажды руками, разъезжается с репозиторием и тихо протухает — так и
  # вышло 09.09.2026. Теперь файл юнита пишется из этого скрипта каждый раз,
  # поэтому он не может быть старее выката.
  #
  # ВНИМАНИЕ: heredoc REMOTE не закавычен (он нарочно подставляет \$REMOTE_DIR
  # локально), поэтому всё, что должно раскрыться НА СЕРВЕРЕ, экранируется:
  # \\\$1, \\\$(seq …). Без этого локальный set -u падает на «\$1: unbound
  # variable» ещё до ssh, и шаг [4/6] не выполняется вовсе.
  wait_api_health() {
    for _ in \$(seq 1 30); do
      if curl -fsS -m 3 "http://127.0.0.1:\$1/health" >/dev/null 2>&1; then return 0; fi
      sleep 1
    done
    echo "API на порту \$1 не поднялся за 30 с" >&2
    return 1
  }

  # Снять второй инстанс и вернуться к заведомо рабочей схеме с одним
  # бэкендом. Вызывается, когда инстанс не поднялся: лучше честно остаться на
  # одном, чем оставить в upstream мёртвый порт и юнит во flapping'е.
  disable_api2() {
    systemctl disable --now gitorg-api2 >/dev/null 2>&1 || true
    if grep -q "127.0.0.1:4445" /etc/nginx/sites-available/gitorg; then
      sed -i "/127\.0\.0\.1:4445/d" /etc/nginx/sites-available/gitorg
      # Через if: «nginx -t && reload» последней командой функции вернул бы
      # ненулевой код и под errexit уронил бы весь выкат.
      if nginx -t >/dev/null 2>&1; then systemctl reload nginx; fi
    fi
    echo "ВНИМАНИЕ: gitorg-api2 не поднялся — отключён, работаем на одном инстансе" >&2
  }

  # Юнит пишем всегда: так он гарантированно свежий.
  # PORT задаём В КОМАНДЕ, а не через Environment=: systemd применяет
  # EnvironmentFile ПОСЛЕ Environment=, и PORT=4444 из server/.env перебивал
  # бы его — инстанс лез на занятый порт и падал с EADDRINUSE.
  # StartLimit* — в [Unit]: в systemd 229+ в [Service] эти ключи игнорируются,
  # и без них systemd крутил рестарт вечно (за раз накрутило 103 попытки).
  cat > /etc/systemd/system/gitorg-api2.service <<'UNIT'
# Второй инстанс Gitorg API. Файл генерирует scripts/deploy-prod.sh —
# править руками бесполезно, следующий выкат перезапишет.
[Unit]
Description=Gitorg Express API (instance 2)
After=network.target redis-server.service
StartLimitIntervalSec=60
StartLimitBurst=5

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=/var/www/gitorg/server
EnvironmentFile=/var/www/gitorg/server/.env
Environment=CRON_LEADER=false
Environment=NODE_ENV=production
ExecStart=/usr/bin/env PORT=4445 /usr/bin/node index.js
Restart=on-failure
RestartSec=5
LimitNOFILE=65535

[Install]
WantedBy=multi-user.target
UNIT
  systemctl daemon-reload

  # Второй бэкенд в upstream — идемпотентно.
  if ! grep -q "127.0.0.1:4445" /etc/nginx/sites-available/gitorg; then
    sed -i -E "s|^(\\s*)server 127\\.0\\.0\\.1:4444;|\\1server 127.0.0.1:4444;\\n\\1server 127.0.0.1:4445;|" /etc/nginx/sites-available/gitorg
    if ! nginx -t >/dev/null 2>&1; then
      sed -i "/127\\.0\\.0\\.1:4445/d" /etc/nginx/sites-available/gitorg
      echo "ВНИМАНИЕ: nginx -t не прошёл, второй бэкенд не добавлен" >&2
    fi
  fi

  # Перечитываем ВСЕГДА, а не только когда сами правили файл. Строка в конфиге
  # не значит, что её загрузил работающий nginx: 09.09.2026 4445 попал в файл
  # от прошлого запуска, ветка «уже есть» reload пропускала, и рабочие процессы
  # неделю держали конфиг с одним бэкендом — балансировки не было вовсе, хотя
  # по файлу всё выглядело правильно. Reload дешёвый и graceful, делать его
  # каждый выкат нормально.
  #
  # Пишем через if, а не «nginx -t && systemctl reload»: под errexit падение
  # левой части такого списка роняет весь выкат.
  if nginx -t >/dev/null 2>&1; then
    systemctl reload nginx
  else
    echo "ВНИМАНИЕ: nginx -t не прошёл, конфиг НЕ перечитан" >&2
  fi

  # Рестарт по очереди: пока перезапускается один, трафик держит другой.
  systemctl enable gitorg-api2 >/dev/null 2>&1 || true
  systemctl restart gitorg-api2
  if wait_api_health 4445; then
    systemctl restart gitorg-api
    if ! wait_api_health 4444; then
      echo "gitorg-api не поднялся" >&2
      exit 1
    fi
  else
    # Второй инстанс не блокер выката: деплой обязан дойти до заливки
    # client/dist, иначе фронтенд останется старым (09.09.2026 так и вышло).
    disable_api2
    systemctl restart gitorg-api
    wait_api_health 4444
  fi

  systemctl restart gitorg-worker

  # ── Ежедневный дамп Mongo с ротацией ──
  #
  # Юниты пишем на каждом выкате по той же причине, что и gitorg-api2: то, что
  # заведено руками один раз, разъезжается с репозиторием и тихо протухает.
  # Сам скрипт лежит в репозитории и запускается прямо оттуда, поэтому всегда
  # соответствует выкаченному коду.
  #
  # ВАЖНО: это дамп на ТОТ ЖЕ диск той же машины. Спасает от кривой миграции и
  # случайного удаления, но не от потери VPS — для этого нужно увозить архивы
  # в объектное хранилище.
  cat > /etc/systemd/system/gitorg-mongo-backup.service <<'UNIT'
# Файл генерирует scripts/deploy-prod.sh — править руками бесполезно.
[Unit]
Description=Gitorg: дамп MongoDB с ротацией
After=network.target mongod.service

[Service]
Type=oneshot
ExecStart=/bin/bash /var/www/gitorg/scripts/backup-mongo.sh
# Дамп содержит все персональные данные, поэтому только root.
User=root
Nice=10
IOSchedulingClass=idle
UNIT

  cat > /etc/systemd/system/gitorg-mongo-backup.timer <<'UNIT'
# Файл генерирует scripts/deploy-prod.sh — править руками бесполезно.
[Unit]
Description=Ежедневный дамп MongoDB

[Timer]
OnCalendar=*-*-* 03:30:00
# Разброс, чтобы дамп не совпадал с часовым обменом 1С в :26.
RandomizedDelaySec=600
# Пропущенный запуск (машина была выключена) догоняем.
Persistent=true

[Install]
WantedBy=timers.target
UNIT

  systemctl daemon-reload
  systemctl enable --now gitorg-mongo-backup.timer >/dev/null 2>&1 || true
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
# gitorg-api поднимается ~4 с (Mongo + индексы до bind:4444), и одиночный curl
# сразу после рестарта стабильно ловил 502. Хуже, что деплой этого не замечал:
# в `curl … && echo` сам curl выведен из-под errexit — он не последний в
# &&-списке, — и скрипт печатал «Готово» с кодом 0 поверх лежащего прода.
# Ретраим до 20 с и падаем явно.
HEALTH_BODY=""
for attempt in $(seq 1 40); do
  if HEALTH_BODY="$(curl -fsS -m 5 "$HEALTH_URL" 2>/dev/null)"; then
    echo "    здоров с попытки $attempt: $HEALTH_BODY"
    break
  fi
  sleep 0.5
done
if [ -z "$HEALTH_BODY" ]; then
  echo "ОШИБКА: $HEALTH_URL не ответил за 20 с после рестарта." >&2
  echo "Смотри: ssh $SERVER 'journalctl -u gitorg-api -n 50 --no-pager'" >&2
  echo "Откат клиента: на сервере в $REMOTE_DIR/client лежат снимки dist.prev-*" >&2
  exit 1
fi


# Сверка боевого nginx со списком API-префиксов.
#
# Конфиг nginx этот скрипт не выкатывает — его правят на сервере руками, и он
# отстаёт молча. Забытый блок не роняет сайт: GET уходит в раздачу SPA и
# возвращает HTML с кодом 200, остальные методы — 405. Так «Доставка и оплата»
# продавца жила сломанной, пока кто-то не полез в devtools.
#
# Деплой из-за этого не валим: код уже на месте и работает, а чинить надо
# конфиг. Но говорим об этом громко и меняем финальную строку.
NGINX_OK=1
if ! ssh "$SERVER" 'cat /etc/nginx/sites-enabled/gitorg' \
  | node server/scripts/checkNginxPrefixes.mjs; then
  NGINX_OK=0
fi

echo
if [ "$NGINX_OK" = 1 ]; then
  echo "✅ Готово. Открой https://gitorg.ru и обнови Ctrl+F5."
else
  echo "⚠️  Код выкачен и работает, но nginx на сервере отстал (см. выше)."
  echo "    Пока блока нет, эти ручки отвечают HTML вместо JSON."
  echo "    Образец: docs/deploy/nginx-izibuy.conf.example"
  echo "    На сервере: правь /etc/nginx/sites-available/gitorg (sites-enabled —"
  echo "    симлинк на него), бэкап делай cp -L, потом nginx -t && systemctl reload nginx."
fi
