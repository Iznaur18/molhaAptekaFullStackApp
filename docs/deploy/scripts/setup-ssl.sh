#!/usr/bin/env bash
# Получение/проверка Let's Encrypt SSL для gitorg.ru через certbot + nginx.
# Запуск на VPS: ./docs/deploy/scripts/setup-ssl.sh [email]
set -euo pipefail

PRIMARY_DOMAIN="${GITORG_DOMAIN:-gitorg.ru}"
WWW_DOMAIN="www.${PRIMARY_DOMAIN}"
CERTBOT_EMAIL="${1:-}"
NGINX_SITE="/etc/nginx/sites-available/gitorg"
HEALTH_PATH="/health"

log() {
  printf '\n==> %s\n' "$1"
}

fail() {
  printf 'ERROR: %s\n' "$1" >&2
  exit 1
}

require_root_tools() {
  command -v certbot >/dev/null 2>&1 || fail "certbot не установлен: sudo apt install -y certbot python3-certbot-nginx"
  command -v nginx >/dev/null 2>&1 || fail "nginx не установлен"
  command -v curl >/dev/null 2>&1 || fail "curl не установлен"
}

check_nginx_site() {
  [[ -f "${NGINX_SITE}" ]] || fail "нет ${NGINX_SITE} — скопируй nginx-izibuy.conf.example (см. DEPLOY.md §5)"
  sudo nginx -t
}

check_dns() {
  log "Проверка DNS ${PRIMARY_DOMAIN}"
  local resolved
  resolved="$(dig +short "${PRIMARY_DOMAIN}" A 2>/dev/null | head -1 || true)"
  [[ -n "${resolved}" ]] || fail "нет A-записи для ${PRIMARY_DOMAIN} (dig пустой)"
  printf '  %s → %s\n' "${PRIMARY_DOMAIN}" "${resolved}"

  if command -v curl >/dev/null 2>&1; then
    local vps_ip
    vps_ip="$(curl -fsS --max-time 5 ifconfig.me 2>/dev/null || true)"
    if [[ -n "${vps_ip}" && "${resolved}" != "${vps_ip}" ]]; then
      printf '  WARN: IP VPS (%s) ≠ DNS (%s) — certbot может упасть\n' "${vps_ip}" "${resolved}"
    fi
  fi
}

check_http_before_ssl() {
  log "Проверка HTTP до certbot"
  local code
  code="$(curl -sS -o /dev/null -w '%{http_code}' --max-time 10 "http://${PRIMARY_DOMAIN}${HEALTH_PATH}" || echo "000")"
  [[ "${code}" == "200" || "${code}" == "301" || "${code}" == "302" ]] \
    || fail "http://${PRIMARY_DOMAIN}${HEALTH_PATH} → HTTP ${code} (нужен 200/301; подними nginx и API)"
  printf '  HTTP %s OK\n' "${code}"
}

run_certbot() {
  log "Запуск certbot --nginx"
  local -a args=(
    certbot
    --nginx
    -d "${PRIMARY_DOMAIN}"
    -d "${WWW_DOMAIN}"
    --agree-tos
    --no-eff-email
    --redirect
    --non-interactive
  )

  if [[ -n "${CERTBOT_EMAIL}" ]]; then
    args+=(--email "${CERTBOT_EMAIL}")
  else
    args+=(--register-unsafely-without-email)
    printf '  WARN: email не передан — для продакшена лучше: %s admin@example.ru\n' "$0"
  fi

  sudo "${args[@]}"
}

verify_https() {
  log "Проверка HTTPS"
  local code
  code="$(curl -sS -o /dev/null -w '%{http_code}' --max-time 15 "https://${PRIMARY_DOMAIN}${HEALTH_PATH}")"
  [[ "${code}" == "200" ]] || fail "https://${PRIMARY_DOMAIN}${HEALTH_PATH} → HTTP ${code}"
  printf '  HTTPS %s OK\n' "${code}"

  log "Редирект HTTP → HTTPS"
  local location
  location="$(curl -sSI --max-time 10 "http://${PRIMARY_DOMAIN}/" | awk -F': ' 'tolower($1)=="location"{print $2}' | tr -d '\r')"
  [[ "${location}" == https://* ]] || fail "нет редиректа на HTTPS (Location: ${location:-пусто})"
  printf '  Location: %s\n' "${location}"
}

verify_renewal() {
  log "Dry-run автопродления"
  sudo certbot renew --dry-run
  sudo systemctl is-active certbot.timer >/dev/null 2>&1 \
    && printf '  certbot.timer: active\n' \
    || printf '  WARN: certbot.timer не active — проверь: sudo systemctl enable --now certbot.timer\n'
}

main() {
  require_root_tools
  check_nginx_site
  check_dns
  check_http_before_ssl
  run_certbot
  sudo nginx -t
  sudo systemctl reload nginx
  verify_https
  verify_renewal
  log "Готово: https://${PRIMARY_DOMAIN}"
}

main "$@"
