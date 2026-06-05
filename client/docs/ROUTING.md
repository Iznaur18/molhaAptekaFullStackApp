# Маршрутизация SPA

Оболочка: `app/ui/AppShellLayout` (header, footer, modals, `CartServerSync`).

Контент: `<Outlet />` — отдельные `Route` в `app/routes/appRoutes.jsx`.

## Почему не `/cart` и не `/users`

| Путь UI | Причина |

|---------|---------|

| `/basket` | Vite dev proxy отдаёт `/cart` на Express API |

| `/user-list` | `/users` и префикс `/user/*` уходят на API при F5 на :4444 |

## Таблица маршрутов

| Path | Компонент | mainView |

|------|-----------|----------|

| `/` | `CatalogRoutePage` | catalog |

| `/catalog` | `CatalogRoutePage` | catalog-browser |

| `/me` | `AccountRoutePage` | my-profile (обзор) |

| `/my-products` | `MyProductsRoutePage` | my-products |

| `/my-orders` | `AccountRoutePage` | my-orders |

| `/my-sales` | `AccountRoutePage` | my-sales |

| `/auction` | `AccountRoutePage` | auction |

| `/data-confirmation` | `AccountRoutePage` | data-confirmation |

| `/premium` | `AccountRoutePage` | premium |

| `/loyalty-points` | `AccountRoutePage` | loyalty-points |

| `/subscriptions` | `AccountRoutePage` | subscriptions |

| `/notifications` | `AccountRoutePage` | notifications |

| `/user-list` | `AccountRoutePage` | users |

| `/installment-payments` | `AccountRoutePage` | installment-payments |

| `/installment-sales` | `AccountRoutePage` | installment-sales |

| `/basket` | `CartRoutePage` | cart |

| `/seller/:userId` | `SellerProductsRoutePage` | — |

| `/raffle/:raffleId` | `RaffleProductsRoutePage` | — |

| `/admin-orders` | `AdminOrdersRoutePage` + guard (admin) | admin-orders |

| `/search-synonyms-admin` | `SearchSynonymsAdminRoutePage` + guard (admin) | search-synonyms-admin |

| `/category-tree-admin` | `CategoryTreeAdminRoutePage` + guard (admin) | category-tree-admin |

| `/moderation-products` | `ProductModerationRoutePage` + guard (moderator) | product-moderation |

| `/product-reports` | `ProductReportsRoutePage` + guard | product-reports |

| `/product-promotions` | `ProductPromotionsRoutePage` + guard | product-promotions |

| `/staff-raffles` | `StaffRafflesRoutePage` + guard | staff-raffles |

| `/data-confirmation-requests` | `DataConfirmationRequestsRoutePage` + guard | data-confirmation-requests |

| `/installment-moderation` | `InstallmentModerationRoutePage` + guard | installment-moderation |

| `/installment-disputes` | `InstallmentDisputesRoutePage` + guard | installment-disputes |

| `/users` | redirect → `/user-list` | — |

| `*` | redirect → `/` | — |

Каталог: `shared/lib/catalogMainViewPaths.js`.

Остальные экраны: `shared/lib/homeMainViewPaths.js` + `pages/my-profile/lib/profileTabToMainView.js`.

## Навигация

- `goToMainView("cart")` → `/basket`

- `setMyProfileTab(tab)` → `goToMainView(profileTabToMainView(tab))`

- Закладки `/me?tab=...` → `replace` на path из таблицы

## Состояние

`useAppShellController()` под `AppShellRoot`.

`catalogContentProps` | `accountContentProps`.

## Staff

`StaffLayout` → `staffRouteConfig.jsx` → `StaffRouteGuard`.
