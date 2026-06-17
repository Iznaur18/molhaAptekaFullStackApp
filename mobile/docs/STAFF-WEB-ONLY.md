# Staff на mobile → только web (G.1)

С **G.1** staff/moderation/admin в приложении **не развиваем**. Новые фичи — web SPA.

## Поведение

- Пункты staff в профиле → `Linking.openURL` на web (`EXPO_PUBLIC_WEB_APP_URL` + путь из `@izibuy/shared-lib` / `PROFILE_SECTION_WEB_PATH`).
- Deep link `izibuy://hub/<staff-section>` → краткий redirect в браузер, назад в таб «Профиль».
- Buyer-path (каталог, корзина, заказы, seller my-products) — in-app как раньше.

## Dev

```bash
# mobile/.env
EXPO_PUBLIC_WEB_APP_URL=http://127.0.0.1:5173
```

Запусти `client` (`npm run dev`) и `server` на 4444 — после тапа staff-пункта откроется web с cookie-сессией (тот же backend).

## Prod

```bash
EXPO_PUBLIC_WEB_APP_URL=https://izibuy.ru
```

## Для разработчиков

- Маппинг section → path: `packages/shared-lib/src/profileStaffWebPaths.ts`
- Открытие: `mobile/features/profile-hub/lib/openProfileStaffWebSection.ts`
- Inventory legacy-экранов: [`../README.md`](../README.md) § Staff inventory (G.2)
- Правило Cursor: `.cursor/rules/mobile-staff-freeze.mdc`
