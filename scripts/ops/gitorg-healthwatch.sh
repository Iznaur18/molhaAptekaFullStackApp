#!/usr/bin/env bash
# Проверки прод-сервера Gitorg, которые должны работать, даже когда Node лежит.
# Запускается systemd-таймером gitorg-healthwatch.timer раз в 2 минуты.
#
# Алерт уходит при первом срабатывании, дальше повторяется раз в REPEAT_MIN
# минут, пока проблема не исчезнет; при восстановлении приходит «восстановлено».
# Без TELEGRAM_BOT_TOKEN/TELEGRAM_CHAT_ID сообщения печатаются в stdout (journalctl).
#
# Настройки: /etc/gitorg-alerts.conf (пример — scripts/ops/gitorg-alerts.conf.example).

set -uo pipefail

CONF="${GITORG_ALERTS_CONF:-/etc/gitorg-alerts.conf}"
if [ -r "$CONF" ]; then
  # shellcheck source=/dev/null
  . "$CONF"
fi

STATE_DIR="${STATE_DIR:-/var/lib/gitorg-healthwatch}"
REPEAT_MIN="${REPEAT_MIN:-60}"
UNITS="${UNITS:-gitorg-api gitorg-worker mongod nginx redis-server}"
DISK_PATHS="${DISK_PATHS:-/ /var/lib/mongodb}"
DISK_WARN_PCT="${DISK_WARN_PCT:-80}"
DISK_CRIT_PCT="${DISK_CRIT_PCT:-90}"
HEALTH_URL="${HEALTH_URL:-http://127.0.0.1:4444/health}"
HEARTBEAT_UNIT="${HEARTBEAT_UNIT:-gitorg-worker}"
HEARTBEAT_MAX_MIN="${HEARTBEAT_MAX_MIN:-15}"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/gitorg-mongo}"
BACKUP_MAX_AGE_H="${BACKUP_MAX_AGE_H:-26}"
CERT_FILES="${CERT_FILES:-/etc/letsencrypt/live/gitorg.ru/fullchain.pem}"
CERT_MIN_DAYS="${CERT_MIN_DAYS:-14}"
MONGO_HELLO_URI="${MONGO_HELLO_URI:-}"

HOST_LABEL="${HOST_LABEL:-$(hostname)}"
NOW="$(date +%s)"

mkdir -p "$STATE_DIR"

send() {
  local text="$1"
  if [ -z "${TELEGRAM_BOT_TOKEN:-}" ] || [ -z "${TELEGRAM_CHAT_ID:-}" ]; then
    echo "$text"
    return 0
  fi
  if ! curl -fsS -m 10 -o /dev/null \
    "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
    --data-urlencode "chat_id=${TELEGRAM_CHAT_ID}" \
    --data-urlencode "text=${text}" \
    --data-urlencode "disable_web_page_preview=true"; then
    echo "healthwatch: telegram delivery failed: ${text}" >&2
  fi
}

# fail KEY crit|warn MESSAGE
fail() {
  local key="$1" severity="$2" message="$3"
  local state_file="${STATE_DIR}/${key}"
  if [ -f "$state_file" ]; then
    local last_sent
    last_sent="$(cat "$state_file" 2>/dev/null || echo 0)"
    if [ $((NOW - last_sent)) -lt $((REPEAT_MIN * 60)) ]; then
      return 0
    fi
  fi
  echo "$NOW" > "$state_file"
  local icon="🟠 Важно"
  if [ "$severity" = "crit" ]; then
    icon="🔴 Критично"
  fi
  send "${icon} · ${HOST_LABEL}
${message}"
}

# ok KEY MESSAGE — снимает тревогу, если она была
ok() {
  local key="$1" message="$2"
  local state_file="${STATE_DIR}/${key}"
  if [ -f "$state_file" ]; then
    rm -f "$state_file"
    send "🟢 Восстановлено · ${HOST_LABEL}
${message}"
  fi
}

check_units() {
  command -v systemctl >/dev/null 2>&1 || return 0
  local unit
  for unit in $UNITS; do
    if ! systemctl list-unit-files "${unit}.service" --no-legend 2>/dev/null | grep -q .; then
      continue
    fi
    if systemctl is-active --quiet "$unit"; then
      ok "unit_${unit}" "служба ${unit} работает"
    else
      fail "unit_${unit}" crit "Служба ${unit} не работает.
Смотреть: journalctl -u ${unit} -n 100"
    fi

    # Перезапуски после падения: сам unit снова active, но процесс падал.
    local restarts restarts_file previous
    restarts="$(systemctl show -p NRestarts --value "$unit" 2>/dev/null || echo 0)"
    restarts_file="${STATE_DIR}/restarts_${unit}"
    previous="$(cat "$restarts_file" 2>/dev/null || echo "$restarts")"
    echo "$restarts" > "$restarts_file"
    if [ "${restarts:-0}" -gt "${previous:-0}" ] 2>/dev/null; then
      send "🟠 Важно · ${HOST_LABEL}
Служба ${unit} перезапускалась после падения: $((restarts - previous)) раз с прошлой проверки.
Смотреть: journalctl -u ${unit} -n 200"
    fi
  done
}

check_disk() {
  local mount_path used
  for mount_path in $DISK_PATHS; do
    [ -e "$mount_path" ] || continue
    used="$(df --output=pcent "$mount_path" 2>/dev/null | tail -n 1 | tr -dc '0-9')"
    [ -n "$used" ] || continue
    local key="disk_$(echo "$mount_path" | tr '/' '_')"
    if [ "$used" -ge "$DISK_CRIT_PCT" ]; then
      fail "$key" crit "Диск ${mount_path} заполнен на ${used}%. При 100% упадут загрузки и база."
    elif [ "$used" -ge "$DISK_WARN_PCT" ]; then
      fail "$key" warn "Диск ${mount_path} заполнен на ${used}%."
    else
      ok "$key" "диск ${mount_path} — ${used}%"
    fi
  done
}

check_health() {
  local body
  body="$(curl -fsS -m 5 "$HEALTH_URL" 2>/dev/null || true)"
  if printf '%s' "$body" | grep -q '"status":"ok"'; then
    ok "health" "API отвечает на /health"
  else
    fail "health" crit "API не отвечает на ${HEALTH_URL} или отвечает degraded (база или хранилище файлов).
Ответ: ${body:-нет ответа}"
  fi
}

check_worker_heartbeat() {
  command -v systemctl >/dev/null 2>&1 || return 0
  systemctl is-active --quiet "$HEARTBEAT_UNIT" || return 0

  # Сразу после старта пульса ещё может не быть.
  local since_raw since_epoch
  since_raw="$(systemctl show -p ActiveEnterTimestamp --value "$HEARTBEAT_UNIT" 2>/dev/null)"
  since_epoch="$(date -d "$since_raw" +%s 2>/dev/null || echo 0)"
  if [ $((NOW - since_epoch)) -lt $((HEARTBEAT_MAX_MIN * 60)) ]; then
    return 0
  fi

  if journalctl -u "$HEARTBEAT_UNIT" --since "-${HEARTBEAT_MAX_MIN} min" -o cat 2>/dev/null \
    | grep -q '"event":"worker.heartbeat"'; then
    ok "heartbeat" "воркер снова присылает пульс"
  else
    fail "heartbeat" crit "Воркер ${HEARTBEAT_UNIT} запущен, но не присылал пульс ${HEARTBEAT_MAX_MIN} минут: фоновые задачи (разморозка денег, импорт 1С) могут стоять."
  fi
}

check_backup() {
  [ -d "$BACKUP_DIR" ] || {
    fail "backup" warn "Нет каталога бэкапов ${BACKUP_DIR}."
    return 0
  }
  local newest newest_epoch
  newest="$(ls -1t "$BACKUP_DIR" 2>/dev/null | head -n 1)"
  if [ -z "$newest" ]; then
    fail "backup" warn "В ${BACKUP_DIR} нет ни одного бэкапа."
    return 0
  fi
  newest_epoch="$(stat -c %Y "${BACKUP_DIR}/${newest}")"
  local age_h=$(((NOW - newest_epoch) / 3600))
  if [ "$age_h" -ge "$BACKUP_MAX_AGE_H" ]; then
    fail "backup" warn "Последний бэкап Mongo сделан ${age_h} ч назад (${newest}).
Смотреть: /var/log/gitorg-mongo-backup.log"
  else
    ok "backup" "свежий бэкап Mongo: ${newest}"
  fi
}

check_certs() {
  local cert
  for cert in $CERT_FILES; do
    [ -r "$cert" ] || continue
    local key="cert_$(echo "$cert" | tr '/.' '__')"
    if openssl x509 -checkend $((CERT_MIN_DAYS * 86400)) -noout -in "$cert" >/dev/null 2>&1; then
      ok "$key" "сертификат ${cert} продлён"
    else
      fail "$key" warn "Сертификат ${cert} истекает меньше чем через ${CERT_MIN_DAYS} дней.
Проверить: certbot renew --dry-run"
    fi
  done
}

check_mongo_primary() {
  [ -n "$MONGO_HELLO_URI" ] || return 0
  command -v mongosh >/dev/null 2>&1 || return 0
  local primary
  primary="$(timeout 10 mongosh --quiet "$MONGO_HELLO_URI" --eval 'db.hello().isWritablePrimary' 2>/dev/null | tail -n 1)"
  if [ "$primary" = "true" ]; then
    ok "mongo_primary" "у реплики rs0 есть PRIMARY"
  else
    fail "mongo_primary" crit "У реплики rs0 нет PRIMARY: запись в базу невозможна."
  fi
}

check_units
check_disk
check_health
check_worker_heartbeat
check_backup
check_certs
check_mongo_primary

exit 0
