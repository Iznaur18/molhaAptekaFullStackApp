# Реестр аудита зависимостей (Dependency Audit Register)

Живой список результатов `npm audit` по воркспейсам и принятых решений.
Служит **allow-list** для CI-гейта аудита (см. `.github` / `npm run audit:*`).

Формат записи: пакет · severity · решение · дата ревью.

---

## client

| Пакет | Severity | Advisory | Статус | Решение |
| ----- | -------- | -------- | ------ | ------- |
| `axios` | High (×10) | GHSA-mmx7-hfxf-jppx (prototype pollution) и др. | ✅ **Fixed** | Обновлён `1.17.0 → 1.19.0` через `npm audit fix`. Все 10 CVE закрыты. |
| `react-router` / `react-router-dom` | High | [GHSA-qwww-vcr4-c8h2](https://github.com/advisories/GHSA-qwww-vcr4-c8h2) — CSRF bypass **в RSC-режиме** | 🟡 **Accepted / tracked** | См. ниже. |

### react-router GHSA-qwww-vcr4-c8h2 — обоснование принятия риска

- **Неприменимо к нашему коду.** Уязвимость затрагивает **только RSC-режим**
  (React Server Components: `@react-router/server`, `unstable_RSC`,
  `unstable_createCallServer`). Наш клиент — Vite **SPA** на `<BrowserRouter>`
  (`client/src/app/App.jsx`), RSC-API не используются нигде
  (проверено `grep`: совпадений 0).
- **Форвард-фикса нет.** Уже стоит последняя опубликованная версия
  `react-router-dom@7.18.2`. Патч-релиза в линии 7.12+ на дату ревью не выпущено;
  единственный «fix» от `npm audit fix --force` — **downgrade до 7.11.0**
  (breaking-регресс ради вектора, которого у нас нет). Откат отклонён.
- **План:** отслеживать релизы react-router; как только выйдет патч ≥ текущей
  мажорной линии — обновиться и снять запись из allow-list.

---

## server

Прод-зависимости чистые на дату ревью: `npm audit --omit=dev` → moderate/low только.

| Пакет | Severity | Статус |
| ----- | -------- | ------ |
| `mongoose`, `body-parser` | moderate / low | ✅ Закрыты `npm audit fix` (задача №3) |

---

## mobile

**Статус:** 🟡 Accepted / tracked — build-chain-only, нулевая экспозиция на устройстве.

`npm audit` (даже с `--omit=dev`) показывает 24 уязвимости, вкл. 1 critical (`tar`).
**Все они — в CLI/prebuild-цепочке Expo, не в бандле приложения.**

### Доказательства (почему не эксплуатируется на устройстве)

- **App-код не импортирует** ни один из проблемных пакетов
  (`tar`, `node-forge`, `shell-quote`, `postcss`, `@xmldom/xmldom`, `minimatch`,
  `js-yaml`, `ajv`, `joi`…). Проверено `grep` по `mobile/src` — 0 совпадений.
  Metro бандлит только реально импортируемый JS → в приложение они не попадают.
- **Critical `tar`** приходит из `eas-cli` (уже в `devDependencies` ✔) и из
  `expo → @expo/cli`. `@expo/cli` вшит в рантайм-метапакет `expo` (так Expo
  пакует свой CLI), поэтому `--omit=dev` его не отсекает — но это **CLI сборки**,
  на устройстве не исполняется. Поверхность атаки — dev/CI-машина.

### Почему НЕ `npm audit fix --force`

Force тянет breaking-мажоры вглубь Expo (`@expo/*`, prebuild-config). У проекта
Expo-сборка хрупка к хоистингу (`metro.config`, `disableHierarchicalLookup`),
`expo install` ломает lock. Риск сломать сборку — высокий, выигрыш на устройстве —
нулевой. Отклонено.

### Санкционированный путь (для отдельной контролируемой сборочной сессии)

`npx expo install --check` рекомендует только:
`expo 54.0.35 → 54.0.36` (патч) и `@sentry/react-native 6 → 7` (мажор — отдельно).
Настоящее закрытие build-chain CVE придёт с плановым апгрейдом Expo SDK.
Делать **в mobile-сессии с проверкой бандла**, не в аудит-батче:

```bash
cd mobile
npx expo install expo@~54.0.36     # патч SDK
npx expo-doctor                    # проверка целостности
# собрать/проверить бандл; @sentry major — отдельным шагом с регрессом
```

---

_Обновляйте эту таблицу при каждом ревью аудита. CI-гейт должен падать на новых
High/Critical, отсутствующих в этом реестре._
