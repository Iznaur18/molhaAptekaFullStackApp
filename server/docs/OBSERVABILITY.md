# Наблюдаемость API

## Куда смотреть

| Канал | Назначение |
| ----- | ---------- |
| stdout/stderr → journald | источник истины ops-логов на VPS |
| Sentry (`SENTRY_DSN`) | только 5xx / uncaught / UI crash |
| Loki / Grafana Cloud / Yandex Logging | ship из journald (см. [`docs/deploy/LOGGING-CENTRAL.md`](../../docs/deploy/LOGGING-CENTRAL.md)) |

```bash
journalctl -u izibuy-api -f
journalctl -u izibuy-worker -f
journalctl -u izibuy-api | jq 'select(.event=="http.access")'
journalctl -u izibuy-api | jq 'select(.requestId=="…")'
journalctl -u izibuy-worker | jq 'select(.event=="worker.heartbeat")'
```

## Access-логи (`http.access`)

Middleware `accessLogMW` (сразу после `requestIdMW`).

| Поле | Описание |
| ---- | -------- |
| `event` | `http.access` |
| `requestId` | корреляция |
| `method` / `path` | без query string |
| `statusCode` | итоговый HTTP |
| `latencyMs` | до `res.finish` |
| `sampled` | `true` если попал по sample rate; `false` для status ≥ 400 (всегда) |

Env `ACCESS_LOG_SAMPLE_RATE` (0..1):

| Значение | Поведение |
| -------- | --------- |
| unset | production `0.1`, development `1`, test `0` |
| `0` | выкл |
| `1` | все (кроме skip-путей) |
| `0.1` | 10% успешных; 4xx/5xx всегда |

Skip: `/health`, `/uploads/*`. Body/cookies/Authorization не пишутся.

## Контракт JSON-лога (`logServerEvent`)

Одна строка JSON:

| Поле | Обязательность | Описание |
| ---- | -------------- | -------- |
| `level` | да | `debug` \| `info` \| `warn` \| `error` \| `fatal` |
| `time` | да | ISO timestamp |
| `event` | да | `namespace.snake_case` (новые/тронутые пути) |
| `requestId` \| `jobId` \| `workerId` | на request/job path | корреляция |
| `message` / `stack` | по необходимости | текст ошибки |

Уровни:

| Level | Когда |
| ----- | ----- |
| `info` | бизнес/lifecycle факт (start, heartbeat, credited…) |
| `warn` | degraded / fallback / 4xx |
| `error` | failed side-effect / 5xx / job fail |
| `fatal` | process death path (`uncaughtException`, env invalid, listen fail) |
| `debug` | зарезервирован (пока почти не используется) |

Namespaces (новые события): `api.`, `worker.`, `cron.`, `bullmq.`, `mongo.`, `onec.`, `process.`, `http.` (legacy: `http_error` без точки — не ломаем).

PII: `scrubLogFieldsPii` маскирует `email` / `phone` / `password` / `token` / `authorization` / … перед записью. Не логировать body, cookies, паспорт.

## Request ID

- Middleware: `requestIdMW` (первый после `trust proxy` в `createApp.js`).
- Заголовок: `X-Request-Id`.
- Клиент может передать свой id (`8–64` символов, `[a-zA-Z0-9._-]`); иначе сервер выдаёт UUID.
- Ответ: тот же заголовок + поле `requestId` в JSON ошибок (`errorRes`).

CORS: `exposedHeaders: ['X-Request-Id']` — браузер может прочитать заголовок.

**Backlog (отдельный PR):** ~~client/mobile прокидывают `X-Request-Id` на исходящие API-запросы.~~ ✅ `@izibuy/shared-api` → `createJsonApiClient` шлёт `X-Request-Id`; auth/money/5xx → Sentry breadcrumb с тем же id.

## JSON-логи HTTP-ошибок

`errorHandler` → `logServerHttpError` → одна строка JSON:

| Поле        | Описание                          |
| ----------- | --------------------------------- |
| `level`     | `error` (5xx), `warn` (4xx)       |
| `time`      | ISO timestamp                     |
| `event`     | `http_error`                      |
| `requestId` | корреляция                        |
| `statusCode`| HTTP после классификации          |
| `method`    | GET, POST, …                      |
| `path`      | `originalUrl`                     |
| `ip`        | с учётом `trust proxy`            |
| `message`   | текст ошибки                      |
| `stack`     | 5xx всегда; 4xx в non-production  |

## Sentry

Опционально при `SENTRY_DSN` / `VITE_SENTRY_DSN`. См. `docs/SENTRY.md`. JSON-лог остаётся источником истины на VPS; Sentry — агрегация 5xx.

## Runbook

`docs/RUNBOOK.md` — бэкап/restore Mongo, rollback deploy, инциденты.

## P0 checklist (server logging)

- [x] Runtime (api/worker/cron/bullmq/mongo-read/onec) → `logServerEvent`, не свободный `console.*`
- [x] `event` snake_case + namespace на тронутых путях; gradual для старых call sites
- [x] Redaction (`scrubLogFieldsPii`) + `formatLogError`
- [x] Корреляция: `requestId` на HTTP; `jobId`/`job` на BullMQ fail
- [x] Client/mobile: прокидка `X-Request-Id` (`@izibuy/shared-api` + Sentry breadcrumb на auth/money/5xx)
- [x] Access-логи успешных запросов (`http.access`, `ACCESS_LOG_SAMPLE_RATE`)
- [x] Ship journald → Loki/Yandex (док + Alloy example: `docs/deploy/LOGGING-CENTRAL.md`)
