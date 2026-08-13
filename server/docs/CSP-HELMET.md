# CSP и Helmet (prod + CDN)

## Разделение ответственности

| Слой | CSP | Helmet / прочие заголовки |
|------|-----|---------------------------|
| **SPA** (nginx `location /`) | ✅ `Content-Security-Policy` | `X-Frame-Options` через CSP `frame-ancestors` |
| **Статика** `/assets/` | — | `Cache-Control: immutable` |
| **Express API** | ❌ не задаём | `buildApiHelmetOptions()` — без CSP, `CORP: cross-origin` для `/uploads` |

CSP на JSON API бесполезен и путает отладку. Политика для браузера — только на HTML документе SPA.

## Генерация CSP

Из `server/.env` (production):

```bash
cd server
node scripts/printSpaCspHeader.js
```

Источник правды: `server/utils/buildSpaContentSecurityPolicy.js`.

### Директивы (v1)

| Директива | Значение | Зачем |
|-----------|----------|--------|
| `default-src` | `'self'` | база |
| `script-src` | `'self'` | Vite bundles, без `unsafe-eval` |
| `style-src` | `'self' 'unsafe-inline'` | inline `style=` в React |
| `img-src` | `'self' data: blob: https:` + CDN origin | карточки, placeholder, внешние URL товаров |
| `media-src` | `'self' blob: https:` + CDN origin | превью-видео, blob при upload сторис |
| `connect-src` | `'self'` + API origin (вариант B) + Sentry | fetch/XHR, Sentry |
| `object-src` | `'none'` | Flash и т.п. |
| `upgrade-insecure-requests` | при `https://` FRONTEND_URL | prod TLS |

### CDN (`PUBLIC_UPLOAD_BASE_URL`)

| Деплой | `img-src` / `media-src` |
|--------|-------------------------|
| Вариант A: `https://torgum.ru` = SPA и uploads | `'self'` + `https:` (внешние фото в карточках) |
| S3 + CDN: `https://cdn.torgum.ru` | явно `https://cdn.torgum.ru` + `https:` |

Клиент **не** переписывает CDN URL (`resolveUploadedImageUrl.js`).

### Вариант B (split origin)

`VITE_API_URL=https://api.example.com` при сборке → origin попадает в `connect-src`.

## nginx

См. `docs/deploy/nginx-izibuy.conf.example` — блок `add_header Content-Security-Policy` в `location /`.

HSTS лучше на `server { listen 443 ... }`, не дублировать в Express.

## Vite preview

`client/vite.config.js` — middleware с тем же `buildSpaContentSecurityPolicy` (проверка перед prod).

Dev (`npm run dev`) — **без** CSP (HMR).

## Чеклист prod

- [ ] `node scripts/printSpaCspHeader.js` → CSP в nginx
- [ ] Upload фото → URL с CDN открывается в `<img>` без console CSP errors
- [ ] Видео-превью / blob upload сторис — без блокировки `media-src`
- [ ] Sentry (если `VITE_SENTRY_DSN`) — события уходят, нет CSP на `ingest.sentry.io`
- [ ] Split API — логин и каталог без `connect-src` violations

## v2 (не сделано)

- `Content-Security-Policy-Report-Only` + endpoint
- nonce для `style-src` без `unsafe-inline`
- nginx `map` + envsubst в CI
