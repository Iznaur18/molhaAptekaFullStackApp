# Molha Apteka / Izibuy — архитектура и деплой

Гайд: как устроен проект, почему в dev «всё работает само», и **какой вариант продакшена быстрее и надёжнее**.

См. также:

- nginx: [`docs/deploy/nginx-izibuy.conf.example`](../../docs/deploy/nginx-izibuy.conf.example)
- **деплой:** [`docs/deploy/DEPLOY.md`](../../docs/deploy/DEPLOY.md)
- runbook (бэкап, restore, rollback): [`server/docs/RUNBOOK.md`](RUNBOOK.md)
- Sentry: [`server/docs/SENTRY.md`](SENTRY.md)
- горизонталь (очередь, read replicas): [`server/docs/HORIZONTAL-SCALING.md`](HORIZONTAL-SCALING.md)

---

## 1. Что это за проект

Full-stack маркетплейс:

| Часть      | Технологии                      | Папка                      |
| ---------- | ------------------------------- | -------------------------- |
| **Клиент** | React + Vite (SPA)              | `client/`                  |
| **API**    | Express 5 + MongoDB (Mongoose)  | `server/`                  |
| **Медиа**  | multer → диск `server/uploads/` | раздача `GET /uploads/...` |

Фичи: каталог, корзина, заказы, модерация товаров, скидки, розыгрыши (фото/видео приза), профили, DaData-адреса, staff-модерация.

---

## 2. Структура репозитория

```
molhaAptekaFullStackApp/
├── client/          # фронт (npm run dev / npm run build)
├── server/          # API (npm run start:dev)
│   ├── index.js     # точка входа Express
│   ├── models/      # Mongoose-схемы
│   ├── controllers/ # бизнес-логика
│   ├── routes/      # маршруты
│   ├── validations/ # express-validator
│   ├── middlewares/ # JWT, rate limit, multer
│   ├── uploads/     # загруженные файлы (важно для прода!)
│   └── scripts/     # миграции БД
├── docs/deploy/     # пример nginx
└── client/docs/     # связка клиент ↔ сервер
```

**FSD на клиенте:** `entities/`, `pages/`, `widgets/`, `shared/`.

---

## 3. Как запрос проходит через систему

### 3.1. Development (локально)

```
Браузер → http://127.0.0.1:5173/auth/login
         ↓ Vite proxy (vite.config.js)
         → http://127.0.0.1:4444/auth/login
         ↓ Express
         → MongoDB
```

- Браузер думает, что API на **том же origin** (5173).
- **CORS не нужен.**
- Загрузки: `POST /upload` → ответ `/uploads/file.jpg` → браузер грузит `5173/uploads/...` → proxy на 4444. **Работает «магически».**

Проксируемые префиксы (`client/vite.config.js`):

`/auth`, `/cart`, `/user`, `/vote`, `/order`, `/product`, `/address`, `/uploads`, `/upload`

**Важно:** SPA-путь `/user-list` **не** проксируется на API — только `/user` и `/user/...` (см. `shouldProxyToApi` в vite.config.js).

### 3.2. Production

В prod **нет Vite proxy**. Рекомендуемый старт — **вариант A** (один VPS + nginx, один домен). Подробности — раздел 6.

---

## 4. Авторизация (httpOnly cookie + refresh)

1. `POST /auth/login` или `/auth/register` → httpOnly cookie `access_token` (1 ч) и `refresh_token` (30 д).
2. Клиент (`apiClient.js`): `withCredentials: true`, без `localStorage`.
3. При 401 → `POST /auth/refresh` → повтор запроса.
4. `checkAuthMW` проверяет access JWT (`JWT_SECRET`).

**Prod:** `JWT_SECRET` — длинная случайная строка; при cross-domain — `COOKIE_CROSS_SITE=true` + HTTPS.

Подробнее: `server/docs/auth-session.md`.

---

## 5. Загрузка файлов (критично для прода)

### 5.1. Эндпоинты

| Метод | Путь            | Поле    | Лимит                |
| ----- | --------------- | ------- | -------------------- |
| POST  | `/upload`       | `image` | 5 МБ (jpeg/png/webp) |
| POST  | `/upload/video` | `video` | 5 МБ (mp4/webm)      |

Оба требуют JWT.

### 5.2. Что сохраняется в БД

Сервер (`server/utils/buildPublicUploadUrl.js`):

- если задан **`PUBLIC_UPLOAD_BASE_URL`** → полный URL: `https://izibuy.ru/uploads/xxx.mp4`
- иначе → **относительный** путь: `/uploads/xxx.mp4`

Клиент (`client/src/shared/lib/resolveUploadedImageUrl.js`) для путей с `/` подставляет **`window.location.origin`** (origin **фронта**).

### 5.3. Почему в dev ок, а в prod может сломаться

| Среда                                                         | URL в БД                        | Кто отдаёт файл          |
| ------------------------------------------------------------- | ------------------------------- | ------------------------ |
| Dev + Vite proxy                                              | `/uploads/...`                  | proxy → Express ✅       |
| Prod, фронт и API **раздельно**, без `PUBLIC_UPLOAD_BASE_URL` | origin **фронта**/uploads/...   | CDN статики → **404** ❌ |
| **Вариант A:** один домен + nginx                             | `https://izibuy.ru/uploads/...` | nginx → Express ✅       |

### 5.4. Persistent storage

Файлы на **локальном диске** (`server/uploads/`). После redeploy без volume файлы **пропадают**.

Нужен persistent disk на VPS или позже object storage (S3/R2).

---

## 6. Варианты деплоя

### Вариант A — один VPS + nginx ⭐ рекомендуется

```
https://izibuy.ru/           → nginx → client/dist (статика SPA)
https://izibuy.ru/auth/...   → nginx → proxy → Node :4444
https://izibuy.ru/uploads/   → nginx → proxy → Node
```

**Плюсы:** один origin; `/uploads` без сюрпризов; быстрая статика; минимум CORS.

**Env (server/.env):**

```env
MONGO_URI=mongodb+srv://...
JWT_SECRET=<длинная случайная строка>
NODE_ENV=production
FRONTEND_URL=https://izibuy.ru
PUBLIC_UPLOAD_BASE_URL=https://izibuy.ru
PORT=4444
DADATA_API_KEY=...
DADATA_SECRET_KEY=...
```

**Клиент:** при сборке **`VITE_API_URL` не задавать** — запросы идут на `/auth/...` того же домена.

**Пример nginx:** [`docs/deploy/nginx-izibuy.conf.example`](docs/deploy/nginx-izibuy.conf.example)

---

### Вариант B — CDN (Vercel) + API на VPS

```env
# client/.env при build
VITE_API_URL=https://api.izibuy.ru

# server/.env
FRONTEND_URL=https://app.izibuy.ru
PUBLIC_UPLOAD_BASE_URL=https://api.izibuy.ru
```

**Плюсы:** CDN для JS/CSS. **Минусы:** два origin, обязательны CORS и `PUBLIC_UPLOAD_BASE_URL`.

---

### Вариант C — PaaS (Render/Railway)

Без persistent volume **uploads ненадёжны**. Для маркетплейса с медиа — слабый выбор без object storage.

---

### Сравнение

| Критерий         | A: VPS+nginx | B: CDN+API | C: PaaS |
| ---------------- | ------------ | ---------- | ------- |
| Скорость статики | ★★★★         | ★★★★★      | ★★★     |
| Upload/медиа     | ★★★★★        | ★★★★       | ★★      |
| Простота         | ★★★★         | ★★★        | ★★★★    |

---

## 7. Сборка и запуск prod (вариант A)

```bash
# 1. Миграции (один раз на prod БД)
cd server
npm run migrate:apply

# 2. API (pm2 или systemd)
cd server
NODE_ENV=production node index.js

# 3. Клиент
cd client
npm run build
# dist/ → /var/www/izibuy/client/dist (путь в nginx)
```

---

## 8. Smoke-test перед запуском

1. Login / register
2. Upload фото товара → открыть URL в новой вкладке
3. Upload видео розыгрыша (≤5 МБ) → превью на витрине
4. Создать заказ с адресом
5. Staff: модерация товара/розыгрыша

Если пункт 2–3 даёт 404 — проверь nginx `/uploads` и `PUBLIC_UPLOAD_BASE_URL`.

---

## 9. Nginx: вариант A (кратко)

Полный файл: **`docs/deploy/nginx-izibuy.conf.example`**.

Суть:

1. `client_max_body_size 6m` — видео/фото до 5 МБ.
2. API-префиксы проксируются на `127.0.0.1:4444`.
3. `/user` — только `^/user(/|$)`, **не** `/user-list` (SPA).
4. `/uploads` и `/upload` — **до** catch-all SPA.
5. `location /` → `try_files` + `index.html` для React Router.
6. Кеш для `/assets/*` (хеши Vite).

Установка (Ubuntu/Debian):

```bash
sudo cp docs/deploy/nginx-izibuy.conf.example /etc/nginx/sites-available/izibuy
# отредактируй server_name и root
sudo ln -s /etc/nginx/sites-available/izibuy /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

SSL: `certbot --nginx -d izibuy.ru -d www.izibuy.ru`

---

## 10. Переменные окружения (шпаргалка)

### Server

| Переменная               | Обязательно | Назначение                  |
| ------------------------ | ----------- | --------------------------- |
| `MONGO_URI`              | да          | MongoDB                     |
| `JWT_SECRET`             | да          | JWT                         |
| `NODE_ENV`               | prod        | `production`                |
| `FRONTEND_URL`           | да\*        | CORS (\*если другой origin) |
| `PUBLIC_UPLOAD_BASE_URL` | да\*\*      | полные URL uploads          |
| `PORT`                   | нет         | default 4444                |
| `DADATA_*`               | для адресов | DaData                      |

### Client (build)

| `VITE_API_URL` | Вариант A: не задавать. Вариант B: URL API. |

---

## 11. Розыгрыш: фото или видео

- `prizeMediaType`: `image` | `video`
- Видео на витрине: autoplay, loop, muted
- Лимит файла: **5 МБ** (mp4/webm)

---

## 12. Частые ошибки

| Ошибка                    | Причина                                                         |
| ------------------------- | --------------------------------------------------------------- |
| CORS                      | неверный `FRONTEND_URL`                                         |
| 404 на медиа              | nginx не проксирует `/uploads` или нет `PUBLIC_UPLOAD_BASE_URL` |
| 413 на upload             | `client_max_body_size` в nginx                                  |
| Файлы пропали             | redeploy без persistent disk                                    |
| F5 на `/user-list` → JSON | nginx проксирует `/user-list` в API (нужен regex как в примере) |

---

## 13. Полезные файлы в репо

| Файл                                       | Содержание            |
| ------------------------------------------ | --------------------- |
| `server/docs/project-overview.md`          | обзор API             |
| `client/docs/связка-клиента-с-сервером.md` | dev proxy             |
| `client/docs/LAN-dev-access.md`            | доступ по Wi‑Fi       |
| `server/.env.example`                      | шаблон env            |
| `server/docs/production-checklist.md`      | чеклист перед деплоем |
| `client/.env.example`                      | `VITE_API_URL`        |
| `docs/deploy/nginx-izibuy.conf.example`    | nginx вариант A       |

---

**Итог:** для скорости и простоты с uploads — **VPS + nginx + один домен + persistent disk + migrate:apply**. CDN для фронта — когда вырастет трафик.
