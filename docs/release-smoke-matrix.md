# Release smoke matrix (F.4)

**Когда:** каждый релиз на prod/staging и hotfix, затрагивающий auth, каталог, корзину, upload или mobile buyer-path.

**Кто:** ответственный за релиз. Заполняет **Release log** внизу.

---

## Предусловия

| Компонент | Web | Mobile |
| --------- | --- | ------ |
| API | `server` prod/staging, `/health` → `ok` | `EXPO_PUBLIC_API_URL` → тот же API |
| Аккаунты | buyer + seller (e2e seed локально: `node server/scripts/e2ePlaywrightSeed.js`) | тот же buyer на устройстве |
| Автоматика до ручного | см. колонку **Auto** | см. колонку **Auto** |

### Команды (локально / CI)

```bash
# Web
cd client && npm run test:e2e

# Mobile static + API buyer path
cd mobile && npm run regression:wf72
cd mobile && npm run smoke:buyer-path   # server :4444 + seed

# Packages
npm run test:packages
```

---

## Матрица §7

Отметьте `- [x]` web и/или mobile при прогоне. **Auto** — что уже закрыто тестами; ручной шаг всё равно нужен на staging перед prod.

| # | Сценарий | Web — как проверить | Mobile — как проверить | Auto |
| - | -------- | ------------------- | ---------------------- | ---- |
| 1 | Login / logout | Header → Войти → выход | `/(auth)/login`, logout в профиле | `e2e/smoke.spec.js` (login UI) |
| 2 | GET /auth/me после refresh | F5 на `/me`, сессия жива | Kill app → cold start, профиль загружен | `e2e/query-profile-smoke.spec.js` |
| 3 | Каталог + фильтры | `/`, chips, поиск | `/(tabs)/index`, chips, `/(tabs)/catalog` | `e2e/catalog-cart.spec.js` (частично) |
| 4 | Корзина → оформить | Добавить → `/basket` → заказ | Карточка → cart tab → checkout → `/orders` | `e2e/catalog-cart.spec.js`, `smoke:buyer-path` |
| 5 | Upload image (auth) | Профиль → аватар | `/profile/edit` → gallery | `e2e/upload-image.spec.js`, wf72 upload |
| 6 | Upload video (seller ad) | `/advertising` intro ad | `/hub/advertising` | wf72 upload video wiring |
| 7 | Розыгрыш + фото приза | `/me` → create raffle | seller: web (G.1) или legacy hub | — |
| 8 | Wishlist sync | Wishlist toggle → `/wishlist` | `/hub/wishlist` | — |
| 9 | Push token (mobile) | n/a | Login → notifications permission | — |
| 10 | Staff section | `/moderation-products` (moderator) | Hub staff → **открывается web** (G.1) | wf72 staff→web |

**Staff (п.10):** на mobile новые staff-фичи не в RN — только browser. См. [`mobile/docs/STAFF-WEB-ONLY.md`](../mobile/docs/STAFF-WEB-ONLY.md).

**Buyer path (G.3):** расширенный чеклист — [`mobile/docs/BUYER-CRITICAL-PATH.md`](../mobile/docs/BUYER-CRITICAL-PATH.md).

---

## Release log

Копируйте строку на каждый релиз.

| Release (версия / дата) | Окружение | Tester | Web (из 10) | Mobile (из 9) | Авто CI зелёный | Заметки |
| ----------------------- | --------- | ------ | ----------- | ------------- | --------------- | ------- |
| _пример: 1.2.0 / 2026-06-17_ | staging | @user | 10/10 | 9/9 | lint, test:packages, e2e | — |

---

Связано: [`client-mobile-consolidation-audit.md`](client-mobile-consolidation-audit.md) §7, [`mobile-development.md`](mobile-development.md) § WF-7.2.
