# SMTP для подтверждения email

Код: `server/utils/smtpMail.js` + `deliverEmailVerification` в `emailVerification.js`.  
OTP UI уже есть (регистрация / gate / смена email). Нужен только рабочий SMTP.

Минимум в `server/.env` (на **VPS**, не коммитьте секреты):

```env
SMTP_HOST=...
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
SMTP_FROM=noreply@your-domain.ru
# опционально: SMTP_SECURE=true|false  (иначе: 465/1127 → TLS, остальное → STARTTLS)
```

Проверка после заполнения:

```bash
cd server
npm run test:smtp -- your-real@email.com
```

Перезапусти API после изменения `.env`.

---

## Вариант A — Selectel Email Service (рекомендуется на VPS Selectel)

Документация: [подключение](https://docs.selectel.ru/email-service/connect-email-service/).

**Ограничение:** отправка только с серверов в инфраструктуре Selectel. Локальный ПК → не подойдёт (для dev — Mailtrap / Yandex).

### Чеклист в панели Selectel

1. Продукты → **Почтовый сервис** → создать ресурс.
2. TXT: ключ проверки владения доменом.
3. Привязать домен к ресурсу (до 3 доменов).
4. TXT DKIM: `selcloud._domainkey.<domain>`.
5. TXT DMARC: `_dmarc.<domain>` → `v=DMARC1; p=quarantine;`.
6. TXT SPF: `v=spf1 include:spf.mail.selcloud.ru ?all`  
   (если SPF уже есть — добавьте `include:spf.mail.selcloud.ru` в существующую запись).
7. На вкладке ресурса скопировать **логин/пароль** SMTP.

DNS может расходиться до 72 ч; обычно быстрее.

### `.env` на VPS

```env
SMTP_HOST=smtp.mail.selcloud.ru
SMTP_PORT=1127
SMTP_USER=<логин из панели ресурса>
SMTP_PASS=<пароль из панели ресурса>
SMTP_FROM=noreply@your-domain.ru
```

- Порт **1127** — TLS (как 465). В коде уже `secure: true`.
- Порт **1126** — STARTTLS (`SMTP_PORT=1126`, без `SMTP_SECURE`).
- `SMTP_FROM` — любой ящик на привязанном домене (ящик может не существовать как mailbox; важны DNS + ресурс).

Лимит: ~100 писем / 5 мин на ресурс.

### Smoke

```bash
cd /path/to/server
npm run test:smtp -- you@yandex.ru
```

Дальше: регистрация / resend / смена email в UI — код в письме.

---

## Вариант B — Mailtrap (удобно для dev на ПК)

1. [mailtrap.io](https://mailtrap.io) → **Email Testing** → Inbox → **SMTP Settings**
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

## Вариант C — Yandex

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

## Вариант D — Gmail

1. Google Account → 2FA → **App passwords**
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

| Симптом | Что проверить |
| --- | --- |
| `Invalid login` / 535 | логин/пароль ресурса Selectel или пароль приложения |
| `501 from domain not trusted` | домен не привязан / DNS ещё не ок |
| `450 ratelimit exceeded` | лимит Selectel 100 / 5 мин — подождать |
| `550 bounced check filter` | адрес в стоп-листе Selectel |
| Письмо в spam | SPF/DKIM/DMARC; `SMTP_FROM` на привязанном домене |
| Лог `[email-verify]` без «Письмо отправлено» | нет `SMTP_HOST`+`USER`+`PASS`, перезапуск процесса |
| `self signed certificate` | только dev: `SMTP_TLS_REJECT_UNAUTHORIZED=false` |
| TLS handshake fail на 1127 | не ставьте `SMTP_SECURE=false`; порт должен быть 1127 |
