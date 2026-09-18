#!/usr/bin/env bash
# Установка healthwatch и алертов о падении служб на прод-сервер.
# Повторный запуск безопасен: файлы перезаписываются, конфиг с токеном не трогается.
#
#   sudo bash scripts/ops/install-healthwatch.sh
#
# После установки впишите токен и чат в /etc/gitorg-alerts.conf и проверьте:
#   sudo systemctl start gitorg-healthwatch.service && journalctl -u gitorg-healthwatch -n 20

set -euo pipefail

if [ "$(id -u)" -ne 0 ]; then
  echo "Запустите от root: sudo bash $0" >&2
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ALERT_UNITS="${ALERT_UNITS:-gitorg-api gitorg-worker}"

install -m 755 "${SCRIPT_DIR}/gitorg-healthwatch.sh" /usr/local/bin/gitorg-healthwatch
install -m 755 "${SCRIPT_DIR}/gitorg-alert-unit-failed.sh" /usr/local/bin/gitorg-alert-unit-failed

install -m 644 "${SCRIPT_DIR}/systemd/gitorg-healthwatch.service" /etc/systemd/system/gitorg-healthwatch.service
install -m 644 "${SCRIPT_DIR}/systemd/gitorg-healthwatch.timer" /etc/systemd/system/gitorg-healthwatch.timer
install -m 644 "${SCRIPT_DIR}/systemd/gitorg-alert@.service" /etc/systemd/system/gitorg-alert@.service

for unit in $ALERT_UNITS; do
  install -d -m 755 "/etc/systemd/system/${unit}.service.d"
  install -m 644 "${SCRIPT_DIR}/systemd/10-gitorg-alert.conf" \
    "/etc/systemd/system/${unit}.service.d/10-gitorg-alert.conf"
done

if [ ! -f /etc/gitorg-alerts.conf ]; then
  install -m 600 "${SCRIPT_DIR}/gitorg-alerts.conf.example" /etc/gitorg-alerts.conf
  echo "Создан /etc/gitorg-alerts.conf — впишите TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_ID."
else
  chmod 600 /etc/gitorg-alerts.conf
fi

install -d -m 700 /var/lib/gitorg-healthwatch

systemctl daemon-reload
systemctl enable --now gitorg-healthwatch.timer

echo "Готово. Таймер:"
systemctl list-timers gitorg-healthwatch.timer --no-pager
