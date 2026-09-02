import assert from "node:assert/strict";
import { test } from "node:test";

import {
  faqItemIdParamsSchema,
  faqItemLinkPatchBodySchema,
  isAllowedFaqItemLinkHref,
} from "../src/faqItemLink.js";

test("isAllowedFaqItemLinkHref accepts http(s), mailto, tel and relative paths", () => {
  assert.equal(isAllowedFaqItemLinkHref("https://example.com/a"), true);
  assert.equal(isAllowedFaqItemLinkHref("http://127.0.0.1/faq"), true);
  assert.equal(isAllowedFaqItemLinkHref("mailto:support@example.com"), true);
  assert.equal(isAllowedFaqItemLinkHref("tel:+79990000000"), true);
  assert.equal(isAllowedFaqItemLinkHref("/legal/terms"), true);
  assert.equal(isAllowedFaqItemLinkHref("javascript:alert(1)"), false);
  assert.equal(isAllowedFaqItemLinkHref("data:text/html,hi"), false);
});

test("faqItemLinkPatchBodySchema validates href and resetHref", () => {
  assert.ok(
    faqItemLinkPatchBodySchema.safeParse({ href: "https://example.com" }).success,
  );
  assert.ok(faqItemLinkPatchBodySchema.safeParse({ resetHref: true }).success);
  assert.ok(
    faqItemLinkPatchBodySchema.safeParse({ href: null }).success,
  );
  assert.equal(
    faqItemLinkPatchBodySchema.safeParse({ href: "javascript:x" }).success,
    false,
  );
  assert.equal(
    faqItemLinkPatchBodySchema.safeParse({ resetHref: true, href: "https://x" })
      .success,
    false,
  );
});

test("faqItemIdParamsSchema accepts slug ids", () => {
  assert.ok(faqItemIdParamsSchema.safeParse({ itemId: "buy-n-free-seller" }).success);
  assert.equal(faqItemIdParamsSchema.safeParse({ itemId: "Bad Id" }).success, false);
});
