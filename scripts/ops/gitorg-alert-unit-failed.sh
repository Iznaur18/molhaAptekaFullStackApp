#!/usr/bin/env bash
# Вызывается из gitorg-alert@.service, когда служба окончательно перешла в failed
# (OnFailure= в drop-in). Логи в сообщение не кладём: в них могут быть данные
# пользователей — только команда, где смотреть.

set -uo pipefail

UNIT="${1:-unknown}"
CONF="${GITORG_ALERTS_CONF:-/etc/gitorg-alerts.conf}"
if [ -r "$CONF" ]; then
  # shellcheck source=/dev/null
  . "$CONF"
fi

HOST_LABEL="${HOST_LABEL:-$(hostname)}"
TEXT="🔴 Критично · ${HOST_LABEL}
Служба ${UNIT} упала и не поднялась сама.
Смотреть: journalctl -u ${UNIT} -n 200
Поднять: systemctl restart ${UNIT}"

if [ -z "${TELEGRAM_BOT_TOKEN:-}" ] || [ -z "${TELEGRAM_CHAT_ID:-}" ]; then
  echo "$TEXT"
  exit 0
fi

curl -fsS -m 10 -o /dev/null \
  "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
  --data-urlencode "chat_id=${TELEGRAM_CHAT_ID}" \
  --data-urlencode "text=${TEXT}" || echo "alert delivery failed for ${UNIT}" >&2

exit 0
