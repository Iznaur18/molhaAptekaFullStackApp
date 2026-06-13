# Sentry (опционально)

Без DSN интеграция **не активна** — локально и на staging без аккаунта Sentry всё работает как раньше.

## Проекты в Sentry

Создайте два проекта (или один full-stack):

| Часть | SDK | DSN env |
| ----- | --- | ------- |
| API | `@sentry/node` | `SENTRY_DSN` в `server/.env` |
| SPA | `@sentry/react` | `VITE_SENTRY_DSN` при **build** клиента |
| Mobile | `@sentry/react-native` | `EXPO_PUBLIC_SENTRY_DSN` в `mobile/.env` / EAS env |

## Server

```env
SENTRY_DSN=https://xxx@oXXX.ingest.sentry.io/XXX
SENTRY_TRACES_SAMPLE_RATE=0.1
GIT_COMMIT_SHA=abc1234
```

- Init: `server/instrument.js` (импорт сразу после `dotenv` в `index.js`)
- 5xx из `errorHandler` → `captureServerHttpError` (тег `requestId`)
- PII: cookie/Authorization отфильтрованы в `beforeSend`

## Client

```env
# client/.env.production (или CI secrets при build)
VITE_SENTRY_DSN=https://yyy@oYYY.ingest.sentry.io/YYY
VITE_SENTRY_TRACES_SAMPLE_RATE=0.1
VITE_GIT_COMMIT_SHA=abc1234
```

`initClientSentry()` в `main.jsx`, UI-ошибки — `Sentry.ErrorBoundary` в `App.jsx`.

## Mobile

```env
# mobile/.env или eas.json env (preview/production)
EXPO_PUBLIC_SENTRY_DSN=https://zzz@oZZZ.ingest.sentry.io/ZZZ
EXPO_PUBLIC_SENTRY_TRACES_SAMPLE_RATE=0.1
EXPO_PUBLIC_GIT_COMMIT_SHA=abc1234
EXPO_PUBLIC_APP_ENV=development
```

- Init: `mobile/shared/lib/initMobileSentry.ts` (импорт в `app/_layout.tsx`)
- Root layout обёрнут в `Sentry.wrap()`; тег `platform:mobile`, `app_platform` = ios/android/web
- Breadcrumb: версия app + build number из `expo-constants`
- PII: `Authorization` / `Cookie` в `beforeSend` — как на SPA

Source maps для EAS: плагин `@sentry/react-native/expo` в `app.json` — при первом успешном `eas build`.

## Source maps

`vite build` с `sourcemap: "hidden"` — `.map` не в публичном URL, но есть в `dist/` для загрузки.

После сборки (нужен [Sentry auth token](https://docs.sentry.io/product/accounts/auth-tokens/)):

```bash
cd client
export SENTRY_AUTH_TOKEN=...
export SENTRY_ORG=your-org
export SENTRY_PROJECT=izibuy-client
export SENTRY_RELEASE="${VITE_GIT_COMMIT_SHA:-local}"

npx @sentry/cli sourcemaps upload ./dist \
  --release "$SENTRY_RELEASE" \
  --url-prefix "~/" \
  --validate
```

В CI: шаг после `npm run build` только если заданы secrets (не ломать PR без Sentry).

## Проверка

1. Задать DSN на staging
2. Вызвать тестовую 5xx (временный route) или `throw` на клиенте
3. В Sentry: issue с `requestId`, `release` = git sha

## Связь с логами

JSON-лог (`OBSERVABILITY.md`) остаётся источником истины на VPS; Sentry — агрегация 5xx и фронтовых падений.
