#!/usr/bin/env bash
# Первичная установка конфига nginx для gitorg.ru из шаблона репозитория.
#
# ВНИМАНИЕ. Шаблон — только http-заготовка: HTTPS в боевой конфиг добавляет
# certbot прямо в файл. Поэтому перезапуск этого скрипта поверх настроенного
# сервера СТИРАЕТ весь ssl-блок, и сайт остаётся доступен лишь по http.
# Именно так 03.09.2026 gitorg.ru лёг на несколько часов.
#
# Скрипт для ПЕРВОЙ установки. Если конфиг уже с сертификатом — он
# останавливается. Осознанно перезаписать: FORCE_OVERWRITE_SSL=1.
set -euo pipefail

SITE="/etc/nginx/sites-available/gitorg"
TEMPLATE="/var/www/gitorg/docs/deploy/nginx-izibuy.conf.example"

if [[ -f "${SITE}" ]] && grep -q "ssl_certificate" "${SITE}"; then
  if [[ "${FORCE_OVERWRITE_SSL:-}" != "1" ]]; then
    cat >&2 <<'MSG'
ОТКАЗ: в текущем конфиге есть ssl_certificate — шаблон его затрёт, и HTTPS пропадёт.

Что нужно почти всегда вместо этого:
  * добавить новый location руками в /etc/nginx/sites-available/gitorg;
  * список обязательных API-префиксов: docs/deploy/nginx-api-prefixes.txt.

Если перезапись действительно нужна, то после неё сразу верните сертификат:
  FORCE_OVERWRITE_SSL=1 bash docs/deploy/scripts/setup-nginx-gitorg.sh
  certbot install --cert-name gitorg.ru --nginx --non-interactive
MSG
    exit 1
  fi
  echo "FORCE_OVERWRITE_SSL=1 — перезаписываю конфиг вместе с ssl-блоком"
fi

if [[ -f "${SITE}" ]]; then
  BACKUP="/root/nginx-backups/gitorg.bak-$(date +%Y%m%d-%H%M%S)"
  mkdir -p /root/nginx-backups
  cp "${SITE}" "${BACKUP}"
  echo "копия прежнего конфига: ${BACKUP}"
fi

python3 - "${TEMPLATE}" "${SITE}" <<'PY'
import sys
from pathlib import Path

template, site = sys.argv[1], sys.argv[2]
src = Path(template).read_text()
src = src.replace("/var/www/izibuy", "/var/www/gitorg")
src = src.replace("izibuy_api", "gitorg_api")
Path(site).write_text(src)
print("шаблон записан в", site)
PY

ln -sfn "${SITE}" /etc/nginx/sites-enabled/gitorg
rm -f /etc/nginx/sites-enabled/default
mkdir -p /var/www/certbot
nginx -t
systemctl reload nginx
echo NGINX_OK

if [[ ! -d /etc/letsencrypt/live/gitorg.ru ]]; then
  echo "Сертификата ещё нет — дальше: bash docs/deploy/scripts/setup-ssl.sh <email>"
elif ! grep -q "ssl_certificate" "${SITE}"; then
  echo
  echo "ВАЖНО: сертификат в системе есть, а в конфиге его нет. Верните HTTPS:"
  echo "  certbot install --cert-name gitorg.ru --nginx --non-interactive"
  echo "  и допишите http2 в listen 443 — certbot ставит только 'listen 443 ssl;'"
fi
