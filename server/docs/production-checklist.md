# Production checklist

## Обязательно перед деплоем

| Переменная | Зачем |
|------------|--------|
| `NODE_ENV=production` | Secure cookie, скрытие деталей ошибок |
| `JWT_SECRET` | `crypto.randomBytes(32).toString('hex')` |
| `MONGO_URI` | Atlas / replica set (**обязателен для транзакций**) |
| `FRONTEND_URL` | CORS + redirect после verify email |

## MongoDB

- **Replica set** — без него MongoDB transactions (баллы заказа) не работают
- Регулярные бэкапы (Atlas continuous backup или `mongodump` cron)
- Индексы: `npm run migrate:apply` после деплоя

## Проверки после деплоя

1. `GET /health` → `{ status: "ok", mongo: "connected" }`
2. Login → cookie `access_token` (httpOnly, Secure)
3. Logout → `/auth/me` → 401
4. Register → ссылка verify в логах/SMTP
5. Заказ без verify email → 403

## Безопасность

- Не логировать passport, password, JWT
- `FRONTEND_URL` — один origin, без `*`
- Rate limits включены (см. `rateLimitMW.js`)
- Uploads: лимит размера, проверка MIME

## Мониторинг (рекомендация v2)

- Sentry / аналог для 5xx
- Uptime ping на `/health`
- Алерт при `mongo: disconnected`

## SMTP (email verify v2)

```env
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=noreply@example.com
```

Пока SMTP не настроен — ссылка verify в server console (`[email-verify]`).
