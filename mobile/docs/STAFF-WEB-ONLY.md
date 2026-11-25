# Staff на mobile (G.1 freeze + G.2 maintenance)

Новые staff/moderation/admin фичи в RN **не добавляем** — только web SPA (`client/`).

Факт (не «весь staff → web»):

| Bucket | Источник | Поведение |
| ------ | -------- | --------- |
| **In-app maintenance (G.2)** | `PROFILE_STAFF_IN_APP_SECTION_IDS` (~15: staff + management order) | Меню → `/hub/<section>` (legacy RN). Не расширять. |
| **Web-only hub** | `PROFILE_STAFF_WEB_ONLY_SECTION_IDS` (3: `courier-moderation`, `raffles`, `seller-personal-category-moderation`) | Меню / deep hub → `openProfileStaffWebSection` → браузер. |
| **Deep link null** | `WEB_ONLY_PATHS` в `resolveWebPathToMobileRoute` | Часть staff/courier SPA-путей → `null` (нет экрана). |

`create-raffle` — seller/moderator hub page (`/hub/create-raffle`), не в staff order; тоже maintenance.

## Поведение меню

- `isProfileStaffWebOnlySection(id)` → `Linking.openURL` (`EXPO_PUBLIC_WEB_APP_URL` + `PROFILE_SECTION_WEB_PATH`).
- Остальной staff из меню → in-app hub (G.2).
- Buyer-path и seller trade — in-app как раньше.

## Dev

```bash
# mobile/.env
EXPO_PUBLIC_WEB_APP_URL=http://127.0.0.1:5173
```

Запусти `client` (`npm run dev`) и `server` на 4444 — после тапа web-only staff откроется web с cookie-сессией.

## Prod

```bash
EXPO_PUBLIC_WEB_APP_URL=https://gitorg.ru
```

## Для разработчиков

- Маппинг / flags: `packages/shared-lib/src/profileStaffWebPaths.ts`
- Открытие web-only: `mobile/features/profile-hub/lib/openProfileStaffWebSection.ts`
- Inventory legacy: [`../README.md`](../README.md) § Staff inventory (G.2)
- Правило Cursor: `.cursor/rules/mobile-staff-freeze.mdc`
