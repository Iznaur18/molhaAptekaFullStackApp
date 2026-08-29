import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const MOBILE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CLIENT_ROOT = join(MOBILE_ROOT, "..", "client");

const readFile = (root, relativePath) => readFileSync(join(root, relativePath), "utf8");

test("product qa item matches web product-qa-item chrome", () => {
  const layout = readFile(MOBILE_ROOT, "entities/product-qa/lib/productQaItemLayout.ts");
  const styles = readFile(MOBILE_ROOT, "shared/theme/catalogProductStyles.ts");
  const item = readFile(MOBILE_ROOT, "entities/product-qa/ui/ProductQuestionListItem.tsx");
  const webCss = readFile(CLIENT_ROOT, "src/entities/product-qa/ui/ProductQaSection.css");

  assert.match(layout, /borderRadius: 20/);
  assert.match(layout, /answerBorderLeftWidth: 3/);
  assert.match(layout, /questionFontSize: 14/);
  assert.match(webCss, /\.product-qa-item[\s\S]*border-radius: 1\.25rem/);
  assert.match(webCss, /\.product-qa-item__answer[\s\S]*border-left: 3px solid var\(--iz-color-action\)/);
  assert.match(webCss, /\.product-qa-item__answer-label[\s\S]*text-transform: uppercase/);
  assert.match(styles, /qaItem:/);
  assert.match(styles, /qaAnswer:[\s\S]*backgroundColor: theme\.colors\.surface/);
  assert.match(styles, /qaAnswerLabel:[\s\S]*textTransform: "uppercase"/);
  assert.match(styles, /qaBadge:[\s\S]*theme\.colors\.warningSurface/);
  assert.match(item, /styles\.qaItem/);
  assert.match(item, /styles\.qaAnswerText/);
  assert.match(item, /styles\.qaActionPrimary/);
});
