import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  resolveContentMaxWidth,
  resolveProductGridGap,
  SCREEN_CONTENT_MAX_WIDTH_LARGE_TABLET,
  SCREEN_CONTENT_MAX_WIDTH_MEDIUM_TABLET,
  SCREEN_CONTENT_MAX_WIDTH_SMALL_TABLET,
  SCREEN_CONTENT_MAX_WIDTH_WIDE,
} from "../shared/lib/screenBreakpoints.ts";

const mobileRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = resolve(mobileRoot, "..");
const readMobileFile = (p) => readFileSync(resolve(mobileRoot, p), "utf8");
const readRepoFile = (p) => readFileSync(resolve(repoRoot, p), "utf8");

test("лесенка ширин совпадает с web --app-shell-max-width", () => {
  // Веб задаёт её в client/src/index.css и прямо ссылается на паритет с mobile.
  const webIndex = readRepoFile("client/src/index.css");
  const pairs = [
    [600, SCREEN_CONTENT_MAX_WIDTH_SMALL_TABLET, "32.5rem"],
    [768, SCREEN_CONTENT_MAX_WIDTH_MEDIUM_TABLET, "45rem"],
    [1024, SCREEN_CONTENT_MAX_WIDTH_LARGE_TABLET, "60rem"],
    [1280, SCREEN_CONTENT_MAX_WIDTH_WIDE, "75rem"],
  ];
  for (const [width, expected, webRem] of pairs) {
    assert.equal(resolveContentMaxWidth(width), expected, `ширина на ${width}dp`);
    assert.equal(parseFloat(webRem) * 16, expected, `${webRem} в вебе = ${expected}`);
    assert.ok(
      new RegExp(`min-width: ${width}px`).test(webIndex),
      `в вебе нет брейкпоинта ${width}px`,
    );
    assert.ok(webIndex.includes(webRem), `в вебе нет ширины ${webRem}`);
  }
  // Телефон — во всю ширину, как `--app-shell-max-width: 100%`.
  assert.equal(resolveContentMaxWidth(375), undefined);
});

test("поля по краям — 1rem, как web --app-shell-content-inline-padding", () => {
  // Модуль тянет алиас `@/`, поэтому читаем значение из исходника.
  const layout = readMobileFile("shared/theme/screenContentLayout.ts");
  assert.match(layout, /SCREEN_CONTENT_PADDING_HORIZONTAL = 16;/);
  const tokens = readRepoFile("client/src/shared/styles/designTokens.css");
  assert.match(tokens, /--iz-space-4: 1rem;/);
  const shell = readRepoFile("client/src/app/ui/AppShell.css");
  assert.match(shell, /--app-shell-content-inline-padding: var\(--iz-space-4\)/);
});

test("зазор сетки товаров повторяет web по всем брейкпоинтам", () => {
  const shell = readRepoFile("client/src/app/ui/AppShell.css");
  // ≤667 — 2 колонки, ≤903 — 0.15rem, шире — 1rem.
  assert.equal(resolveProductGridGap(375), 2);
  assert.equal(resolveProductGridGap(768), 2.4);
  assert.equal(resolveProductGridGap(1280), 16);
  assert.match(shell, /gap: 0\.15rem/, "в вебе пропал зазор 0.15rem");
  assert.match(shell, /gap: 1rem/, "в вебе пропал зазор 1rem");
});

test("экраны ограничивают ширину колонки на планшете", () => {
  // Все они раньше растягивались во всю ширину, тогда как веб держит
  // их внутри `.app-shell` с max-width.
  //
  // `LegalDocumentsScreen` сюда не попал намеренно: его правка лежит в одном
  // файле с незавершённой чужой работой по кнопке «назад» и поедет вместе с ней.
  const screens = [
    "features/faq/ui/FaqScreen.tsx",
    "features/notifications-page/ui/NotificationsPage.tsx",
    "features/profile-edit/ui/EditProfileForm.tsx",
  ];
  for (const path of screens) {
    const source = readMobileFile(path);
    assert.ok(
      source.includes("useScreenLayout"),
      `${path} не берёт лейаут экрана`,
    );
    assert.ok(
      source.includes("centeredContentStyle"),
      `${path} не применяет ограничение ширины`,
    );
  }
});

test("мастер товара ограничен своими 40rem, а не общей лесенкой", () => {
  const wizard = readMobileFile("features/create-product/ui/CreateProductScreen.tsx");
  assert.ok(
    wizard.includes("const WIZARD_COLUMN_MAX_WIDTH = 640;"),
    "нет собственного лимита мастера",
  );
  assert.ok(wizard.includes("wizardColumnStyle"), "лимит не применяется");
  // Общая лесенка тут была бы шире веба (720 против 640).
  assert.ok(
    !wizard.includes("centeredContentStyle"),
    "мастер не должен брать общую лесенку",
  );

  const webWizard = readRepoFile(
    "client/src/features/create-product-wizard/ui/CreateProductWizard.css",
  );
  assert.match(webWizard, /min-width: 40rem/, "в вебе изменился лимит мастера");
  assert.match(webWizard, /calc\(\(100vw - 40rem\) \/ 2\)/);
  // Поля мастера в вебе — 1.25rem, а не общие 1rem.
  assert.match(webWizard, /padding-inline: 1\.25rem/);
  assert.ok(wizard.includes("paddingHorizontal: 20, // 1.25rem"));
});

test("шторка чекаута: высота и ширина как в вебе", () => {
  const webSheet = readRepoFile("client/src/features/checkout/ui/CheckoutSheetModal.css");
  const styles = readMobileFile("shared/theme/formChromeStyles.ts");
  const sheet = readMobileFile("features/checkout/ui/CheckoutSheetModal.tsx");

  const webHeight = /--checkout-sheet-height: (\d+)%/.exec(webSheet)?.[1];
  assert.equal(webHeight, "70", "в вебе изменилась высота шторки");
  assert.ok(
    styles.includes("CHECKOUT_SHEET_HEIGHT_PERCENT = 70"),
    "высота шторки разошлась с вебом",
  );

  // Веб ограничивает шторку той же лесенкой, что и контент, и центрирует.
  assert.match(webSheet, /width: min\(100%, var\(--app-shell-max-width/);
  assert.ok(
    sheet.includes("resolveAppShellMaxWidthStyle(windowWidth)"),
    "шторка растягивается во всю ширину планшета",
  );

  // Радиус верхних углов — 2rem в обоих.
  assert.match(webSheet, /--checkout-sheet-radius: 2rem/);
  assert.ok(styles.includes("borderTopLeftRadius: 32"));

  const animation = readMobileFile("features/checkout/model/useCheckoutSheetModalAnimation.ts");
  const timing = readMobileFile("features/checkout/lib/checkoutSheetModalAnimation.ts");
  assert.match(sheet, /useCheckoutSheetModalAnimation/);
  assert.match(sheet, /useCssTransition \? View : Animated\.View/);
  assert.match(animation, /scheduleOpenAfterPaint/);
  assert.match(animation, /transitionProperty: "transform"/);
  assert.match(timing, /enterMs: 280/);
  assert.match(timing, /exitMs: 220/);
  assert.match(timing, /enterEasingCss: "cubic-bezier\(0.215, 0.61, 0.355, 1\)"/);
  assert.match(webSheet, /--checkout-sheet-enter-ms: 280ms/);
  assert.match(webSheet, /--checkout-sheet-exit-ms: 220ms/);
});

test("пропорция и вписывание картинок берутся из общего пакета токенов", () => {
  const token = readRepoFile("packages/design-tokens/src/productMedia.ts");
  assert.match(token, /PRODUCT_MEDIA_DISPLAY_ASPECT_RATIO = 1;/);
  const webToken = readRepoFile("client/src/entities/product/ui/productImageTokens.css");
  assert.match(webToken, /--product-card-image-aspect-ratio: 1 \/ 1;/);

  // `contain` в мобилке ровно там же, где `object-fit: contain` в вебе.
  const pairs = [
    ["entities/product/ui/ProductImageLightbox.tsx", "ProductImageLightbox.css"],
    ["entities/product/ui/ProductMediaSlideContent.tsx", "ProductMediaSlideContent.css"],
  ];
  for (const [mobilePath, webCss] of pairs) {
    assert.ok(
      readMobileFile(mobilePath).includes('contentFit="contain"'),
      `${mobilePath} потерял contain`,
    );
    assert.match(
      readRepoFile(`client/src/entities/product/ui/${webCss}`),
      /object-fit: contain/,
      `${webCss} потерял contain`,
    );
  }
});

test("catalog-product-shell: сетка не выходит за catalog wrapper (без edge-bleed)", () => {
  const css = readRepoFile("client/src/app/routes/CatalogProductShellLayout.css");
  assert.match(css, /\.catalog-product-shell__catalog \.app-shell__grid[\s\S]*margin-inline: 0/);
  assert.match(css, /overflow-x: clip/);
});
