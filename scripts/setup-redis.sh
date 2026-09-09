#!/usr/bin/env bash
#
# Разовая настройка Redis на проде. Всё остальное — юнит второго инстанса API,
# upstream в nginx, роллинг-рестарт — делает scripts/deploy-prod.sh на каждом
# выкате. Здесь этого НЕТ намеренно: юнит, заведённый отдельным скриптом,
# разъезжается с репозиторием и тихо протухает (так и вышло 09.09.2026).
#
# Зачем Redis. Без REDIS_URL `getAppQueue()` отдаёт null, и
# `enqueueOneCImportJob` / `enqueueProductBulkImport` уходят в фолбэк
# `setImmediate(...)` — разбор каталога 1С на 4114 позиций крутится ВНУТРИ
# процесса gitorg-api, в одном event loop с запросами пользователей, пока
# gitorg-worker простаивает на кроне. Consumer'ы очереди стартуют только в
# worker.js, поэтому одного REDIS_URL достаточно, чтобы API перестал молоть
# каталог сам.
#
# Запускать НА СЕРВЕРЕ из-под root, один раз:
#   scp scripts/setup-redis.sh root@135.106.146.218:/root/
#   ssh root@135.106.146.218 'bash /root/setup-redis.sh'
#
# Идемпотентен. ПРЕДВАРИТЕЛЬНО нужен пакет (apt из агента режется):
#   apt-get update && apt-get install -y redis-server

set -Eeuo pipefail

ENV_FILE="/var/www/gitorg/server/.env"
REDIS_CONF="/etc/redis/redis.conf"
REDIS_URL_VALUE="redis://127.0.0.1:6379"
TS="$(date +%Y%m%d-%H%M%S)"

log() { printf '==> %s\n' "$*"; }

if ! command -v redis-server >/dev/null 2>&1; then
  echo "redis-server не установлен. Сначала:" >&2
  echo "  apt-get update && apt-get install -y redis-server" >&2
  exit 1
fi

if [ ! -f "$ENV_FILE" ]; then
  echo "нет $ENV_FILE — не тот сервер?" >&2
  exit 1
fi

log "[1/3] redis: только localhost, noeviction"
cp -L "$REDIS_CONF" "$REDIS_CONF.bak-$TS"

# BullMQ обязан работать с noeviction: выселение ключей под нагрузкой означает
# молча потерянные задачи, а не замедление. 256 МБ очереди хватает с запасом —
# на VPS всего 3.9 ГБ, отдавать больше нечему.
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

log "[2/3] REDIS_URL в server/.env"
cp -L "$ENV_FILE" "$ENV_FILE.bak-$TS"

if grep -qE '^\s*REDIS_URL=' "$ENV_FILE"; then
  echo "    уже задан, не трогаю"
elif grep -qE '^\s*#\s*REDIS_URL=' "$ENV_FILE"; then
  # В файле лежит закомментированный образец — меняем именно его, чтобы не
  # плодить вторую строку с тем же ключом.
  sed -i -E "s|^\s*#\s*REDIS_URL=.*$|REDIS_URL=$REDIS_URL_VALUE|" "$ENV_FILE"
  echo "    REDIS_URL=$REDIS_URL_VALUE"
else
  printf '\nREDIS_URL=%s\n' "$REDIS_URL_VALUE" >> "$ENV_FILE"
  echo "    REDIS_URL=$REDIS_URL_VALUE"
fi
chown www-data:www-data "$ENV_FILE"
chmod 600 "$ENV_FILE"

log "[3/3] проверки"
echo -n "    redis:     "; redis-cli ping
echo -n "    policy:    "; redis-cli config get maxmemory-policy | tail -1

echo
echo "Готово. Дальше — обычный выкат: bash scripts/deploy-prod.sh."
echo "Он поднимет второй инстанс API и перезапустит воркер; после этого"
echo "journalctl -u gitorg-worker должен показывать \"mode\":\"bullmq\"."
