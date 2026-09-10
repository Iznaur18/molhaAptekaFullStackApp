#!/usr/bin/env bash
#
# Локальный дамп Mongo с ротацией. Запускается таймером
# gitorg-mongo-backup.timer, который заводит scripts/deploy-prod.sh.
#
# ЧЕГО ЭТОТ БЭКАП НЕ ДЕЛАЕТ: он лежит на ТОМ ЖЕ диске той же VPS. Он спасает
# от кривой миграции, случайного удаления и порчи данных приложением — это
# самые частые беды. От потери самой машины или порчи файловой системы он не
# спасает: для этого дамп нужно увозить в объектное хранилище. Считать эту
# настройку полноценным бэкапом нельзя.
#
# Почему без --oplog: он требует дампа всего инстанса, а MONGO_URI указывает
# на конкретную базу. Точечная несогласованность между коллекциями теоретически
# возможна, но данных здесь 16 МБ и дамп снимается быстрее секунды.

set -Eeuo pipefail

ENV_FILE="${MONGO_BACKUP_ENV_FILE:-/var/www/gitorg/server/.env}"
BACKUP_DIR="${MONGO_BACKUP_DIR:-/var/backups/mongo}"
KEEP="${MONGO_BACKUP_KEEP:-14}"
# Не начинаем дамп, если на диске меньше этого — бэкап не должен стать
# причиной падения сайта. Диск на этой VPS узкий: 20 ГБ на всё.
MIN_FREE_MB="${MONGO_BACKUP_MIN_FREE_MB:-1024}"
# Пустой архив mongodump всё равно создаёт, поэтому подозрительно маленький
# файл считаем неудачей, а не бэкапом.
MIN_ARCHIVE_BYTES="${MONGO_BACKUP_MIN_ARCHIVE_BYTES:-10240}"

log() { printf '[mongo-backup] %s\n' "$*"; }
fail() { printf '[mongo-backup] ОШИБКА: %s\n' "$*" >&2; exit 1; }

[ -f "$ENV_FILE" ] || fail "нет $ENV_FILE"
command -v mongodump >/dev/null 2>&1 || fail "mongodump не установлен"

# URI читаем из .env и никуда не печатаем: в нём логин и пароль.
MONGO_URI="$(grep -oP '^MONGO_URI=\K.*' "$ENV_FILE" || true)"
[ -n "$MONGO_URI" ] || fail "MONGO_URI не найден в $ENV_FILE"

free_mb="$(df -Pm "$(dirname "$BACKUP_DIR")" | awk 'NR==2 {print $4}')"
if [ "$free_mb" -lt "$MIN_FREE_MB" ]; then
  fail "на диске всего ${free_mb} МБ (нужно ${MIN_FREE_MB}) — дамп не делаем"
fi

mkdir -p "$BACKUP_DIR"
# В дампе все персональные данные — доступ только root.
chmod 700 "$BACKUP_DIR"

ts="$(date -u +%Y%m%d-%H%M%S)"
final="$BACKUP_DIR/mongo-$ts.archive.gz"
tmp="$final.partial"

cleanup_tmp() { rm -f "$tmp"; }
trap cleanup_tmp EXIT

log "снимаю дамп → $(basename "$final")"
# Пишем во временный файл и переименовываем: оборванный дамп не должен
# выглядеть готовым снимком и не должен участвовать в ротации.
if ! mongodump --uri="$MONGO_URI" --gzip --archive="$tmp" --quiet; then
  fail "mongodump завершился с ошибкой"
fi

size="$(stat -c %s "$tmp")"
if [ "$size" -lt "$MIN_ARCHIVE_BYTES" ]; then
  fail "архив подозрительно мал (${size} байт) — считаю дамп неудачным"
fi

mv "$tmp" "$final"
trap - EXIT
chmod 600 "$final"
log "готово: $(numfmt --to=iec "$size" 2>/dev/null || echo "${size} байт")"

# Ротация: оставляем KEEP самых свежих. Считаем только готовые архивы —
# .partial сюда не попадают по маске.
mapfile -t all < <(ls -1t "$BACKUP_DIR"/mongo-*.archive.gz 2>/dev/null || true)
if [ "${#all[@]}" -gt "$KEEP" ]; then
  for old in "${all[@]:$KEEP}"; do
    rm -f "$old"
    log "удалён старый снимок: $(basename "$old")"
  done
fi

log "снимков в $BACKUP_DIR: $(ls -1 "$BACKUP_DIR"/mongo-*.archive.gz 2>/dev/null | wc -l), занято $(du -sh "$BACKUP_DIR" | cut -f1)"
