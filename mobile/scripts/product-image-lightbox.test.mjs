import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const mobileRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = resolve(mobileRoot, "..");

const readMobileFile = (relativePath) =>
  readFileSync(resolve(mobileRoot, relativePath), "utf8");
const readRepoFile = (relativePath) =>
  readFileSync(resolve(repoRoot, relativePath), "utf8");

test("подписи совпадают с веб-компонентом слово в слово", () => {
  const web = readRepoFile("client/src/shared/config/copy/catalog.js");
  const mobile = readMobileFile("shared/config/appUiCopy.ts");

  for (const line of [
    'IMAGE_LIGHTBOX_OPEN_LABEL: "Показать изображение в полном размере"',
    'IMAGE_LIGHTBOX_CLOSE: "Закрыть просмотр изображения"',
    'IMAGE_LIGHTBOX_DIALOG_LABEL: "Изображение товара"',
    'IMAGE_LIGHTBOX_DIALOG_LABEL_GALLERY: "Фотографии товара"',
  ]) {
    assert.ok(web.includes(line), `нет в вебе: ${line}`);
    assert.ok(mobile.includes(line), `нет в мобилке: ${line}`);
  }
});

test("заголовок диалога зависит от числа фото, как в вебе", () => {
  const mobile = readMobileFile("entities/product/ui/ProductImageLightbox.tsx");
  assert.match(mobile, /len > 1[\s\S]{0,120}IMAGE_LIGHTBOX_DIALOG_LABEL_GALLERY/);
  assert.match(mobile, /IMAGE_LIGHTBOX_DIALOG_LABEL\b/);

  const web = readRepoFile("client/src/entities/product/ui/ProductImageLightbox.jsx");
  assert.match(web, /len > 1[\s\S]{0,160}IMAGE_LIGHTBOX_DIALOG_LABEL_GALLERY/);
});

test("перелистывание закольцовано и выключено на одном фото", () => {
  const mobile = readMobileFile("entities/product/ui/ProductImageLightbox.tsx");
  // Те же формулы, что в вебе: (i - 1 + len) % len и (i + 1) % len.
  assert.match(mobile, /\(current - 1 \+ len\) % len/);
  assert.match(mobile, /\(current \+ 1\) % len/);

  const guards = mobile.match(/if \(len <= 1\) \{/g) ?? [];
  assert.equal(guards.length, 2, "оба перехода должны быть заглушены при одном фото");

  const web = readRepoFile("client/src/entities/product/ui/ProductImageLightbox.jsx");
  assert.match(web, /\(i - 1 \+ len\) % len/);
  assert.match(web, /\(i \+ 1\) % len/);
});

test("нечитаемые url отсеиваются до показа", () => {
  const mobile = readMobileFile("entities/product/ui/ProductImageLightbox.tsx");
  assert.match(mobile, /filterDisplayableImageUrls/);
  assert.match(mobile, /isDisplayableMediaUrl\(url\)/);
  // Пустой список — просмотр не открывается.
  assert.match(mobile, /if \(!visible \|\| len === 0\) \{/);

  const web = readRepoFile("client/src/entities/product/ui/ProductImageLightbox.jsx");
  assert.match(web, /if \(len === 0\) return null;/);
});

test("стартовый индекс считает фото, пропуская слайд с видео", () => {
  const mobile = readMobileFile("entities/product/lib/buildProductMediaSlides.ts");
  const web = readRepoFile("client/src/entities/product/lib/buildProductMediaSlides.js");

  for (const source of [mobile, web]) {
    assert.match(source, /resolveProductImageIndexForLightbox/);
    assert.match(source, /if \(slides\[i\]\??\.?type === "image"\) \{/);
    assert.match(source, /imageIndex \+= 1;/);
  }
});

test("лайтбокс подключён только на экране товара", () => {
  const gallery = readMobileFile("entities/product/ui/ProductMediaGallery.tsx");
  assert.match(gallery, /<ProductImageLightbox/);
  // Открытие — из detail-варианта и только для слайда-картинки.
  assert.match(gallery, /isDetail && mediaSlides\[index\]\?\.type === "image"/);
  assert.match(
    gallery,
    /startIndex=\{resolveProductImageIndexForLightbox\(mediaSlides, safeSlideIndex\)\}/,
  );
  // Каталожная карточка остаётся без лайтбокса — её тап открывает товар.
  assert.match(gallery, /\{isDetail \? \(\s*\r?\n\s*<ProductImageLightbox/);
});

test("тап по видео не открывает просмотр фото", () => {
  const slide = readMobileFile("entities/product/ui/ProductMediaSlideContent.tsx");
  // Видео возвращается раньше, чем создаётся обёртка-Pressable.
  assert.ok(
    slide.indexOf("slide.type === \"video\"") < slide.indexOf("const withPressable"),
  );
});
