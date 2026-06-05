# Наблюдаемость API

## Request ID

- Middleware: `requestIdMW` (первый после `trust proxy` в `createApp.js`).
- Заголовок: `X-Request-Id`.
- Клиент может передать свой id (`8–64` символов, `[a-zA-Z0-9._-]`); иначе сервер выдаёт UUID.
- Ответ: тот же заголовок + поле `requestId` в JSON ошибок (`errorRes`).

CORS: `exposedHeaders: ['X-Request-Id']` — браузер может прочитать заголовок.

## JSON-логи ошибок

`errorHandler` → `logServerHttpError` → одна строка JSON в stderr/stdout:

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

Не логируются: body, cookies, `Authorization`, паспорт (см. `pii-passport-handling.md`).

## Поиск в логах

```bash
journalctl -u izibuy-api | jq 'select(.requestId=="…")'
```

## Sentry

Опционально при `SENTRY_DSN` / `VITE_SENTRY_DSN`. См. `docs/SENTRY.md`.

## Runbook

`docs/RUNBOOK.md` — бэкап/restore Mongo, rollback deploy, инциденты.

## Дальше (todo)

- Access-логи успешных запросов (опционально)
