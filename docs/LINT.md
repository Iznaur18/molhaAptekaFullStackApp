# Lint / format (root)

Инструменты в корне репо — один конфиг на `client/`, `server/`, `contract/`.

```bash
npm install          # корень: eslint + prettier
npm run lint         # ESLint 9 (flat config)
npm run lint:fix
npm run format       # Prettier — первый прогон может затронуть весь репо
npm run format:check
```

- `eslint.config.js` — browser (React) + node (server/contract)
- `prettier.config.js` — `printWidth: 88`, double quotes, trailing commas

CI: `.github/workflows/lint.yml` — `npm run lint` + `npm run format:check`.

Типы API: `contract/docs/TYPES.md`, `client/jsconfig.json` (`checkJs`).
