## Summary

<!-- 1–3 предложения: зачем PR -->

## Test plan

- [ ] Локально прогнал релевантные тесты / smoke
- [ ] Затронут buyer-path или auth → см. `docs/release-smoke-matrix.md` (при релизе)

## Shared-слой (A.4)

Только если PR трогает `client/`, `mobile/`, `packages/`, `contract/`:

- [ ] Pure-функция / константа — в `packages/shared-lib` или `contract`, не копипаста в оба клиента
- [ ] Parse API — через `@izibuy/shared-api` + тонкий wrapper, без второго `parseApiContract`
- [ ] Upload-лимиты — только из `@molha/api-contract`
- [ ] Нет импорта `client/src/...` в `mobile/` (и наоборот UI-компонентов)
- [ ] Staff на mobile: не добавлял новые RN staff-экраны (G.1 → web)

См. `docs/client-mobile-consolidation-audit.md` §2.6, `.cursor/rules/client-mobile-share-boundaries.mdc`

## Triage (если фикс бага)

Метка: <!-- web-dev-infra | web-feature | mobile-feature | server | contract | shared-drift -->

См. `docs/bug-triage-labels.md`
