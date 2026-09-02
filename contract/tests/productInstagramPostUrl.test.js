import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  parseInstagramPostUrl,
  productInstagramPostUrlFieldSchema,
  validateInstagramPostUrlInput,
} from "../src/productInstagramPostUrl.js";

describe("productInstagramPostUrl", () => {
  test("parseInstagramPostUrl accepts p/reel/tv", () => {
    const post = parseInstagramPostUrl("https://www.instagram.com/p/ABC123_xYz/");
    assert.equal(post?.mediaKind, "post");
    assert.equal(post?.shortcode, "ABC123_xYz");
    assert.match(post?.embedUrl ?? "", /\/p\/ABC123_xYz\/embed\//);

    const reel = parseInstagramPostUrl("instagram.com/reel/AbCdEfGhIj/");
    assert.equal(reel?.mediaKind, "reel");

    const tv = parseInstagramPostUrl("https://instagram.com/tv/ShortCode1/");
    assert.equal(tv?.mediaKind, "tv");
  });

  test("parseInstagramPostUrl rejects profile and other hosts", () => {
    assert.equal(parseInstagramPostUrl("https://www.instagram.com/username/"), null);
    assert.equal(parseInstagramPostUrl("https://example.com/p/ABC123/"), null);
  });

  test("validateInstagramPostUrlInput allows empty", () => {
    assert.equal(validateInstagramPostUrlInput(""), null);
    assert.equal(validateInstagramPostUrlInput("   "), null);
  });

  test("productInstagramPostUrlFieldSchema accepts empty and valid url", () => {
    assert.equal(productInstagramPostUrlFieldSchema.parse(""), "");
    assert.equal(
      productInstagramPostUrlFieldSchema.parse("https://www.instagram.com/p/ABC123_xYz/"),
      "https://www.instagram.com/p/ABC123_xYz/",
    );
  });
});
