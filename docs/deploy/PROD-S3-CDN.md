# Production: медиа в Selectel S3 + CDN

Код уже поддерживает `UPLOAD_STORAGE=s3`. Этот чеклист — перенос прода с диска
VPS на объектное хранилище без поломки старых ссылок.

## Почему Selectel, а не Cloudflare R2

- С июня 2025 крупные российские провайдеры ограничивают трафик к сетям
  Cloudflare: у части покупателей картинки просто не загрузятся.
- В приватном бакете лежат селфи с паспортом. Хранение за границей нарушает
  требование о локализации персональных данных (152-ФЗ).
- Сервер уже в Selectel: трафик между VPS и хранилищем бесплатный.

Совместимые запасные варианты с тем же S3 API: Yandex Object Storage, VK Cloud.

## 1. Что создать в панели Selectel (делает владелец аккаунта)

1. Объектное хранилище, регион **ru-1**.
2. Контейнер `gitorg-media` — **публичный**, за CDN.
3. Контейнер `gitorg-private` — **приватный**: без публичного доступа, без CDN.
   Туда попадают селфи с паспортом и документы курьеров (§1a).
4. Сервисный пользователь с S3-ключами и правами на чтение и запись в оба
   контейнера. Ключи владелец сам вписывает в `server/.env` на сервере.
5. CDN-ресурс над `gitorg-media` с доменом `cdn.gitorg.ru`, CNAME у
   регистратора, сертификат Let's Encrypt в настройках ресурса.
6. CORS на публичном контейнере (если браузер грузит напрямую с CDN):

```json
[
  {
    "AllowedOrigins": ["https://gitorg.ru"],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3600
  }
]
```

## 1a. Приватные файлы — только в отдельном контейнере ⚠️

Селфи паспорта пишутся с ключом `uploads/private/<file>`, публичные медиа —
`uploads/<file>`. Если оба лежат в **одном** контейнере за CDN, приватный объект
открывается по прямой ссылке `https://cdn.gitorg.ru/uploads/private/<file>` —
**в обход авторизации приложения**. Это утечка персональных данных.

- Приватные файлы идут в `S3_PRIVATE_BUCKET`, который **не** подключён к CDN.
- Приложение отдаёт их только через `GET /upload/private/:filename`
  (`checkAuthMW` + ACL, байты стримятся из приватного контейнера).
- `S3_PRIVATE_BUCKET` обязателен в production и **должен отличаться** от
  `S3_BUCKET`, иначе `npm run preflight:prod` падает (`validateObjectStorageEnv`).
  Скрипт переноса в этом случае тоже откажется копировать `private/`.

## 2. `server/.env` (production)

```env
NODE_ENV=production
UPLOAD_STORAGE=s3
S3_BUCKET=gitorg-media
S3_PRIVATE_BUCKET=gitorg-private
S3_ACCESS_KEY_ID=...
S3_SECRET_ACCESS_KEY=...
S3_REGION=ru-1
S3_ENDPOINT=https://s3.ru-1.storage.selcloud.ru   # точный адрес — из панели
S3_FORCE_PATH_STYLE=true
PUBLIC_UPLOAD_BASE_URL=https://cdn.gitorg.ru
FRONTEND_URL=https://gitorg.ru
```

`PUBLIC_UPLOAD_BASE_URL` — адрес CDN, не API. Новые загрузки сохраняются в базе
как `https://cdn.gitorg.ru/uploads/<file>`.

Что делает код в S3-режиме:

- публичные объекты получают `Cache-Control: public, max-age=31536000, immutable` —
  имя файла случайное и не переиспользуется, поэтому CDN может кэшировать навсегда;
- превью ленты `<имя>-w600.webp` пишутся в тот же контейнер
  (`createPublicUploadImageThumbnail`);
- `/health` раз в минуту проверяет доступность контейнера; недоступен — ответ
  `degraded` (503), и внешний пинг поднимает тревогу (см. `OPS-ALERTS.md`);
- временные архивы 1С остаются на диске: они распаковываются при каждом импорте.

Проверка:

```bash
cd server && npm run validate:prod
curl -sS -o /dev/null -w '%{http_code}\n' http://127.0.0.1:4444/health   # 200
```

## 3. Перенос файлов с диска

```bash
cd server
npm run sync-uploads:s3          # пробный прогон: что и куда поедет
npm run sync-uploads:s3:apply    # загрузка
```

Скрипт копирует:

- файлы верхнего уровня `server/uploads/` (вместе с превью `-w600.webp`) —
  в `S3_BUCKET` с кэш-заголовком;
- `server/uploads/private/` — в `S3_PRIVATE_BUCKET` с ключом `uploads/private/<file>`.

Уже загруженные объекты пропускаются, повторный запуск безопасен.

## 4. Порядок переключения

1. Пробный прогон, сверить число файлов и объём с `du -sh server/uploads`.
2. `sync-uploads:s3:apply`.
3. Переключить переменные окружения, перезапустить `gitorg-api` и `gitorg-worker`.
4. Старые ссылки `/uploads/...` в базе: nginx отвечает 301 на CDN для всего,
   кроме `private/` (приватный путь приложение и так закрывает 404):

   ```nginx
   location ^~ /uploads/private/ { return 404; }
   location ^~ /uploads/ { return 301 https://cdn.gitorg.ru$request_uri; }
   ```

   Затем — миграция, которая переписывает адреса в документах на CDN
   (отдельная задача; до неё работает редирект).
5. Проверки из §5.
6. Папку `server/uploads` на диске не удалять 30 дней.

## 5. Проверки после переключения

1. Загрузить фото товара → в ответе и в базе адрес начинается с `PUBLIC_UPLOAD_BASE_URL`.
2. Открыть адрес в режиме инкогнито → 200, заголовок `Cache-Control` с `immutable`.
3. Карточка в каталоге показывает превью `-w600.webp`.
4. Удалить товар или заменить фото → объект и превью исчезают из контейнера.
5. **Приватные файлы:** оформить рассрочку (загружается селфи), затем открыть
   `https://cdn.gitorg.ru/uploads/private/<любое>` в инкогнито → 403 или 404.
   `GET /upload/private/<file>` без входа → 401/403, от сотрудника → 200.
6. Старое селфи, загруженное до переноса, открывается у модератора.

## 6. Откат

```env
UPLOAD_STORAGE=disk
PUBLIC_UPLOAD_BASE_URL=https://gitorg.ru
```

Перезапуск API и воркера; убрать редирект из nginx. Файлы, загруженные после
переключения, останутся только в контейнере — перед откатом скачать их
(`rclone copy selectel:gitorg-media/uploads server/uploads`).

## 7. Стоимость

Хранение — от 2,29 ₽ за ГБ в месяц (стандартный класс). Основная статья —
исходящий трафик CDN; оценивать по панели после первого месяца.

Подробнее: `server/docs/MEDIA-OBJECT-STORAGE.md`, `server/docs/RUNBOOK.md`.
