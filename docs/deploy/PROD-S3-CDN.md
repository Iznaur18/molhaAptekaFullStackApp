# Production: S3/R2 + CDN для медиа

Код уже поддерживает `UPLOAD_STORAGE=s3`. Этот чеклист — включение на prod без поломки старых URL.

## 1. Инфраструктура (Cloudflare R2)

1. Бакет `izibuy-media` (или своё имя → `S3_BUCKET`).
2. API token: Object Read & Write.
3. **Custom domain** на бакете: `cdn.izibuy.ru` → публичный HTTPS.
4. CORS на бакете (если браузер грузит напрямую с CDN):

```json
[
  {
    "AllowedOrigins": ["https://izibuy.ru"],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3600
  }
]
```

## 2. `server/.env` (production)

```env
NODE_ENV=production
UPLOAD_STORAGE=s3
S3_BUCKET=izibuy-media
S3_ACCESS_KEY_ID=...
S3_SECRET_ACCESS_KEY=...
S3_REGION=auto
S3_ENDPOINT=https://<account_id>.r2.cloudflarestorage.com
S3_FORCE_PATH_STYLE=true
PUBLIC_UPLOAD_BASE_URL=https://cdn.izibuy.ru
FRONTEND_URL=https://izibuy.ru
```

`PUBLIC_UPLOAD_BASE_URL` — **origin CDN**, не API. Новые upload в БД: `https://cdn.izibuy.ru/uploads/<file>`.

Проверка:

```bash
cd server && npm run validate:prod
curl -sS https://izibuy.ru/health | jq .uploadStorage
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

Клиент: полные CDN URL **не** переписываются на `izibuy.ru` (`resolveUploadedImageUrlForBrowser`).

## 5. Smoke после cutover

1. Staff: upload фото товара → в ответе/БД URL начинается с `PUBLIC_UPLOAD_BASE_URL`.
2. Открыть URL в инкогнито (без cookie) → 200.
3. Карточка каталога показывает картинку.
4. Удаление товара/смена фото — объект в бакете удаляется (`deleteUploadFileByUrl`).

## 6. Откат

```env
UPLOAD_STORAGE=disk
PUBLIC_UPLOAD_BASE_URL=https://izibuy.ru
```

Перезапуск API. Файлы на диске должны остаться (не удалять после sync без бэкапа).

Подробнее: `server/docs/MEDIA-OBJECT-STORAGE.md`, `server/docs/RUNBOOK.md`.
