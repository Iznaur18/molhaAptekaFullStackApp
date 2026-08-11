# Централизованные логи (journald → Loki / Yandex)

Приложение **не** шлёт логи по HTTP. Источник: systemd → journald (JSON lines из `logServerEvent`).
Shipper на VPS копирует journal в store.

См. контракт: [`../../server/docs/OBSERVABILITY.md`](../../server/docs/OBSERVABILITY.md).

## Выбор бэкенда

| Вариант | Когда |
| ------- | ----- |
| **A. Grafana Alloy → Grafana Cloud Loki** (рекомендуется) | быстрый старт, без своего Loki |
| **B. Alloy → self-hosted Loki** | свой VPS/k8s, полный контроль |
| **C. Yandex Cloud Logging** | уже в Yandex Cloud / 152-ФЗ хостинг там |

Не делать: SDK CloudWatch/Datadog из Node; писать ops-логи в Mongo.

---

## A. Grafana Alloy → Grafana Cloud

### 1. Grafana Cloud

1. Создать stack (бесплатный tier ок для старта).
2. **Connections → Loki → Grafana Alloy** — скопировать:
   - `https://logs-prod-XXX.grafana.net/loki/api/v1/push`
   - user (instance id) + API token (`logs:write`).

### 2. Установка Alloy на VPS (Ubuntu)

```bash
sudo mkdir -p /etc/apt/keyrings
wget -q -O - https://apt.grafana.com/gpg.key | gpg --dearmor | sudo tee /etc/apt/keyrings/grafana.gpg > /dev/null
echo "deb [signed-by=/etc/apt/keyrings/grafana.gpg] https://apt.grafana.com stable main" | sudo tee /etc/apt/sources.list.d/grafana.list
sudo apt-get update
sudo apt-get install -y alloy
```

### 3. Конфиг

```bash
sudo cp /var/www/izibuy/docs/deploy/alloy-izibuy.alloy.example /etc/alloy/config.alloy
sudo nano /etc/alloy/config.alloy   # URL, user, password
sudo mkdir -p /etc/alloy
# секреты не в git:
sudo install -m 600 /dev/null /etc/alloy/loki.env
sudo tee /etc/alloy/loki.env >/dev/null <<'EOF'
LOKI_URL=https://logs-prod-XXX.grafana.net/loki/api/v1/push
LOKI_USERNAME=123456
LOKI_PASSWORD=glc_...
EOF
```

Подключить env к unit Alloy (drop-in):

```bash
sudo mkdir -p /etc/systemd/system/alloy.service.d
sudo tee /etc/systemd/system/alloy.service.d/loki.conf >/dev/null <<'EOF'
[Service]
EnvironmentFile=/etc/alloy/loki.env
EOF
sudo systemctl daemon-reload
sudo usermod -aG systemd-journal alloy   # читать journald
sudo systemctl enable --now alloy
sudo systemctl status alloy
```

Проверка: Grafana Explore → Loki → `{app="izibuy"}`.

### 4. Полезные LogQL

```logql
{app="izibuy", unit="izibuy-api.service"} |= `` | json | requestId = "e2e-correlation-id-99"
{app="izibuy"} | json | event = "http.access"
{app="izibuy"} | json | event = "http_error" | statusCode >= 500
{app="izibuy", unit="izibuy-worker.service"} | json | event = "worker.heartbeat"
{app="izibuy"} | json | level = "error"
```

---

## B. Self-hosted Loki

Тот же `alloy-izibuy.alloy.example`, `LOKI_URL=http://127.0.0.1:3100/loki/api/v1/push`, без basic auth (или свой).  
Loki+Grafana — отдельный compose/хост; не на том же маленьком VPS, что API, если диск/RAM впритык.

---

## C. Yandex Cloud Logging

1. Каталог → **Cloud Logging** → log group `izibuy-prod`.
2. Сервисный аккаунт с ролью `logging.writer`, ключ JSON на VPS (`chmod 600`).
3. Агент: [Yandex Unified Agent](https://yandex.cloud/ru/docs/logging/operations/ingest/unified-agent) или Fluent Bit → Yandex output.

Минимальный смысл для Fluent Bit (journald input):

```ini
[INPUT]
    Name            systemd
    Tag             izibuy.*
    Systemd_Filter  _SYSTEMD_UNIT=izibuy-api.service
    Systemd_Filter  _SYSTEMD_UNIT=izibuy-worker.service

[OUTPUT]
    Name            yc-logging
    Match           izibuy.*
    group_id        <log-group-id>
    resource_type   izibuy.host
    # auth via YC metadata или ключ SA
```

Точные поля output — по актуальной доке Yandex (плагин обновляется). JSON из `MESSAGE` парсить в Explore/запросах group.

---

## Чеклист на VPS

- [ ] `journalctl -u izibuy-api -n 5 -o cat` — видны JSON-строки
- [ ] Alloy/агент `active (running)`
- [ ] В UI: свежие строки с label `unit=izibuy-api.service`
- [ ] Запрос по `requestId` из error JSON / Sentry breadcrumb находит access + http_error
- [ ] Retention: Cloud free tier / Loki limits — не хранить PII дольше нужного (body и так не пишем)

## Алерты (минимум)

| Сигнал | Где |
| ------ | --- |
| Spike 5xx | Sentry (уже) + опционально LogQL rate `http_error` |
| Нет heartbeat worker > 15m | LogQL absence `event=worker.heartbeat` |
| Alloy down | systemd `OnFailure` / Grafana agent health |

---

## Антипаттерны

- Тянуть все journald без фильтра unit → шум ssh/cron ОС
- Высокий `ACCESS_LOG_SAMPLE_RATE=1` в prod + полный ship без retention plan
- Класть `LOKI_PASSWORD` в git / world-readable
