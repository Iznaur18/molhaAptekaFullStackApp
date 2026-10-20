import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const MOBILE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) => readFileSync(join(MOBILE_ROOT, relativePath), "utf8");

test("отзывы: все страницы с «Показать ещё» и лимит текста из контракта, как на сайте", () => {
  const hook = read("entities/product-review/model/useProductReviewsQuery.ts");
  assert.match(hook, /useInfiniteQuery\(/);
  assert.match(hook, /getNextPageParam/);

  const tab = read("features/product-detail/ui/ProductReviewsTab.tsx");
  assert.match(tab, /pages\.flatMap\(\(page\) => page\.reviews\)/);
  assert.match(tab, /PRODUCT_REVIEW_UI\.LOAD_MORE/);
  assert.match(tab, /reviewsQuery\.fetchNextPage\(\)/);
  assert.match(tab, /maxLength=\{PRODUCT_REVIEW_TEXT_MAX_LENGTH\}/);
  // Не подгрузилась следующая страница — показанные отзывы не прячем.
  assert.match(tab, /reviewsQuery\.isError && !reviewsQuery\.data/);

  const web = read("../client/src/shared/config/copy/product-detail.js");
  const mobile = read("shared/config/appUiCopy.ts");
  const loadMore = /LOAD_MORE: "([^"]+)"/.exec(web)?.[1];
  assert.ok(loadMore);
  assert.match(mobile, new RegExp(`LOAD_MORE: "${loadMore}"`));
});

test("рассрочка: продавец видит статус своей программы, как на сайте", () => {
  const tab = read("features/product-detail/ui/ProductInstallmentTab.tsx");
  assert.match(tab, /INSTALLMENT_UI\.MODERATION_PENDING/);
  assert.match(tab, /INSTALLMENT_UI\.MODERATION_REJECTED/);
  assert.match(tab, /INSTALLMENT_UI\.MODERATION_APPROVED/);
  assert.match(tab, /INSTALLMENT_UI\.SELLER_TAB_HINT/);

  const web = read("../client/src/shared/config/copy/installment.js");
  const approved = /MODERATION_APPROVED: "([^"]+)"/.exec(web)?.[1];
  assert.ok(approved);
  assert.match(
    read("shared/config/appUiCopy.ts"),
    new RegExp(`MODERATION_APPROVED: "${approved}"`),
  );
});
