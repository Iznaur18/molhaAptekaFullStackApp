# Медиа: object storage + CDN

## Режимы

| `UPLOAD_STORAGE` | Куда пишется                           | URL в БД                                                |
| ---------------- | -------------------------------------- | ------------------------------------------------------- |
| `disk` (default) | `server/uploads/`                      | `/uploads/...` или `PUBLIC_UPLOAD_BASE_URL/uploads/...` |
| `s3`             | бакет S3/R2, ключ `uploads/<filename>` | `PUBLIC_UPLOAD_BASE_URL/uploads/...` (CDN)              |

Клиент: `POST /upload` без изменений. Полный CDN URL не подменяется на origin SPA (`resolveUploadedImageUrlForBrowser`).

`/health` → `uploadStorage`: `"disk"` | `"s3"`.

## Cloudflare R2 (рекомендуется)

1. Бакет + API token (Object Read & Write).
2. Custom domain → `https://cdn.torgum.ru` (CDN).
3. `.env` на API:

```env
UPLOAD_STORAGE=s3
S3_BUCKET=izibuy-media
S3_ACCESS_KEY_ID=...
S3_SECRET_ACCESS_KEY=...
S3_REGION=auto
S3_ENDPOINT=https://<account_id>.r2.cloudflarestorage.com
S3_FORCE_PATH_STYLE=true
PUBLIC_UPLOAD_BASE_URL=https://cdn.torgum.ru
FRONTEND_URL=https://torgum.ru
```

4. Публичный доступ: R2 public bucket или custom domain.

Чеклист prod: [`docs/deploy/PROD-S3-CDN.md`](../../docs/deploy/PROD-S3-CDN.md).

## Миграция с диска

```bash
cd server
npm run sync-uploads:s3          # dry-run
npm run sync-uploads:s3:apply    # PutObject для отсутствующих ключей
```

Или: `aws s3 sync ./uploads s3://bucket/uploads` / rclone.

Порядок cutover:

1. Sync файлов в бакет.
2. Включить `UPLOAD_STORAGE=s3` + `PUBLIC_UPLOAD_BASE_URL` (CDN).
3. `npm run validate:prod` → restart API.
4. `GET /uploads` на API оставить для legacy URL на основном домене (опционально).

Опционально: `normalizeStoredUploadUrl` при PATCH переписывает старый host на CDN.

## Удаление

`deleteUploadFileByUrl` — disk: `unlink`; s3: `DeleteObject` по filename из URL.

## Проверка

```bash
cd server && npm run validate:prod
```

При `UPLOAD_STORAGE=s3` в production обязательны: bucket, keys, `PUBLIC_UPLOAD_BASE_URL` (https), `S3_ENDPOINT`.

## Клиент

- Относительный `/uploads/...` → origin SPA (dev proxy, вариант A).
- `https://cdn.../uploads/...` → как в БД, без rewrite.
