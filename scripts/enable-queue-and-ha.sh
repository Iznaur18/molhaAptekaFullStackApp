#!/usr/bin/env bash
#
# Разовая настройка прода: очередь BullMQ + второй инстанс API.
#
# Зачем. Без REDIS_URL `getAppQueue()` отдаёт null, и `enqueueOneCImportJob` /
# `enqueueProductBulkImport` уходят в fallback `setImmediate(...)` — «фоновый»
# разбор каталога на 4114 позиций крутится ВНУТРИ процесса gitorg-api, в одном
# event loop со всеми запросами пользователей, а gitorg-worker в это время
# простаивает на одном кроне (`worker.heartbeat mode=cron-intervals`).
# С REDIS_URL задачи уходят в очередь, а consumer'ы стартуют только в worker.js
# (`startBullMqWorkers` больше нигде не вызывается) — API перестаёт молоть
# каталог сам.
#
# Второй инстанс — про 502 в момент рестарта. `systemctl restart gitorg-api`
# оставляет ~4 секунды, когда на 127.0.0.1:4444 никто не слушает, и nginx
# отдаёт 502 всем (08.09.2026 в 02:15:35 это поймал живой пользователь).
# Два бэкенда в upstream + рестарт по очереди убирают окно: nginx по своему
# дефолтному `proxy_next_upstream error timeout` уводит запрос на живой инстанс,
# отдельная директива для этого не нужна.
#
# Запускать НА СЕРВЕРЕ, из-под root, один раз:
#   scp scripts/enable-queue-and-ha.sh root@135.106.146.218:/root/
#   ssh root@135.106.146.218 'bash /root/enable-queue-and-ha.sh'
#
# Идемпотентен: повторный запуск ничего не ломает.
#
# ПРЕДВАРИТЕЛЬНО нужен redis-server (ставится отдельно, apt из агента режется):
#   apt-get update && apt-get install -y redis-server

set -Eeuo pipefail

APP_DIR="/var/www/gitorg"
ENV_FILE="$APP_DIR/server/.env"
NGINX_SITE="/etc/nginx/sites-available/gitorg"
API_PORT_PRIMARY=4444
API_PORT_SECONDARY=4445
REDIS_URL_VALUE="redis://127.0.0.1:6379"
TS="$(date +%Y%m%d-%H%M%S)"

log() { printf '==> %s\n' "$*"; }

# --- 0. предусловия -----------------------------------------------------------

if ! command -v redis-server >/dev/null 2>&1; then
  echo "redis-server не установлен. Сначала:" >&2
  echo "  apt-get update && apt-get install -y redis-server" >&2
  exit 1
fi

if [ ! -f "$ENV_FILE" ]; then
  echo "нет $ENV_FILE — не тот сервер?" >&2
  exit 1
fi

# --- 1. redis -----------------------------------------------------------------

log "[1/6] redis: слушает только localhost, noeviction"
REDIS_CONF="/etc/redis/redis.conf"
cp -L "$REDIS_CONF" "$REDIS_CONF.bak-$TS"

# BullMQ обязан работать с noeviction: выселение ключей под нагрузкой означает
# молча потерянные задачи, а не замедление. 256 МБ на очередь с запасом хватает
# (на VPS всего 3.9 ГБ, отдавать больше нечему).
python3 - "$REDIS_CONF" <<'PY'
import re, sys

path = sys.argv[1]
with open(path, encoding="utf-8") as fh:
    text = fh.read()

wanted = {
    "bind": "bind 127.0.0.1 -::1",
    "protected-mode": "protected-mode yes",
    "maxmemory": "maxmemory 256mb",
    "maxmemory-policy": "maxmemory-policy noeviction",
}

for key, line in wanted.items():
    pattern = re.compile(rf"^[#\s]*{re.escape(key)}\s+.*$", re.MULTILINE)
    if pattern.search(text):
        text = pattern.sub(line, text, count=1)
    else:
        text += f"\n{line}\n"

with open(path, "w", encoding="utf-8") as fh:
    fh.write(text)
PY

systemctl enable --now redis-server
systemctl restart redis-server
redis-cli ping

# --- 2. REDIS_URL в .env ------------------------------------------------------

log "[2/6] REDIS_URL в server/.env"
cp -L "$ENV_FILE" "$ENV_FILE.bak-$TS"

if grep -qE '^\s*REDIS_URL=' "$ENV_FILE"; then
  echo "    уже задан, не трогаю"
else
  # В файле лежит закомментированный образец `# REDIS_URL=rediss://…` — меняем
  # именно его, чтобы не плодить вторую строку с тем же ключом.
  if grep -qE '^\s*#\s*REDIS_URL=' "$ENV_FILE"; then
    sed -i -E "s|^\s*#\s*REDIS_URL=.*$|REDIS_URL=$REDIS_URL_VALUE|" "$ENV_FILE"
  else
    printf '\nREDIS_URL=%s\n' "$REDIS_URL_VALUE" >> "$ENV_FILE"
  fi
  echo "    REDIS_URL=$REDIS_URL_VALUE"
fi
chown www-data:www-data "$ENV_FILE"
chmod 600 "$ENV_FILE"

# --- 3. второй инстанс API ----------------------------------------------------

log "[3/6] systemd-юнит gitorg-api2 (порт $API_PORT_SECONDARY)"
# Копия gitorg-api с другим PORT. CRON_LEADER=false обязателен: cron-лидер —
# только worker.js, иначе плановые задачи выполнятся дважды.
cat > /etc/systemd/system/gitorg-api2.service <<UNIT
# Второй инстанс Gitorg API — чтобы рестарт не давал окно 502.
# Отличается от gitorg-api только портом. Создан scripts/enable-queue-and-ha.sh.
[Unit]
Description=Gitorg Express API (instance 2)
After=network.target redis-server.service

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=$APP_DIR/server
EnvironmentFile=$APP_DIR/server/.env
Environment=CRON_LEADER=false
Environment=NODE_ENV=production
Environment=PORT=$API_PORT_SECONDARY
ExecStart=/usr/bin/node index.js
Restart=on-failure
RestartSec=5
LimitNOFILE=65535

[Install]
WantedBy=multi-user.target
UNIT

systemctl daemon-reload
systemctl enable gitorg-api2

# --- 4. nginx upstream --------------------------------------------------------

log "[4/6] nginx: второй бэкенд в upstream gitorg_api"
# sites-enabled — симлинк, бэкап только через cp -L.
cp -L "$NGINX_SITE" "$NGINX_SITE.bak-$TS"

if grep -q "127.0.0.1:$API_PORT_SECONDARY" "$NGINX_SITE"; then
  echo "    уже в upstream, не трогаю"
else
  sed -i -E "s|^(\s*)server 127\.0\.0\.1:$API_PORT_PRIMARY;|\1server 127.0.0.1:$API_PORT_PRIMARY;\n\1server 127.0.0.1:$API_PORT_SECONDARY;|" "$NGINX_SITE"
fi

nginx -t

# --- 5. поднять всё по очереди ------------------------------------------------

wait_health() {
  local port="$1" name="$2"
  for _ in $(seq 1 30); do
    if curl -fsS -m 3 "http://127.0.0.1:$port/health" >/dev/null 2>&1; then
      echo "    $name: ok"
      return 0
    fi
    sleep 1
  done
  echo "    $name: НЕ поднялся за 30 с" >&2
  return 1
}

log "[5/6] роллинг-рестарт API + worker"
systemctl start gitorg-api2
wait_health "$API_PORT_SECONDARY" "gitorg-api2"

systemctl reload nginx

# Теперь трафик держит api2, можно перезапускать первый без окна.
systemctl restart gitorg-api
wait_health "$API_PORT_PRIMARY" "gitorg-api"

systemctl restart gitorg-worker

# --- 6. проверки --------------------------------------------------------------

log "[6/6] проверки"
echo -n "    redis:        "; redis-cli ping
echo -n "    maxmemory:    "; redis-cli config get maxmemory-policy | tail -1
echo -n "    api  (4444):  "; curl -fsS -m 5 "http://127.0.0.1:$API_PORT_PRIMARY/health" && echo
echo -n "    api2 (4445):  "; curl -fsS -m 5 "http://127.0.0.1:$API_PORT_SECONDARY/health" && echo
echo -n "    через nginx:  "; curl -fsS -m 5 "https://gitorg.ru/health" && echo

echo "    worker mode (ждём bullmq):"
sleep 3
journalctl -u gitorg-worker --since '-1 min' --no-pager -o cat | grep -oE '"mode":"[a-z-]+"' | tail -1 || true

echo
echo "Готово. Если worker пишет mode=cron-intervals, значит REDIS_URL до него"
echo "не доехал — проверь $ENV_FILE и systemctl show gitorg-worker -p Environment."
