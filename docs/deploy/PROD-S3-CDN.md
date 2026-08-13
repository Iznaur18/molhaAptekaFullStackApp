# Production: S3/R2 + CDN для медиа

Код уже поддерживает `UPLOAD_STORAGE=s3`. Этот чеклист — включение на prod без поломки старых URL.

## 1. Инфраструктура (Cloudflare R2)

1. Бакет `izibuy-media` (или своё имя → `S3_BUCKET`) — **публичный**, за CDN.
2. **Отдельный** бакет `izibuy-media-private` (→ `S3_PRIVATE_BUCKET`) для PII
   (селфи паспорта) — **без custom domain, без публичного доступа**. См. §1a.
3. API token: Object Read & Write (на оба бакета).
4. **Custom domain** только на публичном бакете: `cdn.torgum.ru` → публичный HTTPS.
5. CORS на публичном бакете (если браузер грузит напрямую с CDN):

```json
[
  {
    "AllowedOrigins": ["https://torgum.ru"],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3600
  }
]
```

## 1a. Приватные файлы (PII) — отдельный непубличный бакет ⚠️

Селфи паспорта пишутся с ключом `uploads/private/<file>`. Публичные медиа —
`uploads/<file>`. Если оба лежат в **одном** бакете за CDN, приватный объект
доступен по прямой ссылке `https://cdn.torgum.ru/uploads/private/<file>` —
**в обход auth+ACL приложения** (custom domain R2 публикует весь бакет). Это
утечка ПДн.

Поэтому:

- Приватные файлы идут в **отдельный** бакет `S3_PRIVATE_BUCKET`, **не** за CDN.
- Приложение отдаёт их только через gated-роут `GET /upload/private/:filename`
  (`checkAuthMW` + ACL, стримит байты из приватного бакета).
- `S3_PRIVATE_BUCKET` **обязателен в production** и **должен отличаться** от
  `S3_BUCKET` — иначе `npm run preflight:prod` падает с ошибкой
  (`validateObjectStorageEnv`).
- Имена файлов — крипто-стойкие (`crypto.randomBytes`, 128 бит), но это лишь
  defense-in-depth; безопасность держится на **разделении бакетов**, а не на
  секретности имени.

## 2. `server/.env` (production)

```env
NODE_ENV=production
UPLOAD_STORAGE=s3
S3_BUCKET=izibuy-media
S3_PRIVATE_BUCKET=izibuy-media-private   # отдельный НЕпубличный бакет для PII
S3_ACCESS_KEY_ID=...
S3_SECRET_ACCESS_KEY=...
S3_REGION=auto
S3_ENDPOINT=https://<account_id>.r2.cloudflarestorage.com
S3_FORCE_PATH_STYLE=true
PUBLIC_UPLOAD_BASE_URL=https://cdn.torgum.ru
FRONTEND_URL=https://torgum.ru
```

`PUBLIC_UPLOAD_BASE_URL` — **origin CDN**, не API. Новые upload в БД: `https://cdn.torgum.ru/uploads/<file>`.

Проверка:

```bash
cd server && npm run validate:prod
curl -sS https://torgum.ru/health | jq .uploadStorage
# "s3"
```

## 3. Миграция файлов с диска VPS

```bash
cd server
# dry-run
npm run sync-uploads:s3
# загрузка
npm run sync-uploads:s3:apply
```

Альтернатива: `rclone copy ./uploads r2:izibuy-media/uploads`.

## 4. Nginx (вариант A, один домен для SPA+API)

- **Новые медиа** отдаёт CDN — блок `/uploads/` на nginx **не обязателен** для них.
- **Legacy** `/uploads/...` на старом домене: оставить proxy на API или alias на диск до полной миграции БД.

Клиент: полные CDN URL **не** переписываются на `torgum.ru` (`resolveUploadedImageUrlForBrowser`).

## 5. Smoke после cutover

1. Staff: upload фото товара → в ответе/БД URL начинается с `PUBLIC_UPLOAD_BASE_URL`.
2. Открыть URL в инкогнито (без cookie) → 200.
3. Карточка каталога показывает картинку.
4. Удаление товара/смена фото — объект в бакете удаляется (`deleteUploadFileByUrl`).
5. **PII-проверка:** оформить рассрочку (загружается селфи паспорта), затем
   попробовать открыть `https://cdn.torgum.ru/uploads/private/<любое>` в инкогнито
   → должно быть **403/404** (приватного бакета нет за CDN). А `GET /upload/private/<file>`
   без авторизации → **401/403**, со staff-токеном → **200**.

## 6. Откат

```env
UPLOAD_STORAGE=disk
PUBLIC_UPLOAD_BASE_URL=https://torgum.ru
```

Перезапуск API. Файлы на диске должны остаться (не удалять после sync без бэкапа).

Подробнее: `server/docs/MEDIA-OBJECT-STORAGE.md`, `server/docs/RUNBOOK.md`.
