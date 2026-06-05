# SMTP для подтверждения email

Код: `server/utils/smtpMail.js` + `deliverEmailVerification` в `emailVerification.js`.

Минимум в `server/.env`:

```env
SMTP_HOST=...
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
SMTP_FROM=noreply@your-domain.ru
```

Проверка после заполнения:

```bash
cd server
npm run test:smtp -- your-real@email.com
```

Перезапусти `npm run start:dev` после изменения `.env`.

---

## Вариант A — Mailtrap (удобно для dev)

1. [mailtrap.io](https://mailtrap.io) → бесплатный аккаунт → **Email Testing** → Inbox → **SMTP Settings**
2. В `.env`:

```env
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=587
SMTP_USER=<из Mailtrap>
SMTP_PASS=<из Mailtrap>
SMTP_FROM=noreply@izibuy.local
```

Письма не уходят в реальный inbox — смотри в веб-интерфейсе Mailtrap.

---

## Вариант B — Yandex

1. [id.yandex.ru](https://id.yandex.ru) → Безопасность → **Пароли приложений** → создать «Почта»
2. В `.env`:

```env
SMTP_HOST=smtp.yandex.ru
SMTP_PORT=465
SMTP_USER=your@yandex.ru
SMTP_PASS=<пароль приложения, не основной пароль>
SMTP_FROM=your@yandex.ru
```

Порт **587** тоже ок (`SMTP_PORT=587`).

---

## Вариант C — Gmail

1. Google Account → 2FA включена → **App passwords**
2. В `.env`:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=<16-char app password>
SMTP_FROM=your@gmail.com
```

---

## Ошибки

| Симптом                                              | Что проверить                                    |
| ---------------------------------------------------- | ------------------------------------------------ |
| `Invalid login`                                      | пароль приложения, не обычный пароль             |
| Письмо в spam                                        | нормально для dev; `SMTP_FROM` = тот же ящик     |
| Всё ещё лог `[email-verify]` без «Письмо отправлено» | перезапуск сервера, все 3 поля HOST/USER/PASS    |
| `self signed certificate`                            | только dev: `SMTP_TLS_REJECT_UNAUTHORIZED=false` |
